import React from 'react';
import './LoginPage.css';
import logoImg from '../assets/images/login_bodalogo.png';
import kakaoBtnImg from '../assets/images/login_kakaotalk.png';

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

export default function LoginPage() {
  const handleKakaoLogin = () => {
    const kakaoAuthUrl =
      `https://kauth.kakao.com/oauth/authorize` +
      `?client_id=${KAKAO_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}` +
      `&response_type=code`;

    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-logo-area">
          <img src={logoImg} alt="BODA 로고" className="login-logo" />
        </div>

        <div className="login-text-area">
          <h2>BODA에 오신 걸 환영해요</h2>
          <p>
            로그인하면 분석 결과를 저장하고<br />
            다음에 다시 업로드하지 않아도 돼요
          </p>
        </div>

        <button className="kakao-login-btn" onClick={handleKakaoLogin}>
          <img src={kakaoBtnImg} alt="카카오로 3초만에 가입하기" />
        </button>

        <div className="login-footer-divider"></div>

        <div className="login-footer-text">
          <p>업로드된 문서는 분석 후 즉시 삭제됩니다</p>
          <p>분석된 텍스트는 암호화되어 안전하게 보관됩니다</p>
        </div>
      </div>
    </div>
  );
}