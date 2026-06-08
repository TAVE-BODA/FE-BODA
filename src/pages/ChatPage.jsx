import React, { useState } from 'react';
import './ChatPage.css';
import avatarImg from '../assets/images/chat_icon.png';

export default function ChatPage() {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (optionNumber) => {
    setSelectedOption(optionNumber);
  };

  const handleInputConditions = () => {
    console.log('보험 조건 입력하기 클릭됨');
  };

  // 선택한 번호에 따라 우측 유저 말풍선에 들어갈 텍스트를 매핑합니다
  const getOptionText = (option) => {
    switch (option) {
      case 1: return "1. 청구 가능한지 먼저 알고싶어요";
      case 2: return "2. 예상 보험금을 먼저 알고 싶어요";
      case 3: return "3. 필요 서류를 먼저 알고 싶어요";
      case 4: return "4. 내 보험의 보장 항목부터 보고 싶어요";
      default: return "";
    }
  };

  // 🚀 선택한 번호에 따라 챗봇 첫 번째 말풍선의 중심 문구를 동적으로 변경합니다
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

        {/* --- 대화 상태 2: 1, 2, 3번 버튼을 선택했을 때 나오는 공통 양식 화면 (멘트는 동적 변경) --- */}
        {[1, 2, 3].includes(selectedOption) && (
          <div className="chat-flow-container">
            
            {/* [유저 메시지] 사용자가 누른 1, 2, 3번 중 하나의 텍스트가 꽂힙니다 */}
            <div className="chat-message-row user-row">
              <div className="chat-bubble user-bubble">
                {getOptionText(selectedOption)}
              </div>
            </div>

            {/* [챗봇 연속 답변] */}
            <div className="chat-message-row">
              <div className="chat-avatar-area">
                <img src={avatarImg} alt="챗봇 캐릭터" className="chat-avatar" />
              </div>
              
              <div className="chatbot-responses-group">
                {/* 🚀 getChatbotFocusText 함수를 사용하여 선택지에 맞는 문구가 출력됩니다 */}
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

        {/* --- 대화 상태 3: 4번 버튼을 선택했을 때의 분기 화면 --- */}
        {selectedOption === 4 && (
          <div className="chat-flow-container">
            <div className="chat-message-row user-row">
              <div className="chat-bubble user-bubble">
                {getOptionText(selectedOption)}
              </div>
            </div>
            {/* 추후 필요시 4번 전용 챗봇 UI를 여기에 추가 구현 */}
          </div>
        )}

      </div>
    </div>
  );
}