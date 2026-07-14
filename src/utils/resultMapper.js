// questionType -> ResultPage 테마 / 뱃지 매핑 (chat.js의 QUESTION_TYPE_MAP과 동일한 축)
const THEME_BY_QUESTION_TYPE = {
  CHIP_CLAIM: 'main',
  CHIP_AMOUNT: 'purple',
  CHIP_DOCUMENTS: 'green',
};

// claimGuide.claimStatus -> 말풍선 타이틀
// 지금까지 실제로 확인된 값은 'NEEDS_REVIEW' 뿐이라 다른 값은 추정치예요.
// 백엔드에서 실제 enum 값 내려주면 여기 맞춰서 수정하면 됩니다.
const CLAIM_STATUS_TITLE = {
  POSSIBLE: '청구 가능해요!',
  NOT_POSSIBLE: '청구가 어려워요',
  NEEDS_REVIEW: '확인이 조금 더 필요해요',
};

// selectedOption(1~4) 기준 다음 질문 버튼들 — 기존 더미 데이터의 followupOptions를 재사용
const FOLLOWUP_OPTIONS_BY_QUESTION_TYPE = {
  CHIP_CLAIM: [
    { number: 2, label: '2. 얼마나 더 받을 수 있어요?' },
    { number: 3, label: '3. 필요 서류를 먼저 알고 싶어요' },
    { number: 4, label: '4. 내 보험의 보장 항목부터 보고 싶어요' },
  ],
  CHIP_AMOUNT: [
    { number: 1, label: '1. 청구 가능한지 먼저 알고 싶어요' },
    { number: 3, label: '3. 필요 서류를 먼저 알고 싶어요' },
    { number: 4, label: '4. 내 보험의 보장 항목부터 보고 싶어요' },
  ],
  CHIP_DOCUMENTS: [
    { number: 1, label: '1. 청구 가능한지 먼저 알고 싶어요' },
    { number: 2, label: '2. 얼마나 더 받을 수 있어요?' },
    { number: 4, label: '4. 내 보험의 보장 항목부터 보고 싶어요' },
  ],
};

// userMessage.messageContent는 "청구 가능한지 먼저 알고 싶어요\n\n[사용자 입력 조건]\n..." 형태라
// 말풍선에는 첫 줄(사용자가 실제로 고른 질문 문구)만 보여줘요.
function extractUserQuestion(userMessage) {
  if (!userMessage?.messageContent) return '';
  return userMessage.messageContent.split('\n\n')[0].trim();
}

// reasons를 문장 단위로 각각 카드화하지 않고, [입원]/[수술] 같은 대괄호 라벨 기준으로
// 치료 유형별 카드 하나로 묶어요. 태그는 문장 내용을 추측하는 게 아니라 대괄호 값
// 그대로 써서(= 실제 데이터) 오분류 위험이 없게 했어요.
// - 같은 그룹 문장들은 카드 하나에 리스트로 모음
// - "찾지 못했어요/확인되지 않았어요" 같은 부정 표현이 있으면 뒤로, 확인된 그룹을 앞으로 정렬
// - 대괄호가 없는 문장은 "확인된 내용" 카드 하나로 별도 모음
const NEGATIVE_RESULT_PATTERN = /(찾지 못했|확인되지 않|되지 않았)/;

