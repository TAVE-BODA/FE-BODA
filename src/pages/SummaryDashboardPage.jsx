import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Character from '../components/Character';
import InsuranceBadge from '../components/InsuranceBadge';
import CoverageCard from '../components/CoverageCard';
import { getDashboardSummary } from '../api/dashboard';
import { buildCoverageSummaryTile } from '../utils/coverageMapper';
import { COVERAGE_META, COVERAGE_ORDER } from '../utils/coverageMeta';
import './DashboardPage.css';

const NOTICE_BANNER = '진단금, 수술비, 입원일당, 골절·재해는 보험사마다 따로 청구해서 모두 받을 수 있어요.';

// 칩4(내 보험 보장 항목부터 보기) 전용: 최대 3개까지 업로드한 보험증권을 백엔드가 이미
// coverageType별로 합산(min~max, 감지된 회사 목록)해서 내려주는 GET /api/dashboard/summary/{chatSessionId}
// 응답(DashboardResponse)을 그대로 렌더링. 회사별 상세 항목은 이 응답에 없어서 안 다룸 — SummaryDetailPage 참고.
export default function SummaryDashboardPage() {
  const navigate = useNavigate();
  const { chatSessionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatSessionId) return;
    getDashboardSummary(chatSessionId)
      .then(setData)
      .catch(() => setError('데이터를 불러오지 못했어요.'));
  }, [chatSessionId]);

  if (!chatSessionId) {
    return (
      <div className="result-page">
        <header className="result-header"><NavBar /></header>
        <main className="result-main">
          <p style={{ padding: '80px 0', textAlign: 'center', color: 'var(--gray-05)' }}>세션 정보를 찾을 수 없어요. 보험증권을 먼저 업로드해주세요.</p>
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

  const companyNames = data.companyNames ?? [];
  const coverages = COVERAGE_ORDER.map((coverageType) => {
    const meta = COVERAGE_META[coverageType];
    const summary = data.coverageSummaries?.find((s) => s.coverageType === coverageType);
    const { amountText, companies, inactive } = buildCoverageSummaryTile(summary);
    return { id: meta.id, icon: meta.icon, category: meta.label, amount: amountText, companies, inactive };
  });

  return (
    <div className="result-page">
      <header className="result-header">
        <NavBar />
      </header>

      <main className="result-main">

        <div className="result-title-area">
          <div className="result-title-left">
            <div className="result-title-row">
              <Character size="sm" animate />
              <h1 className="result-title">
                {data.insuredName ?? '고객'}님이 보장을 받고 있는 항목들이에요
              </h1>
            </div>
            <p className="result-meta">
              보험 {companyNames.length}개 분석 완료 &bull; {data.analysisCompletedAt}
              <span className="result-meta__check">✓</span>
            </p>
          </div>
        </div>

        <div className="result-badges">
          {companyNames.map((name) => (
            <InsuranceBadge key={name} company={name} bold />
          ))}
        </div>

        <div className="result-notice">
          <span className="result-notice__icon">!</span>
          <p className="result-notice__text">{NOTICE_BANNER}</p>
        </div>

        <div className="result-grid">
          {coverages.map((c) => (
            <CoverageCard
              key={c.id}
              icon={c.icon}
              category={c.category}
              amount={c.amount}
              companies={c.companies}
              inactive={c.inactive}
              onClick={() => navigate(`/result/summary/${chatSessionId}/${c.id}`)}
            />
          ))}
        </div>

      </main>
    </div>
  );
}
