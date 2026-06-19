import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 세션(쿠키) 기반 로그인이라 별도의 access token은 없고,
// 쿼리 파라미터로 id, kakaoId, nickname만 붙어서 옴.
//
// 주의: 앞으로 로그인 후 다른 API(예: /api/user/me)를 호출할 때는
// axios 요청에 { withCredentials: true }를 꼭 넣어야 세션 쿠키가 같이 전달됨.
// 안 넣으면 로그인했는데도 로그인 안 한 사용자로 인식될 수 있음.
// 예: axios.get('/api/user/me', { withCredentials: true })

export default function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const kakaoId = params.get('kakaoId');
    const nickname = params.get('nickname');

    if (!id || !kakaoId) {
      setError('카카오 로그인이 취소되었거나 사용자 정보를 받지 못했습니다.');
      return;
    }

    // 화면에 표시할 용도로만 저장 (로그인 상태 자체는 백엔드가 심어준 세션 쿠키로 유지됨)
    localStorage.setItem('user', JSON.stringify({ id, kakaoId, nickname }));
    navigate('/home');
  }, [navigate]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>로그인 페이지로 돌아가기</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <p>카카오 로그인 처리 중입니다...</p>
    </div>
  );
}