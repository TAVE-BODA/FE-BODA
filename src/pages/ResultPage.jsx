import { useLocation, useNavigate } from 'react-router-dom';
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

export default function ResultPage({ data, onSelectFollowup, onCustomInput }) {
  const location = useLocation();
  const navigate = useNavigate();

  // UploadPage가 navigate(`/result/option/${selectedOption}`, { state: { resultData } })로
  // 넘겨준 messages API 응답을 사용. 더미 데이터는 더 이상 안 씀 -> state가 없으면
  // (새로고침, 직접 URL 진입 등) 결과를 못 그리니 안내 화면으로 대체.
  const apiResultData = location.state?.resultData;
  const resolvedData = data || (apiResultData ? mapApiResponseToResultView(apiResultData) : null);

  if (!resolvedData) {
    return (
      <div className="result-page-container">
        <header className="result-header">
          <NavBar />
        </header>
        <div className="result-empty-wrap">
          <p className="result-empty-title">결과를 불러올 수 없어요</p>
          <p className="result-empty-desc">
            새로고침했거나 잘못된 경로로 들어오면 결과 데이터가 사라져요.
            <br />
            증권·약관 업로드부터 다시 진행해주세요.
          </p>
          <button
            className="result-empty-btn"
            type="button"
            onClick={() => navigate('/upload')}
          >
            처음부터 다시 하기
          </button>
        </div>
      </div>
    );
  }

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
              tone={item.tone}
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