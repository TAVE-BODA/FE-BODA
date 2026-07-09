import React, { useState } from 'react';
import './InsuranceModal.css';
import logoImg from '../assets/images/chat_component_icon.png';
import calendarIcon from '../assets/images/chat_component_calendar.png';

const Q1_OPTIONS = [
  { id: 'injury', label: '다쳤어요', desc: '예: 넘어짐, 교통사고, 운동 중 부상, 추락' },
  { id: 'sick', label: '아파서 병원에 갔어요', desc: '예: 감기, 암, 디스크, 소화불량' },
  { id: 'checkup', label: '검진에서 발견됐어요', desc: '예: 건강검진, MRI, 내시경 결과' },
];

const Q2_OPTIONS = [
  { id: 'diagnosis', label: '진단만 받았어요' },
  { id: 'surgery', label: '수술받았어요' },
  { id: 'hospitalized', label: '입원했어요' },
  { id: 'outpatient', label: '통원·외래 치료만 받았어요', desc: '예: 물리치료, 도수치료' },
  { id: 'cast', label: '깁스·고정 치료받았어요' },
  { id: 'dental', label: '치아 치료받았어요' },
  { id: 'disability', label: '장해·후유장해 진단받았어요' },
];

const Q3A_HOSPITAL_OPTIONS = [
  { id: 'clinic', label: '동네 병원·의원' },
  { id: 'general', label: '종합병원' },
  { id: 'university', label: '대학병원·상급종합병원' },
];

const Q3A_ROOM_OPTIONS = [
  { id: 'single', label: '1인실' },
  { id: 'double', label: '2, 3인실' },
  { id: 'general', label: '일반 병실 (4인실 이상)' },
];

const Q3B_BODY_OPTIONS = [
  { id: 'limb', label: '팔·다리·발·손가락 등 사지' },
  { id: 'trunk', label: '척추·갈비뼈·골반 등 몸통' },
];

const Q3B_CAST_OPTIONS = [
  { id: 'full', label: '석고붕대로 전체를 감쌌어요' },
  { id: 'partial', label: '반깁스·부목이었어요' },
];

const Q3C_DENTAL_OPTIONS = [
  { id: 'extraction', label: '이를 뽑았어요' },
  { id: 'crown', label: '씌우거나 심었어요' },
  { id: 'filling', label: '때웠어요' },
  { id: 'root_canal', label: '신경치료 받았어요' },
];

