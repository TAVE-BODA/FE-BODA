import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Character from '../components/Character';
import './MyPage.css';

// profileImage: 카카오 로그인에서 받아오는 프로필 사진 URL. 없으면 기본 캐릭터 이미지로 대체.
// 프로필 사진은 백엔드가 아직 안 줘서 항상 null (KakaoCallbackPage.jsx 참고, id/kakaoId/nickname만 옴).
const USER_DATA = {
  joinDate: '2026.05.29',
  profileImage: null,
};

// 칩1~3: 개인정보 입력 + 증권 1개 + 약관 1개 업로드 → 분석 완료 시 채팅 가능, 채팅 세션은 문서별로 누적/재개됨
// 칩4: 증권만 업로드 → 즉시 대시카드 생성, 약관은 나중에 추가해야 채팅이 열림
const INSURANCE_LIST = [
  {
    id: 1,
    company: '삼성생명',
    companyShort: '삼성',
    name: '삼성 팩 건강보험(2604)',
    registeredDate: '2026.05.29',
    cert: { uploaded: true },
    terms: { uploaded: false },
    personalInfoEntered: false,
    analyzed: true,
    chatSessions: [],
  },
  {
    id: 2,
    company: '동양생명',
    companyShort: '동양',
    name: '동양생명 보험증권',
    registeredDate: '2026.06.01',
    cert: { uploaded: true },
    terms: { uploaded: false },
    personalInfoEntered: true,
    analyzed: false,
    chatSessions: [],
  },
  {
    id: 3,
    company: '한화생명',
    companyShort: '한화',
    name: '한화생명 보험증권 · 약관',
    registeredDate: '2026.06.05',
    cert: { uploaded: true },
    terms: { uploaded: true },
    personalInfoEntered: true,
    analyzed: true,
    chatSessions: [{ id: 1, title: '2026.06.05 대화' }],
  },
  {
    id: 4,
    company: '흥국생명',
    companyShort: '흥국',
    name: '흥국생명 여성건강보험',
    registeredDate: '2026.05.29',
    cert: { uploaded: true },
    terms: { uploaded: true },
    personalInfoEntered: true,
    analyzed: true,
    chatSessions: [
      { id: 1, title: '2026.05.29 대화' },
      { id: 2, title: '2026.06.10 대화' },
    ],
  },
];

const COMPANY_COLORS = {
  '삼성생명': { bg: '#EBF4FF', text: '#057dee' },
  '동양생명': { bg: '#E8FAF2', text: '#1A9E60' },
  '한화생명': { bg: '#FDEAEC', text: '#D6455B' },
  '흥국생명': { bg: '#F0EEFF', text: '#7C55D8' },
};

function getCompanyColor(company) {
  return COMPANY_COLORS[company] ?? { bg: '#F0F2F3', text: '#575A5F' };
}

