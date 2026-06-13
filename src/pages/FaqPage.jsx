import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import './FaqPage.css';

import iconFaq from '../assets/images/side_icon_faq.png';
import iconUpload from '../assets/images/side_icon_upload.png';
import iconResult from '../assets/images/side_icon_result.png';
import iconPrivacy from '../assets/images/side_icon_privacy.png';
import iconCoverage from '../assets/images/side_icon_coverage.png';

export default function FaqPage() {
  const [currentMenu, setCurrentMenu] = useState('faq');
  const [openIndex, setOpenIndex] = useState(null);

  const menuItems = [
    { id: 'faq', name: '자주 묻는 질문', icon: iconFaq },
    { id: 'upload', name: '파일 업로드', icon: iconUpload },
    { id: 'result', name: '분석 결과', icon: iconResult },
    { id: 'privacy', name: '개인정보 보호', icon: iconPrivacy },
    { id: 'coverage', name: '지원 범위', icon: iconCoverage },
  ];

  const contentData = {
    faq: [
      { 
        q: "어떤 파일을 올려야 하나요?", 
        a: "보험증권과 약관 PDF 파일을 올리면 돼요.\n증권만 올려도 보장 내역 확인은 가능해요. 청구 가능 여부가 궁금하다면 약관도 함께 올려줘요.\n파일은 보험사 앱이나 홈페이지에서 받을 수 있어요." 
      },
      { q: "올린 파일은 어떻게 되나요? 저장되나요?", a: "여기에 두 번째 질문의 답변 내용을 입력하세요." },
      { q: "제 보험사가 지원되는지 어떻게 알 수 있나요?", a: "여기에 세 번째 질문의 답변 내용을 입력하세요." },
      { q: "실손보험도 분석해주나요?", a: "여기에 네 번째 질문의 답변 내용을 입력하세요." }
    ],
    upload: [],
    result: [],
    privacy: [],
    coverage: []
  };

  const handleMenuChange = (menuId) => {
    setCurrentMenu(menuId);
    setOpenIndex(null);
  };

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const activeMenuObj = menuItems.find(item => item.id === currentMenu);
  const currentList = contentData[currentMenu] || [];

  return (
    <div className="faq-page-container">
      
      <Sidebar currentMenu={currentMenu} onMenuChange={handleMenuChange} />

      <main className="faq-main-content">
        <div className="faq-content-wrap">
          
          <div className="faq-title-area">
            <img src={activeMenuObj?.icon} alt="타이틀 아이콘" className="faq-title-black-icon" />
            <h1 className="faq-main-title">{activeMenuObj?.name}</h1>
          </div>

          <div className="faq-accordion-list">
            {currentList.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className={`faq-accordion-item ${isOpen ? 'is-open' : ''}`}>
                  
                  <button className="faq-question-btn" onClick={() => handleToggle(index)}>
                    <span className="faq-question-text">
                      <span className="q-highlight">Q.</span> {item.q}
                    </span>
                    <span className={`faq-arrow-chevron ${isOpen ? 'rotated' : ''}`}></span>
                  </button>

                  <div className={`faq-answer-panel ${isOpen ? 'show' : ''}`}>
                    <div className="faq-answer-inner">
                      {/* A. 하이라이트 태그 분리 및 내부 텍스트 정렬 래퍼 추가 */}
                      <span className="a-highlight">A.</span>
                      <div className="faq-answer-text-block">
                        {item.a.split('\n').map((line, lIdx) => (
                          <React.Fragment key={lIdx}>
                            {line}
                            <br />
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </main>

    </div>
  );
}