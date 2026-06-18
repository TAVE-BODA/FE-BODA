import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const kakaoError = params.get('error');

    if (kakaoError || !code) {
      setError('카카오 로그인이 취소되었거나 인가 코드를 받지 못했습니다.');
      return;
    }

    axios
      .post('/api/auth/kakao', { code })
      .then((res) => {
        const { accessToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        navigate('/home');
      })
      .catch((err) => {
        console.error('카카오 로그인 처리 실패:', err);
        setError('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      });
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