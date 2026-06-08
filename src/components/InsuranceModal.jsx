import React, { useState } from 'react';
import './InsuranceModal.css';
import logoImg from '../assets/images/chat_component_icon.png'; 
import calendarIcon from '../assets/images/chat_component_calendar.png'; 

export default function InsuranceModal({ isOpen, onClose, onSubmitSuccess }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    treatment: '',       
    hospitalType: '',    
    visitDateType: '',   
    visitDate: '',       
    costType: '',        
    cost: ''             
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCostChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, cost: rawValue }));
  };

  const formatComma = (num) => {
    if (!num) return '';
    return Number(num).toLocaleString();
  };

  const isFormValid = formData.treatment.trim() !== '' && formData.hospitalType !== '';

  /* 백엔드 데이터 전송 */
  const handleNextSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/insurance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatment: formData.treatment,
          hospitalType: formData.hospitalType,
          visitDateType: formData.visitDateType,
          visitDate: formData.visitDateType === 'select' ? formData.visitDate : null,
          costType: formData.costType,
          cost: formData.cost ? parseInt(formData.cost, 10) : 0
        }),
      });

      if (!response.ok) throw new Error('서버 전송 실패');

      const result = await response.json();
      if (onSubmitSuccess) onSubmitSuccess(result);
      
    } catch (error) {
      console.error(error);
      alert('데이터 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= lastDateOfMonth; i++) {
    daysArray.push(i);
  }

  const changeMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const handleDateSelect = (day) => {
    if (!day) return;
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateString = `${year}-${formattedMonth}-${formattedDay}`;
    handleInputChange('visitDate', dateString);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header-area">
          <img src={logoImg} alt="boda" className="modal-logo" />
        </div>

        <div className="modal-scroll-body">
          
          <div className="question-card">
            <div className="card-title-row">
              <span className="question-number">1</span>
              <span className="question-text">
                어떤 치료나 사고였나요?<span className="required-badge">*필수</span>
              </span>
            </div>
            <input 
              type="text" 
              className="style-text-input"
              placeholder="예: MRI 촬영, 도수치료, 수술, 골절, 입원 등"
              value={formData.treatment}
              onChange={(e) => handleInputChange('treatment', e.target.value)}
            />
          </div>

          <div className="question-card">
            <div className="card-title-row">
              <span className="question-number">2</span>
              <span className="question-text">
                병원은 어떻게 이용하셨나요?<span className="required-badge">*필수</span>
              </span>
            </div>
            <div className="tile-grid-4">
              {[
                { id: '통원', label: '통원' },
                { id: '입원', label: '입원' },
                { id: '응급실', label: '응급실' },
                { id: '모르겠어요', label: '모르겠어요' }
              ].map((tile) => (
                <div 
                  key={tile.id}
                  className={`visual-tile ${formData.hospitalType === tile.id ? 'selected' : ''}`}
                  onClick={() => handleInputChange('hospitalType', tile.id)}
                >
                  <div className="tile-icon-placeholder"></div>
                  <span className="tile-label">{tile.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="question-card">
            <div className="card-title-row">
              <span className="question-number">3</span>
              <span className="question-text">
                언제 치료를 받으셨나요?<span className="optional-badge">선택</span>
              </span>
            </div>
            <div className="button-option-group">
              <button 
                className={`option-btn ${formData.visitDateType === 'select' ? 'selected' : ''}`}
                onClick={() => handleInputChange('visitDateType', 'select')}
              >
                <img src={calendarIcon} alt="" className="calendar-icon" />
                날짜 선택
              </button>
              <button 
                className={`option-btn ${formData.visitDateType === 'unknown' ? 'selected' : ''}`}
                onClick={() => {
                  handleInputChange('visitDateType', 'unknown');
                  handleInputChange('visitDate', ''); 
                }}
              >
                아직 몰라요
              </button>
            </div>

            {formData.visitDateType === 'select' && (
              <div className="custom-calendar-container">
                <div className="calendar-header">
                  <button type="button" onClick={() => changeMonth(-1)} className="cal-nav-btn">◀</button>
                  <span className="calendar-title-ym">{year}년 {month + 1}월</span>
                  <button type="button" onClick={() => changeMonth(1)} className="cal-nav-btn">▶</button>
                </div>
                
                <div className="calendar-weekdays">
                  {['일', '월', '화', '수', '목', '금', '토'].map(d => <span key={d}>{d}</span>)}
                </div>

                <div className="calendar-days-grid">
                  {daysArray.map((day, idx) => {
                    const formattedMonth = String(month + 1).padStart(2, '0');
                    const formattedDay = String(day).padStart(2, '0');
                    const thisDateStr = day ? `${year}-${formattedMonth}-${formattedDay}` : '';
                    const isSelected = formData.visitDate === thisDateStr;

                    return (
                      <div 
                        key={idx} 
                        className={`calendar-day-cell ${day ? 'active-day' : ''} ${isSelected ? 'selected-day' : ''}`}
                        onClick={() => day && handleDateSelect(day)}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                
                {formData.visitDate && (
                  <div className="selected-date-display">
                    선택된 날짜: <span>{formData.visitDate}</span>
                  </div>
                )}
              </div>
            )}

            <p className="info-sub-text">
              진료 날짜는 면책기간, 보장개시일 확인에 사용돼요.
            </p>
          </div>

          <div className="question-card">
            <div className="card-title-row">
              <span className="question-number">4</span>
              <span className="question-text">
                진료비가 대략 얼마였나요?<span className="optional-badge">선택</span>
              </span>
            </div>
            <div className="currency-input-box">
              <input 
                type="text" 
                className="style-currency-input"
                placeholder="금액을 입력해주세요. 예) 30000"
                value={formatComma(formData.cost)}
                onChange={handleCostChange}
              />
              <span className="currency-unit">원</span>
            </div>
            <div className="button-option-group">
              <button 
                className={`option-btn ${formData.costType === 'unknown' ? 'selected' : ''}`}
                onClick={() => handleInputChange('costType', 'unknown')}
              >
                아직 몰라요
              </button>
              <button 
                className={`option-btn ${formData.costType === 'none' ? 'selected' : ''}`}
                onClick={() => handleInputChange('costType', 'none')}
              >
                해당 없어요
              </button>
            </div>
          </div>

          <div className="modal-next-btn-container">
            <button 
              className="modal-next-btn"
              disabled={!isFormValid || isSubmitting}
              onClick={handleNextSubmit}
            >
              {isSubmitting ? '전송 중...' : '다음으로'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}