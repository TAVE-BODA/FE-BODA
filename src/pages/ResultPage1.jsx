import './ResultPage1.css';
import NavBar from '../components/NavBar';
import EvidenceCard from '../components/EvidenceCard';
import characterResult from '../assets/images/characters/character_result2.png';
import checkBadge from '../assets/images/check-badge.png';

// 백엔드 응답이 아직 없을 때 화면 확인용 더미 데이터
const DUMMY_DATA = {
  userQuestion: '운동하다가 어깨 다쳤는데, 수술받으면 보험금 청구 가능해요?',
  resultTitle: '청구 가능해요!',
  resultSummary: '삼성생명, 삼성 팩 건강보험(2604) 기준으로 확인했어요.',
  highlightText: '운동 중 다치셨으면 보험에서 재해로 봐요.\n그래서 수술보험금을 받을 수 있어요.',
  evidences: [
    {
      id: 'ev1',
      tag: '핵심',
      title: '재해랑 질병은 달라요',
      description: '운동하다 다친 건 외부에서 생긴 사고라서 \'재해\'예요. 보험에선 몸 안에서 생기는 병과 다르게 봐요.',
      clauseRef: '재해분류표 제1항',
    },
    {
      id: 'ev2',
      tag: '조건',
      title: '재해로 인한 수술이면 1년 이내라도 전액 받을 수 있어요',
      description: '질병으로 인한 수술은 가입 1년 안엔 절반만 나가지만, 재해로 인한 수술은 1년이 안 됐어도 전액 받을 수 있어요.',
      clauseRef: '질병·재해수술보장특약IIILT 제2-2조',
    },
    {
      id: 'ev3',
      tag: '비용',
      title: '수술을 받으시면 70,000원이 나와요',
      description: '아영님 보험의 수술 특약 가입금액이 7만원이에요. 재해로 인정되면 이 금액을 그대로 받을 수 있어요.',
      clauseRef: '질병·재해수술보장특약IIILT 제2-2조',
    },
  ],
  followupOptions: [
    { number: 2, label: '2. 얼마나 더 받을 수 있어요?' },
    { number: 3, label: '3. 필요 서류를 먼저 알고 싶어요' },
    { number: 4, label: '4. 내 보험의 보장 항목부터 보고 싶어요' },
  ],
};

export default function ResultPage1({
  data = DUMMY_DATA,
  onSelectFollowup,
  onCustomInput,
}) {
  const {
    userQuestion,
    resultTitle,
    resultSummary,
    highlightText,
    evidences,
    followupOptions,
  } = data;

  return (
    <div className="result-page-container">
      <header className="result-header">
        <NavBar />
      </header>

      <div className="result-content-wrap">
        <div className="result-user-row">
          <div className="result-user-question">
            {userQuestion}
          </div>
        </div>

        <div className="result-main-row">
          <div className="result-avatar-area">
            <img src={characterResult} alt="" className="result-character" />
          </div>

          <div className="result-bubble">
            <h3 className="result-bubble-title">{resultTitle}</h3>
            <p className="result-bubble-desc">{resultSummary}</p>

            <div className="result-highlight-box">
              <img src={checkBadge} alt="" className="result-check-badge" />
              <p className="result-highlight-text">
                {highlightText.split('\n').map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx < highlightText.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>

        <div className="result-evidence-list">
          {evidences.map((item) => (
            <EvidenceCard
              key={item.id}
              tag={item.tag}
              title={item.title}
              description={item.description}
              clauseRef={item.clauseRef}
            />
          ))}
        </div>

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