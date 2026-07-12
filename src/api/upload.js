const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 보험증권 PDF 업로드
export const uploadPolicy = async (file, chatSessionId) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${BASE_URL}/api/upload/policy?chatSessionId=${chatSessionId}`,
    {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }
  );
  if (!response.ok) throw new Error('보험증권 업로드 실패');
  return response.json();
};

// 보험약관 PDF 업로드
export const uploadTerms = async (file, chatSessionId) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${BASE_URL}/api/upload/terms?chatSessionId=${chatSessionId}`,
    {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }
  );
  if (!response.ok) throw new Error('보험약관 업로드 실패');
  return response.json();
};