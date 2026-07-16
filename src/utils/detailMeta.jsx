// DetailPage/SummaryDetailPage 공용: 화면 라우트 id <-> 백엔드 coverageType 문자열, 아이콘, 문구 매핑

export const ICONS = {
  diagnosis: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21h6M10 17v4M14 17v4" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  surgery: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3.5" stroke="#229cff" strokeWidth="1.8"/>
    </svg>
  ),
  hospital: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#229cff" strokeWidth="1.8"/>
      <path d="M3 9h18M9 5V3M15 5V3M9 13h2v2h2v-2h2v-2h-2v-2h-2v2H9v2z" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  bone: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M6.5 6.5C5.67 5.67 5.67 4.33 6.5 3.5S8.33 2.67 9.17 3.5L20.5 14.83c.83.84.83 2.17 0 3S18.17 18.67 17.33 17.83" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M17.5 17.5c.83.83.83 2.17 0 3s-2.17.83-3 0L3.17 9.17c-.83-.84-.83-2.17 0-3s2.17-.83 3 0" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  tooth: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C9.24 2 7 4.24 7 7c0 1.3.5 2.48 1.3 3.37C7.48 12.2 7 14.05 7 16c0 2.21.9 4 2 4s2-1.79 2-4c0-.55.45-1 1-1s1 .45 1 1c0 2.21.9 4 2 4s2-1.79 2-4c0-1.95-.48-3.8-1.3-5.63C16.5 9.48 17 8.3 17 7c0-2.76-2.24-5-5-5z" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  reimbursement: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#229cff" strokeWidth="1.8"/>
      <path d="M3 9h18M9 5V3M15 5V3M9 13h2v2h2v-2h2v-2h-2v-2h-2v2H9v2z" stroke="#229cff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// analysisId=1처럼 오래된 테스트 데이터는 "진단비/수술비/입원비"였지만, 실제 최신 데이터
// (analysisId=84/87/100 등)는 "진단/수술/입원" 축약형을 씀 — coverageMeta.jsx와 동일 기준.
export const COVERAGE_TYPE_BY_ID = {
  diagnosis: '진단',
  surgery: '수술',
  hospital: '입원',
  bone: '골절재해',
  tooth: '치아',
  reimbursement: '실손',
};

export const TEXT_BY_ID = {
  diagnosis: { title: '진단비', subtitle: '암, 뇌, 심장 질환을 진단받았을 때 청구할 수 있는 보장이에요', ctaText: '내 상황에서 청구 가능한지 궁금하다면?' },
  surgery:   { title: '수술비', subtitle: '수술 종류에 따라 분류되어 지급해요', ctaText: '내 수술이 몇 종인지, 얼마 받는지 궁금하다면?' },
  hospital:  { title: '입원비', subtitle: '입원 1일당 지급되는 금액이에요', ctaText: '입원 후 얼마 받을 수 있는지 궁금하다면?' },
  bone:      { title: '골절·재해', subtitle: '재해로 인한 골절·화상 발생 시 지급되는 보험금이에요', ctaText: '내 상황이 재해에 해당하는지 궁금하다면?' },
  tooth:     { title: '치아', subtitle: '치아 치료 시 지급되는 보험금이에요', ctaText: '치아 치료 청구 가능한지 궁금하다면?' },
  reimbursement: { title: '실손', subtitle: '병원비, 약제비 등 실제 부담한 의료비를 보장해요', ctaText: '실손 청구 가능 여부가 궁금하다면?' },
};
