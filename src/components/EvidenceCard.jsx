import { useState } from 'react';
import './EvidenceCard.css';
import bookmarkIcon from '../assets/images/bookmark-outline.png';
import docSearchIcon from '../assets/images/doc-search.png';
import chevronUpIcon from '../assets/images/chevron-up.png';

export default function EvidenceCard({ tag, title, description, clauseRef }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="evidence-card">
      <button className="evidence-bookmark-btn" type="button" aria-label="스크랩">
        <img src={bookmarkIcon} alt="" />
      </button>

      <span className="evidence-tag">{tag}</span>
      <h4 className="evidence-title">{title}</h4>
      <p className="evidence-desc">{description}</p>

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

      {isOpen && clauseRef && (
        <p className="evidence-clause-ref">{clauseRef}</p>
      )}
    </div>
  );
}