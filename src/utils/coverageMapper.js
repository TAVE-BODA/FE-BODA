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
  const allAmounts = coverage.items
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

// 상세페이지용: items -> InsuranceDetailCard가 원하는 rows 배열
export function buildDetailRows(coverageType, items) {
  return coverageType === '치아' ? buildToothRows(items) : buildStandardRows(items);
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
    const amount = item.amounts[0];
    rows.push({ type: 'simple', label: item.coverageName, amount: formatWon(amount?.coverageAmount) });
  });

  return rows;
}

// 치아 카드: coverageAmount가 null이면 그룹 헤더(section)로 취급
function buildToothRows(items) {
  const rows = [];
  items.forEach((item) => {
    item.amounts.forEach((a) => {
      if (a.coverageAmount === null || a.coverageAmount === undefined) {
        rows.push({ type: 'section', label: item.coverageName });
      } else {
        rows.push({ type: 'simple', label: item.coverageName, amount: formatWon(a.coverageAmount) });
      }
    });
  });
  return rows;
}
