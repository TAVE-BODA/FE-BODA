import React from 'react';
import LoginPage from './pages/LoginPage'; // 방금 만든 로그인 페이지 컴포넌트 불러오기
import './App.css'; // 전역 스타일 초기화용 (선택)

function App() {
  return (
    <>
      {/* 로그인 페이지 컴포넌트를 화면에 렌더링합니다 */}
      <LoginPage />
    </>
  );
}

export default App;