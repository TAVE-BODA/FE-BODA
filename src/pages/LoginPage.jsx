import React from 'react';
import './LoginPage.css';
import logoImg from '../assets/images/login_bodalogo.png';
import kakaoBtnImg from '../assets/images/login_kakaotalk.png';

export default function LoginPage() {
  const handleKakaoLogin = () => {
    // 카카오 로그인 API 로직이 들어올 자리
    console.log('카카오 로그인 시도');
  };

  return (
    <div className="login-page-container">
      {/* 중앙 화이트 카드 카드 */}
      <div className="login-card">
        
        {/* 서비스 로고 */}
        <div className="login-logo-area">
          <img src={logoImg} alt="BODA 로고" className="login-logo" />
        </div>

        {/* 안내 문구 */}
        <div className="login-text-area">
          <h2>BODA에 오신 걸 환영해요</h2>
          <p>
            로그인하면 분석 결과를 저장하고<br />
            다음에 다시 업로드하지 않아도 돼요
          </p>
        </div>

        {/* 카카오 로그인 버튼 (클릭 이벤트 연결) */}
        <button className="kakao-login-btn" onClick={handleKakaoLogin}>
          <img src={kakaoBtnImg} alt="카카오로 3초만에 가입하기" />
        </button>

        {/* 하단 안내 가이드 선 및 유의사항 */}
        <div className="login-footer-divider"></div>
        
        <div className="login-footer-text">
          <p>업로드된 문서는 분석 후 즉시 삭제됩니다</p>
          <p>분석된 텍스트는 암호화되어 안전하게 보관됩니다</p>
        </div>

      </div>
    </div>
  );
}