import { useState, useRef } from 'react';
import './InsuranceBadge.css';

// 회사별 색상 하드코딩
const COMPANY_COLORS = {
  '삼성생명':   { bg: '#EBF4FF', border: '#229cff', text: '#057dee' },
  '동양생명':   { bg: '#EDFAF3', border: '#2BBF7A', text: '#1A9E60' },
  '한화생명':   { bg: '#FFF4EB', border: '#FF8C2A', text: '#D9700E' },
  'KB생명':     { bg: '#FFF0F0', border: '#F04E4E', text: '#C93232' },
  '교보생명':   { bg: '#F3EEFF', border: '#8B5CF6', text: '#6D3FD8' },
  '신한생명':   { bg: '#FFF8E6', border: '#F5A623', text: '#C8820A' },
  '흥국생명':   { bg: '#EDFAFF', border: '#0BA5D3', text: '#0885AB' },
  '메트라이프': { bg: '#F0F8FF', border: '#3B82F6', text: '#1D5FC5' },
};

// 분석 정확도 경고 대상 회사
const LOW_ACCURACY_COMPANIES = ['동양생명'];

function getCompanyColor(company) {
  return COMPANY_COLORS[company] ?? { bg: '#F5F5F5', border: '#9E9E9E', text: '#616161' };
}

export default function InsuranceBadge({ company, year, bold = false }) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const timerRef = useRef(null);
  const colors = getCompanyColor(company);
  const isLowAccuracy = LOW_ACCURACY_COMPANIES.includes(company);

  const showTooltip = () => {
    clearTimeout(timerRef.current);
    setTooltipVisible(true);
  };

  const hideTooltip = () => {
    timerRef.current = setTimeout(() => setTooltipVisible(false), 100);
  };

  return (
    <span
      className={['insurance-badge', bold ? 'insurance-badge--bold' : ''].filter(Boolean).join(' ')}
      style={{ '--badge-bg': colors.bg, '--badge-border': colors.border, '--badge-text': colors.text }}
    >
      {company}{year ? ` ${year}~` : ''}
      {isLowAccuracy && (
        <span
          className="insurance-badge__info"
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          i
          {tooltipVisible && (
            <span className="insurance-badge__tooltip">
              {company}은 분석 정확도가 낮을 수 있어요
            </span>
          )}
        </span>
      )}
    </span>
  );
}
