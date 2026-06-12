import React from 'react';
import './HomePage.css';
import Character from '../components/Character';
import NavBar from '../components/NavBar';
import checkBtnImg from '../assets/images/home_confirmbutton.png';
import logosImg from '../assets/images/home_bottomicon.png';

export default function HomePage() {
  const handleCheckInsurance = () => {
    console.log('내 보험금 확인하기 버튼 클릭됨');
  };

  return (
    <div className="home-page-container">

      <header className="home-header">
        <NavBar />
      </header>

      <main className="home-main-content">
        
        <div className="home-character-area">
          <Character size="lg" animate />
        </div>

        <h1 className="home-title">
          내 보험, <span className="highlight">보다</span>에게 물어봐요
        </h1>

        <p className="home-subtitle">
          보험증권과 약관을 바탕으로, 내 상황에서 보험금을 받을 수 있는지 확인해드려요.<br />
          아래 버튼을 클릭해 서비스를 시작해보세요!
        </p>

        <button className="check-insurance-btn" onClick={handleCheckInsurance}>
          <img src={checkBtnImg} alt="내 보험금 확인하기" />
        </button>

      </main>

      <footer className="home-footer-area">
        <div className="footer-notice-wrap">
          <p className="footer-notice-text">
            BODA가 정확하게 분석할 수 있는 보험사는 아래와 같아요
            <span className="footer-notice-info">!</span>
          </p>
        </div>
        <div className="insurance-logos-wrap">
          <img src={logosImg} alt="지원하는 보험사 로고 목록" className="insurance-logos" />
        </div>
      </footer>

    </div>
  );
}