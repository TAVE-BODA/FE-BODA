import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Character from '../components/Character';
import { getMyPage, getMe, logout } from '../api/mypage';
import './MyPage.css';

// 백엔드 companyName은 "삼성생명보험주식회사"처럼 정식 법인명으로 오는데, 디자인은
// "삼성생명" 같은 짧은 이름 기준이라 그대로 매칭이 안 됨 (InsuranceBadge.jsx와 동일한 이슈).
const COMPANY_COLORS = {
  '삼성생명': { bg: '#EBF4FF', text: '#057dee' },
  '동양생명': { bg: '#E8FAF2', text: '#1A9E60' },
  '한화생명': { bg: '#FDEAEC', text: '#D6455B' },
  '흥국생명': { bg: '#F0EEFF', text: '#7C55D8' },
  'KB생명': { bg: '#FFF0F0', text: '#C93232' },
  '교보생명': { bg: '#F3EEFF', text: '#6D3FD8' },
  '신한생명': { bg: '#FFF8E6', text: '#C8820A' },
  '메트라이프': { bg: '#F0F8FF', text: '#1D5FC5' },
};

function normalizeCompanyName(company) {
  if (!company) return company;
  return Object.keys(COMPANY_COLORS).find((name) => company.includes(name)) ?? company;
}

function getCompanyColor(company) {
  return COMPANY_COLORS[company] ?? { bg: '#F0F2F3', text: '#575A5F' };
}

function getCompanyShortName(normalizedName) {
  const stripped = normalizedName.replace(/(생명|화재|해상)$/, '');
  return stripped !== normalizedName ? stripped : normalizedName.slice(0, 2);
}

function formatDate(isoDate) {
  return isoDate ? isoDate.replaceAll('-', '.') : '';
}

function CheckBadge({ children }) {
  return (
    <span className="mypage-badge mypage-badge--check">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="6.5" fill="#2BBF7A" />
        <path d="M3.5 6.5L5.5 8.5L9.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </span>
  );
}

function EmptyBadge({ children }) {
  return <span className="mypage-badge mypage-badge--empty">{children}</span>;
}

function FilledBadge({ children }) {
  return <span className="mypage-badge mypage-badge--filled">{children}</span>;
}

function InsuranceCard({ insurance, onViewDashcard, onUploadTerms, onOpenChat }) {
  const displayName = normalizeCompanyName(insurance.companyName);
  const colors = getCompanyColor(displayName);
  const companyShort = getCompanyShortName(displayName);

  return (
    <div className="mypage-insurance-card">
      <div className="mypage-card-header">
        <div className="mypage-company-badge" style={{ background: colors.bg, color: colors.text }}>
          {companyShort}
        </div>
        <div className="mypage-card-info">
          <p className="mypage-card-name">{displayName}</p>
          <p className="mypage-card-meta">{formatDate(insurance.analysisCompletedAt)} 분석 완료</p>
        </div>
      </div>

      <div className="mypage-badge-row">
        <CheckBadge>증권 완료</CheckBadge>
        {insurance.termsUploaded ? (
          <CheckBadge>약관 완료</CheckBadge>
        ) : (
          <EmptyBadge>약관 없음</EmptyBadge>
        )}
        {insurance.conditionCompleted && !insurance.termsUploaded && (
          <FilledBadge>개인정보 입력됨</FilledBadge>
        )}
      </div>

      <div className="mypage-card-actions">
        {insurance.termsUploaded ? (
          <div className="mypage-action-row">
            <button className="mypage-action-btn mypage-action-btn--primary" onClick={onViewDashcard}>
              저장된 대시카드 보러가기
            </button>
            <button className="mypage-action-btn mypage-action-btn--secondary" onClick={onOpenChat}>
              채팅하러가기
            </button>
          </div>
        ) : insurance.conditionCompleted ? (
          <div className="mypage-action-row">
            <button className="mypage-action-btn mypage-action-btn--secondary" onClick={onViewDashcard}>
              대시카드 보러가기
            </button>
            <button className="mypage-action-btn mypage-action-btn--primary" onClick={onUploadTerms}>
              이어서 약관 업로드하고 채팅하러가기
            </button>
          </div>
        ) : (
          <div className="mypage-action-row">
            <button className="mypage-action-btn mypage-action-btn--primary" onClick={onViewDashcard}>
              저장된 대시카드 보러가기
            </button>
            <button className="mypage-action-btn mypage-action-btn--secondary" onClick={onUploadTerms}>
              약관 업로드하고 채팅하러가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [mypage, me] = await Promise.all([
          getMyPage(),
          getMe().catch(() => null),
        ]);
        if (cancelled) return;
        setProfile({
          nickname: mypage.userName,
          joinDate: mypage.firstLoginDate,
          profileImage: me?.user?.profileImageUrl ?? null,
        });
        setInsurances(mypage.insurances ?? []);
      } catch {
        if (!cancelled) setError('마이페이지 정보를 불러오지 못했어요.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    await logout().catch(() => {});
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="mypage">
        <header className="mypage-header"><NavBar /></header>
        <main className="mypage-main">
          <p style={{ padding: '80px 0', textAlign: 'center', color: 'var(--gray-05)' }}>불러오는 중이에요...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mypage">
        <header className="mypage-header"><NavBar /></header>
        <main className="mypage-main">
          <p style={{ padding: '80px 0', textAlign: 'center', color: 'var(--gray-05)' }}>{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="mypage">
      <header className="mypage-header">
        <NavBar />
      </header>

      <main className="mypage-main">
        <h1 className="mypage-title">MY PAGE</h1>

        <div className="mypage-profile-card">
          <div className="mypage-profile-avatar">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={`${profile.nickname} 프로필`} className="mypage-profile-avatar-img" />
            ) : (
              <Character size="sm" />
            )}
          </div>
          <div className="mypage-profile-info">
            <p className="mypage-profile-name">{profile.nickname ?? '고객'} <span className="mypage-profile-nim">님</span></p>
            <p className="mypage-profile-sub">BODA와 {formatDate(profile.joinDate)}부터 함께 했어요</p>
          </div>
          <button className="mypage-kakao-btn">카카오 로그인</button>
        </div>

        <h2 className="mypage-section-title">내보험 저장소</h2>

        <div className="mypage-insurance-list">
          {insurances.map((ins) => (
            <InsuranceCard
              key={ins.analysisId}
              insurance={ins}
              onViewDashcard={() => navigate(`/result/analysis/${ins.analysisId}`)}
              onUploadTerms={() => navigate('/upload', { state: { chatSessionId: ins.existingChatSessionId } })}
              onOpenChat={() => navigate('/chat', { state: { chatSessionId: ins.existingChatSessionId } })}
            />
          ))}
        </div>

        <button className="mypage-add-card" onClick={() => navigate('/chat')}>
          + 다른 보험서류 업로드하러가기
        </button>

        <button className="mypage-logout-btn" onClick={handleLogout}>로그아웃</button>
      </main>
    </div>
  );
}
