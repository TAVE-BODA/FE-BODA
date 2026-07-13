import { useParams, useLocation } from 'react-router-dom';
import './ResultPage.css';
import NavBar from '../components/NavBar';
import EvidenceCard from '../components/EvidenceCard';
import { mapApiResponseToResultView } from '../utils/resultMapper';
import characterResult from '../assets/images/characters/character_result2.png';
import checkBadge from '../assets/images/check-badge.png';
import checkBadgePurple from '../assets/images/check-badge-purple.png';
import checkBadgeGreen from '../assets/images/check-badge-green.png';

const BADGE_BY_THEME = {
  main: checkBadge,
  purple: checkBadgePurple,
  green: checkBadgeGreen,
};

const DUMMY_DATA_BY_OPTION = {
  1: {
    theme: 'main',
    userQuestion: '운동하다가 어깨 다쳤는데, 수술받으면 보험금 청구 가능해요?',
    resultTitle: '청구 가능해요!',
    resultSummary: '삼성생명, 삼성 팩 건강보험(2604) 기준으로 확인했어요.',
    highlightType: 'text',
    highlightText: '운동 중 다치셨으면 보험에서 재해로 봐요.\n그래서 수술보험금을 받을 수 있어요.',
    evidences: [
      {
        id: 'ev1',
        tag: '핵심',
        title: '재해랑 질병은 달라요',
        description: "운동하다 다친 건 외부에서 생긴 사고라서 '재해'예요. 보험에선 몸 안에서 생기는 병과 다르게 봐요.",
        clauseRef: '재해분류표 제1항',
      },
      {
        id: 'ev2',
        tag: '조건',
        title: '재해로 인한 수술이면 1년 이내라도 전액 받을 수 있어요',
        description: '질병으로 인한 수술은 가입 1년 안엔 절반만 나가지만, 재해로 인한 수술은 1년이 안 됐어도 전액 받을 수 있어요.',
        clauseRef: '일반-재해수술보장특약LT 제 2-2조',
      },
      {
        id: 'ev3',
        tag: '비용',
        title: '수술을 받으시면 70,000원이 나와요',
        description: '가입한 보험의 수술 특약 가입금액을 기반으로 계산했고, 재해분 인약하지만 이 금액은 그대로 받을 수 있어요.',
        clauseRef: '일반-재해수술보장특약LT 제2-2조',
      },
    ],
    followupOptions: [
      { number: 2, label: '2. 얼마나 더 받을 수 있어요?' },
      { number: 3, label: '3. 필요 서류를 먼저 알고 싶어요' },
      { number: 4, label: '4. 내 보험의 보장 항목부터 보고 싶어요' },
    ],
  },
  2: {
    theme: 'purple',
    userQuestion: '얼마나 받을 수 있어요?',
    resultTitle: '받을 수 있어요! 약 65만원이에요.',
    resultSummary: '삼성생명, 삼성 팩 건강보험(2604) 기준으로 확인했어요.',
    highlightType: 'amount',
    highlightLabel: '예상 수령액(입원 5일 기준)',
    highlightAmount: '650,000원',
    evidences: [
      {
        id: 'ev1',
        title: '골절 진단을 받으셨으니까',
        amount: '300,000원',
        description: '재해로 인한 골절 진단이면 한 번에 30만원이 나와요. 복합골절이어도 1회만 지급돼요.',
        clauseRef: '재해추상골절(치아파절제외)·깁스(부목제외)치료비특약L 제2-2조 항2호',
      },
      {
        id: 'ev2',
        title: '깁스를 하셨다면',
        amount: '100,000원',
        description: '정식 깁스(석고붕대를 뼈 둘레 전체에 감싸는 것)를 하셨으면 10만원이 더 나와요.',
        clauseRef: '재해추상골절(치아파절제외)·깁스(부목제외)치료비특약L 제2-2조 ①항 5호',
      },
      {
        id: 'ev3',
        title: '상급종합병원 2인실에 5일 계셨으니까',
        amount: '250,000원',
        description: '하루에 5만원씩 5일이면 25만원이에요. 한 번 입원에 최대 30일까지 받을 수 있어요.',
        clauseRef: [
          '2-3인실입원(상급종합병원)특약LT 제2-2조 1호',
          '2-3인실입원(종합병원이상)특약LT 제2-2조 1호',
        ],
      },
    ],
    followupOptions: [
      { number: 1, label: '1. 청구 가능한지 먼저 알고 싶어요' },
      { number: 3, label: '3. 필요 서류를 먼저 알고 싶어요' },
      { number: 4, label: '4. 내 보험의 보장 항목부터 보고 싶어요' },
    ],
  },
  3: {
    theme: 'green',
    userQuestion: '보험금 받으려면 어떤 서류가 필요해요?',
    resultTitle: '꼭 챙겨야할 서류 4가지에요.',
    resultSummary: '골절 입원 청구 기준  삼성생명 삼성 팩 건강보험(2604) 기준으로 확인했어요.',
    highlightType: 'amount',
    highlightLabel: '퇴원 전에 한번에 받으면 편해요.',
    highlightAmount: '4가지 서류가 필요해요.',
    evidences: [
      {
        id: 'ev1',
        tag: '필수',
        title: '진단서',
        description: '어떤 재해로 골절 진단을 받았는지 적혀있는 서류예요.',
        tip: '퇴원 전 담당 의사한테 요청하면 바로 발급돼요.',
        clauseRef: '삼성 팩 건강보험(2604) 약관 요약서 보험금 청구서류 — 진단 항목',
      },
      {
        id: 'ev2',
        tag: '필수',
        title: '입퇴원확인서',
        description: '언제 입원하고 퇴원했는지 확인해주는 서류예요.',
        tip: '퇴원 당일 원무과에서 발급받으면 돼요.',
        clauseRef: '삼성 팩 건강보험(2604) 약관 요약서 보험금 청구서류 — 입원 항목',
      },
      {
        id: 'ev3',
        tag: '필수',
        title: '보험금 청구서',
        description: '삼성생명 양식으로 작성해야 해요.',
        tip: '삼성생명 앱 또는 홈페이지에서 내려받을 수 있어요.',
        clauseRef: '삼성 팩 건강보험(2604) 약관 요약서 보험금 청구서류 — 공통 항목',
      },
      {
        id: 'ev4',
        tag: '필수',
        title: '신분증',
        description: '주민등록증이나 운전면허증이면 돼요.',
        tip: '가족이 대신 청구할 땐 인감증명서도 함께 필요해요.',
        clauseRef: '삼성 팩 건강보험(2604) 약관 요약서 보험금 청구서류 — 공통 항목',
      },
    ],
    followupOptions: [
      { number: 0, label: '각 서류 발급받는 방법이 궁금해요 – 진단서  입퇴원확인서  청구서 발급 방법' },
      { number: 1, label: '1. 청구 가능한지 먼저 알고 싶어요' },
      { number: 2, label: '2. 얼마나 더 받을 수 있어요?' },
      { number: 4, label: '4. 내 보험의 보장 항목부터 보고 싶어요' },
    ],
  },
};

