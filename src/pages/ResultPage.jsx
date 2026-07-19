import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './ResultPage.css';
import NavBar from '../components/NavBar';
import EvidenceCard from '../components/EvidenceCard';
import { mapApiResponseToResultView } from '../utils/resultMapper';
import { RESULT_PREVIEW_SAMPLES } from '../data/resultPreviewSamples';
import { getMessageSources } from '../api/evidence';
import { sendInsuranceCondition, sendFreeTextMessage } from '../api/chat';
import characterResult from '../assets/images/characters/character_result2.png';
import checkBadge from '../assets/images/check-badge.png';
import checkBadgePurple from '../assets/images/check-badge-purple.png';
import checkBadgeGreen from '../assets/images/check-badge-green.png';

const BADGE_BY_THEME = {
  main: checkBadge,
  purple: checkBadgePurple,
  green: checkBadgeGreen,
};

export default function ResultPage({ data, onSelectFollowup, onCustomInput }) {
  const { sampleKey } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [apiResultData, setApiResultData] = useState(
    location.state?.resultData || (sampleKey ? RESULT_PREVIEW_SAMPLES[sampleKey] : null)
  );
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const [customInputText, setCustomInputText] = useState('');
  const [freeTextTurns, setFreeTextTurns] = useState([]);
  const [isCustomSending, setIsCustomSending] = useState(false);

  const chatSessionId = location.state?.chatSessionId;
  const conditionData = location.state?.conditionData;

  const resolvedData = data || (apiResultData ? mapApiResponseToResultView(apiResultData) : null);
  const sourceMessageId = resolvedData?.sourceMessageId;

  const [sources, setSources] = useState(null);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesError, setSourcesError] = useState(null);

  useEffect(() => {
    if (!sourceMessageId) return;
    let cancelled = false;
    setSources(null);
    setSourcesError(null);
    setSourcesLoading(true);

    getMessageSources(sourceMessageId)
      .then((result) => {
        if (!cancelled) setSources(result.sources || []);
      })
      .catch((err) => {
        if (!cancelled) setSourcesError(err.message || '약관 근거를 불러오지 못했어요.');
      })
      .finally(() => {
        if (!cancelled) setSourcesLoading(false);
      });

    return () => { cancelled = true; };
  }, [sourceMessageId]);

  const handleSelectFollowup = async (optionNumber) => {
    if (onSelectFollowup) {
      onSelectFollowup(optionNumber);
      return;
    }

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
      setApiResultData(result);
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

  const handleCustomInputClick = () => {
    if (onCustomInput) {
      onCustomInput();
      return;
    }
    setIsCustomInputOpen(true);
  };

  const handleCustomSubmit = async () => {
    const text = customInputText.trim();
    if (!text || isCustomSending) return;

    if (!chatSessionId) {
      if (sampleKey) {
        setIsCustomSending(true);
        setTimeout(() => {
          setFreeTextTurns((prev) => [...prev, {
            userText: text,
            aiText: `(프리뷰 모드라 실제 API 호출은 안 했어요)\n"${text}"에 대한 답변은 이 자리에 이렇게 나올 거예요.\n실제 배포/로그인 환경에서는 여기에 진짜 백엔드 답변이 표시돼요.`,
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
      const aiText = result?.aiMessage?.messageContent || '답변을 받지 못했어요.';
      setFreeTextTurns((prev) => [...prev, { userText: text, aiText }]);
      setCustomInputText('');
    } catch (error) {
      console.error('자유 입력 질문 전송 오류:', error);
      alert('답변을 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      setIsCustomSending(false);
    }
  };

  const handleEndConversation = () => {
    navigate('/home');
  };

  if (!resolvedData) {
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

  const {
    theme = 'main',
    userQuestion,
    resultTitle,
    resultSummary,
    highlightType,
    highlightText,
    highlightLabel,
    highlightAmount,
    evidences,
    followupOptions,
  } = resolvedData;

  return (
    <div className={`result-page-container theme-${theme}`}>
      <header className="result-header">
        <NavBar />
      </header>

      <div className="result-content-wrap">
        <div className="result-user-row">
          <div className="result-user-question">{userQuestion}</div>
        </div>

        <div className="result-main-row">
          <div className="result-avatar-area">
            <img src={characterResult} alt="" className="result-character" />
          </div>

          <div className="result-bubble">
            <h3 className="result-bubble-title">{resultTitle}</h3>
            <p className="result-bubble-desc">{resultSummary}</p>

            <div className="result-highlight-box">
              <img
                src={BADGE_BY_THEME[theme] || checkBadge}
                alt=""
                className="result-check-badge"
              />
              {highlightType === 'amount' ? (
                <div>
                  <p className="result-highlight-label">{highlightLabel}</p>
                  <p className="result-highlight-amount">{highlightAmount}</p>
                </div>
              ) : (
                <p className="result-highlight-text">
                  {highlightText.split('\n').map((line, idx, arr) => (
                    <span key={idx}>
                      {line}
                      {idx < arr.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>
        </div>

        {evidences.length > 0 && (
        <div className="result-evidence-list">
          {evidences.map((item) => (
            <EvidenceCard
              key={item.id}
              tag={item.tag}
              title={item.title}
              amount={item.amount}
              description={item.description}
              tip={item.tip}
              tone={item.tone}
              highlight={item.highlight}
              sourceChunkIds={item.sourceChunkIds}
              allSources={sources}
              sourcesLoading={sourcesLoading}
              sourcesError={sourcesError}
            />
          ))}
        </div>
        )}

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
              {freeTextTurns.map((turn, idx) => (
                <div key={idx} className="result-freechat-turn">
                  <div className="result-freechat-user-bubble">{turn.userText}</div>
                  <div className="result-freechat-answer-row">
                    <div className="result-avatar-area">
                      <img src={characterResult} alt="" className="result-character" />
                    </div>
                    <div className="result-freechat-answer-bubble">
                      {turn.aiText.split('\n').map((line, i, arr) => (
                        <span key={i}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

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

                {freeTextTurns.length > 0 && (
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