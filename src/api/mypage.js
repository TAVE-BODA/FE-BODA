const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// GET /api/mypage - 스웨거 스펙으로 확인 완료 (2026-07-20)
// { userName, firstLoginDate, insurances: [{ analysisId, companyName, analysisCompletedAt,
//   dashboardAvailable, termsUploaded, conditionCompleted, existingChatSessionId, canCreateNewChat }] }
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