function buildClaimEvidences(claimGuide) {
  if (!claimGuide) return [];

  // claimGuide.sourceChunkIds는 reason 하나하나가 아니라 claimGuide 전체에 걸린
  // 근거라, 그룹 카드마다 정확히 매칭은 안 되지만 동일하게 붙여줌
  const sharedChunkIds = claimGuide.hasSources && claimGuide.sourceChunkIds?.length
    ? claimGuide.sourceChunkIds
    : undefined;

  const groups = []; // [{ label, texts: [] }], 등장 순서 유지
  const groupIndexByLabel = new Map();
  const ungroupedTexts = [];

  (claimGuide.reasons || []).forEach((reason) => {
    const match = reason.match(/^\[([^\]]+)\]\s*/);
    const cleanText = reason.replace(/^\[[^\]]+\]\s*/, '');

    if (!match) {
      ungroupedTexts.push(cleanText);
      return;
    }

    const label = match[1];
    if (!groupIndexByLabel.has(label)) {
      groupIndexByLabel.set(label, groups.length);
      groups.push({ label, texts: [] });
    }
    groups[groupIndexByLabel.get(label)].texts.push(cleanText);
  });

  const groupCards = groups
    .map((group, idx) => {
      const isNegative = group.texts.some((t) => NEGATIVE_RESULT_PATTERN.test(t));
      return {
        id: `reason-group-${idx}`,
        tag: group.label,
        title: isNegative ? `${group.label} 보장을 찾지 못했어요` : `${group.label} 보장이 확인돼요`,
        description: group.texts,
        sourceChunkIds: sharedChunkIds,
        _negative: isNegative, // 정렬용, 카드로 안 넘어감
      };
    })
    .sort((a, b) => Number(a._negative) - Number(b._negative))
    .map(({ _negative, ...card }) => card);

  const ungroupedCard = ungroupedTexts.length
    ? [{
        id: 'reason-ungrouped',
        tag: '확인된 내용',
        title: '확인된 내용',
        description: ungroupedTexts,
        sourceChunkIds: sharedChunkIds,
      }]
    : [];

  // cautions는 여러 개여도 카드 하나에 리스트로 모아서 보여줌 (근거 토글은 없음 - 경고 문구지 조항 인용이 아님)
  const cautions = claimGuide.cautions || [];
  const cautionCard = cautions.length
    ? [{
        id: 'caution',
        tag: '주의',
        title: '이 점은 꼭 확인하세요',
        description: cautions,
        tone: 'caution',
      }]
    : [];

  return [...groupCards, ...ungroupedCard, ...cautionCard];
}

// amountGuide 실제 구조 (2026-07-14 실응답 기준):
// {
//   calculationAvailable: boolean,
//   estimatedItems: [{ coverageName, amountText, reason, hasSources, sourceChunkIds }],
//   cautions: [string],
//   hasSources, sourceChunkIds (전체 합계용, 지금은 안 씀)
//   totalAmountText?: string  <- 정확히 매칭되는 항목이 있을 때만 내려오는 것으로 추정, 미확인
// }
function buildAmountEvidences(amountGuide) {
  if (!amountGuide) return [];

  // 칩1/칩3과 다르게 항목마다 자기 sourceChunkIds가 따로 있어서, 항목별로 정확한 근거만 붙일 수 있음
  const itemCards = (amountGuide.estimatedItems || []).map((item, idx) => ({
    id: `amount-item-${idx}`,
    title: item.coverageName || `보장 항목 ${idx + 1}`,
    amount: item.amountText,
    description: item.reason || '',
    sourceChunkIds: item.hasSources && item.sourceChunkIds?.length ? item.sourceChunkIds : undefined,
  }));

  const cautions = amountGuide.cautions || [];
  const cautionCard = cautions.length
    ? [{
        id: 'amount-caution',
        tag: '주의',
        title: '이 점은 꼭 확인하세요',
        description: cautions,
        tone: 'caution',
      }]
    : [];

  return [...itemCards, ...cautionCard];
}

// documentGuide 실제 구조 (2026-07-14 실응답 기준):
// {
//   documents: [{ name, description, required, hasSources, sourceChunkIds }],  // 문서별 필드는 지금 null로만 옴
//   hasSources, sourceChunkIds  // documentGuide 전체에 공통으로 달려있는 근거
// }
function buildDocumentEvidences(documentGuide) {
  if (!documentGuide) return [];

  const { documents = [] } = documentGuide;

  // 문서 하나하나에 근거가 따로 안 내려오고(지금 응답 기준 documents[].sourceChunkIds는 항상 null),
  // documentGuide 전체 공통 근거를 모든 서류 카드에 동일하게 붙여줌
  const sharedChunkIds = documentGuide.hasSources && documentGuide.sourceChunkIds?.length
    ? documentGuide.sourceChunkIds
    : undefined;

  return documents.map((doc, idx) => ({
    id: `doc-${idx}`,
    tag: doc.required === false ? '선택' : '필수',
    title: doc.name || `서류 ${idx + 1}`,
    description: doc.description || '',
    sourceChunkIds: doc.hasSources && doc.sourceChunkIds?.length ? doc.sourceChunkIds : sharedChunkIds,
  }));
}

