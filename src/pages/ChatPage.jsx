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

        {/* --- 대화 상태 2: 버튼을 클릭했을 때의 화면 --- */}
        {selectedOption !== null && (
          <div className="chat-flow-container">
            
            {/* [유저 선택 메시지] 챗봇 라인과 수평을 이룬 채 우측에 나란히 안착합니다 */}
            <div className="chat-message-row user-row">
              <div className="chat-bubble user-bubble">
                {selectedOption === 1 && "1. 청구 가능한지 먼저 알고싶어요"}
                {selectedOption === 2 && "2. 예상 보험금을 먼저 알고 싶어요"}
                {selectedOption === 3 && "3. 필요 서류를 먼저 알고 싶어요"}
                {selectedOption === 4 && "4. 내 보험의 보장 항목부터 보고 싶어요"}
              </div>
            </div>

            {/* [챗봇 연속 답변] 위치 미동 없이 그 자리에서 부드럽게 출력 */}
            <div className="chat-message-row">
              <div className="chat-avatar-area">
                <img src={avatarImg} alt="챗봇 캐릭터" className="chat-avatar" />
              </div>
              
              <div className="chatbot-responses-group">
                <div className="chat-bubble chatbot-bubble">
                  <p className="chat-bubble-text font-medium">
                    좋아요.<br />
                    청구 가능성을 중심으로 확인해 드릴게요.
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

      </div>
    </div>
  );
}