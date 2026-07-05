import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import DetailPage from './pages/DetailPage';
import MyPage from './pages/MyPage';
import ServiceIntroPage from './pages/ServiceIntroPage';
import FaqPage from './pages/FaqPage';
import KakaoCallbackPage from './pages/KakaoCallbackPage';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/result" element={<DashboardPage />} />
        <Route path="/result/:id" element={<DetailPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/service" element={<ServiceIntroPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/oauth/callback/kakao" element={<KakaoCallbackPage />} />
        <Route path="/result/:optionNumber" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;