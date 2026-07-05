import React, { useState } from 'react';
import './ServiceIntroPage.css';
import NavBar from '../components/NavBar';
import Character from '../components/Character';

function PopupContent({ cardId }) {
  if (cardId === 'what') {
    return (
      <div className="popup-content">
        <Character variant="curious" size="sm" />
        <h2 className="popup-title">보다가 뭐 하는 서비스야?</h2>
        <p className="popup-body">
          보험 증권이랑 약관 PDF를 올리면<br />
          <span className="popup-highlight">지금 내 상황에서 청구 가능한지</span><br />
          AI가 근거와 함께 알려줘요.
        </p>
        <p className="popup-body popup-body--spaced">
          막연한 추측이 아니라 약관 조항을 직접 찾아서<br />
          <span className="popup-highlight">"이 특약 3조에 따라 청구 가능해요"</span>처럼 답해드려요.
        </p>
      </div>
    );
  }

  if (cardId === 'how') {
    const steps = [
      { num: 1, title: '궁금한 질문 선택하기', desc: '청구·금액·서류·보장\n중에서 골라요' },
      { num: 2, title: '서류 올리기', desc: '보험증권 먼저,\n약관도 올리면 더 정확해요' },
      { num: 3, title: 'AI 분석', desc: '보다(BODA)가\n다 읽어요' },
      { num: 4, title: '결과 확인 & 추가 질문', desc: '더 궁금한 건\n바로 물어봐요' },
    ];
    return (
      <div className="popup-content">
        <Character variant="curious" size="sm" />
        <h2 className="popup-title">어떻게 쓰는 거야?</h2>
        <div className="popup-steps">
          {steps.map((step, i) => (
            <React.Fragment key={step.num}>
              <div className="popup-step">
                <span className="popup-step__num">{step.num}</span>
                <span className="popup-step__title">{step.title}</span>
                <span className="popup-step__desc">{step.desc.split('\n').map((line, j) => (
                  <React.Fragment key={j}>{line}{j === 0 && <br />}</React.Fragment>
                ))}</span>
              </div>
              {i < steps.length - 1 && <span className="popup-step-arrow">›</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (cardId === 'privacy') {
    return (
      <div className="popup-content">
        <Character variant="curious" size="sm" />
        <h2 className="popup-title">내 개인정보 괜찮아?</h2>
        <p className="popup-body">
          PDF 원본은 분석이 끝나는 즉시 삭제돼요.<br />
          보다가 저장하는 건 개인정보를 암호화한 텍스트로<br />
          추출된 보장 내용뿐이에요.
        </p>
        <p className="popup-body popup-body--spaced">
          보험증권 파일 자체는 서버에 남지 않아요.
        </p>
      </div>
    );
  }

  if (cardId === 'insurer') {
    const insurers = [
      { label: '삼성', cls: 'samsung' },
      { label: '한화', cls: 'hanwha' },
      { label: '교보', cls: 'kyobo' },
      { label: '현대', cls: 'hyundai' },
      { label: 'DB',   cls: 'db' },
      { label: '메리츠', cls: 'meritz' },
    ];
    return (
      <div className="popup-content">
        <Character variant="curious" size="sm" />
        <h2 className="popup-title">어떤 보험사가 되는거야?</h2>
        <p className="popup-body">
          전 보험사 분석이 가능해요.<br />
          아래 6개사는 더 높은 정확도로 분석돼요.
        </p>
        <div className="popup-insurers">
          {insurers.map(ins => (
            <span key={ins.label} className={`popup-insurer-chip popup-insurer-chip--${ins.cls}`}>
              {ins.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

const CARDS = [
  {
    id: 'what',
    text: '보다가 뭐하는 서비스야?',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="10" y="14" width="16" height="13" rx="2" stroke="#229cff" strokeWidth="2" fill="#c5eeff"/>
        <path d="M14 14V11a4 4 0 0 1 8 0v3" stroke="#229cff" strokeWidth="2" strokeLinecap="round"/>
        <rect x="15" y="19" width="6" height="3" rx="1" fill="#229cff"/>
      </svg>
    ),
  },
  {
    id: 'privacy',
    text: '내 개인정보 괜찮아?',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="11" y="16" width="14" height="11" rx="2" fill="#c5eeff" stroke="#229cff" strokeWidth="2"/>
        <path d="M14 16v-3a4 4 0 0 1 8 0v3" stroke="#229cff" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="18" cy="21" r="2" fill="#229cff"/>
        <line x1="18" y1="23" x2="18" y2="25" stroke="#229cff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'how',
    text: '어떻게 쓰는 거야?',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M8 12a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-4l-4 4v-4H12a4 4 0 0 1-4-4V12Z" fill="#c5eeff" stroke="#229cff" strokeWidth="2"/>
        <circle cx="13" cy="16" r="1.5" fill="#229cff"/>
        <circle cx="18" cy="16" r="1.5" fill="#229cff"/>
        <circle cx="23" cy="16" r="1.5" fill="#229cff"/>
      </svg>
    ),
  },
  {
    id: 'insurer',
    text: '어떤 보험사가 되는 거야?',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 8L9 12v6c0 5 4 9.7 9 11 5-1.3 9-6 9-11v-6L18 8Z" fill="#c5eeff" stroke="#229cff" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M14 18l2.5 2.5L22 15" stroke="#229cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function ServiceIntroPage() {
  const [openCard, setOpenCard] = useState(null);

  return (
    <div className="service-intro-page">
      <header className="service-intro-header">
        <NavBar />
      </header>

      <main className="service-intro-main">
        <p className="service-intro-label">
          <span className="service-intro-label__star">★</span> 서비스 소개
        </p>
        <h1 className="service-intro-title">boda에 오신것을 환영해요</h1>
        <p className="service-intro-subtitle">궁금한 말풍선을 눌러 boda를 알아가봐요</p>

        <div className="service-intro-grid">
          <div className="service-intro-col service-intro-col--left">
            {CARDS.slice(0, 2).map(card => (
              <button key={card.id} className="intro-card" onClick={() => setOpenCard(card.id)}>
                <span className="intro-card__icon">{card.icon}</span>
                <span className="intro-card__text">{card.text}</span>
              </button>
            ))}
          </div>

          <div className="service-intro-character">
            <Character variant="aha" size="lg" animate />
          </div>

          <div className="service-intro-col service-intro-col--right">
            {CARDS.slice(2, 4).map(card => (
              <button key={card.id} className="intro-card" onClick={() => setOpenCard(card.id)}>
                <span className="intro-card__icon">{card.icon}</span>
                <span className="intro-card__text">{card.text}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {openCard && (
        <div className="service-intro-overlay" onClick={() => setOpenCard(null)}>
          <div
            className={`service-intro-popup${openCard === 'how' ? ' service-intro-popup--wide' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <button className="service-intro-popup__close" onClick={() => setOpenCard(null)}>×</button>
            <PopupContent cardId={openCard} />
          </div>
        </div>
      )}
    </div>
  );
}
