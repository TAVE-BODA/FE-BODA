/* eslint-disable react-refresh/only-export-components -- 컴포넌트가 아닌 데이터/아이콘 매핑 모듈 */
// 백엔드 coverageType 문자열 <-> 화면 라우트 id / 아이콘 / 표시 이름 매핑
// DashboardPage(단일 분석)와 SummaryDashboardPage(다중 보험사 합산)가 공용으로 사용.

const IconDiagnosis = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21h6M10 17v4M14 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconSurgery = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

const IconHospital = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M3 9h18M9 5V3M15 5V3M9 13h2v2h2v-2h2v-2h-2v-2h-2v2H9v2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconBone = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M6.5 6.5C5.67 5.67 5.67 4.33 6.5 3.5S8.33 2.67 9.17 3.5L20.5 14.83c.83.84.83 2.17 0 3S18.17 18.67 17.33 17.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M17.5 17.5c.83.83.83 2.17 0 3s-2.17.83-3 0L3.17 9.17c-.83-.84-.83-2.17 0-3s2.17-.83 3 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconTooth = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C9.24 2 7 4.24 7 7c0 1.3.5 2.48 1.3 3.37C7.48 12.2 7 14.05 7 16c0 2.21.9 4 2 4s2-1.79 2-4c0-.55.45-1 1-1s1 .45 1 1c0 2.21.9 4 2 4s2-1.79 2-4c0-1.95-.48-3.8-1.3-5.63C16.5 9.48 17 8.3 17 7c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// coverageType 키는 analysisId=1처럼 오래된 테스트 데이터에서 보이던 "진단비/수술비/입원비"가
// 아니라, 실제 최신 데이터(analysisId=84/87/100 등)와 요약 API 양쪽에서 공통으로 확인된
// "진단/수술/입원" 축약형 기준. 두 API가 같은 이름을 쓰는 걸 확인했으니 별도 별칭 매핑 불필요.
export const COVERAGE_META = {
  '진단':    { id: 'diagnosis',    label: '진단',     icon: <IconDiagnosis /> },
  '수술':    { id: 'surgery',      label: '수술',     icon: <IconSurgery />   },
  '입원':    { id: 'hospital',     label: '입원',     icon: <IconHospital />  },
  '골절재해': { id: 'bone',        label: '골절·재해', icon: <IconBone />      },
  '치아':    { id: 'tooth',        label: '치아',     icon: <IconTooth />     },
  '실손':    { id: 'reimbursement', label: '실손',    icon: <IconHospital /> },
};

// 대시보드 카드 고정 노출 순서 (백엔드 응답 순서와 무관하게 항상 이 순서로 렌더링)
export const COVERAGE_ORDER = ['진단', '수술', '입원', '골절재해', '치아', '실손'];
