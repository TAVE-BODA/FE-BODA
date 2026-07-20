import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './ResultPage.css';
import NavBar from '../components/NavBar';
import ChipResultTurn from '../components/ChipResultTurn';
import { mapApiResponseToResultView, pairMessagesIntoTurns, buildUserQuestionText } from '../utils/resultMapper';
import { RESULT_PREVIEW_SAMPLES } from '../data/resultPreviewSamples';
import { sendInsuranceCondition, sendFreeTextMessage } from '../api/chat';
import characterResult from '../assets/images/characters/character_result2.png';

function FreeTextTurn({ turn }) {
  // 자유입력으로 보낸 메시지도 백엔드가 원본 조건 텍스트("[사용자 입력 조건]...")를 덧붙여
  // 그대로 돌려줘서, 칩 결과와 동일하게 잘라내는 로직을 거쳐야 함
  const userQuestion = buildUserQuestionText(turn.userMessage, turn.userMessage?.questionType);
  return (
    <div className="result-freechat-turn">
      <div className="result-freechat-user-bubble">{userQuestion}</div>
      <div className="result-freechat-answer-row">
        <div className="result-avatar-area">
          <img src={characterResult} alt="" className="result-character" />
        </div>
        <div className="result-freechat-answer-bubble">
          {(turn.aiMessage?.messageContent || '').split('\n').map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const { sampleKey } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 마이페이지에서 이어서 연 세션(resultHistory, 전체 대화)/방금 제출한 결과(resultData,
  // 한 턴)/디자인 프리뷰(sampleKey) 중 있는 걸로 스레드를 시작함. 셋 다 없으면 빈 스레드.
  const seedTurns = () => {
    const state = location.state || {};
    if (state.resultHistory) return pairMessagesIntoTurns(state.resultHistory);
    if (state.resultData) return [state.resultData];
    if (sampleKey && RESULT_PREVIEW_SAMPLES[sampleKey]) return [RESULT_PREVIEW_SAMPLES[sampleKey]];
    return [];
  };

  const [turns, setTurns] = useState(seedTurns);
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(
    () => seedTurns().some((t) => t.aiMessage?.questionType === 'FREE_TEXT')
  );
  const [customInputText, setCustomInputText] = useState('');
  const [isCustomSending, setIsCustomSending] = useState(false);

  const chatSessionId = location.state?.chatSessionId;
  const conditionData = location.state?.conditionData;

  // 후속 질문 버튼은 대화가 자유입력으로 이어진 뒤에도 계속 뜰 수 있게, 스레드의
  // 마지막 "칩" 턴(자유입력이 아닌 마지막 턴) 기준으로 구함
  const lastChipView = [...turns].reverse()
    .map(mapApiResponseToResultView)
    .find((v) => v?.followupOptions?.length > 0);
  const followupOptions = lastChipView?.followupOptions ?? [];
  const hasFreeTextTurn = turns.some((t) => t.aiMessage?.questionType === 'FREE_TEXT');

  const handleSelectFollowup = async (optionNumber) => {
    if (optionNumber === 4) {
      if (!chatSessionId) {
        alert('세션 정보가 없어서 보장 항목을 볼 수 없어요. 증권·약관 업로드부터 다시 진행해주세요.');
        navigate('/upload');
        return;
      }
      navigate(`/result/summary/${chatSessionId}`);
      return;
    }

    if (!chatSessionId || !conditionData) {
      alert('다시 조건을 입력해야 다른 결과를 볼 수 있어요. 증권·약관 업로드부터 다시 진행해주세요.');
      navigate('/upload');
      return;
    }

    setIsFollowupLoading(true);
    try {
      const result = await sendInsuranceCondition(chatSessionId, conditionData, optionNumber);
      setTurns((prev) => [...prev, result]);
      navigate(`/result/option/${optionNumber}`, {
        state: { resultData: result, chatSessionId, conditionData },
        replace: true,
      });
    } catch (error) {
      console.error('후속 질문 전송 오류:', error);
      alert('결과를 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      setIsFollowupLoading(false);
    }
  };

  const handleCustomInputClick = () => setIsCustomInputOpen(true);

  const handleCustomSubmit = async () => {
    const text = customInputText.trim();
    if (!text || isCustomSending) return;

    if (!chatSessionId) {
      if (sampleKey) {
        setIsCustomSending(true);
        setTimeout(() => {
          setTurns((prev) => [...prev, {
            userMessage: { messageContent: text, senderType: 'USER', questionType: 'FREE_TEXT' },
            aiMessage: {
              messageContent: `(프리뷰 모드라 실제 API 호출은 안 했어요)\n"${text}"에 대한 답변은 이 자리에 이렇게 나올 거예요.\n실제 배포/로그인 환경에서는 여기에 진짜 백엔드 답변이 표시돼요.`,
              senderType: 'AI', questionType: 'FREE_TEXT', hasSources: false,
            },
          }]);
          setCustomInputText('');
          setIsCustomSending(false);
        }, 500);
        return;
      }

      alert('세션 정보가 없어서 질문할 수 없어요. 증권·약관 업로드부터 다시 진행해주세요.');
      navigate('/upload');
      return;
    }

    setIsCustomSending(true);
    try {
      const result = await sendFreeTextMessage(chatSessionId, text);
      setTurns((prev) => [...prev, result]);
      setCustomInputText('');
    } catch (error) {
      console.error('자유 입력 질문 전송 오류:', error);
      alert('답변을 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      setIsCustomSending(false);
    }
  };

  const handleEndConversation = () => navigate('/home');

  if (turns.length === 0) {
    return (
      <div className="result-page-container">
        <header className="result-header">
          <NavBar />
        </header>
        <div className="result-empty-wrap">
          <p className="result-empty-title">결과를 불러올 수 없어요</p>
          <p className="result-empty-desc">
            {sampleKey
              ? `"${sampleKey}"라는 샘플은 없어요. src/data/resultPreviewSamples.js에서 사용 가능한 키를 확인해주세요.`
              : (
                <>
                  새로고침했거나 잘못된 경로로 들어오면 결과 데이터가 사라져요.
                  <br />
                  증권·약관 업로드부터 다시 진행해주세요.
                </>
              )}
          </p>
          <button
            className="result-empty-btn"
            type="button"
            onClick={() => navigate('/upload')}
          >
            처음부터 다시 하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="result-page-container">
      <header className="result-header">
        <NavBar />
      </header>

      <div className="result-content-wrap">
        {turns.map((turn, idx) => (
          turn.aiMessage?.questionType === 'FREE_TEXT'
            ? <FreeTextTurn key={turn.aiMessage?.messageId ?? `free-${idx}`} turn={turn} />
            : <ChipResultTurn key={turn.aiMessage?.messageId ?? `chip-${idx}`} turn={turn} />
        ))}

        <div className="result-followup-area">
          <p className="result-followup-lead">
            {isFollowupLoading ? '다음 답변을 준비하고 있어요...' : '더 궁금한 점 있으세요?'}
          </p>
          {followupOptions.map((opt) => (
            <button
              key={opt.number}
              className="result-followup-btn"
              onClick={() => handleSelectFollowup(opt.number)}
              disabled={isFollowupLoading}
              type="button"
            >
              {opt.label}
            </button>
          ))}
          {isCustomInputOpen ? (
            <div className="result-freechat-area">
              <div className="result-freechat-composer">
                <div className="result-custom-input-box">
                  <input
                    type="text"
                    className="result-custom-input-field"
                    placeholder="궁금한 점을 자유롭게 입력해보세요"
                    value={customInputText}
                    onChange={(e) => setCustomInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCustomSubmit(); }}
                    disabled={isCustomSending}
                    autoFocus
                  />
                  <button
                    className="result-custom-input-send-btn"
                    onClick={handleCustomSubmit}
                    disabled={isCustomSending || !customInputText.trim()}
                    type="button"
                    aria-label="전송"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M10 15V5M10 5L5 10M10 5L15 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {hasFreeTextTurn && (
                  <button
                    className="result-freechat-end-btn"
                    onClick={handleEndConversation}
                    type="button"
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    대화 끝내기
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              className="result-custom-input-btn"
              onClick={handleCustomInputClick}
              disabled={isFollowupLoading}
              type="button"
            >
              직접 입력할게요
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
