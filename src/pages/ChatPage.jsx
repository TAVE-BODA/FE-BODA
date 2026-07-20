import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ChatPage.css';
import Character from '../components/Character';
import InsuranceModal from '../components/InsuranceModal';
import NavBar from '../components/NavBar';
import { createChatSession, sendInsuranceCondition } from '../api/chat';

const OPTION_TEXT = {
  1: '1. 청구 가능한지 먼저 알고싶어요',
  2: '2. 예상 보험금을 먼저 알고 싶어요',
  3: '3. 필요 서류를 먼저 알고 싶어요',
  4: '4. 내 보험의 보장 항목부터 보고 싶어요',
};

const CHATBOT_FOCUS_TEXT = {
  1: '청구 가능성을 중심으로',
  2: '예상 보험금을 중심으로',
  3: '필요서류를 중심으로',
};

const UPLOAD_CONTENT = {
  confirm: {
    messages: [
      '알려주신 내용을 확인했어요!',
      '이제 내 보험 기준으로 확인하려면 보험증권과 보험약관 PDF가 필요해요.',
      '파일을 준비하셨나요?',
    ],
    cancelLabel: '아직 준비가 안됐어요',
  },
  confirmReady: {
    messages: [
      '알려주신 내용을 확인했어요!',
      '이미 등록해두신 보험증권·약관으로 바로 확인해드릴게요.',
    ],
  },
  coverage: {
    messages: [
      '알겠습니다!\n청구에 활용할 수 있는 보장 항목을\n보여드릴게요.',
      '분석을 위해 보험증권 PDF가 필요해요.',
      '파일을 바로 등록하시겠어요?',
    ],
    cancelLabel: '나중에 올릴게요',
  },
};

