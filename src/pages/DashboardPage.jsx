import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Character from '../components/Character';
import InsuranceBadge from '../components/InsuranceBadge';
import CoverageCard from '../components/CoverageCard';
import { getDashboard } from '../api/dashboard';
import { buildSummaryTile } from '../utils/coverageMapper';
import { COVERAGE_META, COVERAGE_ORDER } from '../utils/coverageMeta';
import './DashboardPage.css';

const NOTICE_BANNER = '진단금, 수술비, 입원일당, 골절·재해는 보험사마다 따로 청구해서 모두 받을 수 있어요.';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { analysisId } = useParams();
  const [searchParams] = useSearchParams();
  const chatSessionId = searchParams.get('chatSessionId');
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
      <div className="result-page">
        <header className="result-header"><NavBar /></header>
        <main className="result-main">
          <p style={{ padding: '80px 0', textAlign: 'center', color: 'var(--gray-05)' }}>분석 결과를 찾을 수 없어요. 보험증권을 먼저 업로드해주세요.</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-page">
        <header className="result-header"><NavBar /></header>
        <main className="result-main">
          <p style={{ padding: '80px 0', textAlign: 'center', color: 'var(--gray-05)' }}>{error}</p>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="result-page">
        <header className="result-header"><NavBar /></header>
        <main className="result-main">
          <p style={{ padding: '80px 0', textAlign: 'center', color: 'var(--gray-05)' }}>불러오는 중이에요...</p>
        </main>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const coverages = COVERAGE_ORDER.map((coverageType) => {
    const meta = COVERAGE_META[coverageType];
    // 감지 안 된 보장은 백엔드가 항목 자체를 null로 내려보낼 때가 있어서 x가 null일 수 있음
    const c = data.coverages.find((x) => x && x.coverageType === coverageType);

    if (!c) {
      return { id: meta.id, icon: meta.icon, category: meta.label, amount: '', companies: [], inactive: true };
    }

    const { amountText, inactive } = buildSummaryTile(c);
    return {
      id: meta.id,
      icon: meta.icon,
      category: meta.label,
      amount: amountText,
      companies: inactive ? [] : [data.companyName],
      inactive,
    };
  });

  return (
    <div className="result-page">
      <header className="result-header">
        <NavBar />
      </header>

      <main className="result-main">

        {/* 타이틀 영역 */}
        <div className="result-title-area">
          <div className="result-title-left">
            <div className="result-title-row">
              <Character size="sm" animate />
              <h1 className="result-title">
                {user.nickname ?? '고객'}님이 보장을 받고 있는 항목들이에요
              </h1>
            </div>
            <p className="result-meta">
              {data.companyName} &bull; {data.insuranceStartDate} ~ {data.insuranceEndDate}
              <span className="result-meta__check">✓</span>
            </p>
          </div>
          <button className="result-report-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            분석 리포트
          </button>
        </div>

        {/* 보험사 필터 뱃지 */}
        <div className="result-badges">
          <InsuranceBadge company={data.companyName} year={data.insuranceStartDate?.slice(0, 4)} bold />
        </div>

        {/* 공지 배너 */}
        <div className="result-notice">
          <span className="result-notice__icon">!</span>
          <p className="result-notice__text">{NOTICE_BANNER}</p>
        </div>

        {/* 보장 카드 그리드 */}
        <div className="result-grid">
          {coverages.map((c) => (
            <CoverageCard
              key={c.id}
              icon={c.icon}
              category={c.category}
              amount={c.amount}
              companies={c.companies}
              inactive={c.inactive}
              // 실손은 상세페이지 디자인이 아직 없어서 클릭해도 이동하지 않음
              onClick={c.id === 'reimbursement' ? undefined : () => navigate(
                `/result/analysis/${analysisId}/${c.id}${chatSessionId != null ? `?chatSessionId=${chatSessionId}` : ''}`
              )}
            />
          ))}
        </div>

      </main>
    </div>
  );
}
