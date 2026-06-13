import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Character from '../components/Character';
import InsuranceDetailCard from '../components/InsuranceDetailCard';
import { COVERAGE_DETAIL } from '../data/coverageDetailData';
import './DetailPage.css';

// 카테고리별 아이콘
const ICONS = {
  diagnosis: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21h6M10 17v4M14 17v4" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  surgery: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3.5" stroke="#229cff" strokeWidth="1.8"/>
    </svg>
  ),
  hospital: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#229cff" strokeWidth="1.8"/>
      <path d="M3 9h18M9 5V3M15 5V3M9 13h2v2h2v-2h2v-2h-2v-2h-2v2H9v2z" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  bone: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M6.5 6.5C5.67 5.67 5.67 4.33 6.5 3.5S8.33 2.67 9.17 3.5L20.5 14.83c.83.84.83 2.17 0 3S18.17 18.67 17.33 17.83" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M17.5 17.5c.83.83.83 2.17 0 3s-2.17.83-3 0L3.17 9.17c-.83-.84-.83-2.17 0-3s2.17-.83 3 0" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  tooth: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C9.24 2 7 4.24 7 7c0 1.3.5 2.48 1.3 3.37C7.48 12.2 7 14.05 7 16c0 2.21.9 4 2 4s2-1.79 2-4c0-.55.45-1 1-1s1 .45 1 1c0 2.21.9 4 2 4s2-1.79 2-4c0-1.95-.48-3.8-1.3-5.63C16.5 9.48 17 8.3 17 7c0-2.76-2.24-5-5-5z" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = COVERAGE_DETAIL[id];

  if (!data) {
    return (
      <div className="detail-page">
        <NavBar />
        <p style={{ padding: '120px 40px', color: 'var(--gray-05)' }}>페이지를 찾을 수 없어요.</p>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <header className="detail-header">
        <NavBar />
      </header>

      <main className="detail-main">

        {/* 뒤로가기 + 타이틀 */}
        <div className="detail-top">
          <button className="detail-back-btn" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            돌아가기
          </button>
          <div className="detail-title-row">
            {ICONS[id]}
            <h1 className="detail-title">{data.title}</h1>
          </div>
        </div>

        <p className="detail-subtitle">{data.subtitle}</p>

        {/* 보험사별 카드 */}
        <div className="detail-cards">
          {data.companies.map((c) => (
            <InsuranceDetailCard
              key={c.company}
              company={c.company}
              period={c.period}
              rows={c.rows}
            />
          ))}
        </div>

        {/* 하단 CTA 배너 */}
        <div className="detail-cta">
          <Character size="sm" animate />
          <p className="detail-cta__text">{data.ctaText}</p>
          <button className="detail-cta__btn" onClick={() => navigate('/upload')}>
            약관 업로드하러 가기
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </main>
    </div>
  );
}
