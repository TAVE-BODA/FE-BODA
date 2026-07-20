import { useState, useRef } from 'react';
import './InsuranceDetailCard.css';

const COMPANY_COLORS = {
  '삼성생명':   '#229cff',
  '동양생명':   '#2BBF7A',
  '한화생명':   '#FF8C2A',
  'KB생명':     '#F04E4E',
  '교보생명':   '#8B5CF6',
  '신한생명':   '#F5A623',
  '흥국생명':   '#0BA5D3',
  '메트라이프': '#3B82F6',
};

// 백엔드 companyName이 "삼성생명보험주식회사"처럼 정식 법인명으로 와서 짧은 브랜드명
// 기준인 COMPANY_COLORS랑 그대로 매칭이 안 됨 (InsuranceBadge.jsx와 동일한 이유).
function normalizeCompanyName(company) {
  if (!company) return company;
  return Object.keys(COMPANY_COLORS).find((name) => company.includes(name)) ?? company;
}

function getColor(company) {
  return COMPANY_COLORS[company] ?? '#9E9E9E';
}

/* ── 툴팁 ────────────────────────────────── */
function Tooltip({ text }) {
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  return (
    <span
      className="detail-tooltip-wrap"
      onMouseEnter={() => { clearTimeout(timer.current); setVisible(true); }}
      onMouseLeave={() => { timer.current = setTimeout(() => setVisible(false), 100); }}
    >
      <span className="detail-tooltip-icon">i</span>
      {visible && <span className="detail-tooltip-bubble">{text}</span>}
    </span>
  );
}

/* ── 행 렌더러 ───────────────────────────── */
function SimpleRow({ row }) {
  return (
    <div className="detail-row detail-row--simple">
      <span className="detail-row__label">{row.label}</span>
      <span className={['detail-row__amount', row.bold ? 'detail-row__amount--bold' : ''].filter(Boolean).join(' ')}>
        {row.amount}
      </span>
    </div>
  );
}

function NeedsTermsRow({ row }) {
  return (
    <div className="detail-row detail-row--simple">
      <span className="detail-row__label">{row.label}</span>
      <span className="detail-row__needs-terms">약관이 필요해요</span>
    </div>
  );
}

function ColHeaderRow({ row }) {
  return (
    <div className="detail-row detail-row--col-header">
      <span className="detail-row__label" />
      <span className="detail-row__col-head">
        {row.col1}
        {row.col1Tooltip && <Tooltip text={row.col1Tooltip} />}
      </span>
      <span className="detail-row__col-head">
        {row.col2}
        {row.col2Tooltip && <Tooltip text={row.col2Tooltip} />}
      </span>
    </div>
  );
}

function SectionRow({ row }) {
  const hasColumns = row.col1 !== undefined || row.col2 !== undefined;
  return (
    <div className={['detail-row detail-row--section', hasColumns ? 'detail-row--section-cols' : ''].filter(Boolean).join(' ')}>
      <span className="detail-row__section-label">{row.label}</span>
      {hasColumns && (
        <>
          <span className="detail-row__col-head detail-row__col-head--section">
            {row.col1}
            {row.col1Tooltip && <Tooltip text={row.col1Tooltip} />}
          </span>
          <span className="detail-row__col-head detail-row__col-head--section">
            {row.col2}
            {row.col2Tooltip && <Tooltip text={row.col2Tooltip} />}
          </span>
        </>
      )}
    </div>
  );
}

function ColDataRow({ row }) {
  return (
    <div className="detail-row detail-row--col-data">
      <span className="detail-row__label">{row.label}</span>
      <span className={['detail-row__col-val', row.col1Active ? 'detail-row__col-val--active' : ''].filter(Boolean).join(' ')}>
        {row.col1 ?? ''}
        {row.col1 && row.col1Tooltip && <Tooltip text={row.col1Tooltip} />}
      </span>
      <span className={['detail-row__col-val', row.col2Active ? 'detail-row__col-val--active' : ''].filter(Boolean).join(' ')}>
        {row.col2 ?? ''}
        {row.col2 && row.col2Tooltip && <Tooltip text={row.col2Tooltip} />}
      </span>
    </div>
  );
}

function renderRow(row, idx) {
  switch (row.type) {
    case 'col-header':  return <ColHeaderRow  key={idx} row={row} />;
    case 'section':     return <SectionRow    key={idx} row={row} />;
    case 'col-data':    return <ColDataRow    key={idx} row={row} />;
    case 'needs-terms': return <NeedsTermsRow key={idx} row={row} />;
    default:            return <SimpleRow     key={idx} row={row} />;
  }
}

/* ── 카드 ────────────────────────────────── */
export default function InsuranceDetailCard({ company, period, rows }) {
  const displayName = normalizeCompanyName(company);
  const color = getColor(displayName);

  return (
    <div className="detail-card" style={{ '--card-color': color }}>
      <div className="detail-card__header">
        <span className="detail-card__dot" />
        <span className="detail-card__company">{displayName}</span>
        <span className="detail-card__period">{period}</span>
      </div>
      <div className="detail-card__body">
        {rows.map(renderRow)}
      </div>
    </div>
  );
}
