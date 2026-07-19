import { useState } from 'react';
import './EvidenceCard.css';
import bookmarkIcon from '../assets/images/bookmark-outline.png';
import docSearchIcon from '../assets/images/doc-search.png';
import chevronUpIcon from '../assets/images/chevron-up.png';

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
            {matchedSources.map((source) => (
              <li key={source.chunkId}>{source.title}</li>
            ))}
          </ul>
        ) : allSources ? (
          <p className="evidence-clause-ref">이 항목에 대한 약관 근거를 찾지 못했어요.</p>
        ) : null
      )}
    </div>
  );
}