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

function buildClaimEvidences(claimGuide) {
  if (!claimGuide) return [];

  const reasonCards = (claimGuide.reasons || []).map((reason, idx) => ({
    id: `reason-${idx}`,
    tag: '확인된 내용',
    title: `확인된 내용 ${idx + 1}`,
    description: reason,
    // hasSources: false인 케이스라 clauseRef는 없음 -> EvidenceCard가 토글 버튼을 알아서 숨김
  }));

  const cautionCards = (claimGuide.cautions || []).map((caution, idx) => ({
    id: `caution-${idx}`,
    tag: '주의',
    title: '이 점은 꼭 확인하세요',
    description: caution,
  }));

  return [...reasonCards, ...cautionCards];
}

// amountGuide 실제 구조 (2026-07-12 실응답 기준):
// {
//   calculationAvailable: boolean,
//   estimatedItems: [{ coverageName, amountText, reason }],
//   cautions: [string],
//   totalAmountText?: string  <- 정확히 매칭되는 항목이 있을 때만 내려오는 것으로 추정, 미확인
// }
function buildAmountEvidences(amountGuide) {
  if (!amountGuide) return [];

  const itemCards = (amountGuide.estimatedItems || []).map((item, idx) => ({
    id: `amount-item-${idx}`,
    title: item.coverageName || `보장 항목 ${idx + 1}`,
    amount: item.amountText,
    description: item.reason || '',
  }));

  const cautionCards = (amountGuide.cautions || []).map((caution, idx) => ({
    id: `amount-caution-${idx}`,
    tag: '주의',
    title: '이 점은 꼭 확인하세요',
    description: caution,
  }));

  return [...itemCards, ...cautionCards];
}

// documentGuide 실제 구조 (2026-07-13 실응답 기준):
// {
//   documents: [{ name, description, required }],
//   evidences: [{ chunkId, title }],  // 문서별이 아니라 documentGuide 전체에 공통으로 달려있는 근거
//   evidenceAvailable: boolean,
//   notice: string
// }
function buildDocumentEvidences(documentGuide) {
  if (!documentGuide) return [];

  const { documents = [], evidences: clauseEvidences = [] } = documentGuide;

  // 근거가 문서 하나하나에 매칭되어 내려오는 게 아니라 공통 목록이라,
  // 중복 제목은 정리해서 각 서류 카드에 동일하게 붙여줌
  const clauseRef = clauseEvidences.length
    ? [...new Set(clauseEvidences.map((e) => e.title).filter(Boolean))]
    : undefined;

  return documents.map((doc, idx) => ({
    id: `doc-${idx}`,
    tag: doc.required === false ? '선택' : '필수',
    title: doc.name || `서류 ${idx + 1}`,
    description: doc.description || '',
    clauseRef,
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
    const { estimatedItems, cautions, totalAmountText } = aiMessage.amountGuide;
    resultTitle = aiMessage.messageContent;
    evidences = buildAmountEvidences(aiMessage.amountGuide);

    if (totalAmountText) {
      // 정확히 매칭되는 항목이 있어서 합계가 내려오는 경우 (미확인 케이스, 필드명 추정)
      highlightType = 'amount';
      highlightLabel = '예상 수령액';
      highlightAmount = totalAmountText;
    } else {
      // 지금까지 실제로 확인된 케이스: 정확히 매칭 안 돼서 항목별 "확인 필요" 텍스트만 내려옴
      // -> 근거 없는 숫자를 지어내지 않고, 메시지 본문을 텍스트로 보여줌
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
  };
}