const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 보험증권 PDF 업로드 (2026-07-19 백엔드 확인: 여러 개를 한 번에 같이 보내는 방식으로 변경됨)
// files: File[] - 최대 3개까지
export const uploadPolicy = async (files, chatSessionId) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const url = chatSessionId
    ? `${BASE_URL}/api/upload/policy?chatSessionId=${chatSessionId}`
    : `${BASE_URL}/api/upload/policy`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json();
    const err = new Error(errorBody.error || '보험증권 업로드 실패');
    err.code = errorBody.code;
    throw err;
  }
  // NOTE: 여러 파일을 한 번에 보내는 방식으로 바뀌면서 응답 구조가 예전(단일 id)과
  // 달라졌을 가능성이 높음. 정확한 필드명 확인 전까지 UploadPage.jsx에서
  // 있을 법한 필드(ids/analysisIds/id)를 방어적으로 다 시도하도록 처리함.
  return response.json();
};

// 보험약관 PDF 업로드
export const uploadTerms = async (file, chatSessionId) => {
  const formData = new FormData();
  formData.append('file', file);

  const url = chatSessionId
    ? `${BASE_URL}/api/upload/terms?chatSessionId=${chatSessionId}`
    : `${BASE_URL}/api/upload/terms`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json();
    const err = new Error(errorBody.error || '보험약관 업로드 실패');
    err.code = errorBody.code;
    throw err;
  }
  return response.json(); // { status, id, message }
};

// 보험증권 분석 상태 조회
export const checkPolicyStatus = async (analysisId) => {
  const response = await fetch(
    `${BASE_URL}/api/upload/status/${analysisId}`,
    { method: 'GET', credentials: 'include' }
  );
  if (!response.ok) throw new Error('증권 상태 조회 실패');
  return response.json(); // { analysisId, analysisStatus, ... }
};

// 보험약관 파싱 상태 조회
export const checkTermsStatus = async (termsDocumentId) => {
  const response = await fetch(
    `${BASE_URL}/api/upload/terms/status/${termsDocumentId}`,
    { method: 'GET', credentials: 'include' }
  );
  if (!response.ok) throw new Error('약관 상태 조회 실패');
  return response.json(); // { termsDocumentId, parsingStatus, ... }
};

// 3초 간격으로 완료될 때까지 폴링
export const pollUntilDone = async (checkFn, id, interval = 3000, maxTry = 30) => {
  for (let i = 0; i < maxTry; i++) {
    const result = await checkFn(id);
    const status = result.analysisStatus || result.parsingStatus;
    if (status === 'DONE') return result;
    if (status === 'FAILED') throw new Error('분석에 실패했어요. 다시 시도해주세요.');
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error('분석 시간이 초과됐어요. 다시 시도해주세요.');
};