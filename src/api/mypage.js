const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// GET /api/mypage - 응답 구조 변경 반영 (백엔드 재배포, 2026-07-20):
// { userName, firstLoginDate, insurers: [{ companyKey, companyName, title, registeredAt,
//   analysisIds, policyStatus, policyCompleted, termsUploaded, conditionCompleted,
//   dashboardAvailable, canUploadTermsToContinue, chatCount,
//   chats: [{ chatSessionId, title, createdDate, analysisIds, termsDocumentId,
//             termsUploaded, conditionCompleted, dashboardAvailable }] (생성순 오름차순) }] }
// companyKey === "보험사 정보 없음"이면 보험사 분류가 안 되는 채팅(증권 미업로드/증권 전부 삭제) 묶음
export const getMyPage = async () => {
  const response = await fetch(`${BASE_URL}/api/mypage`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('마이페이지 정보를 불러오지 못했어요.');
  return response.json();
};

// GET /me - 실제 응답 확인 완료 (2026-07-20):
// { loggedIn, message, user: { id, kakaoId, nickname, profileImageUrl } }
export const getMe = async () => {
  const response = await fetch(`${BASE_URL}/me`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('프로필 정보를 불러오지 못했어요.');
  return response.json();
};

// GET /logout
export const logout = async () => {
  const response = await fetch(`${BASE_URL}/logout`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('로그아웃에 실패했어요.');
  return response.json();
};
