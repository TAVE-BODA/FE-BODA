import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Character from '../components/Character';
import { getMyPage, getMe, logout } from '../api/mypage';
import { deleteChatSession, getMessages, OPTION_BY_QUESTION_TYPE } from '../api/chat';
import { deletePolicy, deleteTerms } from '../api/upload';
import './MyPage.css';

// 보험사 분류가 안 되는 채팅(증권 없음/삭제됨)은 companyKey가 이 고정 문자열로 옴 (백엔드 스펙, 2026-07-20)
const UNCATEGORIZED_KEY = '보험사 정보 없음';

// 백엔드 companyName은 "삼성생명보험주식회사"처럼 정식 법인명으로 올 때가 있는데, 디자인은
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

function ErrorBadge({ children }) {
  return <span className="mypage-badge mypage-badge--error">{children}</span>;
}

function DropdownCaret() {
  return (
    <svg className="mypage-dropdown-caret" width="10" height="6" viewBox="0 0 10 6" fill="none">
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatDropdownButton({ label, variant, chats, onSelectChat, onNewChat }) {
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
          {chats.map((chat) => (
            <button
              key={chat.chatSessionId}
              type="button"
              className="mypage-dropdown-item"
              onClick={() => {
                setOpen(false);
                onSelectChat(chat);
              }}
            >
              {chat.title}
            </button>
          ))}
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
        </div>
      )}
    </div>
  );
}

