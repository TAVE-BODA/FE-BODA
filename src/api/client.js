import axios from 'axios';

// 세션(쿠키) 기반 로그인이라 withCredentials 없으면 로그인 안 한 사용자로 인식됨 (KakaoCallbackPage 참고)
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export default client;
