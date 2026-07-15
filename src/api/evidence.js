const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 약관 근거(citation) 조회 API.
// GET /api/chat/messages/{messageId}/sources - 스웨거 스펙으로 확인 완료 (2026-07-14).
export const getMessageSources = async (messageId) => {
  const response = await fetch(`${BASE_URL}/api/chat/messages/${messageId}/sources`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('약관 근거를 불러오지 못했어요.');
  return response.json();
  // 응답 형태 (스웨거 확인):
  // {
  //   messageId, sourceStatus: "AVAILABLE" | ...,
  //   notice: string,
  //   sources: [{ sourceId, chunkId, title, citedText, clauseType, relevanceScore }]
  // }
};