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

// 실손은 정액 개념이 없어서(coverageAmount가 항상 null) 금액으로 감지 여부를 못 가림.
// "가입 관련 안내가 포함되어 있으며..."처럼 몇 세대 실손인지 특정 못하고 일반 안내
// 문구만 온 경우나, condition 자체가 "실손 감지 안됨"으로 오는 경우는 isDetected가
// true여도 실제로 감지된 게 아니므로 이 함수로 걸러냄.
export function isReimbursementActuallyDetected(coverage) {
  if (!coverage?.isDetected) return false;
  const items = coverage.items ?? [];
  if (items.length === 0) return true;
  const isGenericNoticeOnly = items.every((item) =>
    item.amounts.every((a) => typeof a.condition === 'string'
      && (a.condition.includes('안내') || a.condition.includes('감지 안됨')))
  );
  return !isGenericNoticeOnly;
}

// 대시보드 요약 카드용: 카드 안 모든 금액 중 최소~최대 범위 텍스트
export function buildSummaryTile(coverage) {
  // 금액 대신 감지 여부만 "실손 보장" 텍스트로 표시 (상세페이지는 아직 미구현이라 카드에서 안내만).
  if (coverage.coverageType === '실손') {
    const detected = isReimbursementActuallyDetected(coverage);
    return { amountText: detected ? '실손 보장' : '', inactive: !detected };
  }

  const allAmounts = (coverage.items ?? [])
    .filter((item) => !isMisplacedCoverageItem(coverage.coverageType, item.coverageName))
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
// (실제 응답으로 확인: 골절재해 analysisId=87의 "보장 범위" 항목). "약관이 필요해요"/"약관 필요"처럼
// 문구가 매번 조금씩 다르게 와서, 정확히 일치하는 대신 "약관"+"필요"가 둘 다 있으면 인식함.
function isNeedsTermsCondition(condition) {
  return typeof condition === 'string' && condition.includes('약관') && condition.includes('필요');
}

// "1회당"/"회당"처럼 건별 지급 조건은 금액 옆에 "/회"로 붙여서 보여줌
// (실제 화면 기준: "깁스(Cast) 치료 10만원/회"). 그 외 조건("조건없음" 등)은 접미사 없음.
function formatConditionSuffix(condition) {
  return condition === '1회당' || condition === '회당' ? '/회' : '';
}

function buildSingleAmountRow(coverageName, amount) {
  // condition이 "약관이 필요해요" 문구가 아니어도(예: "조건없음") coverageAmount 자체가
  // null이면 결국 백엔드가 금액을 못 뽑은 것과 같으므로, 빈 금액으로 보여주는 대신
  // 약관 필요 배지로 통일해서 표시
  if (isNeedsTermsCondition(amount?.condition) || amount?.coverageAmount == null) {
    return { type: 'needs-terms', label: coverageName };
  }
  const formatted = formatWon(amount.coverageAmount);
  const displayAmount = `${formatted}${formatConditionSuffix(amount.condition)}`;
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

// "1년 이내"/"2년 초과"/"계약일부터 1년 이내"처럼 어딘가에 "N년"이 들어간 조건에서 N만 뽑아냄.
// "조건없음"/"1회당"처럼 가입 후 경과기간과 비교할 대상이 아닌 조건은 null.
function parseYearCondition(condition) {
  const match = condition?.match(/(\d+)년/);
  return match ? Number(match[1]) : null;
}

// "계약일부터 1년 이내"/"계약일로부터 1년 이내"처럼 조건 앞에 붙는 군더더기 문구는
// 화면에 안 보이게 떼어냄 (매칭 로직은 원본 문자열로 하고, 화면 표시용에만 사용)
function cleanConditionLabel(condition) {
  return condition?.replace(/^계약일(로)?부터\s*/, '') ?? condition;
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

// 헤더 행은 "N년 이내"/"N년 초과" 둘 다 항상 보여줌. 가입일 기준 지금 해당되는 쪽 강조는
// 툴팁 + 글씨색(active 클래스)으로만 표시하고, 라벨 자체를 비우지는 않음.
function buildHeaderDisplay(condition1, condition2, elapsedYears) {
  const meta = buildActiveColumnMeta(condition1, condition2, elapsedYears);
  return {
    col1: cleanConditionLabel(condition1),
    col2: cleanConditionLabel(condition2),
    col1Tooltip: meta.col1Tooltip,
    col2Tooltip: meta.col2Tooltip,
  };
}

// LLM 프롬프트에서 "다른 카드에는 치아/골절재해 항목을 넣지 말라"고 지시해도 가끔 새서
// 들어옴(예: 수술비 카드에 "질병·재해수술"). 백엔드가 프롬프트로 막고 있지만 완전히
// 안 막혀서, 치아/골절재해 카드가 아닌 곳에서는 coverageName에 이 키워드가 있으면 걸러냄.
const MISPLACED_COVERAGE_KEYWORDS = ['재해', '치아'];

function isMisplacedCoverageItem(coverageType, coverageName) {
  if (coverageType === '치아' || coverageType === '골절재해') return false;
  return MISPLACED_COVERAGE_KEYWORDS.some((keyword) => coverageName.includes(keyword));
}

// 상세페이지용: items -> InsuranceDetailCard가 원하는 rows 배열
export function buildDetailRows(coverageType, items, insuranceStartDate) {
  const safeItems = (items ?? []).filter((item) => !isMisplacedCoverageItem(coverageType, item.coverageName));
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
  const elapsedYears = getElapsedYears(insuranceStartDate);
  const overflowThreshold = allowPairing ? 2 : 1;
  const rows = [];
  let headerShown = false;

  items.forEach((item) => {
    // 조건은 있는데 coverageAmount가 둘 다 null인 항목 - 치아 카드와 같은 "그룹 헤더" 패턴
    // (예: "질병·재해수술"). 데이터 없는 빈 줄로 보여주는 대신 회색 헤더 행으로 표시.
    const isNullHeaderItem = allowPairing && item.amounts.length > 1
      && item.amounts.every((a) => a.coverageAmount === null || a.coverageAmount === undefined);

    if (isNullHeaderItem) {
      const [first, second] = sortAmountsWithInsideFirst(item.amounts);
      rows.push({ type: 'section', label: item.coverageName, ...buildHeaderDisplay(first?.condition, second?.condition, elapsedYears) });
      headerShown = true;
      return;
    }

    if (allowPairing && item.amounts.length === 2) {
      const [first, second] = sortAmountsWithInsideFirst(item.amounts);
      // 헤더 전용 item 없이 페어 데이터만 있는 정상 케이스(진단/입원 등)는 예전처럼
      // 공통 컬럼 헤더를 한 번만 보여줌
      if (!headerShown) {
        rows.push({ type: 'col-header', col1: cleanConditionLabel(first.condition), col2: cleanConditionLabel(second.condition) });
        headerShown = true;
      }
      rows.push({
        type: 'col-data',
        label: item.coverageName,
        col1: formatWon(first.coverageAmount),
        col2: formatWon(second.coverageAmount),
        ...buildActiveColumnMeta(first.condition, second.condition, elapsedYears),
      });
      return;
    }

    if (item.amounts.length > overflowThreshold) {
      // 스펙 위반(조건 3개 이상)에 대한 방어: 표로는 못 담으니 "항목명 · 조건" 한 줄씩 풀어서
      // 금액이 화면에서 사라지지 않게 함
      item.amounts.forEach((amount) => rows.push(buildSingleAmountRow(`${item.coverageName} · ${amount.condition}`, amount)));
      return;
    }

    rows.push(buildSingleAmountRow(item.coverageName, item.amounts[0]));
  });

  return rows;
}

// 실제 응답 기준(analysisId=237): 그룹 헤더가 별도 item으로 안 오고, coverageName 자체에
// "그룹명 - 세부항목명"처럼 그룹명이 합쳐져서 옴 (예: "영구치보철치료보험금 - 가철성의치(틀니) — 보철물당").
// " - "로 그룹명만 떼어내고, 그룹 없이 단독으로 오는 항목(크라운치료, 영구치발치 등)은 원래 이름 그대로 씀.
function splitGroupedCoverageName(coverageName) {
  const idx = coverageName.indexOf(' - ');
  if (idx === -1) return { group: null, label: coverageName };
  return { group: coverageName.slice(0, idx), label: coverageName.slice(idx + 3) };
}

// "2년 초과"/"2년 이내"처럼 뒤죽박죽 순서로 오는 조건 쌍을, buildStandardRows와 동일하게
// "이내"가 항상 왼쪽(첫 번째)에 오도록 정렬
function sortAmountsWithInsideFirst(amounts) {
  return [...amounts].sort((a, b) => (b.condition.includes('이내') ? 1 : 0) - (a.condition.includes('이내') ? 1 : 0));
}

// 치아 카드 전용 규칙(백엔드 LLM 프롬프트 기준):
// - 같은 면책기간(예: "2년 이내"/"2년 초과")을 쓰는 치료끼리 그룹으로 묶임
// - 그룹 제목은 coverageAmount가 둘 다 null인 item으로 따로 오거나(구 스펙),
//   coverageName에 "그룹명 - 세부항목명"으로 합쳐서 옴(실제 응답) — 그룹이 바뀔 때만 헤더 행 삽입
// - 그룹명이 없는 단독 항목(크라운치료, 영구치발치 등)이라도 직전 섹션과 면책기간(조건)이
//   다르면 새 헤더를 보여줌 — 안 그러면 크라운치료(1년)가 바로 앞 영구치보철치료(2년) 헤더
//   밑에 붙어서 마치 2년 조건인 것처럼 잘못 보임
function buildToothRows(items, insuranceStartDate) {
  const elapsedYears = getElapsedYears(insuranceStartDate);
  const rows = [];
  // 그룹명이 있으면 그룹명으로, 없으면 그 항목 자신의 조건 쌍으로 "지금 보이고 있는 섹션"을 추적.
  // 조건 쌍이 같으면 굳이 헤더를 또 안 넣어서 중복을 피하고, 조건이 바뀌면 항목명으로 새 헤더를 냄.
  let currentSectionKey = null;

  items.forEach((item) => {
    const isNullHeaderItem = item.amounts.length > 1
      && item.amounts.every((a) => a.coverageAmount === null || a.coverageAmount === undefined);

    if (isNullHeaderItem) {
      const [first, second] = sortAmountsWithInsideFirst(item.amounts);
      rows.push({ type: 'section', label: item.coverageName, ...buildHeaderDisplay(first?.condition, second?.condition, elapsedYears) });
      currentSectionKey = item.coverageName;
      return;
    }

    const { group, label } = splitGroupedCoverageName(item.coverageName);

    if (item.amounts.length === 2) {
      const [first, second] = sortAmountsWithInsideFirst(item.amounts);
      const sectionKey = group ?? `${first.condition}|${second.condition}`;

      if (sectionKey !== currentSectionKey) {
        currentSectionKey = sectionKey;
        rows.push({ type: 'section', label: group ?? item.coverageName, ...buildHeaderDisplay(first.condition, second.condition, elapsedYears) });
      }

      rows.push({
        type: 'col-data',
        label,
        col1: formatWon(first.coverageAmount),
        col2: formatWon(second.coverageAmount),
        ...buildActiveColumnMeta(first.condition, second.condition, elapsedYears),
      });
      return;
    }

    // 발치처럼 면책기간 개념이 없는 단일 조건 항목은 섹션 추적에서 제외 (다음 항목이
    // 이어서 같은 헤더를 쓸지 판단할 근거가 없으므로 리셋)
    currentSectionKey = null;

    if (item.amounts.length > 2) {
      // 스펙 위반 방어(골절재해와 동일한 문제): 여러 치료가 item 하나에 뭉쳐서 온 경우,
      // 조건별로 한 줄씩 풀어서 금액이 화면에서 사라지지 않게 함
      item.amounts.forEach((amount) => rows.push(buildSingleAmountRow(`${label} · ${amount.condition}`, amount)));
      return;
    }

    rows.push(buildSingleAmountRow(label, item.amounts[0]));
  });

  return rows;
}