export default function InsuranceModal({ isOpen, onClose, onSubmitSuccess }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    q1: '',
    q2: [],
    q3a_hospital: '',
    q3a_room: '',
    q3a_nights: '',
    q3b_body: '',
    q3b_cast: '',
    q3c_dental: '',
    q3c_count: '',
    q4_type: '',
    q4_date: '',
    q4_year: '',
    q4_month: '',
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQ2 = (id) => {
    setFormData(prev => {
      const already = prev.q2.includes(id);
      return {
        ...prev,
        q2: already ? prev.q2.filter(v => v !== id) : [...prev.q2, id],
      };
    });
  };

  const handleField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showQ3A = formData.q2.includes('hospitalized');
  const showQ3B = formData.q2.includes('cast');
  const showQ3C = formData.q2.includes('dental');

  const isFormValid =
    formData.q1 !== '' &&
    formData.q2.length > 0 &&
    formData.q4_type !== '' &&
    (formData.q4_type === 'date'
      ? formData.q4_date !== ''
      : formData.q4_year !== '' && formData.q4_month !== '');

  const handleSubmit = () => {
    if (!isFormValid || isSubmitting) return;
    if (onSubmitSuccess) onSubmitSuccess(formData);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const daysArray = [];
  for (let i = 0; i < firstDay; i++) daysArray.push(null);
  for (let i = 1; i <= lastDate; i++) daysArray.push(i);

  const handleDateSelect = (day) => {
    if (!day) return;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    handleField('q4_date', `${year}-${m}-${d}`);
  };

  const getQ3Num = (type) => {
    if (type === 'A') return 3;
    if (type === 'B') return showQ3A ? 4 : 3;
    if (type === 'C') return (showQ3A ? 1 : 0) + (showQ3B ? 1 : 0) + 3;
    return (showQ3A ? 1 : 0) + (showQ3B ? 1 : 0) + (showQ3C ? 1 : 0) + 3;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={e => e.stopPropagation()}>

        <div className="modal-header-area">
          <img src={logoImg} alt="boda" className="modal-logo" />
        </div>

        <div className="modal-scroll-body">

          {/* Q1 */}
          <div className="question-card">
            <div className="card-title-row">
              <span className="question-number">1</span>
              <span className="question-text">
                어떤 일이 있으셨나요? <span className="required-badge">*필수</span>
              </span>
            </div>
            <div className="radio-card-group">
              {Q1_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`radio-card ${formData.q1 === opt.id ? 'selected' : ''}`}
                  onClick={() => handleField('q1', opt.id)}
                >
                  <span className="radio-dot" />
                  <span className="radio-card-label">
                    <span className="radio-card-main">{opt.label}</span>
                    {opt.desc && <span className="radio-card-sub">{opt.desc}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Q2 */}
          <div className="question-card">
            <div className="card-title-row">
              <span className="question-number">2</span>
              <span className="question-text">
                어떤 치료를 받았나요? <span className="required-badge">*필수</span>
                <span style={{ fontSize: '12px', color: 'var(--gray-04)', fontWeight: 'normal', marginLeft: '6px' }}>중복 선택 가능</span>
              </span>
            </div>
            <div className="checkbox-card-group">
              {Q2_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`checkbox-card ${formData.q2.includes(opt.id) ? 'selected' : ''}`}
                  onClick={() => handleQ2(opt.id)}
                >
                  <span className="checkbox-box">✓</span>
                  <span className="checkbox-card-label">
                    <span className="checkbox-card-main">{opt.label}</span>
                    {opt.desc && <span className="checkbox-card-sub">{opt.desc}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Q3-A: 입원 */}
          {showQ3A && (
            <div className="question-card">
              <div className="card-title-row">
                <span className="question-number">{getQ3Num('A')}</span>
                <span className="question-text">입원 관련 정보</span>
              </div>

              <p className="sub-question-title" style={{ marginTop: 0 }}>어떤 병원에 입원하셨나요?</p>
              <div className="toggle-btn-group" style={{ marginBottom: '20px' }}>
                {Q3A_HOSPITAL_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`toggle-btn ${formData.q3a_hospital === opt.id ? 'selected' : ''}`}
                    onClick={() => handleField('q3a_hospital', opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <p className="sub-question-title">어떤 병실을 사용하셨나요?</p>
              <div className="toggle-btn-group" style={{ marginBottom: '20px' }}>
                {Q3A_ROOM_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`toggle-btn ${formData.q3a_room === opt.id ? 'selected' : ''}`}
                    onClick={() => handleField('q3a_room', opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <p className="sub-question-title">몇 박 입원하셨나요?</p>
              <div className="nights-input-wrap">
                <input
                  type="number"
                  className="nights-input"
                  placeholder="숫자로 입력해주세요"
                  value={formData.q3a_nights}
                  onChange={e => handleField('q3a_nights', e.target.value)}
                  min="1"
                />
                <span className="nights-unit">박</span>
              </div>
            </div>
          )}

          {/* Q3-B: 깁스 */}
          {showQ3B && (
            <div className="question-card">
              <div className="card-title-row">
                <span className="question-number">{getQ3Num('B')}</span>
                <span className="question-text">깁스 관련 정보</span>
              </div>

              <p className="sub-question-title" style={{ marginTop: 0 }}>어느 부위를 다쳤나요?</p>
              <div className="toggle-btn-group" style={{ marginBottom: '20px' }}>
                {Q3B_BODY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`toggle-btn ${formData.q3b_body === opt.id ? 'selected' : ''}`}
                    onClick={() => handleField('q3b_body', opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <p className="sub-question-title">깁스를 어떻게 하셨나요?</p>
              <div className="toggle-btn-group">
                {Q3B_CAST_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`toggle-btn ${formData.q3b_cast === opt.id ? 'selected' : ''}`}
                    onClick={() => handleField('q3b_cast', opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Q3-C: 치아 */}
          {showQ3C && (
            <div className="question-card">
              <div className="card-title-row">
                <span className="question-number">{getQ3Num('C')}</span>
                <span className="question-text">치아 관련 정보</span>
              </div>

              <p className="sub-question-title" style={{ marginTop: 0 }}>어떤 치아 치료를 받으셨나요?</p>
              <div className="toggle-btn-group" style={{ flexWrap: 'wrap', marginBottom: '20px' }}>
                {Q3C_DENTAL_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`toggle-btn ${formData.q3c_dental === opt.id ? 'selected' : ''}`}
                    onClick={() => handleField('q3c_dental', opt.id)}
                    style={{ minWidth: '140px' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <p className="sub-question-title">총 몇 개의 치아 치료를 받으셨나요?</p>
              <div className="teeth-count-grid">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button
                    key={n}
                    className={`teeth-count-btn ${formData.q3c_count === String(n) ? 'selected' : ''}`}
                    onClick={() => handleField('q3c_count', String(n))}
                  >
                    {n}개
                  </button>
                ))}
                <button
                  className={`teeth-count-btn teeth-count-unknown ${formData.q3c_count === 'unknown' ? 'selected' : ''}`}
                  onClick={() => handleField('q3c_count', 'unknown')}
                >
                  잘 모르겠어요
                </button>
              </div>
            </div>
          )}

          {/* Q4 */}
          <div className="question-card">
            <div className="card-title-row">
              <span className="question-number">{getQ3Num('Q4')}</span>
              <span className="question-text">
                치료를 언제 시작하셨나요? <span className="required-badge">*필수</span>
              </span>
            </div>
            <div className="button-option-group">
              <button
                className={`option-btn ${formData.q4_type === 'date' ? 'selected' : ''}`}
                onClick={() => handleField('q4_type', 'date')}
              >
                <img src={calendarIcon} alt="" className="calendar-icon" />
                날짜 직접 선택
              </button>
              <button
                className={`option-btn ${formData.q4_type === 'yearmonth' ? 'selected' : ''}`}
                onClick={() => handleField('q4_type', 'yearmonth')}
              >
                연도·월만 알아요
              </button>
            </div>

            {formData.q4_type === 'date' && (
              <div className="custom-calendar-container">
                <div className="calendar-header">
                  <button type="button" className="cal-nav-btn" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>◀</button>
                  <span className="calendar-title-ym">{year}년 {month + 1}월</span>
                  <button type="button" className="cal-nav-btn" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>▶</button>
                </div>
                <div className="calendar-weekdays">
                  {['일','월','화','수','목','금','토'].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="calendar-days-grid">
                  {daysArray.map((day, idx) => {
                    const m = String(month + 1).padStart(2, '0');
                    const d = String(day).padStart(2, '0');
                    const dateStr = day ? `${year}-${m}-${d}` : '';
                    const isSelected = formData.q4_date === dateStr;
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
                {formData.q4_date && (
                  <div className="selected-date-display">
                    선택된 날짜: <span>{formData.q4_date}</span>
                  </div>
                )}
              </div>
            )}

            {formData.q4_type === 'yearmonth' && (
              <div className="custom-calendar-container">
                <div className="calendar-header">
                  <button type="button" className="cal-nav-btn" onClick={() => handleField('q4_year', String(Number(formData.q4_year || new Date().getFullYear()) - 1))}>◀</button>
                  <span className="calendar-title-ym">{formData.q4_year || new Date().getFullYear()}년</span>
                  <button type="button" className="cal-nav-btn" onClick={() => handleField('q4_year', String(Number(formData.q4_year || new Date().getFullYear()) + 1))}>▶</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '12px' }}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <button
                      key={m}
                      className={`toggle-btn ${formData.q4_month === String(m) ? 'selected' : ''}`}
                      onClick={() => handleField('q4_month', String(m))}
                      style={{ padding: '12px 8px' }}
                    >
                      {m}월
                    </button>
                  ))}
                </div>
                {formData.q4_year && formData.q4_month && (
                  <div className="selected-date-display">
                    선택됨: <span>{formData.q4_year}년 {formData.q4_month}월</span>
                  </div>
                )}
              </div>
            )}

            <p className="info-sub-text">치료 날짜는 면책기간, 보장개시일 확인에 사용돼요.</p>
          </div>

          <div className="modal-next-btn-container">
            <button
              className="modal-next-btn"
              disabled={!isFormValid || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? '전송 중...' : '다음으로'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}