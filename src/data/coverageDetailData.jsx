// ── 행 타입 정의 ───────────────────────────────────────────
// { type: 'simple',      label, amount, bold? }
// { type: 'needs-terms', label }
// { type: 'col-header',  col1, col1Tooltip?, col2 }
// { type: 'section',     label }
// { type: 'col-data',    label, col1?, col1Active?, col1Tooltip?, col2?, col2Active?, col2Tooltip? }
//
// col1Active / col2Active = true → 파란색 (현재 받을 수 있는 금액)

export const COVERAGE_DETAIL = {

  /* ── 진단비 ──────────────────────────────────────────── */
  diagnosis: {
    title: '진단비',
    subtitle: '암, 뇌, 심장 질환을 진단받았을 때 청구할 수 있는 보장이에요',
    ctaText: '내 상황에서 청구 가능한지 궁금하다면?',
    companies: [
      {
        company: '삼성생명',
        period: '2026. 05 ~ 2102. 05',
        rows: [
          { type: 'simple', label: '암진단', amount: '1,000만원' },
          { type: 'simple', label: '소액암 진단', amount: '200만원' },
          { type: 'simple', label: '뇌혈관질환 진단', amount: '500만원' },
          { type: 'simple', label: '허혈심장질환 진단', amount: '500만원' },
          { type: 'simple', label: '원형탈모·크론병·디스크 등', amount: '500만원' },
          { type: 'simple', label: '독감 항바이러스제 처방', amount: '3만원' },
        ],
      },
      {
        company: '동양생명',
        period: '2002. 07 ~ 2028.07',
        rows: [
          { type: 'col-header', col1: '1년 이내', col2: '1년 초과' },
          {
            type: 'col-data',
            label: '암 진단 최초 2회',
            col1: '1,000만원', col1Active: false,
            col2: '3,000만원', col2Active: true,
            col2Tooltip: '가입 후 1년이 지나서 지금 받을 수 있는 금액이에요',
          },
          {
            type: 'col-data',
            label: '18세 이후 암 진단',
            col1: '1,000만원', col1Active: false,
            col2: '3,000만원', col2Active: true,
            col2Tooltip: '가입 후 1년이 지나서 지금 받을 수 있는 금액이에요',
          },
          { type: 'col-data', label: '뇌출혈 진단', col1: null, col2: '200만원', col2Active: false },
        ],
      },
    ],
  },

  /* ── 수술비 ──────────────────────────────────────────── */
  surgery: {
    title: '수술비',
    subtitle: '수술 종류에 따라 1~5종으로 분류되어 지급해요',
    ctaText: '내 수술이 몇 종인지, 얼마 받는지 궁금하다면?',
    companies: [
      {
        company: '삼성생명',
        period: '2026. 05 ~ 2102. 05',
        rows: [
          { type: 'col-header', col1: '1년 이내', col2: '1년 초과' },
          {
            type: 'col-data',
            label: '질병 수술',
            col1: '3.5만원', col1Active: true,
            col1Tooltip: '가입 후 1년이 지나지 않아서 지금 받을 수 있는 금액이에요',
            col2: null,
          },
          {
            type: 'col-data',
            label: '재해 수술',
            col1: '3.5만원', col1Active: true,
            col1Tooltip: '가입 후 1년이 지나지 않아서 지금 받을 수 있는 금액이에요',
            col2: null,
          },
          { type: 'col-data', label: '아킬레스힘줄·무릎인대파열 수술', col1: null, col2: '10만원', col2Active: false },
          { type: 'needs-terms', label: '수술 종별 기준' },
        ],
      },
      {
        company: '동양생명',
        period: '2011. 07 ~ 2028.07',
        rows: [
          { type: 'simple', label: '1종 수술', amount: '10만원' },
          { type: 'simple', label: '2종 수술', amount: '30만원' },
          { type: 'simple', label: '3종 수술', amount: '50만원' },
          { type: 'simple', label: '4종 수술', amount: '80만원' },
          { type: 'simple', label: '5종 수술(고도·특수)', amount: '110만원' },
          { type: 'simple', label: '장기이식 수술', amount: '1,000만원' },
          { type: 'needs-terms', label: '수술 종별 기준' },
        ],
      },
    ],
  },

  /* ── 입원비 ──────────────────────────────────────────── */
  hospital: {
    title: '입원비',
    subtitle: '입원 1일당 지급되는 금액이에요',
    ctaText: '입원 후 얼마 받을 수 있는지 궁금하다면?',
    companies: [
      {
        company: '삼성생명',
        period: '2026. 05 ~ 2102. 05',
        rows: [
          { type: 'simple', label: '2·3인실 입원 (종합·상급종합병원)', amount: '1만원/일' },
          { type: 'simple', label: '2·3인실 입원 (상급종합병원)', amount: '4만원/일' },
          { type: 'simple', label: '상급병실 1인실 (종합병원)', amount: '3만원/일' },
          { type: 'simple', label: '상급병실 1인실 (상급종합병원)', amount: '7만원/일' },
          { type: 'simple', label: '1회 입원 한도', amount: '30일', bold: true },
        ],
      },
      {
        company: '동양생명',
        period: '2002. 07 ~ 2028.07',
        rows: [
          { type: 'simple', label: '질병 입원일당 (3일 초과)', amount: '3,000원/일' },
          { type: 'simple', label: '재해 입원일당', amount: '3,000원/일' },
          { type: 'simple', label: '최대 보장 기간', amount: '1회 120일, 연 3회', bold: true },
        ],
      },
    ],
  },

  /* ── 골절·재해 ───────────────────────────────────────── */
  bone: {
    title: '골절·재해',
    subtitle: '재해로 인한 골절·화상 발생 시 지급되는 보험금이에요',
    ctaText: '내 상황이 재해에 해당하는지 궁금하다면?',
    companies: [
      {
        company: '삼성생명',
        period: '2026. 05 ~ 2102. 05',
        rows: [
          { type: 'simple', label: '재해골절 진단 (치아 파절 제외)', amount: '30만원' },
          { type: 'simple', label: '5대 재해골절 진단', amount: '70만원' },
          { type: 'simple', label: '재해골절 수술', amount: '50만원' },
          { type: 'simple', label: '재해 화상 — 현저한 추상', amount: '300만원' },
          { type: 'simple', label: '재해 화상 — 추상', amount: '200만원' },
          { type: 'simple', label: '깁스(Cast) 치료', amount: '10만원/회' },
          { type: 'needs-terms', label: '보장 범위' },
        ],
      },
      {
        company: '동양생명',
        period: '2002. 07 ~ 2028.07',
        rows: [
          { type: 'simple', label: '재해 장해 (80% 이상)', amount: '3,000만원' },
          { type: 'simple', label: '재해 화상·동상', amount: '3,000만원' },
          { type: 'needs-terms', label: '보장 범위' },
        ],
      },
    ],
  },

  /* ── 치아 ────────────────────────────────────────────── */
  tooth: {
    title: '치아',
    subtitle: '치아 치료 시 지급되는 보험금이에요',
    ctaText: '치아 치료 청구 가능한지 궁금하다면?',
    companies: [
      {
        company: '삼성생명',
        period: '2026. 05 ~ 2102. 05',
        rows: [
          {
            type: 'section',
            label: '영구치 발치 치료',
            col1: '2년 이내',
            col1Tooltip: '가입 후 2년이 지나지 않아서 지금 받을 수 있는 금액이에요',
            col2: '',
          },
          {
            type: 'col-data',
            label: '가철성의치(틀니) — 보철문당',
            col1: '2.5만원', col1Active: true,
            col2: '5만원', col2Active: false,
          },
          {
            type: 'col-data',
            label: '고정성가공의치(브릿지)',
            col1: '1만원/개', col1Active: true,
            col2: '2만원/개', col2Active: false,
          },
          {
            type: 'col-data',
            label: '임플란트',
            col1: '1.5만원/개', col1Active: true,
            col2: '3만원/개', col2Active: false,
          },
          {
            type: 'section',
            label: '크라운 치료',
            col1: '1년 이내',
            col1Tooltip: '가입 후 1년이 지나지 않아서 지금 받을 수 있는 금액이에요',
            col2: '',
          },
          {
            type: 'col-data',
            label: '크라운 치료 (연 영구치 3개 한도)',
            col1: '1만원/개', col1Active: true,
            col2: '2만원/개', col2Active: false,
          },
          {
            type: 'section',
            label: '보존 치료',
            col1: '1년 이내',
            col1Tooltip: '가입 후 1년이 지나지 않아서 지금 받을 수 있는 금액이에요',
            col2: '',
          },
          {
            type: 'col-data',
            label: '인레이·온레이',
            col1: '5,000원', col1Active: true,
            col2: '1만원', col2Active: false,
          },
          {
            type: 'col-data',
            label: '복합레진',
            col1: '1,500원', col1Active: true,
            col2: '3,000원', col2Active: false,
          },
          {
            type: 'col-data',
            label: '아말감·글레스아이오노머',
            col1: '500원', col1Active: true,
            col2: '1,000원', col2Active: false,
          },
          { type: 'section', label: '영구치 발치 치료' },
          { type: 'simple', label: '영구치 발치 1개당', amount: '1,600원' },
        ],
      },
    ],
  },
};
