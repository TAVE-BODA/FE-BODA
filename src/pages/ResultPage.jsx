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
  const { sampleKey } = useParams(); // /result/preview/:sampleKey로 들어왔을 때만 존재
  const location = useLocation();
  const navigate = useNavigate();

  // 우선순위: 1) data prop 직접 전달 2) UploadPage가 navigate state로 넘긴 실제 응답
  // 3) /result/preview/:sampleKey로 들어왔으면 저장해둔 샘플 응답
  // (더미 데이터는 더 이상 안 씀 -> 셋 다 없으면 안내 화면으로 대체)
  // apiResultData를 state로 들고 있어야 후속 질문(다른 칩) 클릭 시 새 응답으로 교체할 수 있음
  const [apiResultData, setApiResultData] = useState(
    location.state?.resultData || (sampleKey ? RESULT_PREVIEW_SAMPLES[sampleKey] : null)
  );
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const [customInputText, setCustomInputText] = useState('');
  const [freeTextTurns, setFreeTextTurns] = useState([]); // [{ userText, aiText }] - 직접 입력으로 이어가는 대화 기록
  const [isCustomSending, setIsCustomSending] = useState(false);

  // 후속 질문을 다시 물어보려면 최초 조건 입력 당시의 세션/조건 정보가 필요함.
  // UploadPage가 navigate state에 같이 실어보내줌 (resultData만 있으면 재요청 불가)
  const chatSessionId = location.state?.chatSessionId;
  const conditionData = location.state?.conditionData;

  const resolvedData = data || (apiResultData ? mapApiResponseToResultView(apiResultData) : null);
  const sourceMessageId = resolvedData?.sourceMessageId;

  // 약관 근거(citation)는 카드마다 따로 안 불러오고, 메시지 하나당 한 번만 fetch해서
  // 카드들이 sourceChunkIds로 각자 필요한 것만 걸러쓰게 함 (Rules of Hooks 때문에
  // 아래 !resolvedData 얼리 리턴보다 반드시 위에 있어야 함)
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

  // 후속 질문(다른 칩) 클릭 시: 같은 세션/조건으로 questionType만 바꿔서 다시 물어봄
  const handleSelectFollowup = async (optionNumber) => {
    // 커스텀 override가 주어졌으면(예: 채팅 위젯 안에 임베드된 경우) 그쪽에 위임
    if (onSelectFollowup) {
      onSelectFollowup(optionNumber);
      return;
    }

    // 4번(내 보험의 보장 항목)은 우리 chat messages 흐름이 아니라, 증권 업로드 ->
    // 합산 대시보드(UploadOverviewPage -> SummaryDashboardPage)로 연결됨. 여기서
    // sendInsuranceCondition을 호출하면 안 됨 - resultMapper.js가 CHIP_OVERVIEW 구조를
    // 모르기도 하고, ChatPage.jsx의 최초 진입점과 동일하게 기존 chatSessionId를 재사용.
    if (optionNumber === 4) {
      navigate('/upload/overview', { state: { chatSessionId } });
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
      // 주소도 새 옵션 번호로 맞춰주고, 새로고침해도 유지되도록 state 다시 실어보냄
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
    // 커스텀 override가 주어졌으면 그쪽에 위임 (기존 onCustomInput prop 방식 유지)
    if (onCustomInput) {
      onCustomInput();
      return;
    }
    setIsCustomInputOpen(true);
  };

  // FREE_TEXT로 질문 보내고, 응답의 aiMessage.messageContent를 대화 턴으로 추가.
  // 계속 이어서 물어볼 수 있게 입력창은 매 턴마다 다시 뜸.
  const handleCustomSubmit = async () => {
    const text = customInputText.trim();
    if (!text || isCustomSending) return;

    if (!chatSessionId) {
      // 프리뷰 모드(/result/preview/:sampleKey)는 진짜 chatSessionId가 없어서 API를
      // 호출할 수 없음 -> 실제 백엔드 없이도 대화가 쌓이는 레이아웃/스크롤 동작만
      // 로컬에서 확인할 수 있게 가짜 응답으로 대체함. 실제 플로우엔 영향 없음.
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
                  <div className="result-freechat-composer-footer">
                    <button
                      className="result-freechat-end-btn"
                      onClick={handleEndConversation}
                      type="button"
                    >
                      대화 끝내기
                    </button>
                  </div>
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