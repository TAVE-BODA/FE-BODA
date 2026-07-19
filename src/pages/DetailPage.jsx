import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Character from '../components/Character';
import InsuranceDetailCard from '../components/InsuranceDetailCard';
import { getDashboard } from '../api/dashboard';
import { buildDetailRows } from '../utils/coverageMapper';
import { ICONS, COVERAGE_TYPE_BY_ID, TEXT_BY_ID } from '../utils/detailMeta';
import './DetailPage.css';

export default function DetailPage() {
  const { analysisId, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!analysisId) return;
    getDashboard(analysisId)
      .then(setData)
      .catch(() => setError('데이터를 불러오지 못했어요.'));
  }, [analysisId]);

  if (!analysisId) {
    return (
      <div className="detail-page">
        <NavBar />
        <p style={{ padding: '120px 40px', color: 'var(--gray-05)' }}>분석 결과를 찾을 수 없어요. 보험증권을 먼저 업로드해주세요.</p>
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

  if (!data) {
    return (
      <div className="detail-page">
        <NavBar />
        <p style={{ padding: '120px 40px', color: 'var(--gray-05)' }}>불러오는 중이에요...</p>
      </div>
    );
  }

  const coverageType = COVERAGE_TYPE_BY_ID[id];
  const coverage = data.coverages.find((c) => c.coverageType === coverageType);
  const text = TEXT_BY_ID[id];

  if (!coverage || !text) {
    return (
      <div className="detail-page">
        <NavBar />
        <p style={{ padding: '120px 40px', color: 'var(--gray-05)' }}>페이지를 찾을 수 없어요.</p>
      </div>
    );
  }

  const rows = buildDetailRows(coverageType, coverage.items);
  const period = `${data.insuranceStartDate} ~ ${data.insuranceEndDate}`;

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
            <h1 className="detail-title">{text.title}</h1>
          </div>
        </div>

        <p className="detail-subtitle">{text.subtitle}</p>

        {/* 보험사별 카드 */}
        <div className="detail-cards">
          <InsuranceDetailCard company={data.companyName} period={period} rows={rows} />
        </div>

        {/* 하단 CTA 배너 */}
        <div className="detail-cta">
          <Character size="sm" animate />
          <p className="detail-cta__text">{text.ctaText}</p>
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
