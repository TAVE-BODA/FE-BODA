import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Character from '../components/Character';
import InsuranceDetailCard from '../components/InsuranceDetailCard';
import { getDashboard, getDashboardSummary } from '../api/dashboard';
import { buildDetailRows } from '../utils/coverageMapper';
import { ICONS, COVERAGE_TYPE_BY_ID, TEXT_BY_ID } from '../utils/detailMeta';
import './DetailPage.css';

// 합산 대시보드(SummaryDashboardPage)의 카드 클릭 시 이동하는 상세 페이지.
// GET /api/dashboard/summary/{chatSessionId}(DashboardResponse)에는 회사별 상세 항목(items)이
// 없어서, 응답에 담긴 analysisIds 각각을 기존 GET /api/dashboard/analysis/{analysisId}
// (DashcardResponse, items 포함)로 다시 조회해서 보험사별 카드를 만든다.
export default function SummaryDetailPage() {
  const { chatSessionId, id } = useParams();
  const navigate = useNavigate();
  const [dashcards, setDashcards] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatSessionId) return;
    getDashboardSummary(chatSessionId)
      .then((summary) => Promise.all((summary.analysisIds ?? []).map((analysisId) => getDashboard(analysisId))))
      .then(setDashcards)
      .catch(() => setError('데이터를 불러오지 못했어요.'));
  }, [chatSessionId]);

  if (!chatSessionId) {
    return (
      <div className="detail-page">
        <NavBar />
        <p style={{ padding: '120px 40px', color: 'var(--gray-05)' }}>세션 정보를 찾을 수 없어요. 보험증권을 먼저 업로드해주세요.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <NavBar />
        <p style={{ padding: '120px 40px', color: 'var(--gray-05)' }}>{error}</p>
      </div>
    );
  }

  if (!dashcards) {
    return (
      <div className="detail-page">
        <NavBar />
        <p style={{ padding: '120px 40px', color: 'var(--gray-05)' }}>불러오는 중이에요...</p>
      </div>
    );
  }

  const coverageType = COVERAGE_TYPE_BY_ID[id];
  const text = TEXT_BY_ID[id];

  const cards = dashcards
    .map((d) => ({
      analysisId: d.analysisId,
      companyName: d.companyName,
      period: `${d.insuranceStartDate} ~ ${d.insuranceEndDate}`,
      coverage: d.coverages.find((c) => c.coverageType === coverageType),
    }))
    .filter(({ coverage }) => coverage?.isDetected);

  if (!coverageType || !text || cards.length === 0) {
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

        <div className="detail-top">
          <button className="detail-back-btn" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            돌아가기
          </button>
          <div className="detail-title-row">
            {ICONS[id]}
            <h1 className="detail-title">{text.title}</h1>
          </div>
        </div>

        <p className="detail-subtitle">{text.subtitle}</p>

        <div className="detail-cards">
          {cards.map(({ analysisId, companyName, period, coverage }) => (
            <InsuranceDetailCard
              key={analysisId}
              company={companyName}
              period={period}
              rows={buildDetailRows(coverageType, coverage.items)}
            />
          ))}
        </div>

        <div className="detail-cta">
          <Character size="sm" animate />
          <p className="detail-cta__text">{text.ctaText}</p>
          <button className="detail-cta__btn" onClick={() => navigate('/upload/overview')}>
            증권 업로드하러 가기
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </main>
    </div>
  );
}
