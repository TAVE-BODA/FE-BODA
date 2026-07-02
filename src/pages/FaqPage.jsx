import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import './FaqPage.css';

import iconFaq from '../assets/images/side_icon_faq.png';
import iconUpload from '../assets/images/side_icon_upload.png';
import iconResult from '../assets/images/side_icon_result.png';
import iconPrivacy from '../assets/images/side_icon_privacy.png';
import iconCoverage from '../assets/images/side_icon_coverage.png';
import iconCs from '../assets/images/side_icon_cs.png';
import characterCs from '../assets/images/characters/character_cs.png';

export default function FaqPage() {
  const [currentMenu, setCurrentMenu] = useState('faq');
  const [openIndex, setOpenIndex] = useState(null);

  const menuItems = [
    { id: 'faq', name: '자주 묻는 질문', icon: iconFaq },
    { id: 'upload', name: '파일 업로드', icon: iconUpload },
    { id: 'result', name: '분석 결과', icon: iconResult },
    { id: 'privacy', name: '개인정보 보호', icon: iconPrivacy },
    { id: 'coverage', name: '지원 범위', icon: iconCoverage },
    { id: 'cs', name: '고객센터', icon: iconCs },
  ];

  const contentData = {
    faq: [
      {
        q: "어떤 파일을 올려야 하나요?",
        a: "보험증권과 약관 PDF 파일을 올리면 돼요.\n증권만 올려도 보장 내역 확인은 가능해요. 청구 가능 여부가 궁금하다면 약관도 함께 올려줘요.\n파일은 보험사 앱이나 홈페이지에서 받을 수 있어요."
      },
      {
        q: "올린 파일은 어떻게 되나요? 저장되나요?",
        a: "PDF 원본은 분석이 끝나면 <b>즉시 삭제</b>돼요.\n분석된 텍스트 내용만 계정에 저장해요. 덕분에 다음에 다시 올리지 않아도 바로 질문할 수 있어요."
      },
      {
        q: "제 보험사가 지원되는지 어떻게 알 수 있나요?",
        a: "<b>삼성생명, 한화생명, 교보생명, 삼성화재, 현대해상, DB손해보험</b> 6개사는 높은 정확도로 분석돼요.\n그 외 보험사도 업로드는 가능하지만, 분석 정확도가 낮을 수 있어요."
      },
      {
        q: "실손보험도 분석해주나요?",
        a: "실손은 가입 여부 확인과 기본적인 청구 가능 여부까지 알 수 있어요.\n다만 중복 비례보상 계산은 보다가 정확하게 답하기 어려워요. \n이 경우엔 보험사에 직접 확인하는 게 맞아요."
      }
    ],
    upload: [
      {
        q: "PDF 파일이 아니면 올릴 수 없나요?",
        a: "지금은 <b>PDF 파일만 올릴 수 있어요.</b> 파일은 보험사 앱·홈페이지에서 PDF로 받아봐요."
      },
      {
        q: "보험증권 여러 개를 동시에 올릴 수 있나요?",
        a: "네, 여러 보험사 증권을 <b>동시에</b> 올릴 수 있어요. 대시보드에서 한눈에 볼 수 있어요."
      },
      {
        q: "스캔 파일도 올릴 수 있나요?",
        a: "스캔 품질이 낮으면 분석이 정확하지 않을 수 있어요.\n보험사 앱에서 <b>디지털 원본</b>을 받아 올려주는 게 가장 좋아요."
      }
    ],
    result: [
      {
        q: "분석 도중 창을 닫으면 어떻게 되나요?",
        a: "창만 닫아도 분석은 계속돼요. 다시 접속하면 <b>이어서</b> 확인할 수 있어요."
      },
      {
        q: "답변이 맞는지 어떻게 믿을 수 있나요?",
        a: "모든 답변에는 <b>약관 근거</b>가 함께 표시돼요. 몇 페이지, 어떤 조항인지 직접 확인해볼 수 있어요."
      },
      {
        q: "이전에 올린 보험을 다시 분석하려면 어떻게 하나요?",
        a: "MY PAGE에서 분석된 보험 목록을 볼 수 있어요.\n파일을 다시 올리지 않아도 <b>바로 질문</b>할 수 있어요."
      },
      {
        q: "보다(Boda)가 제 보험 데이터를 저장하나요?",
        a: "네, 분석한 내용은 저장돼요. 단, PDF 원본 파일은 분석이 끝나는 즉시 삭제돼요.\n저장되는 건 PDF에서 추출한 텍스트 내용뿐이에요. 덕분에 다음에 다시 오셔도 파일을 다시 올리지 않아도 바로 질문할 수 있어요."
      }
    ],
    privacy: [
      {
        q: "제 보험 정보가 외부에 공유되나요?",
        a: "아니요. 보험 정보는 외부에 공유되지 않아요. 분석에만 사용하고, PDF 원본은 분석 후 <b>즉시 삭제</b>돼요."
      },
      {
        q: "저장된 분석 데이터를 지울 수 있나요?",
        a: "MY PAGE에서 분석 데이터를 직접 삭제할 수 있어요."
      },
      {
        q: "카카오 로그인 말고 다른 방법은 없나요?",
        a: "지금은 <b>카카오 로그인</b>만 지원해요. 공동인증서 없이 간편하게 이용할 수 있어요."
      }
    ],
    coverage: [
      {
        q: "연금보험이나 변액보험도 분석해주나요?",
        a: "연금보험, 변액보험, 자동차보험은 지금 지원하지 않아요.\n건강보험, 암보험, 상해보험, 치아보험 등을 분석해드릴 수 있어요."
      },
      {
        q: "보험사가 목록에 없어도 올릴 수 있나요?",
        a: "올릴 수는 있어요. 다만 주요 6개사 외에는 <b>분석 정확도가 낮을 수 있어요.</b> \n결과를 참고용으로만 활용해 주세요."
      },
      {
        q: "보다(Boda)가 답하기 어려운 질문은 어떻게 되나요?",
        a: "보다가 정확하게 답하기 어려운 질문은 솔직하게 알려드려요. 이 경우엔 보험사 고객센터 번호도 함께 안내해드려요."
      }
    ],
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

  const parseBoldText = (text) => {
    const regex = /(<b>.*?<\/b>)/g;
    const parts = text.split(regex);
    return parts.map((part, idx) => {
      if (part.startsWith('<b>') && part.endsWith('</b>')) {
        const cleanText = part.replace(/<\/?b>/g, '');
        return <strong key={idx} style={{ fontWeight: 'var(--weight-bold)' }}>{cleanText}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="faq-page-container">
      <Sidebar currentMenu={currentMenu} onMenuChange={handleMenuChange} />

      <main className="faq-main-content">
        <div className="faq-content-wrap">

          {currentMenu === 'cs' ? (
            <div className="cs-content">
              <div className="faq-title-area">
                <img src={iconCs} alt="고객센터" className="faq-title-black-icon" />
                <h1 className="faq-main-title">고객센터</h1>
              </div>
              <div className="cs-body">
                <img
                  src={characterCs}
                  alt="고객센터 캐릭터"
                  className="cs-character"
                />
                <p className="cs-main-text">더 궁금한 건 고객센터에 물어봐요</p>
                <p className="cs-tel">Tel. 010-5637-3731</p>

                <div className="cs-hours-card">
                  <div className="cs-hours-row">
                    <span className="cs-hours-label">평일</span>
                    <span className="cs-hours-value">09:00 - 18:00</span>
                  </div>
                  <div className="cs-hours-divider" />
                  <div className="cs-hours-row">
                    <span className="cs-hours-label">점심시간</span>
                    <span className="cs-hours-value">12:00 - 13:00</span>
                  </div>
                  <div className="cs-hours-divider" />
                  <div className="cs-hours-row cs-hours-closed">
                    <span className="cs-hours-label">주말 · 공휴일</span>
                    <span className="cs-hours-value">휴무</span>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <>
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
                          <span className="a-highlight">A.</span>
                          <div className="faq-answer-text-block">
                            {item.a.split('\n').map((line, lIdx) => (
                              <React.Fragment key={lIdx}>
                                {parseBoldText(line)}
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
            </>
          )}

        </div>
      </main>
    </div>
  );
}