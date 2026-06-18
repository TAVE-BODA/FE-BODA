import React from 'react';
import './LoginPage.css';
import logoImg from '../assets/images/login_bodalogo.png';
import kakaoBtnImg from '../assets/images/login_kakaotalk.png';

// 백엔드가 카카오 인증부터 토큰 교환까지 전부 처리함. 프론트엔드는 이 주소로만 보내면 됨.
const KAKAO_LOGIN_URL = import.meta.env.VITE_KAKAO_LOGIN_URL;

export default function LoginPage() {
  const handleKakaoLogin = () => {
    window.location.href = KAKAO_LOGIN_URL;
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