function getStatusBarText(insurance) {
  if (!insurance.analyzed) return null;
  if (insurance.chatSessions.length >= 2) return null; // 채팅 개수 뱃지로 대체
  const docsLabel = insurance.terms.uploaded ? '증권·약관' : '증권';
  const tailLabel = insurance.chatSessions.length === 1 ? '채팅방 생성됨' : '대시카드 생성됨';
  return `${docsLabel} 분석 완료 · ${tailLabel}`;
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

function DropdownCaret() {
  return (
    <svg className="mypage-dropdown-caret" width="10" height="6" viewBox="0 0 10 6" fill="none">
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatDropdownButton({ label, variant, sessions, includeNewInMenu, onSelectSession, onNewChat }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="mypage-dropdown"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className={`mypage-action-btn mypage-action-btn--${variant} mypage-dropdown-trigger`}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <DropdownCaret />
      </button>
      {open && (
        <div className="mypage-dropdown-menu">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              className="mypage-dropdown-item"
              onClick={() => {
                setOpen(false);
                onSelectSession(session);
              }}
            >
              {session.title}
            </button>
          ))}
          {includeNewInMenu && (
            <button
              type="button"
              className="mypage-dropdown-item mypage-dropdown-item--new"
              onClick={() => {
                setOpen(false);
                onNewChat();
              }}
            >
              + 새로운 채팅
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function InsuranceCard({ insurance, onViewDashcard, onUploadTerms, onOpenChat, onNewChat }) {
  const colors = getCompanyColor(insurance.company);
  const statusBarText = getStatusBarText(insurance);
  const chatCount = insurance.chatSessions.length;

  return (
    <div className="mypage-insurance-card">
      <div className="mypage-card-header">
        <div className="mypage-company-badge" style={{ background: colors.bg, color: colors.text }}>
          {insurance.companyShort}
        </div>
        <div className="mypage-card-info">
          <p className="mypage-card-name">{insurance.name}</p>
          <p className="mypage-card-meta">{insurance.company} · {insurance.registeredDate} 등록</p>
        </div>
      </div>

      <div className="mypage-badge-row">
        <CheckBadge>{insurance.analyzed ? '증권 완료' : '증권 업로드 완료'}</CheckBadge>
        {insurance.terms.uploaded ? (
          <CheckBadge>{insurance.analyzed ? '약관 완료' : '약관 업로드 완료'}</CheckBadge>
        ) : (
          <EmptyBadge>약관 없음</EmptyBadge>
        )}
        {insurance.personalInfoEntered && !insurance.terms.uploaded && (
          <FilledBadge>개인정보 입력됨</FilledBadge>
        )}
        {chatCount >= 2 && <CheckBadge>채팅 {chatCount}건</CheckBadge>}
      </div>

      {statusBarText && (
        <div className="mypage-status-bar">
          <span className="mypage-status-dot" />
          <span className="mypage-status-text">{statusBarText}</span>
        </div>
      )}

      <div className="mypage-card-actions">
        {chatCount >= 2 ? (
          <>
            <button className="mypage-action-btn mypage-action-btn--primary" onClick={onViewDashcard}>
              저장된 대시카드 보러가기
            </button>
            <div className="mypage-action-row">
              <ChatDropdownButton
                label="채팅창 선택"
                variant="secondary"
                sessions={insurance.chatSessions}
                includeNewInMenu={false}
                onSelectSession={onOpenChat}
                onNewChat={onNewChat}
              />
              <button className="mypage-action-btn mypage-action-btn--secondary" onClick={onNewChat}>
                + 새로운 채팅
              </button>
            </div>
          </>
        ) : insurance.terms.uploaded ? (
          <div className="mypage-action-row">
            <button className="mypage-action-btn mypage-action-btn--primary" onClick={onViewDashcard}>
              저장된 대시카드 보러가기
            </button>
            <ChatDropdownButton
              label="채팅하러가기"
              variant="secondary"
              sessions={insurance.chatSessions}
              includeNewInMenu
              onSelectSession={onOpenChat}
              onNewChat={onNewChat}
            />
          </div>
        ) : insurance.personalInfoEntered ? (
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
  // KakaoCallbackPage.jsx가 로그인 성공 시 { id, kakaoId, nickname }을 저장해둠
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  const nickname = user.nickname ?? '고객';

  return (
    <div className="mypage">
      <header className="mypage-header">
        <NavBar />
      </header>

      <main className="mypage-main">
        <h1 className="mypage-title">MY PAGE</h1>

        <div className="mypage-profile-card">
          <div className="mypage-profile-avatar">
            {USER_DATA.profileImage ? (
              <img src={USER_DATA.profileImage} alt={`${nickname} 프로필`} className="mypage-profile-avatar-img" />
            ) : (
              <Character size="sm" />
            )}
          </div>
          <div className="mypage-profile-info">
            <p className="mypage-profile-name">{nickname} <span className="mypage-profile-nim">님</span></p>
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
              onViewDashcard={() => navigate(`/result/${ins.id}`)}
              onUploadTerms={() => navigate('/upload', { state: { insuranceId: ins.id } })}
              onOpenChat={() => navigate('/chat', { state: { insuranceId: ins.id } })}
              onNewChat={() => navigate('/chat', { state: { insuranceId: ins.id, newSession: true } })}
            />
          ))}
        </div>

        <button className="mypage-add-card" onClick={() => navigate('/chat')}>
          + 다른 보험서류 업로드하러가기
        </button>

        <button className="mypage-logout-btn">로그아웃</button>
      </main>
    </div>
  );
}
