import { useState, useEffect } from 'react';
import EvidenceCard from './EvidenceCard';
import { mapApiResponseToResultView } from '../utils/resultMapper';
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

// 대화 스레드 안에서 칩1/2/3 결과 한 턴을 담당. 턴마다 근거자료(getMessageSources)를
// 독립적으로 조회해야 해서(훅은 가변 개수로 못 부르므로) 턴 하나당 컴포넌트 인스턴스 하나.
export default function ChipResultTurn({ turn }) {
  const resolvedData = mapApiResponseToResultView(turn);
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

  if (!resolvedData) return null;

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
  } = resolvedData;

  return (
    <div className={`theme-${theme}`}>
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
    </div>
  );
}
