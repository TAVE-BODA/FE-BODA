import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';
import Character from '../components/Character';
import InsuranceModal from '../components/InsuranceModal';
import NavBar from '../components/NavBar';

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
  coverage: {
    messages: [
      '알겠습니다!\n청구에 활용할 수 있는 보장 항목을\n보여드릴게요.',
      '분석을 위해 보험증권 PDF가 필요해요.',
      '파일을 바로 등록하시겠어요?',
    ],
    cancelLabel: '나중에 올릴게요',
  },
};

function UploadButtonGroup({ cancelLabel, onCancel }) {
  return (
    <div className="chat-upload-btn-group">
      <button className="insurance-condition-btn chat-upload-btn">
        파일 업로드하기
      </button>
      <button
        className="chat-option-btn chat-cancel-btn"
        onClick={onCancel}
      >
        {cancelLabel}
      </button>
    </div>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalFinished, setIsModalFinished] = useState(false);
  const [isNotReady, setIsNotReady] = useState(false);

  const handleOptionClick = (optionNumber) => {
    setSelectedOption(optionNumber);
    if (optionNumber === 4) setIsModalFinished(true);
  };

  const handleModalSubmitSuccess = () => {
    setIsModalOpen(false);
    setIsModalFinished(true);
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
                  <button className="insurance-condition-btn" onClick={() => setIsModalOpen(true)}>
                    보험 조건 입력하기
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
                {UPLOAD_CONTENT.confirm.messages.map((msg, idx) => (
                  <div key={idx} className="chat-bubble chatbot-bubble">
                    <p className="chat-bubble-text font-medium">{msg}</p>
                  </div>
                ))}

                {!isNotReady && (
                  <div className="chat-no-indent">
                    <UploadButtonGroup
                      cancelLabel={UPLOAD_CONTENT.confirm.cancelLabel}
                      onCancel={() => setIsNotReady(true)}
                    />
                  </div>
                )}

                {isNotReady && (
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
                          onClick={() => {}}
                        >
                          파일 준비됐어요
                        </button>
                        <button
                          className="chat-option-btn chat-cancel-btn"
                          onClick={() => navigate('/home')}
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
                  <UploadButtonGroup cancelLabel={UPLOAD_CONTENT.coverage.cancelLabel} />
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