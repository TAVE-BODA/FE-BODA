const THEME_BY_QUESTION_TYPE = {
  CHIP_CLAIM: 'main',
  CHIP_AMOUNT: 'purple',
  CHIP_DOCUMENTS: 'green',
};

const CLAIM_STATUS_TITLE = {
  POSSIBLE: '청구 가능해요!',
  NOT_POSSIBLE: '청구가 어려워요',
  NEEDS_REVIEW: '확인이 조금 더 필요해요',
};

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

const USER_QUESTION_BY_TYPE = {
  CHIP_CLAIM: '청구 가능한지 먼저 알고 싶어요',
  CHIP_AMOUNT: '예상 보험금을 먼저 알고 싶어요',
  CHIP_DOCUMENTS: '필요 서류를 먼저 알고 싶어요',
  CHIP_OVERVIEW: '내 보험의 보장 항목부터 보고 싶어요',
};

function extractDiagnosisName(userMessage) {
  if (!userMessage?.messageContent) return '';
  const firstLine = userMessage.messageContent.split('\n\n')[0].trim();
  const isFixedPhrase = Object.values(USER_QUESTION_BY_TYPE).includes(firstLine);
  return isFixedPhrase ? '' : firstLine;
}

function buildUserQuestionText(userMessage, questionType) {
  const phrase = USER_QUESTION_BY_TYPE[questionType];
  if (!phrase) {
    return userMessage?.messageContent?.split('\n\n')[0]?.trim() || '';
  }
  const diagnosisName = extractDiagnosisName(userMessage);
  return diagnosisName ? `${diagnosisName}일 때 ${phrase}` : phrase;
}

const NEGATIVE_RESULT_PATTERN = /(찾지 못했|확인되지 않|되지 않았)/;

function toApproxManwonText(amountNumber) {
  if (amountNumber >= 10000) {
    return `${Math.round(amountNumber / 10000)}만원`;
  }
  return `${amountNumber.toLocaleString('ko-KR')}원`;
}

function buildClaimEvidences(claimGuide) {
  if (!claimGuide) return [];

  const sharedChunkIds = claimGuide.hasSources && claimGuide.sourceChunkIds?.length
    ? claimGuide.sourceChunkIds
    : undefined;

  const groups = [];
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
        _negative: isNegative,
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

function buildAmountEvidences(amountGuide) {
  if (!amountGuide) return [];

  const itemCards = (amountGuide.estimatedItems || []).map((item, idx) => {
    const rawReason = item.reason || '';
    const tagMatch = rawReason.match(/^\[([^\]]+)\]\s*/);
    return {
      id: `amount-item-${idx}`,
      tag: tagMatch ? tagMatch[1] : undefined,
      title: item.coverageName || `보장 항목 ${idx + 1}`,
      amount: item.amountText,
      description: rawReason.replace(/^\[[^\]]+\]\s*/, ''),
      sourceChunkIds: item.hasSources && item.sourceChunkIds?.length ? item.sourceChunkIds : undefined,
    };
  });

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

function buildDocumentEvidences(documentGuide) {
  if (!documentGuide) return [];

  const { documents = [] } = documentGuide;

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
    const { estimatedItems = [], calculationAvailable } = aiMessage.amountGuide;
    evidences = buildAmountEvidences(aiMessage.amountGuide);

    const parsedAmounts = estimatedItems.map((item) => {
      const trimmed = (item.amountText || '').trim();
      const match = trimmed.match(/^([\d,]+)\s*원$/);
      if (!match) return null;
      const digits = match[1].replace(/,/g, '');
      return digits ? Number(digits) : null;
    });
    const allParsed = calculationAvailable !== false
      && parsedAmounts.length > 0
      && parsedAmounts.every((n) => n !== null);

    if (allParsed) {
      const total = parsedAmounts.reduce((sum, n) => sum + n, 0);
      const totalText = `${total.toLocaleString('ko-KR')}원`;
      resultTitle = `받을 수 있어요! 약 ${toApproxManwonText(total)}이에요.`;
      highlightType = 'amount';
      highlightLabel = estimatedItems.length > 1 ? '예상 수령액(항목 합산)' : '예상 수령액';
      highlightAmount = totalText;
    } else {
      const bracketTags = aiMessage.messageContent?.match(/\[[^\]]+\]/g) || [];
      const hasMultipleBracketSections = bracketTags.length >= 2;

      if (hasMultipleBracketSections) {
        resultTitle = '예상 보험금을 확인했어요.';
        highlightType = 'text';
        highlightText = aiMessage.amountGuide.cautions?.[0]
          || aiMessage.disclaimerText
          || '';
      } else {
        const marker = aiMessage.messageContent?.indexOf('[확인된');
        const summaryPart = marker && marker >= 0
          ? aiMessage.messageContent.slice(0, marker)
          : aiMessage.messageContent;
        const summaryText = (summaryPart || '').replace(/\n{2,}/g, '\n').trim();

        resultTitle = aiMessage.messageContent?.split('\n')[0]?.trim() || '예상 보험금을 확인했어요.';
        highlightType = 'text';
        highlightText = summaryText.split('\n').slice(1).join('\n').trim()
          || summaryText
          || estimatedItems?.[0]?.reason
          || '';
      }
    }
  } else if (questionType === 'CHIP_DOCUMENTS' && aiMessage.documentGuide) {
    const { documents = [], notice } = aiMessage.documentGuide;
    highlightType = 'amount';
    highlightLabel = notice || '필요 서류를 확인했어요';
    highlightAmount = documents.length
      ? `${documents.length}가지 서류가 필요해요.`
      : aiMessage.messageContent;
    resultTitle = documents.length ? '꼭 챙겨야 할 서류예요.' : aiMessage.messageContent;
    evidences = buildDocumentEvidences(aiMessage.documentGuide);
  } else {
    resultTitle = aiMessage.messageContent?.split('\n')[0]?.trim() || '답변을 확인했어요.';
    highlightText = aiMessage.messageContent || aiMessage.disclaimerText || '';
  }

  return {
    theme,
    userQuestion: buildUserQuestionText(userMessage, questionType),
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