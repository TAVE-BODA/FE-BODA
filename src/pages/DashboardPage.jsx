import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Character from '../components/Character';
import InsuranceBadge from '../components/InsuranceBadge';
import CoverageCard from '../components/CoverageCard';
import { getDashboard } from '../api/dashboard';
import { buildSummaryTile } from '../utils/coverageMapper';
import './DashboardPage.css';

// ── 아이콘 (SVG 인라인) ────────────────────────────────────
const IconDiagnosis = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21h6M10 17v4M14 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconSurgery = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

const IconHospital = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M3 9h18M9 5V3M15 5V3M9 13h2v2h2v-2h2v-2h-2v-2h-2v2H9v2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconBone = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M6.5 6.5C5.67 5.67 5.67 4.33 6.5 3.5S8.33 2.67 9.17 3.5L20.5 14.83c.83.84.83 2.17 0 3S18.17 18.67 17.33 17.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M17.5 17.5c.83.83.83 2.17 0 3s-2.17.83-3 0L3.17 9.17c-.83-.84-.83-2.17 0-3s2.17-.83 3 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconTooth = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C9.24 2 7 4.24 7 7c0 1.3.5 2.48 1.3 3.37C7.48 12.2 7 14.05 7 16c0 2.21.9 4 2 4s2-1.79 2-4c0-.55.45-1 1-1s1 .45 1 1c0 2.21.9 4 2 4s2-1.79 2-4c0-1.95-.48-3.8-1.3-5.63C16.5 9.48 17 8.3 17 7c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 백엔드 coverageType 문자열 <-> 화면 라우트 id / 아이콘 매핑
const COVERAGE_META = {
  '진단비':  { id: 'diagnosis',    label: '진단',     icon: <IconDiagnosis /> },
  '수술비':  { id: 'surgery',      label: '수술',     icon: <IconSurgery />   },
  '입원비':  { id: 'hospital',     label: '입원',     icon: <IconHospital />  },
  '골절재해': { id: 'bone',        label: '골절·재해', icon: <IconBone />      },
  '치아':    { id: 'tooth',        label: '치아',     icon: <IconTooth />     },
  '실손':    { id: 'reimbursement', label: '실손',    icon: <IconHospital /> },
};

// 대시보드 카드 고정 노출 순서 (백엔드 응답 순서와 무관하게 항상 이 순서로 렌더링)
const COVERAGE_ORDER = ['진단비', '수술비', '입원비', '골절재해', '치아', '실손'];

const NOTICE_BANNER = '진단금, 수술비, 입원일당, 골절·재해는 보험사마다 따로 청구해서 모두 받을 수 있어요.';

export default function DashboardPage() {
  const navigate = useNavigate();
  const analysisId = localStorage.getItem('analysisId');
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
    const c = data.coverages.find((x) => x.coverageType === coverageType);

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
              onClick={() => navigate(`/result/${c.id}`)}
            />
          ))}
        </div>

      </main>
    </div>
  );
}
