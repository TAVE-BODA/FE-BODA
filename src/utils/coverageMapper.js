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

// "1회당"/"회당"처럼 건별 지급 조건은 금액 옆에 "/회"로 붙여서 보여줌
// (실제 화면 기준: "깁스(Cast) 치료 10만원/회"). 그 외 조건("조건없음" 등)은 접미사 없음.
function formatConditionSuffix(condition) {
  return condition === '1회당' || condition === '회당' ? '/회' : '';
}

function buildSingleAmountRow(coverageName, amount) {
  if (amount?.condition === NEEDS_TERMS_CONDITION) {
    return { type: 'needs-terms', label: coverageName };
  }
  const formatted = formatWon(amount?.coverageAmount);
  const displayAmount = formatted ? `${formatted}${formatConditionSuffix(amount?.condition)}` : formatted;
  return { type: 'simple', label: coverageName, amount: displayAmount };
}

// 가입일 기준 오늘까지 지난 만 연수. 만 나이 계산과 동일하게 월/일까지 봐서, 아직
// 생일(가입일)이 안 지났으면 1년 덜 지난 것으로 셈.
function getElapsedYears(startDate) {
  if (!startDate) return null;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return null;

  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const monthDiff = now.getMonth() - start.getMonth();
  const dayDiff = now.getDate() - start.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) years -= 1;
  return years;
}

// "1년 이내"/"2년 초과"처럼 "N년" 단위 조건에서 N만 뽑아냄. "조건없음"/"1회당"처럼
// 가입 후 경과기간과 비교할 대상이 아닌 조건은 null.
function parseYearCondition(condition) {
  const match = condition?.match(/^(\d+)년/);
  return match ? Number(match[1]) : null;
}

function tooltipFor(condition, isActive, years) {
  if (!isActive) return undefined;
  return condition.includes('초과')
    ? `가입 후 ${years}년이 지나서 지금 받을 수 있는 금액이에요`
    : `아직 가입 후 ${years}년이 안 지나서 지금 받을 수 있는 금액이에요`;
}

// "N년 이내"/"N년 초과" 한 쌍 중 가입일 기준 지금 실제로 받을 수 있는 쪽에 강조 표시
// (활성 색상 + 툴팁)를 붙여줌. 가입일이 없거나 "N년" 형태가 아닌 조건이면 강조하지 않음.
function buildActiveColumnMeta(condition1, condition2, elapsedYears) {
  const years = parseYearCondition(condition1);
  if (elapsedYears === null || years === null || years !== parseYearCondition(condition2)) return {};

  const col1Active = condition1.includes('초과') ? elapsedYears >= years : elapsedYears < years;
  const col2Active = !col1Active;

  return {
    col1Active,
    col2Active,
    col1Tooltip: tooltipFor(condition1, col1Active, years),
    col2Tooltip: tooltipFor(condition2, col2Active, years),
  };
}

// 상세페이지용: items -> InsuranceDetailCard가 원하는 rows 배열
export function buildDetailRows(coverageType, items, insuranceStartDate) {
  const safeItems = items ?? [];
  if (coverageType === '치아') return buildToothRows(safeItems, insuranceStartDate);
  // 골절재해는 진단/수술과 달리 "면책기간 이내/초과" 개념이 없어서(사고는 미리 대비할 수
  // 없으니 면책기간을 둘 이유가 없음) 실제 화면에서도 표(2열)가 아니라 낱개 줄로만 나열됨.
  // 조건이 2개 이상이면 표로 묶지 말고 항목별로 풀어서 보여줘야 함.
  return buildStandardRows(safeItems, { allowPairing: coverageType !== '골절재해' }, insuranceStartDate);
}

