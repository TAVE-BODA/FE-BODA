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
        {/* /result/:id(DetailPage)와 경로가 겹쳐서 ResultPage가 안 그려지던 문제로
            /result/option/:optionNumber로 분리함. UploadPage.jsx의 navigate 경로도 함께 수정됨. */}
        <Route path="/result/option/:optionNumber" element={<ResultPage />} />
        {/* 업로드/분석 없이 저장해둔 실제 응답 샘플로 결과 화면을 바로 확인하기 위한 라우트.
            사용 가능한 sampleKey: claim, amount, documents (src/data/resultPreviewSamples.js) */}
        <Route path="/result/preview/:sampleKey" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;