import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Character from '../components/Character';
import './MyPage.css';

const USER_DATA = {
  name: '윤아영',
  joinDate: '2026.05.29',
};

const INSURANCE_LIST = [
  {
    id: 1,
    company: '삼성생명',
    companyShort: '삼성',
    name: '삼성 팩 건강보험(2604)',
    registeredDate: '2026.05.29',
    cert: { filename: '삼성생명_팩건강보험_증권', uploaded: true },
    terms: { filename: '삼성생명_팩건강보험_약관', uploaded: true },
    status: { type: 'complete', text: '증권 · 약관 분석 완료', date: '2026.05.29' },
    hasResult: true,
  },
  {
    id: 2,
    company: '흥국생명',
    companyShort: '흥국',
    name: '흥국생명 여성건강보험',
    registeredDate: '2026.05.29',
    cert: { filename: '흥국생명_여성건강보험_증권', uploaded: true },
    terms: { filename: null, uploaded: false },
    status: { type: 'partial', text: '증권 분석 완료 · 약관 분석 대기', date: '2026.05.29' },
    hasResult: false,
  },
];

const COMPANY_COLORS = {
  '삼성생명': { bg: '#EBF4FF', text: '#057dee' },
  '흥국생명': { bg: '#EDFAFF', text: '#0885AB' },
};

function getCompanyColor(company) {
  return COMPANY_COLORS[company] ?? { bg: '#F0F2F3', text: '#575A5F' };
}

function UploadCompleteTag() {
  return (
    <span className="mypage-doc-status mypage-doc-status--complete">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="6.5" fill="#2BBF7A" />
        <path d="M3.5 6.5L5.5 8.5L9.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      업로드 완료
    </span>
  );
}

function AddDocButton() {
  return (
    <button className="mypage-add-doc-btn">
      서류 추가하기
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4 6h6M4 8.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="12.5" cy="12.5" r="2.5" fill="currentColor" />
        <path d="M12.5 11.5v2M11.5 12.5h2" stroke="white" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function InsuranceCard({ insurance, onViewResult, onChat, onAnalyze }) {
  const colors = getCompanyColor(insurance.company);
  const isComplete = insurance.status.type === 'complete';

  return (
    <div className="mypage-insurance-card">
      <div className="mypage-card-header">
        <div
          className="mypage-company-badge"
          style={{ background: colors.bg, color: colors.text }}
        >
          {insurance.companyShort}
        </div>
        <div className="mypage-card-info">
          <p className="mypage-card-name">{insurance.name}</p>
          <p className="mypage-card-meta">{insurance.company} · {insurance.registeredDate} 등록</p>
        </div>
      </div>

      <div className="mypage-doc-list">
        <div className="mypage-doc-row">
          <span className="mypage-doc-type mypage-doc-type--cert">증권</span>
          <span className="mypage-doc-filename">{insurance.cert.filename}</span>
          <UploadCompleteTag />
        </div>
        <div className="mypage-doc-row">
          <span className={`mypage-doc-type mypage-doc-type--terms${insurance.terms.uploaded ? '' : ' mypage-doc-type--empty'}`}>약관</span>
          {insurance.terms.uploaded ? (
            <>
              <span className="mypage-doc-filename">{insurance.terms.filename}</span>
              <UploadCompleteTag />
            </>
          ) : (
            <>
              <span className="mypage-doc-filename mypage-doc-filename--empty">약관이 없어요</span>
              <AddDocButton />
            </>
          )}
        </div>
      </div>

      <div className={`mypage-status-bar mypage-status-bar--${insurance.status.type}`}>
        <span className={`mypage-status-dot mypage-status-dot--${insurance.status.type}`} />
        <span className="mypage-status-text">{insurance.status.text}</span>
        <span className="mypage-status-divider">|</span>
        <span className="mypage-status-date">{insurance.status.date}</span>
      </div>

      <div className="mypage-card-actions">
        {insurance.hasResult && (
          <button className="mypage-action-btn mypage-action-btn--secondary" onClick={onViewResult}>
            이전 분석 내용 확인하기
          </button>
        )}
        <button className="mypage-action-btn mypage-action-btn--primary" onClick={insurance.hasResult ? onChat : onAnalyze}>
          {insurance.hasResult ? '새로 질문하러 갈게요' : '분석하러 갈게요'}
        </button>
      </div>
    </div>
  );
}

export default function MyPage() {
  const navigate = useNavigate();

  return (
    <div className="mypage">
      <header className="mypage-header">
        <NavBar />
      </header>

      <main className="mypage-main">
        <h1 className="mypage-title">MY PAGE</h1>

        <div className="mypage-profile-card">
          <div className="mypage-profile-avatar">
            <Character size="sm" />
          </div>
          <div className="mypage-profile-info">
            <p className="mypage-profile-name">{USER_DATA.name} <span className="mypage-profile-nim">님</span></p>
            <p className="mypage-profile-sub">BODA와 {USER_DATA.joinDate}부터 함께 했어요</p>
          </div>
          <button className="mypage-kakao-btn">카카오 로그인</button>
        </div>

        <h2 className="mypage-section-title">내보험 저장소</h2>

        <div className="mypage-insurance-list">
          {INSURANCE_LIST.map((ins) => (
            <InsuranceCard
              key={ins.id}
              insurance={ins}
              onViewResult={() => navigate('/result')}
              onChat={() => navigate('/chat')}
              onAnalyze={() => navigate('/upload')}
            />
          ))}
        </div>

        <button className="mypage-logout-btn">로그아웃</button>
      </main>
    </div>
  );
}