function buildStandardRows(items, { allowPairing = true } = {}, insuranceStartDate) {
  // 정상 스펙에서는 항목당 조건이 1개거나(골절재해), 진단/수술/입원처럼 "이내/초과" 2개뿐임.
  // 조건이 그 이상인 건 백엔드가 여러 항목을 하나로 잘못 합친 경우라 표(2열)로 못 담는데,
  // 그렇다고 금액을 버리면 안 되니 아래에서 "항목명 · 조건" 낱개 줄로 풀어서 처리.
  const pairConditionItems = allowPairing ? items.filter((item) => item.amounts.length === 2) : [];
  const singleConditionItems = items.filter((item) => item.amounts.length <= 1);
  const overflowThreshold = allowPairing ? 2 : 1;
  const overflowItems = items.filter((item) => item.amounts.length > overflowThreshold);
  const rows = [];

  if (pairConditionItems.length > 0) {
    const conditions = [...new Set(pairConditionItems.flatMap((item) => item.amounts.map((a) => a.condition)))];
    // 백엔드가 주는 순서가 뒤죽박죽이라("N년 초과"가 먼저 오기도 함), "이내"가 항상 왼쪽 열에 오도록 정렬
    const [condition1, condition2] = conditions.sort((a, b) => (b.includes('이내') ? 1 : 0) - (a.includes('이내') ? 1 : 0));

    rows.push({ type: 'col-header', col1: condition1, col2: condition2 });

    const elapsedYears = getElapsedYears(insuranceStartDate);
    const activeMeta = buildActiveColumnMeta(condition1, condition2, elapsedYears);

    pairConditionItems.forEach((item) => {
      const amount1 = item.amounts.find((a) => a.condition === condition1);
      const amount2 = item.amounts.find((a) => a.condition === condition2);
      rows.push({
        type: 'col-data',
        label: item.coverageName,
        col1: amount1 ? formatWon(amount1.coverageAmount) : null,
        col2: amount2 ? formatWon(amount2.coverageAmount) : null,
        ...activeMeta,
      });
    });
  }

  singleConditionItems.forEach((item) => {
    rows.push(buildSingleAmountRow(item.coverageName, item.amounts[0]));
  });

  // 스펙 위반(조건 3개 이상)에 대한 방어: 표로는 못 담으니 "항목명 · 조건" 한 줄씩 풀어서
  // 금액이 화면에서 사라지지 않게 함
  overflowItems.forEach((item) => {
    item.amounts.forEach((amount) => {
      rows.push(buildSingleAmountRow(`${item.coverageName} · ${amount.condition}`, amount));
    });
  });

  return rows;
}

// 치아 카드 전용 규칙(백엔드 LLM 프롬프트 기준):
// - 같은 면책기간(예: "2년 이내"/"2년 초과")을 쓰는 치료끼리 그룹으로 묶임
// - 그룹 제목이 필요하면 coverageAmount가 둘 다 null인 item이 먼저 오고, 그 item의
//   condition 값이 곧 그 그룹의 열 이름("2년 이내"/"2년 초과")이 됨
// - 그룹 없이 단독으로 오는 항목(예: 크라운치료, 영구치발치)은 그 자체가 하나의 행
function buildToothRows(items, insuranceStartDate) {
  const elapsedYears = getElapsedYears(insuranceStartDate);

  return items.flatMap((item) => {
    const isGroupHeader = item.amounts.length > 1
      && item.amounts.every((a) => a.coverageAmount === null || a.coverageAmount === undefined);

    if (isGroupHeader) {
      const [first, second] = item.amounts;
      return [{ type: 'section', label: item.coverageName, col1: first?.condition, col2: second?.condition }];
    }

    if (item.amounts.length === 2) {
      const [first, second] = item.amounts;
      return [{
        type: 'col-data',
        label: item.coverageName,
        col1: formatWon(first.coverageAmount),
        col2: formatWon(second.coverageAmount),
        ...buildActiveColumnMeta(first.condition, second.condition, elapsedYears),
      }];
    }

    if (item.amounts.length > 2) {
      // 스펙 위반 방어(골절재해와 동일한 문제): 여러 치료가 item 하나에 뭉쳐서 온 경우,
      // 조건별로 한 줄씩 풀어서 금액이 화면에서 사라지지 않게 함
      return item.amounts.map((amount) => buildSingleAmountRow(`${item.coverageName} · ${amount.condition}`, amount));
    }

    return [buildSingleAmountRow(item.coverageName, item.amounts[0])];
  });
}
