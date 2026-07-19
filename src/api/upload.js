const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 보험증권 PDF 업로드 (필드명 'file' -> 'files'로 백엔드 변경, 2026-07-19 확인)
// NOTE: 배치 업로드(files 필드로 여러 개 한 번에)로 전환했더니 어떤 파일을 올려도
// analysisStatus: 'ERROR'로 계속 실패해서, 원인 확인될 때까지 단건 업로드로 임시 롤백함
// (2026-07-19) - UploadPage.jsx에서 파일마다 이 함수를 반복 호출함
export const uploadPolicy = async (file, chatSessionId) => {
  const formData = new FormData();
  formData.append('files', file);

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
  return response.json(); // { status, id, message }
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
    // 백엔드가 실패 상태로 'FAILED'와 'ERROR'를 섞어서 쓰고 있어서 둘 다 처리함
    // (2026-07-19 확인: 증권 분석 실패 시 analysisStatus: 'ERROR'로 내려옴)
    if (status === 'FAILED' || status === 'ERROR') {
      throw new Error('분석에 실패했어요. 다시 시도해주세요.');
    }
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error('분석 시간이 초과됐어요. 다시 시도해주세요.');
};