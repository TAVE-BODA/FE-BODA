// 백엔드가 주는 { items: [{ coverageName, amounts: [{ condition, coverageAmount }] }] } 구조를
// 화면(InsuranceDetailCard, CoverageCard)이 원하는 모양으로 바꿔주는 함수 모음.

export function formatWon(amount) {
  if (amount === null || amount === undefined) return null;
  if (amount >= 100000000) {
    return `${(amount / 100000000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}억원`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만원`;
  }
  return `${amount.toLocaleString('ko-KR')}원`;
}

// 대시보드 요약 카드용: 카드 안 모든 금액 중 최소~최대 범위 텍스트
export function buildSummaryTile(coverage) {
  // 실손은 실비 보상이라 정액(고정 금액) 개념이 없어서 coverageAmount가 항상 null로 옴.
  // 금액 대신 감지 여부만 "실손 보장" 텍스트로 표시 (상세페이지는 아직 미구현이라 카드에서 안내만).
  if (coverage.coverageType === '실손') {
    return { amountText: coverage.isDetected ? '실손 보장' : '', inactive: !coverage.isDetected };
  }

  const allAmounts = (coverage.items ?? [])
    .flatMap((item) => item.amounts.map((a) => a.coverageAmount))
    .filter((a) => a !== null && a !== undefined);

  if (allAmounts.length === 0) {
    return { amountText: '', inactive: !coverage.isDetected };
  }

  const min = Math.min(...allAmounts);
  const max = Math.max(...allAmounts);
  const amountText = min === max ? formatWon(max) : `${formatWon(min)}~${formatWon(max)}`;

  return { amountText, inactive: !coverage.isDetected };
}

// formatWon과 달리 "원" 접미사를 안 붙이는 축약형 (만/억 단위만 변환). 합산 대시보드의
// unit 필드가 "원", "원/일", "원/개"처럼 이미 통화 단위까지 포함해서 오기 때문에 따로 뺌.
function formatScale(amount) {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}억`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만`;
  }
  return amount.toLocaleString('ko-KR');
}

// 합산 대시보드(GET /api/dashboard/summary/{chatSessionId})용: 백엔드가 이미 회사 간 합산까지
// 끝낸 CoverageSummaryDto { coverageType, minAmount, maxAmount, unit, companyNames } 하나를
// 카드에 뿌릴 형태로 변환. summary가 없거나(그 타입 자체가 응답에 없음) minAmount/maxAmount가
// null이면(백엔드가 미감지 항목도 companyNames 채운 채로 null/null 내려줌) 비활성 카드.
export function buildCoverageSummaryTile(summary) {
  if (!summary) {
    return { amountText: '', companies: [], inactive: true };
  }

  // 실손은 항상 min/maxAmount가 null(정액이 없어서)이라, 감지 여부는 companyNames 유무로 판단.
  if (summary.coverageType === '실손') {
    const companyNames = summary.companyNames ?? [];
    return companyNames.length > 0
      ? { amountText: '실손 보장', companies: companyNames, inactive: false }
      : { amountText: '', companies: [], inactive: true };
  }

  if (summary.minAmount === null || summary.maxAmount === null) {
    return { amountText: '', companies: [], inactive: true };
  }

  const { minAmount, maxAmount, unit } = summary;
  const amountText = minAmount === maxAmount
    ? `${formatScale(maxAmount)}${unit}`
    : `${formatScale(minAmount)}~${formatScale(maxAmount)}${unit}`;

  return { amountText, companies: summary.companyNames ?? [], inactive: false };
}

// 약관을 안 올려서 LLM이 조건/금액을 못 뽑았을 때, condition 자리에 이 안내 문구가 그대로 옴
// (실제 응답으로 확인: 골절재해 analysisId=87의 "보장 범위" 항목).
const NEEDS_TERMS_CONDITION = '약관이 필요해요';

function buildSingleAmountRow(coverageName, amount) {
  if (amount?.condition === NEEDS_TERMS_CONDITION) {
    return { type: 'needs-terms', label: coverageName };
  }
  return { type: 'simple', label: coverageName, amount: formatWon(amount?.coverageAmount) };
}

// 상세페이지용: items -> InsuranceDetailCard가 원하는 rows 배열
export function buildDetailRows(coverageType, items) {
  const safeItems = items ?? [];
  return coverageType === '치아' ? buildToothRows(safeItems) : buildStandardRows(safeItems);
}

function buildStandardRows(items) {
  const multiConditionItems = items.filter((item) => item.amounts.length > 1);
  const singleConditionItems = items.filter((item) => item.amounts.length <= 1);
  const rows = [];

  if (multiConditionItems.length > 0) {
    const conditions = [...new Set(multiConditionItems.flatMap((item) => item.amounts.map((a) => a.condition)))];
    const [condition1, condition2] = conditions;

    rows.push({ type: 'col-header', col1: condition1, col2: condition2 });

    multiConditionItems.forEach((item) => {
      const amount1 = item.amounts.find((a) => a.condition === condition1);
      const amount2 = item.amounts.find((a) => a.condition === condition2);
      rows.push({
        type: 'col-data',
        label: item.coverageName,
        col1: amount1 ? formatWon(amount1.coverageAmount) : null,
        col2: amount2 ? formatWon(amount2.coverageAmount) : null,
      });
    });
  }

  singleConditionItems.forEach((item) => {
    rows.push(buildSingleAmountRow(item.coverageName, item.amounts[0]));
  });

  return rows;
}

// 치아 카드 전용 규칙(백엔드 LLM 프롬프트 기준):
// - 같은 면책기간(예: "2년 이내"/"2년 초과")을 쓰는 치료끼리 그룹으로 묶임
// - 그룹 제목이 필요하면 coverageAmount가 둘 다 null인 item이 먼저 오고, 그 item의
//   condition 값이 곧 그 그룹의 열 이름("2년 이내"/"2년 초과")이 됨
// - 그룹 없이 단독으로 오는 항목(예: 크라운치료, 영구치발치)은 그 자체가 하나의 행
function buildToothRows(items) {
  return items.map((item) => {
    const isGroupHeader = item.amounts.length > 1
      && item.amounts.every((a) => a.coverageAmount === null || a.coverageAmount === undefined);

    if (isGroupHeader) {
      const [first, second] = item.amounts;
      return { type: 'section', label: item.coverageName, col1: first?.condition, col2: second?.condition };
    }

    if (item.amounts.length > 1) {
      const [first, second] = item.amounts;
      return {
        type: 'col-data',
        label: item.coverageName,
        col1: formatWon(first.coverageAmount),
        col2: formatWon(second.coverageAmount),
      };
    }

    return buildSingleAmountRow(item.coverageName, item.amounts[0]);
  });
}