function UploadButtonGroup({ cancelLabel, onCancel, onUpload, isLoading }) {
  return (
    <div className="chat-upload-btn-group">
      <button
        className="insurance-condition-btn chat-upload-btn"
        onClick={onUpload}
        disabled={isLoading}
      >
        {isLoading ? '처리 중...' : '파일 업로드하기'}
      </button>
      <button
        className="chat-option-btn chat-cancel-btn"
        onClick={onCancel}
        disabled={isLoading}
      >
        {cancelLabel}
      </button>
    </div>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // 마이페이지/대시보드에서 기존 채팅 세션으로 다시 들어온 경우 - 새 세션을 만들지 않고
  // 이 세션에 이어서 업로드/조건입력이 붙도록 재사용한다 (같은 보험으로 마이페이지에 묶여 보이게).
  // callerSkipCert: 재사용할 세션은 없어도(증권에 연결된 채팅이 하나도 없는 경우) 호출한
  // 쪽(대시보드)이 이미 분석된 증권이 있다는 걸 알고 있는 경우 - 새 세션을 만들더라도
  // 증권 업로드는 건너뛰고 약관 업로드부터 시작하게 함.
  // incomingTermsUploaded: 마이페이지 "채팅하러가기"로 들어온 채팅에 증권·약관이 이미 다
  // 올라가 있는 경우 - 업로드 화면 자체를 거치지 않고 바로 조건 전송으로 넘어가게 함.
  // unlinkedAnalysisIds: 마이페이지에서 어느 채팅에도 안 묶인(오르판) 증권이 있는 경우 -
  // 새 세션을 만들 때 이 증권들을 바로 연결해서 재업로드 없이 이어가게 함.
  const {
    chatSessionId: incomingChatSessionId,
    skipCert: callerSkipCert,
    termsUploaded: incomingTermsUploaded,
    unlinkedAnalysisIds,
  } = location.state || {};
  const [selectedOption, setSelectedOption] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalFinished, setIsModalFinished] = useState(false);
  const [isNotReady, setIsNotReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conditionData, setConditionData] = useState(null);
  const [chatSessionId, setChatSessionId] = useState(null);

  const handleOptionClick = async (optionNumber) => {
    setSelectedOption(optionNumber);
    if (optionNumber !== 4) return;

    // 칩4(보장 항목부터 보기)는 조건 입력 모달을 안 거쳐서, chatSessionId를 만들어주는
    // handleModalSubmitSuccess도 안 타게 됨 -> chatSessionId가 계속 null로 남아서
    // 업로드/대시보드 이동 시 /result/summary/null로 가버리던 버그. 여기서 직접 생성.
    if (incomingChatSessionId) {
      setChatSessionId(incomingChatSessionId);
      setIsModalFinished(true);
      return;
    }

    setIsLoading(true);
    try {
      const session = await createChatSession({ analysisIds: unlinkedAnalysisIds });
      setChatSessionId(session.chatSessionId);
      setIsModalFinished(true);
    } catch (error) {
      console.error('세션 생성 오류:', error);
      alert('오류가 발생했어요. 다시 시도해주세요.');
      setSelectedOption(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalSubmitSuccess = async (formData) => {
    setIsLoading(true);
    try {
      // 기존 세션으로 들어온 경우 새로 만들지 않고 재사용
      const session = incomingChatSessionId
        ? { chatSessionId: incomingChatSessionId }
        : await createChatSession({ analysisIds: unlinkedAnalysisIds });
      setChatSessionId(session.chatSessionId);
      setConditionData(formData);
      setIsModalOpen(false);
      setIsModalFinished(true);
    } catch (error) {
      console.error('세션 생성 오류:', error);
      alert('오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToUpload = async () => {
    // 칩1/2/3인데 이 채팅에 증권·약관이 이미 다 올라가 있으면, 업로드 화면 자체를 안 거치고
    // 바로 조건을 전송함 (UploadPage.jsx의 TERMS_DONE 단계와 동일한 처리)
    if (selectedOption !== 4 && incomingTermsUploaded) {
      setIsLoading(true);
      try {
        const result = await sendInsuranceCondition(chatSessionId, conditionData, selectedOption);
        navigate(`/result/option/${selectedOption}`, {
          state: { resultData: result, chatSessionId, conditionData },
        });
      } catch (error) {
        console.error('보험 조건 전송 오류:', error);
        alert('분석 중 오류가 발생했어요. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 기존 세션 재사용이거나(증권 이미 업로드됨), 호출한 쪽에서 이미 분석된 증권이 있다고
    // 알려줬거나(연결된 채팅은 없지만 증권만 있던 경우), 방금 새 세션 생성 시 오르판
    // 증권을 바로 연결한 경우 - 증권은 이미 준비돼 있음
    const hasExistingPolicy = Boolean(incomingChatSessionId) || Boolean(callerSkipCert) || Boolean(unlinkedAnalysisIds?.length);

    if (selectedOption === 4) {
      // 칩4(보장 항목부터 보기)는 다중 업로드 전용 페이지로 분리되어 있는데, 증권이 이미
      // 세션에 연결돼 있으면(대시보드가 자동 재생성됨) 업로드 없이 바로 합산 대시보드로
      if (hasExistingPolicy) {
        navigate(`/result/summary/${chatSessionId}`);
        return;
      }
      navigate('/upload/overview', { state: { chatSessionId } });
      return;
    }

    navigate('/upload', {
      state: {
        chatSessionId,
        conditionData,
        selectedOption,
        skipCert: hasExistingPolicy,
      },
    });
  };

  const isOption123 = [1, 2, 3].includes(selectedOption);

  return (
    <div className="chat-page-container">
      <header className="chat-header">
        <NavBar />
      </header>

      <div className="chat-content-wrap">

        {/* --- 대화 상태 1: 첫 화면 --- */}
        {selectedOption === null && (
          <div className="chat-flow-container">
            <div className="chat-message-row">
              <div className="chat-avatar-area">
                <Character size="sm" />
              </div>
              <div className="chat-bubble first-bubble">
                <h3 className="chat-bubble-title">무엇을 먼저 확인해 드릴까요?</h3>
                <p className="chat-bubble-text">
                  선택한 목적에 맞추어<br />
                  결과 화면에서 먼저 보여드릴게요!
                </p>
              </div>
            </div>
            <div className="chat-options-area">
              {Object.entries(OPTION_TEXT).map(([key, label]) => (
                <button
                  key={key}
                  className="chat-option-btn"
                  onClick={() => handleOptionClick(Number(key))}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- 대화 상태 2: 1, 2, 3번 선택 후 모달 입력 전 --- */}
        {isOption123 && !isModalFinished && (
          <div className="chat-flow-container">
            <div className="chat-message-row user-row">
              <div className="chat-bubble user-bubble">
                {OPTION_TEXT[selectedOption]}
              </div>
            </div>
            <div className="chat-message-row">
              <div className="chat-avatar-area">
                <Character size="sm" />
              </div>
              <div className="chatbot-responses-group">
                <div className="chat-bubble chatbot-bubble">
                  <p className="chat-bubble-text font-medium">
                    좋아요.<br />
                    {CHATBOT_FOCUS_TEXT[selectedOption]} 확인해 드릴게요.
                  </p>
                </div>
                <div className="chat-bubble chatbot-bubble">
                  <p className="chat-bubble-text font-medium">
                    몇 가지만 더 알려주세요.
                  </p>
                </div>
                <div className="chat-no-indent">
                  <button
                    className="insurance-condition-btn"
                    onClick={() => setIsModalOpen(true)}
                    disabled={isLoading}
                  >
                    {isLoading ? '처리 중...' : '보험 조건 입력하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 대화 상태 3: 1, 2, 3번 조건 입력 완료 후 --- */}
        {isOption123 && isModalFinished && (
          <div className="chat-flow-container">
            <div className="chat-message-row user-row">
              <div className="chat-bubble user-bubble">
                {OPTION_TEXT[selectedOption]}
              </div>
            </div>
            <div className="chat-message-row">
              <div className="chat-avatar-area">
                <Character size="sm" />
              </div>
              <div className="chatbot-responses-group">
                {(incomingTermsUploaded ? UPLOAD_CONTENT.confirmReady.messages : UPLOAD_CONTENT.confirm.messages).map((msg, idx) => (
                  <div key={idx} className="chat-bubble chatbot-bubble">
                    <p className="chat-bubble-text font-medium">{msg}</p>
                  </div>
                ))}

                {incomingTermsUploaded ? (
                  <div className="chat-no-indent">
                    <button
                      className="insurance-condition-btn chat-upload-btn"
                      onClick={handleGoToUpload}
                      disabled={isLoading}
                    >
                      {isLoading ? '처리 중...' : '결과 확인하기'}
                    </button>
                  </div>
                ) : !isNotReady && (
                  <div className="chat-no-indent">
                    <UploadButtonGroup
                      cancelLabel={UPLOAD_CONTENT.confirm.cancelLabel}
                      onCancel={() => setIsNotReady(true)}
                      onUpload={handleGoToUpload}
                      isLoading={isLoading}
                    />
                  </div>
                )}

                {!incomingTermsUploaded && isNotReady && (
                  <>
                    <div className="chat-message-row user-row">
                      <div className="chat-bubble user-bubble">
                        아직 준비가 안됐어요
                      </div>
                    </div>
                    <div className="chat-bubble chatbot-bubble">
                      <p className="chat-bubble-text font-medium">
                        보험증권과 보험약관은 가입하신 각 보험사에서 다운로드할 수 있어요.
                      </p>
                    </div>
                    <div className="chat-no-indent">
                      <div className="chat-upload-btn-group">
                        <button
                          className="insurance-condition-btn chat-upload-btn"
                          onClick={handleGoToUpload}
                          disabled={isLoading}
                        >
                          {isLoading ? '처리 중...' : '파일 준비됐어요'}
                        </button>
                        <button
                          className="chat-option-btn chat-cancel-btn"
                          onClick={() => navigate('/home')}
                          disabled={isLoading}
                        >
                          나중에 할게요
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- 대화 상태 4: 4번 선택 후 --- */}
        {selectedOption === 4 && isModalFinished && (
          <div className="chat-flow-container">
            <div className="chat-message-row user-row">
              <div className="chat-bubble user-bubble">
                {OPTION_TEXT[selectedOption]}
              </div>
            </div>
            <div className="chat-message-row">
              <div className="chat-avatar-area">
                <Character size="sm" />
              </div>
              <div className="chatbot-responses-group">
                {UPLOAD_CONTENT.coverage.messages.map((msg, idx) => (
                  <div key={idx} className="chat-bubble chatbot-bubble">
                    <p className="chat-bubble-text font-medium">
                      {msg.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < msg.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                ))}
                <div className="chat-no-indent">
                  <UploadButtonGroup
                    cancelLabel={UPLOAD_CONTENT.coverage.cancelLabel}
                    onUpload={handleGoToUpload}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <InsuranceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleModalSubmitSuccess}
      />
    </div>
  );
}