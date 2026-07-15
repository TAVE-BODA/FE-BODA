import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './ResultPage.css';
import NavBar from '../components/NavBar';
import EvidenceCard from '../components/EvidenceCard';
import { mapApiResponseToResultView } from '../utils/resultMapper';
import { RESULT_PREVIEW_SAMPLES } from '../data/resultPreviewSamples';
import { getMessageSources } from '../api/evidence';
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
  const apiResultData = location.state?.resultData || (sampleKey ? RESULT_PREVIEW_SAMPLES[sampleKey] : null);
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
              sourceChunkIds={item.sourceChunkIds}
              allSources={sources}
              sourcesLoading={sourcesLoading}
              sourcesError={sourcesError}
            />
          ))}
        </div>
        )}

        <div className="result-followup-area">
          <p className="result-followup-lead">더 궁금한 점 있으세요?</p>
          {followupOptions.map((opt) => (
            <button
              key={opt.number}
              className="result-followup-btn"
              onClick={() => onSelectFollowup?.(opt.number)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
          <button
            className="result-custom-input-btn"
            onClick={onCustomInput}
            type="button"
          >
            직접 입력할게요
          </button>
        </div>
      </div>
    </div>
  );
}