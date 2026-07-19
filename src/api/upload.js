const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 보험증권 PDF 업로드 (필드명 'file' -> 'files'로 백엔드 변경, 2026-07-19 확인)
// files: File[] - 최대 3개까지, 한 요청에 다 같이 보냄
// 응답 형태가 파일 개수에 따라 다르게 오는 것으로 보임 (2026-07-19 실테스트로 확인):
// - 파일 1개: { message, analysisIds: [숫자], status } (단일 객체)
// - 파일 여러 개: [{ fileName, success, status, analysisId, message }, ...] (배열) <- 아직 실제 확인 전, 백엔드 설명 기준
// 그래서 UploadPage.jsx에서 응답이 배열인지 객체인지 보고 둘 다 처리하도록 짬
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
    // 검증 에러는 {code, error}로 오지만, 500 등 처리 안 된 예외는 {code, message, timestamp}로 옴
    const err = new Error(errorBody.error || errorBody.message || '보험증권 업로드 실패');
    err.code = errorBody.code;
    throw err;
  }
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
    const err = new Error(errorBody.error || errorBody.message || '보험약관 업로드 실패');
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