export default function ResultPage({ data, onSelectFollowup, onCustomInput }) {
  const { optionNumber } = useParams();
  const location = useLocation();

  // UploadPage가 navigate(`/result/${selectedOption}`, { state: { resultData } })로 넘겨준
  // messages API 응답을 최우선으로 사용. state가 없으면(새로고침, 직접 URL 진입 등) 더미로 폴백.
  const apiResultData = location.state?.resultData;
  const mappedData = apiResultData ? mapApiResponseToResultView(apiResultData) : null;

  const resolvedData = data || mappedData || DUMMY_DATA_BY_OPTION[optionNumber] || DUMMY_DATA_BY_OPTION[1];

  const {
    theme = 'main',
    userQuestion,
    resultTitle,
    resultSummary,
    highlightType,
    highlightText,
    highlightLabel,
    highlightAmount,
    evidences,
    followupOptions,
  } = resolvedData;

  return (
    <div className={`result-page-container theme-${theme}`}>
      <header className="result-header">
        <NavBar />
      </header>

      <div className="result-content-wrap">
        <div className="result-user-row">
          <div className="result-user-question">{userQuestion}</div>
        </div>

        <div className="result-main-row">
          <div className="result-avatar-area">
            <img src={characterResult} alt="" className="result-character" />
          </div>

          <div className="result-bubble">
            <h3 className="result-bubble-title">{resultTitle}</h3>
            <p className="result-bubble-desc">{resultSummary}</p>

            <div className="result-highlight-box">
              <img
                src={BADGE_BY_THEME[theme] || checkBadge}
                alt=""
                className="result-check-badge"
              />
              {highlightType === 'amount' ? (
                <div>
                  <p className="result-highlight-amount">{highlightAmount}</p>
                  <p className="result-highlight-label">{highlightLabel}</p>
                </div>
              ) : (
                <p className="result-highlight-text">
                  {highlightText.split('\n').map((line, idx, arr) => (
                    <span key={idx}>
                      {line}
                      {idx < arr.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>
        </div>

        {evidences.length > 0 && (
        <div className="result-evidence-list">
          {evidences.map((item) => (
            <EvidenceCard
              key={item.id}
              tag={item.tag}
              title={item.title}
              amount={item.amount}
              description={item.description}
              tip={item.tip}
              clauseRef={item.clauseRef}
            />
          ))}
        </div>
        )}

        <div className="result-followup-area">
          <p className="result-followup-lead">더 궁금한 점 있으세요?</p>
          {followupOptions.map((opt) => (
            <button
              key={opt.number}
              className="result-followup-btn"
              onClick={() => onSelectFollowup?.(opt.number)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
          <button
            className="result-custom-input-btn"
            onClick={onCustomInput}
            type="button"
          >
            직접 입력할게요
          </button>
        </div>
      </div>
    </div>
  );
}