/**
 * POST /api/chat/sessions/{id}/messages 응답을 ResultPage가 바로 렌더링할 수 있는
 * 형태(DUMMY_DATA_BY_OPTION과 같은 shape)로 변환합니다.
 *
 * @param {object} apiResponse - { chatSessionId, userMessage, aiMessage }
 */
export function mapApiResponseToResultView(apiResponse) {
  const { userMessage, aiMessage } = apiResponse || {};
  if (!aiMessage) return null;

  const questionType = aiMessage.questionType;
  const theme = THEME_BY_QUESTION_TYPE[questionType] || 'main';

  let resultTitle = aiMessage.messageContent;
  let highlightType = 'text';
  let highlightText = aiMessage.messageContent;
  let highlightLabel;
  let highlightAmount;
  let evidences = [];

  if (questionType === 'CHIP_CLAIM' && aiMessage.claimGuide) {
    const { claimStatus, summary } = aiMessage.claimGuide;
    resultTitle = CLAIM_STATUS_TITLE[claimStatus] || summary || aiMessage.messageContent;
    highlightText = summary || aiMessage.messageContent;
    evidences = buildClaimEvidences(aiMessage.claimGuide);
  } else if (questionType === 'CHIP_AMOUNT' && aiMessage.amountGuide) {
    const { estimatedItems, totalAmountText } = aiMessage.amountGuide;
    evidences = buildAmountEvidences(aiMessage.amountGuide);

    if (totalAmountText) {
      // 정확히 매칭되는 항목이 있어서 합계가 내려오는 경우 (미확인 케이스, 필드명 추정)
      resultTitle = `받을 수 있어요! 약 ${totalAmountText}예요.`;
      highlightType = 'amount';
      highlightLabel = '예상 수령액';
      highlightAmount = totalAmountText;
    } else {
      // messageContent는 줄바꿈 포함 긴 문장일 수 있어서(CHIP_DOCUMENTS와 같은 이유로)
      // 제목엔 그대로 안 넣고 짧은 고정 문구로 대체
      resultTitle = '예상 보험금을 확인했어요.';
      highlightType = 'text';
      highlightText = estimatedItems?.[0]?.reason || aiMessage.messageContent;
    }
  } else if (questionType === 'CHIP_DOCUMENTS' && aiMessage.documentGuide) {
    const { documents = [], notice } = aiMessage.documentGuide;
    highlightType = 'amount';
    highlightLabel = notice || '필요 서류를 확인했어요';
    highlightAmount = documents.length
      ? `${documents.length}가지 서류가 필요해요.`
      : aiMessage.messageContent;
    // messageContent는 줄바꿈 포함 긴 안내문이라 제목에 그대로 넣으면 깨져 보여서
    // 짧은 고정 문구로 대체 (문서 개수가 없을 때만 원문으로 폴백)
    resultTitle = documents.length ? '꼭 챙겨야 할 서류예요.' : aiMessage.messageContent;
    evidences = buildDocumentEvidences(aiMessage.documentGuide);
  } else {
    // usedFallback === true 이거나 해당 guide 필드가 null인 경우
    // (지금 준 샘플처럼 claimGuide가 있어도 status가 예상 밖 값일 수 있어 안전하게 처리)
    resultTitle = aiMessage.messageContent;
    highlightText = aiMessage.disclaimerText || aiMessage.messageContent;
  }

  return {
    theme,
    userQuestion: extractUserQuestion(userMessage),
    resultTitle,
    resultSummary: aiMessage.disclaimerText || '',
    highlightType,
    highlightText,
    highlightLabel,
    highlightAmount,
    evidences,
    followupOptions: FOLLOWUP_OPTIONS_BY_QUESTION_TYPE[questionType] || [],
    sourceMessageId: aiMessage.hasSources ? aiMessage.messageId : null,
  };
}