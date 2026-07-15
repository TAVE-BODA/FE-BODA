import { useState } from 'react';
import './EvidenceCard.css';
import bookmarkIcon from '../assets/images/bookmark-outline.png';
import docSearchIcon from '../assets/images/doc-search.png';
import chevronUpIcon from '../assets/images/chevron-up.png';

// citedText는 실제 약관 원문이라 줄바꿈(\r\n)이 조항 구조를 담고 있어요.
// 다 자연스럽게 보여주기 위해 자르지 않고, 과도한 빈 줄만 하나로 정리해요.
function formatCitedText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

// 기본으로는 이 길이만큼만 보여주고, "더보기"를 눌러야 전체 원문이 펼쳐짐.
// (법적 텍스트라 아예 자르고 끝내면 조건/예외 문구가 잘려 오해를 살 수 있어서
// 완전히 숨기지 않고 항상 펼쳐볼 수 있게 함)
const CLAUSE_PREVIEW_LENGTH = 150;

export default function EvidenceCard({
  tag,
  title,
  amount,
  description,
  tip,
  tone = 'default',
  sourceChunkIds,   // 이 카드가 참조하는 chunkId 목록 (resultMapper.js에서 내려줌)
  allSources,       // ResultPage가 한 번에 fetch해서 내려주는 전체 근거 목록 (null = 아직 요청 전/로딩 중)
  sourcesLoading,
  sourcesError,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSources, setExpandedSources] = useState({}); // { [chunkId]: true } - 더보기로 펼친 것만 기록

  const toggleSourceExpanded = (chunkId) => {
    setExpandedSources((prev) => ({ ...prev, [chunkId]: !prev[chunkId] }));
  };

  const hasClause = Array.isArray(sourceChunkIds) && sourceChunkIds.length > 0;
  const matchedSources = hasClause && allSources
    ? allSources.filter((s) => sourceChunkIds.includes(s.chunkId))
    : [];

  return (
    <div className="evidence-card">
      <button className="evidence-bookmark-btn" type="button" aria-label="스크랩">
        <img src={bookmarkIcon} alt="" />
      </button>

      {tag && (
        <span
          className={[
            'evidence-tag',
            tone === 'caution' ? 'evidence-tag--caution' : '',
          ].filter(Boolean).join(' ')}
        >
          {tag}
        </span>
      )}
      <h4 className="evidence-title">{title}</h4>
      {amount && <p className="evidence-amount">{amount}</p>}

      {Array.isArray(description) ? (
        <ul className="evidence-desc-list">
          {description.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="evidence-desc">{description}</p>
      )}

      {tip && <p className="evidence-tip">{tip}</p>}

      {hasClause && (
        <button
          className="evidence-toggle-btn"
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
        >
          <img src={docSearchIcon} alt="" className="evidence-toggle-icon" />
          <span>약관 근거 보기</span>
          <img
            src={chevronUpIcon}
            alt=""
            className="evidence-chevron"
            style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
          />
        </button>
      )}

      {isOpen && hasClause && (
        sourcesError ? (
          <p className="evidence-clause-ref">약관 근거를 불러오지 못했어요.</p>
        ) : !allSources && sourcesLoading ? (
          <p className="evidence-clause-ref">약관 근거를 불러오는 중이에요...</p>
        ) : matchedSources.length > 0 ? (
          <ul className="evidence-clause-list">
            {matchedSources.map((source) => {
              const fullText = formatCitedText(source.citedText);
              const isLong = fullText.length > CLAUSE_PREVIEW_LENGTH;
              const isExpanded = expandedSources[source.chunkId];
              const displayText = isLong && !isExpanded
                ? `${fullText.slice(0, CLAUSE_PREVIEW_LENGTH)}...`
                : fullText;

              return (
                <li key={source.chunkId}>
                  <strong>{source.title}</strong>
                  <div className="evidence-clause-text">
                    {displayText.split('\n').map((line, idx, arr) => (
                      <span key={idx}>
                        {line}
                        {idx < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  {isLong && (
                    <button
                      type="button"
                      className="evidence-clause-more-btn"
                      onClick={() => toggleSourceExpanded(source.chunkId)}
                    >
                      {isExpanded ? '접기' : '더보기'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : allSources ? (
          <p className="evidence-clause-ref">이 항목에 대한 약관 근거를 찾지 못했어요.</p>
        ) : null
      )}
    </div>
  );
}