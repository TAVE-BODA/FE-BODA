// 업로드/분석 없이 결과 화면 디자인을 바로 확인하기 위한 샘플 응답 모음.
// 전부 실제 백엔드가 내려준 응답을 그대로 저장해둔 것 (지어낸 데이터 아님).
// 2026-07-14 기준 최신 스키마(hasSources/sourceChunkIds 포함)로 갱신함.
//
// 참고: 프리뷰에서 "약관 근거 보기"를 누르면 실제로 GET 요청이 나가요.
// (evidence.js의 getMessageSources) 로컬/프리뷰 환경에서 이 messageId가
// 실제로 존재하지 않으면 "불러오지 못했어요"로 뜨는 게 정상이에요 - 버그 아님.
//
// 사용법: /result/preview/claim, /result/preview/amount, /result/preview/documents

export const RESULT_PREVIEW_SAMPLES = {
  // 옵션1 - 깁스 청구 가능 여부 (2026-07-14, chatSessionId 17, messageId 484)
  claim: {
    chatSessionId: 17,
    userMessage: {
      messageId: 483,
      senderType: 'USER',
      questionType: 'CHIP_CLAIM',
      messageContent:
        '청구 가능한지 먼저 알고 싶어요\n\n[사용자 입력 조건]\n- 발생 상황: INJURY\n- 받은 치료: CAST\n- 깁스 정보: 부위=LIMBS, 깁스 방식=FULL_CAST\n- 치료 시작일: 2026-07-09',
      usedFallback: false,
      disclaimerText: null,
      hasSources: false,
      createdAt: '2026-07-14T20:15:16.0529316',
      documentGuide: null,
      claimGuide: null,
      amountGuide: null,
    },
    aiMessage: {
      messageId: 484,
      senderType: 'AI',
      questionType: 'CHIP_CLAIM',
      messageContent:
        '청구 가능성이 있어요.\n\n가입하신 증권에서 깁스(Cast) 치료 보장이 확인돼요.\n입력하신 치료가 반깁스·부목이 아니라 정식 깁스라면 청구 가능성이 있습니다.\n\n[확인된 보장]\n- 깁스(Cast) 치료 (부목 제외): 1회당 100,000원\n\n[주의사항]\n- 부목 제외\n- 동일 원인 깁스치료 2회 이상 또는 동시에 다른 신체부위 치료 시 1회만 지급\n',
      usedFallback: false,
      disclaimerText: '실제 보험금 지급 여부는 보험사 심사 결과 및 약관에 따라 달라질 수 있습니다.',
      hasSources: true,
      createdAt: '2026-07-14T20:15:16.3231161',
      documentGuide: null,
      claimGuide: {
        claimStatus: 'POSSIBLE',
        summary: '정식 깁스 치료는 청구 가능성이 있어요.',
        reasons: [
          '가입하신 증권에서 깁스(Cast) 치료 (부목 제외) 보장이 확인돼요.',
          '입력하신 치료 방식은 정식 깁스예요.',
          '깁스 치료 시 100,000원의 보장금액이 확인됐어요.',
        ],
        cautions: [
          '부목 제외',
          '동일 원인 깁스치료 2회 이상 또는 동시에 다른 신체부위 치료 시 1회만 지급',
          '실제 지급 여부는 보험사 심사 결과 및 약관 조건에 따라 달라질 수 있어요.',
        ],
        hasSources: true,
        sourceChunkIds: [7149, 6303, 7123, 7125, 7126, 7138],
      },
      amountGuide: null,
    },
  },

  // 옵션2 - 재해 수술비 예상 금액 (2026-07-14, chatSessionId 17, messageId 486)
  amount: {
    chatSessionId: 17,
    userMessage: {
      messageId: 485,
      senderType: 'USER',
      questionType: 'CHIP_AMOUNT',
      messageContent: '예상 보험금을 먼저 알고 싶어요\n\n[사용자 입력 조건]\n- 발생 상황: INJURY\n- 받은 치료: SURGERY\n- 치료 시작일: 2026-07-02',
      usedFallback: false,
      disclaimerText: null,
      hasSources: false,
      createdAt: '2026-07-14T20:16:38.7115222',
      documentGuide: null,
      claimGuide: null,
      amountGuide: null,
    },
    aiMessage: {
      messageId: 486,
      senderType: 'AI',
      questionType: 'CHIP_AMOUNT',
      messageContent:
        '예상 수술비 보험금은 약 70,000원이에요.\n\n가입하신 보험의 재해 수술비(연간 1회만) 보장금액이 1년 이내 70,000원으로 확인됐어요.\n재해 또는 상해로 인정되고, 수술명이 약관상 지급 조건에 해당하면 지급 후보가 될 수 있어요.\n\n[계산 내역]\n- 재해 수술비(연간 1회만): 1년 이내 70,000원\n',
      usedFallback: false,
      disclaimerText: '실제 보험금 지급 여부는 보험사 심사 결과 및 약관에 따라 달라질 수 있습니다.',
      hasSources: true,
      createdAt: '2026-07-14T20:16:39.0570666',
      documentGuide: null,
      claimGuide: null,
      amountGuide: {
        calculationAvailable: true,
        estimatedItems: [
          {
            coverageName: '재해 수술비(연간 1회만)',
            amountText: '70,000원',
            reason: '1년 이내 조건 기준으로 확인된 금액이에요.',
            hasSources: true,
            sourceChunkIds: [7183],
          },
        ],
        cautions: ['실제 지급 여부는 보험사 심사 결과 및 약관 조건에 따라 달라질 수 있어요.'],
        hasSources: true,
        sourceChunkIds: [7183],
      },
    },
  },

  // 옵션3 - 입원 청구 서류 (2026-07-14, chatSessionId 17, messageId 490)
  documents: {
    chatSessionId: 17,
    userMessage: {
      messageId: 489,
      senderType: 'USER',
      questionType: 'CHIP_DOCUMENTS',
      messageContent:
        '필요 서류를 먼저 알고 싶어요\n\n[사용자 입력 조건]\n- 발생 상황: DISEASE\n- 받은 치료: HOSPITALIZATION\n- 입원 정보: 병원 종류=GENERAL_HOSPITAL, 병실=GENERAL_ROOM, 입원 기간=3박\n- 치료 시작일: 2026-06-20',
      usedFallback: false,
      disclaimerText: null,
      hasSources: false,
      createdAt: '2026-07-14T20:33:35.5346915',
      documentGuide: null,
      claimGuide: null,
      amountGuide: null,
    },
    aiMessage: {
      messageId: 490,
      senderType: 'AI',
      questionType: 'CHIP_DOCUMENTS',
      messageContent: '필요서류 후보를 확인했어요.\n\n[필요서류 후보]\n- 청구서(회사양식)\n- 신분증\n- 입·퇴원 확인서\n',
      usedFallback: false,
      disclaimerText: '실제 보험금 지급 여부는 보험사 심사 결과 및 약관에 따라 달라질 수 있습니다.',
      hasSources: true,
      createdAt: '2026-07-14T20:33:35.7420957',
      documentGuide: {
        documents: [
          { name: '청구서(회사양식)', description: '보험사 양식에 맞춰 작성하는 보험금 청구서예요.', required: true, hasSources: null, sourceChunkIds: null },
          { name: '신분증', description: '보험금 청구자 본인 확인을 위한 서류예요.', required: true, hasSources: null, sourceChunkIds: null },
          { name: '입·퇴원 확인서', description: '입원 기간과 입·퇴원 사실을 확인하기 위한 서류예요.', required: true, hasSources: null, sourceChunkIds: null },
        ],
        hasSources: true,
        sourceChunkIds: [6274, 6614],
      },
      claimGuide: null,
      amountGuide: null,
    },
  },

  // 옵션2 - 치아 치료(여러 후보라 합산 불가한 케이스, calculationAvailable: false)
  // (2026-07-16, chatSessionId 64, messageId 542)
  amountDental: {
    chatSessionId: 64,
    userMessage: {
      messageId: 541,
      senderType: 'USER',
      questionType: 'CHIP_AMOUNT',
      messageContent:
        '예상 보험금을 먼저 알고 싶어요\n\n[사용자 입력 조건]\n- 발생 상황: INJURY\n- 받은 치료: DENTAL\n- 치아 치료: [CROWN_IMPLANT]\n- 치료 치아 개수: 5개\n- 치료 시작일: 2026-07-03',
      usedFallback: false,
      disclaimerText: null,
      hasSources: false,
      createdAt: '2026-07-16T12:42:44.913886985',
      documentGuide: null,
      claimGuide: null,
      amountGuide: null,
    },
    aiMessage: {
      messageId: 542,
      senderType: 'AI',
      questionType: 'CHIP_AMOUNT',
      messageContent:
        '치료 종류 확인이 필요해요.\n\n선택하신 치아치료 항목에는 여러 치료가 포함될 수 있어요.\n치료 종류에 따라 금액이 달라 하나의 예상 보험금으로 합산하기 어렵습니다.\n\n[확인된 후보]\n- 영구치보철치료보험금: 2년 초과 50,000원, 2년 이내 20,000원\n- 가철성의치(틀니)치료: 2년 초과 50,000원, 2년 이내 25,000원\n- 고정성가공의치(브릿지)치료: 2년 초과 30,000원, 2년 이내 10,000원\n- 임플란트치료: 2년 초과 30,000원, 2년 이내 15,000원\n- 크라운치료보험금: 1년 초과 20,000원, 1년 이내 10,000원\n\n정확한 총액 계산을 위해서는 실제 치료명이 필요해요.\n예: 임플란트, 브릿지, 크라운, 레진, 인레이 등\n',
      usedFallback: false,
      disclaimerText: '실제 보험금 지급 여부는 보험사 심사 결과 및 약관에 따라 달라질 수 있습니다.',
      hasSources: true,
      createdAt: '2026-07-16T12:42:45.990587292',
      documentGuide: null,
      claimGuide: null,
      amountGuide: {
        calculationAvailable: false,
        estimatedItems: [
          {
            coverageName: '영구치보철치료보험금',
            amountText: '2년 초과 50,000원, 2년 이내 20,000원',
            reason: '실제 치료 종류와 가입 시점 조건에 따라 금액이 달라질 수 있어요.',
            hasSources: true,
            sourceChunkIds: [50474, 50705],
          },
          {
            coverageName: '가철성의치(틀니)치료',
            amountText: '2년 초과 50,000원, 2년 이내 25,000원',
            reason: '실제 치료 종류와 가입 시점 조건에 따라 금액이 달라질 수 있어요.',
            hasSources: true,
            sourceChunkIds: [50474, 50705],
          },
          {
            coverageName: '고정성가공의치(브릿지)치료',
            amountText: '2년 초과 30,000원, 2년 이내 10,000원',
            reason: '실제 치료 종류와 가입 시점 조건에 따라 금액이 달라질 수 있어요.',
            hasSources: true,
            sourceChunkIds: [50474, 50705],
          },
          {
            coverageName: '임플란트치료',
            amountText: '2년 초과 30,000원, 2년 이내 15,000원',
            reason: '실제 치료 종류와 가입 시점 조건에 따라 금액이 달라질 수 있어요.',
            hasSources: true,
            sourceChunkIds: [50703, 50669],
          },
          {
            coverageName: '크라운치료보험금',
            amountText: '1년 초과 20,000원, 1년 이내 10,000원',
            reason: '실제 치료 종류와 가입 시점 조건에 따라 금액이 달라질 수 있어요.',
            hasSources: true,
            sourceChunkIds: [50703, 50705],
          },
        ],
        cautions: [
          '선택한 항목에 여러 치료가 포함된 경우 실제 치료명을 확인해야 정확한 금액을 계산할 수 있어요.',
          '가입 후 경과 기간에 따라 지급금액이 달라질 수 있어요.',
          '실제 지급 여부는 보험사 심사 결과 및 약관 조건에 따라 달라질 수 있어요.',
        ],
        hasSources: true,
        sourceChunkIds: [50474, 50705, 50703, 50669],
      },
    },
  },
};