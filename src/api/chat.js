const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createChatSession = async () => {
  const response = await fetch(`${BASE_URL}/api/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error('채팅 세션 생성 실패');
  return response.json();
};

export const sendInsuranceCondition = async (chatSessionId, formData, selectedOption) => {
  const QUESTION_TYPE_MAP = {
    1: 'CHIP_CLAIM',
    2: 'CHIP_AMOUNT',
    3: 'CHIP_DOCUMENT',
  };

  const INCIDENT_TYPE_MAP = {
    injury: 'INJURY',
    sick: 'DISEASE',
    checkup: 'CHECKUP',
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
    university: 'UNIVERSITY_HOSPITAL',
  };

  const ROOM_TYPE_MAP = {
    single: 'PRIVATE_ROOM',
    double: 'SEMI_PRIVATE_ROOM',
    general: 'GENERAL_ROOM',
  };

  const CAST_BODY_MAP = {
    limb: 'LIMBS',
    trunk: 'TRUNK',
  };

  const CAST_TYPE_MAP = {
    full: 'FULL_CAST',
    partial: 'PARTIAL_CAST',
  };

  const DENTAL_TYPE_MAP = {
    extraction: 'EXTRACTION',
    crown: 'CROWN',
    filling: 'FILLING',
    root_canal: 'ROOT_CANAL',
  };

  const questionType = QUESTION_TYPE_MAP[selectedOption];

  const body = {
    questionType,
    message: questionType,
    incidentType: INCIDENT_TYPE_MAP[formData.q1],
    treatmentTypes: formData.q2.map(t => TREATMENT_TYPE_MAP[t]).filter(Boolean),

    // 입원 - 선택 시에만 포함, 미선택 시 null
    hospitalizationInfo: formData.q2.includes('hospitalized') ? {
        hospitalType: HOSPITAL_TYPE_MAP[formData.q3a_hospital],
        roomType: ROOM_TYPE_MAP[formData.q3a_room],
        hospitalizedNights: Number(formData.q3a_nights) || 0,
    } : null,

    // 깁스 - 선택 시에만 포함, 미선택 시 null
    castInfo: formData.q2.includes('cast') ? {
        castInjuryPartType: CAST_BODY_MAP[formData.q3b_body],
        castType: CAST_TYPE_MAP[formData.q3b_cast],
    } : null,

    // 치아 - 선택 시에만 포함, 미선택 시 null
    dentalInfo: formData.q2.includes('dental') ? {
        dentalTreatmentTypes: [DENTAL_TYPE_MAP[formData.q3c_dental]].filter(Boolean),
        dentalTreatmentCountType: formData.q3c_count === 'unknown' ? 'UNKNOWN' : 'EXACT_COUNT',
        dentalTreatmentCount: formData.q3c_count === 'unknown' ? 0 : Number(formData.q3c_count),
    } : null,

    treatmentStartDateType: formData.q4_type === 'date' ? 'EXACT_DATE' : 'YEAR_MONTH',
    treatmentStartDate: formData.q4_type === 'date' ? formData.q4_date : null,
    treatmentStartYear: formData.q4_type === 'yearmonth' ? Number(formData.q4_year) : 0,
    treatmentStartMonth: formData.q4_type === 'yearmonth' ? Number(formData.q4_month) : 0,
    };

  const response = await fetch(`${BASE_URL}/api/chat/sessions/${chatSessionId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error('보험 조건 전송 실패');
  return response.json();
};