function InsurerCard({ insurer, onViewDashcard, onUploadTerms, onOpenChat, onNewChat, onDelete, isDeleting }) {
  const isUncategorized = insurer.companyKey === UNCATEGORIZED_KEY;
  const displayName = isUncategorized ? '기타' : normalizeCompanyName(insurer.companyName);
  const colors = isUncategorized ? { bg: '#F0F2F3', text: '#575A5F' } : getCompanyColor(displayName);
  const companyShort = isUncategorized ? '기타' : getCompanyShortName(displayName);
  const chats = insurer.chats ?? [];
  const chatCount = insurer.chatCount ?? chats.length;

  return (
    <div className="mypage-insurance-card">
      {chats.length > 0 && (
        <button
          type="button"
          className="mypage-card-delete"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? '삭제 중...' : '삭제'}
        </button>
      )}

      <div className="mypage-card-header">
        <div className="mypage-company-badge" style={{ background: colors.bg, color: colors.text }}>
          {companyShort}
        </div>
        <div className="mypage-card-info">
          <p className="mypage-card-name">{insurer.title || displayName}</p>
          <p className="mypage-card-meta">{displayName} &middot; {formatDate(insurer.registeredAt)} 등록</p>
        </div>
      </div>

      <div className="mypage-badge-row">
        {insurer.policyStatus === 'ERROR' ? (
          <ErrorBadge>증권 분석 실패</ErrorBadge>
        ) : insurer.policyCompleted ? (
          <CheckBadge>증권 완료</CheckBadge>
        ) : (
          <EmptyBadge>증권 분석 중</EmptyBadge>
        )}
        {insurer.termsUploaded ? (
          <CheckBadge>약관 완료</CheckBadge>
        ) : (
          <EmptyBadge>약관 없음</EmptyBadge>
        )}
        {insurer.conditionCompleted && !insurer.termsUploaded && (
          <FilledBadge>개인정보 입력됨</FilledBadge>
        )}
        {chatCount >= 2 && <CheckBadge>채팅 {chatCount}건</CheckBadge>}
      </div>

      <div className="mypage-card-actions">
        {insurer.canUploadTermsToContinue ? (
          <div className="mypage-action-row">
            {insurer.dashboardAvailable && (
              <button className="mypage-action-btn mypage-action-btn--secondary" onClick={onViewDashcard}>
                대시카드 보러가기
              </button>
            )}
            <button className="mypage-action-btn mypage-action-btn--primary" onClick={onUploadTerms}>
              {insurer.conditionCompleted ? '이어서 약관 업로드하고 채팅하러가기' : '약관 업로드하고 채팅하러가기'}
            </button>
          </div>
        ) : (
          <div className="mypage-action-row">
            {insurer.dashboardAvailable && (
              <button className="mypage-action-btn mypage-action-btn--primary" onClick={onViewDashcard}>
                저장된 대시카드 보러가기
              </button>
            )}
            {chats.length >= 1 ? (
              <ChatDropdownButton
                label={chats.length >= 2 ? '채팅창 선택' : '채팅하러가기'}
                variant="secondary"
                chats={chats}
                onSelectChat={onOpenChat}
                onNewChat={onNewChat}
              />
            ) : (
              <button className="mypage-action-btn mypage-action-btn--secondary" onClick={onNewChat}>
                + 새로운 채팅
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [insurers, setInsurers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);

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
        // "보험사 정보 없음"(기타) 묶음은 항상 맨 뒤로
        const sorted = [...(mypage.insurers ?? [])].sort((a, b) => {
          const aOther = a.companyKey === UNCATEGORIZED_KEY;
          const bOther = b.companyKey === UNCATEGORIZED_KEY;
          return aOther === bOther ? 0 : aOther ? 1 : -1;
        });
        setInsurers(sorted);
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

  // 채팅창 선택에서 이미 조건 입력이 끝난(conditionCompleted) 채팅을 고르면, 처음부터
  // 다시 묻는 대신 그 채팅의 마지막 질문·답변을 히스토리에서 찾아 결과 화면으로 바로 보냄
  const handleOpenChat = async (chat) => {
    if (chat.conditionCompleted) {
      try {
        const messages = await getMessages(chat.chatSessionId);
        const lastAiIndex = messages.map((m) => m.senderType).lastIndexOf('AI');
        const aiMessage = messages[lastAiIndex];
        const optionNumber = aiMessage && OPTION_BY_QUESTION_TYPE[aiMessage.questionType];
        if (optionNumber) {
          const userMessage = [...messages.slice(0, lastAiIndex)].reverse().find((m) => m.senderType === 'USER');
          navigate(`/result/option/${optionNumber}`, {
            state: { resultData: { userMessage, aiMessage }, chatSessionId: chat.chatSessionId },
          });
          return;
        }
      } catch {
        // 히스토리 조회 실패 시 기존처럼 채팅 화면으로 폴백
      }
    }
    navigate('/chat', { state: { chatSessionId: chat.chatSessionId, termsUploaded: chat.termsUploaded } });
  };

  const handleDeleteInsurer = async (insurer) => {
    const chats = insurer.chats ?? [];
    if (!window.confirm(`${insurer.title || insurer.companyName}의 채팅 ${chats.length}건과 연결된 증권·약관을 모두 삭제할까요?`)) return;

    setDeletingKey(insurer.companyKey);
    try {
      // 채팅방 삭제는 증권/약관 자체를 안 지움(다른 채팅방에서 재사용될 수 있게 설계됨) -
      // 마이페이지에서 완전히 지우려면 증권/약관도 따로 삭제해야 함
      const analysisIds = [...new Set(insurer.analysisIds ?? [])];
      const termsDocumentIds = [...new Set(chats.map((chat) => chat.termsDocumentId).filter((id) => id != null))];

      await Promise.all(chats.map((chat) => deleteChatSession(chat.chatSessionId)));
      await Promise.all(analysisIds.map((id) => deletePolicy(id)));
      await Promise.all(termsDocumentIds.map((id) => deleteTerms(id)));
      setInsurers((prev) => prev.filter((ins) => ins.companyKey !== insurer.companyKey));
    } catch {
      alert('삭제하지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setDeletingKey(null);
    }
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
          {insurers.map((insurer) => {
            const lastChat = insurer.chats?.[insurer.chats.length - 1];
            // insurer.analysisIds는 전체 이력을 통틀어 합친 배열이라 순서가 뒤죽박죽일 수 있음
            // (스펙: chat_session_policy를 id ASC로 읽어 채팅마다 analysisIds를 얻음).
            // 카드가 대표하는 "마지막 채팅"에 실제로 연결된 analysisIds/dashboardAvailable을 써야
            // 그 채팅에서 실제로 본 것과 같은 대시보드가 열림. 어떤 채팅에도 안 묶인 증권만 insurer 전체값으로 대체.
            const chatAnalysisIds = lastChat?.analysisIds ?? insurer.analysisIds ?? [];
            const targetAnalysisId = chatAnalysisIds[chatAnalysisIds.length - 1];
            const dashboardAvailable = lastChat ? lastChat.dashboardAvailable : insurer.dashboardAvailable;

            return (
              <InsurerCard
                key={insurer.companyKey}
                insurer={{ ...insurer, dashboardAvailable }}
                onViewDashcard={() => targetAnalysisId != null && navigate(
                  `/result/analysis/${targetAnalysisId}${lastChat?.chatSessionId != null ? `?chatSessionId=${lastChat.chatSessionId}` : ''}`
                )}
                onUploadTerms={() => navigate('/chat', { state: { chatSessionId: lastChat?.chatSessionId } })}
                onOpenChat={handleOpenChat}
                onNewChat={() => navigate('/chat', { state: { unlinkedAnalysisIds: insurer.unlinkedAnalysisIds } })}
                onDelete={() => handleDeleteInsurer(insurer)}
                isDeleting={deletingKey === insurer.companyKey}
              />
            );
          })}
        </div>

        <button className="mypage-add-card" onClick={() => navigate('/chat')}>
          + 다른 보험서류 업로드하러가기
        </button>

        <button className="mypage-logout-btn" onClick={handleLogout}>로그아웃</button>
      </main>
    </div>
  );
}
