const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// analysisIds(이미 분석된 증권)/termsDocumentId를 같이 넘기면 새 채팅방 생성과 동시에
// 연결됨 - 마이페이지에서 어느 채팅에도 안 묶인 증권(unlinkedAnalysisIds)을 재사용해서
// 새 채팅을 만들 때 재업로드 없이 바로 연결하기 위해 사용.
export const createChatSession = async ({ analysisIds, termsDocumentId } = {}) => {
  const response = await fetch(`${BASE_URL}/api/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      ...(analysisIds?.length && { analysisIds }),
      ...(termsDocumentId != null && { termsDocumentId }),
    }),
  });
  if (!response.ok) throw new Error('채팅 세션 생성 실패');
  return response.json();
};

// 이미 만들어진 채팅방에 나중에 증권을 추가로 연결 (연결 후 대시보드가 자동으로 다시 생성됨)
export const attachPoliciesToChat = async (chatSessionId, analysisIds) => {
  const response = await fetch(`${BASE_URL}/api/chat/sessions/${chatSessionId}/policies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ analysisIds }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const err = new Error(errorBody.error || errorBody.message || '증권 연결 실패');
    err.code = errorBody.code;
    throw err;
  }
  return response.json();
};

export const deleteChatSession = async (chatSessionId) => {
  const response = await fetch(`${BASE_URL}/api/chat/sessions/${chatSessionId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const err = new Error(errorBody.error || errorBody.message || '채팅방 삭제 실패');
    err.code = errorBody.code;
    throw err;
  }
};

const QUESTION_TYPE_MAP = {
  1: 'CHIP_CLAIM',
  2: 'CHIP_AMOUNT',
  3: 'CHIP_DOCUMENTS',
  4: 'CHIP_OVERVIEW',
};

const INCIDENT_TYPE_MAP = {
  injury: 'INJURY',
  sick: 'DISEASE',
  checkup: 'CHECKUP_FOUND',
};

const TREATMENT_TYPE_MAP = {
  diagnosis: 'DIAGNOSIS_ONLY',
  surgery: 'SURGERY',
  hospitalized: 'HOSPITALIZATION',
  outpatient: 'OUTPATIENT',
  cast: 'CAST',
  dental: 'DENTAL',
  disability: 'DISABILITY',
};

const HOSPITAL_TYPE_MAP = {
  clinic: 'LOCAL_CLINIC',
  general: 'GENERAL_HOSPITAL',
  university: 'TERTIARY_HOSPITAL',
};

const ROOM_TYPE_MAP = {
  single: 'PRIVATE_ROOM',
  double: 'TWO_THREE_ROOM',
  general: 'GENERAL_ROOM',
};

const CAST_BODY_MAP = {
  limb: 'LIMBS',
  trunk: 'TRUNK',
};

const CAST_TYPE_MAP = {
  full: 'FULL_CAST',
  partial: 'SPLINT',
};

const DENTAL_TYPE_MAP = {
  extraction: 'EXTRACTION',
  crown: 'CROWN_IMPLANT',
  filling: 'FILLING',
  root_canal: 'ROOT_CANAL',
};

function buildConditionFields(formData) {
  return {
    incidentType: INCIDENT_TYPE_MAP[formData.q1],
    treatmentTypes: formData.q2.map(t => TREATMENT_TYPE_MAP[t]).filter(Boolean),

    treatmentStartDateType: formData.q4_type === 'date' ? 'EXACT_DATE' : 'YEAR_MONTH',
    ...(formData.q4_type === 'date' && {
      treatmentStartDate: formData.q4_date,
    }),
    ...(formData.q4_type === 'yearmonth' && {
      treatmentStartYear: Number(formData.q4_year),
      treatmentStartMonth: Number(formData.q4_month),
    }),

    ...(formData.q2.includes('hospitalized') && {
      hospitalizationInfo: {
        hospitalType: HOSPITAL_TYPE_MAP[formData.q3a_hospital],
        roomType: ROOM_TYPE_MAP[formData.q3a_room],
        hospitalizedNights: Number(formData.q3a_nights) || 0,
      },
    }),

    ...(formData.q2.includes('cast') && {
      castInfo: {
        castInjuryPartType: CAST_BODY_MAP[formData.q3b_body],
        castType: CAST_TYPE_MAP[formData.q3b_cast],
      },
    }),

    ...(formData.q2.includes('dental') && {
      dentalInfo: {
        dentalTreatmentTypes: [DENTAL_TYPE_MAP[formData.q3c_dental]].filter(Boolean),
        dentalTreatmentCountType: formData.q3c_count === 'unknown' ? 'UNKNOWN' : 'EXACT_COUNT',
        dentalTreatmentCount: formData.q3c_count === 'unknown' ? 0 : Number(formData.q3c_count),
      },
    }),
  };
}

async function postChatMessage(chatSessionId, body) {
  const response = await fetch(`${BASE_URL}/api/chat/sessions/${chatSessionId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error('메시지 전송 실패');
  return response.json();
}

export const sendInsuranceCondition = async (chatSessionId, formData, selectedOption) => {
  const body = {
    questionType: QUESTION_TYPE_MAP[selectedOption],
    message: formData.q5_message,
    ...buildConditionFields(formData),
  };
  return postChatMessage(chatSessionId, body);
};

export const sendFreeTextMessage = async (chatSessionId, message) => {
  const body = {
    questionType: 'FREE_TEXT',
    message,
  };
  return postChatMessage(chatSessionId, body);
};