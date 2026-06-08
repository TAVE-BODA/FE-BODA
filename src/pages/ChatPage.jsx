import React, { useState } from 'react';
import './ChatPage.css';
import avatarImg from '../assets/images/chat_icon.png';
import InsuranceModal from '../components/InsuranceModal';

export default function ChatPage() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalFinished, setIsModalFinished] = useState(false);

  const handleOptionClick = (optionNumber) => {
    setSelectedOption(optionNumber);
    
    /* 4번 버튼을 누른 경우 모달을 거치지 않고 즉시 파일 업로드 화면으로 전환 */
    if (optionNumber === 4) {
      setIsModalFinished(true);
    }
  };

  const handleInputConditions = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmitSuccess = (data) => {
    setIsModalOpen(false);
    setIsModalFinished(true);
  };

  const getOptionText = (option) => {
    switch (option) {
      case 1: return "1. 청구 가능한지 먼저 알고싶어요";
      case 2: return "2. 예상 보험금을 먼저 알고 싶어요";
      case 3: return "3. 필요 서류를 먼저 알고 싶어요";
      case 4: return "4. 내 보험의 보장 항목부터 보고 싶어요";
      default: return "";
    }
  };

  const getChatbotFocusText = (option) => {
    switch (option) {
      case 1: return "청구 가능성을 중심으로";
      case 2: return "예상 보험금을 중심으로";
      case 3: return "필요서류를 중심으로";
      default: return "목적에 맞추어";
    }
  };

  return (
    <div className="chat-page-container">
      <div className="chat-content-wrap">
        
        {/* --- 대화 상태 1: 아무것도 선택하지 않은 첫 화면 --- */}
        {selectedOption === null && (
          <div className="chat-flow-container">
            <div className="chat-message-row">
              <div className="chat-avatar-area">
                <img src={avatarImg} alt="챗봇 캐릭터" className="chat-avatar" />
              </div>
              <div className="chat-bubble first-bubble">
                <h3 className="chat-bubble-title">무엇을 먼저 확인해 드릴까요?</h3>
                <p className="chat-bubble-text">
                  선택한 목적에 맞추어<br />
                  결과 화면에서 먼저 보여드릴게요!
                </p>
              </div>
            </div>

            <div className="chat-interactive-area">
              <div className="chat-options-area">
                <button className="chat-option-btn" onClick={() => handleOptionClick(1)}>
                  1. 청구 가능한지 먼저 알고싶어요
                </button>
                <button className="chat-option-btn" onClick={() => handleOptionClick(2)}>
                  2. 예상 보험금을 먼저 알고 싶어요
                </button>
                <button className="chat-option-btn" onClick={() => handleOptionClick(3)}>
                  3. 필요 서류를 먼저 알고 싶어요
                </button>
                <button className="chat-option-btn" onClick={() => handleOptionClick(4)}>
                  4. 내 보험의 보장 항목부터 보고 싶어요
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- 대화 상태 2: 1, 2, 3번 버튼을 선택했을 때 나오는 조건 양식 화면 --- */}
        {[1, 2, 3].includes(selectedOption) && !isModalFinished && (
          <div className="chat-flow-container">
            <div className="chat-message-row user-row">
              <div className="chat-bubble user-bubble">
                {getOptionText(selectedOption)}
              </div>
            </div>

            <div className="chat-message-row">
              <div className="chat-avatar-area">
                <img src={avatarImg} alt="챗봇 캐릭터" className="chat-avatar" />
              </div>
              
              <div className="chatbot-responses-group">
                <div className="chat-bubble chatbot-bubble">
                  <p className="chat-bubble-text font-medium">
                    좋아요.<br />
                    {getChatbotFocusText(selectedOption)} 확인해 드릴게요.
                  </p>
                </div>
                
                <div className="chat-bubble chatbot-bubble">
                  <p className="chat-bubble-text font-medium">
                    몇 가지만 더 알려주세요.
                  </p>
                </div>

                <div className="chat-interactive-area" style={{ paddingLeft: 0 }}>
                  <button className="insurance-condition-btn" onClick={handleInputConditions}>
                    보험 조건 입력하기 <span className="arrow-icon">⟩</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 대화 상태 3: 1, 2, 3번 모달 완료 후 혹은 4번 선택 시 즉시 진입하는 PDF 업로드 화면 --- */}
        {isModalFinished && (
          <div className="chat-flow-container">
            <div className="chat-message-row user-row">
              <div className="chat-bubble user-bubble">
                {getOptionText(selectedOption)}
              </div>
            </div>

            <div className="chat-message-row">
              <div className="chat-avatar-area">
                <img src={avatarImg} alt="챗봇 캐릭터" className="chat-avatar" />
              </div>
              
              <div className="chatbot-responses-group">
                <div className="chat-bubble chatbot-bubble">
                  <p className="chat-bubble-text font-medium">
                    알려주신 내용을 확인했어요!
                  </p>
                </div>
                
                <div className="chat-bubble chatbot-bubble">
                  <p className="chat-bubble-text font-medium">
                    이제 내 보험 기준으로 확인하려면 보험증권과 보험약관 PDF가 필요해요.
                  </p>
                </div>

                <div className="chat-bubble chatbot-bubble">
                  <p className="chat-bubble-text font-medium">
                    파일을 준비하셨나요?
                  </p>
                </div>

                <div className="chat-interactive-area" style={{ paddingLeft: 0, marginTop: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button className="insurance-condition-btn" style={{ justifyContent: 'space-between', minWidth: '240px' }}>
                      파일 업로드하기 <span className="arrow-icon">⟩</span>
                    </button>
                    <button className="chat-option-btn" style={{ borderColor: '#229CFF', color: '#084CB2', minWidth: '240px', textAlign: 'center' }}>
                      아직 준비가 안됐어요
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <InsuranceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmitSuccess={handleModalSubmitSuccess}
      />
    </div>
  );
}