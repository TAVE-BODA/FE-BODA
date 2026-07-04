import React, { useState } from 'react';
import './ServiceIntroPage.css';
import NavBar from '../components/NavBar';
import Character from '../components/Character';

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
          <div className="service-intro-popup" onClick={e => e.stopPropagation()}>
            {/* 팝업 내용은 추후 추가 */}
            <button className="service-intro-popup__close" onClick={() => setOpenCard(null)}>×</button>
            <p>{CARDS.find(c => c.id === openCard)?.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
