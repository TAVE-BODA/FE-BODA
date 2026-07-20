import React, { useCallback, useRef, useState, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import '../pages/UploadPage.css';
import Character from '../components/Character';
import NavBar from '../components/NavBar';
import logosImg from '../assets/images/home_bottomicon.png';
import uploadIconSrc from '../assets/icons/upload-icon.svg';
import { uploadPolicy, checkPolicyStatus, pollUntilDone } from '../api/upload';

// 로티 라이브러리 + 애니메이션 JSON은 분석 중 화면에서만 필요해서
// 별도 청크로 분리해 초기 번들에 포함되지 않도록 지연 로딩합니다.
const AnalyzingLottie = lazy(() => import('../components/AnalyzingLottie'));

const MAX_FILES = 3;

const STEP = {
  UPLOAD:     'upload',
  ANALYZING:  'analyzing',
  DONE:       'done',
};

export default function UploadOverviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { chatSessionId } = location.state || {};

  const [step, setStep] = useState(STEP.UPLOAD);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [failedFiles, setFailedFiles] = useState([]); // 배치 업로드 중 실패한 파일명 기록용 상태 추가
  const [showBeneficiaryConfirm, setShowBeneficiaryConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const hasFiles = files.length > 0;

  const addFiles = useCallback((incoming) => {
    const nextFiles = Array.from(incoming);
    setFiles((prev) => [...prev, ...nextFiles].slice(0, MAX_FILES));
  }, []);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver   = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave  = ()  => setIsDragging(false);
  const handleDrop       = (e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };
  const handleFileChange = (e) => { addFiles(e.target.files); e.target.value = ''; };

  // 배치 업로드가 단건 업로드로 롤백돼서, 파일마다 순서대로 업로드+분석 폴링
  const handleAnalyze = async () => {
    setStep(STEP.ANALYZING);
    setIsLoading(true);
    setFailedFiles([]); // 실패 목록 초기화

    try {
      const succeededIds = [];
      const failedNames = [];

      setProgress({ current: 0, total: files.length });
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const raw = await uploadPolicy(file, chatSessionId);
          const analysisId = raw?.id ?? raw?.analysisId;
          if (analysisId == null) throw new Error('증권 분석 응답 구조를 이해할 수 없어요.');
          await pollUntilDone(checkPolicyStatus, analysisId, 5000, 120);
          succeededIds.push(analysisId);
        } catch {
          failedNames.push(file.name);
        }
        setProgress({ current: i + 1, total: files.length });
      }

      // 모든 파일이 실패한 경우 예외 처리
      if (succeededIds.length === 0) {
        const names = failedNames.join(', ');
        throw new Error(`업로드한 증권을 분석할 수 없었어요${names ? ` (${names})` : ''}. 다시 시도해주세요.`);
      }

      // 실패 파일이 있다면 상태에 기록하여 팝업에서 보여줄 수 있도록 함
      if (failedNames.length > 0) {
        setFailedFiles(failedNames);
      }

      setStep(STEP.DONE);
    } catch (error) {
      console.error('업로드 오류:', error);
      alert(error.message || '업로드 중 오류가 발생했어요. 다시 시도해주세요.');
      setStep(STEP.UPLOAD);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopupNext = () => {
    navigate(`/result/summary/${chatSessionId}`);
  };

  const handleSubmitClick = () => setShowBeneficiaryConfirm(true);

  const handleBeneficiaryConfirmYes = () => {
    setShowBeneficiaryConfirm(false);
    handleAnalyze();
  };

  return (
    <div className="upload-page">

      <header className="upload-header">
        <NavBar />
      </header>

      {step === STEP.UPLOAD && (
        <main className="upload-main">
          <div className="upload-character-area">
            <Character size="lg" animate />
          </div>
          <h1 className="upload-title">
            내 보험, <span className="upload-title__highlight">보다</span>에게 물어봐요
          </h1>
          <p className="upload-subtitle">
            <strong>보험증권</strong>을 최대 {MAX_FILES}개까지 업로드해주세요
          </p>

          <div
            className={[
              'upload-box',
              isDragging && 'upload-box--dragging',
              hasFiles   && 'upload-box--has-files',
            ].filter(Boolean).join(' ')}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {!hasFiles ? (
              <div className="upload-box__empty" onClick={() => fileInputRef.current?.click()}>
                <img src={uploadIconSrc} alt="업로드" className="upload-box__icon" />
                <div className="upload-box__empty-text">
                  <p className="upload-box__drop-text">파일을 여기에 드롭하세요</p>
                  <p className="upload-box__hint">또는 클릭하여 파일 선택 &middot; PDF만 가능 &middot; 최대 {MAX_FILES}개</p>
                </div>
              </div>
            ) : (
              <div className="upload-box__content">
                <div className="upload-box__files">
                  {files.length < MAX_FILES && (
                    <button
                      className="upload-box__add-btn"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="파일 추가"
                    >
                      +
                    </button>
                  )}
                  {files.map((file, i) => (
                    <FileThumb key={i} file={file} onRemove={() => removeFile(i)} />
                  ))}
                </div>
                <div className="upload-box__bottom">
                  <p className="upload-box__notice">파일을 골랐어요! 분석 후 바로 삭제돼요</p>
                  <button
                    className="upload-box__submit"
                    onClick={handleSubmitClick}
                    disabled={isLoading}
                    aria-label="분석 시작"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 15V5M10 5L5 10M10 5L15 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {step === STEP.ANALYZING && (
        <main className="upload-main upload-main--analyzing">
          <div className="upload-analyzing__top">
            <Suspense fallback={<div className="upload-analyzing__lottie" />}>
              <AnalyzingLottie className="upload-analyzing__lottie" />
            </Suspense>
            <h2 className="upload-analyzing__title">
              <span className="upload-analyzing__highlight">보다</span>가 열심히 읽고 있어요
            </h2>
            <p className="upload-analyzing__notice">
              {progress.total > 1 && `${progress.current}/${progress.total}번째 증권 분석 중이에요. `}
              분량이 많으면 분석에 최대 10분 정도 걸릴 수 있어요.
              <br />
              창을 닫지 말고 잠시만 기다려주세요!
            </p>
          </div>
          <div className="upload-analyzing__doc-card">
            <p className="upload-analyzing__doc-title">보험 증권</p>
            <div className="upload-analyzing__skeleton-group">
              <div className="upload-analyzing__skeleton upload-analyzing__skeleton--short" />
              <div className="upload-analyzing__skeleton upload-analyzing__skeleton--long" />
              <div className="upload-analyzing__skeleton upload-analyzing__skeleton--mid" />
            </div>
          </div>
        </main>
      )}

      {step === STEP.DONE && (
        <div className="upload-popup-overlay">
          <div className="upload-popup">
            <Character size="sm" />
            <h2 className="upload-popup__title">보험증권 분석이 끝났어요!</h2>
            <p className="upload-popup__desc">보장 항목을 한눈에 확인할 수 있어요</p>
            
            {/* 일부 파일 분석 실패 시 경고 문구 노출 (두 번째 코드 스타일) */}
            {failedFiles.length > 0 && (
              <p className="upload-popup__desc" style={{ color: '#D64545', marginTop: '4px', fontSize: '14px' }}>
                {failedFiles.join(', ')} 파일은 분석에 실패했어요. 나머지는 정상 반영됐어요.
              </p>
            )}

            <button className="upload-popup__btn" onClick={handlePopupNext}>
              결과 보러가기
            </button>
          </div>
        </div>
      )}

      {showBeneficiaryConfirm && (
        <div className="upload-popup-overlay">
          <div className="upload-popup">
            <Character size="sm" />
            <h2 className="upload-popup__title">증권마다 보장받는 사람이 같나요?</h2>
            <p className="upload-popup__desc">
              증권 여러 개는 보장받는 사람이 같아야 함께 분석할 수 있어요.<br />
              계약자가 아니라 실제로 보장받는 사람 기준이에요.
            </p>
            <div className="upload-popup__btn-group">
              <button className="upload-popup__btn" onClick={handleBeneficiaryConfirmYes}>
                네, 모두 같아요
              </button>
              <button
                className="upload-popup__btn upload-popup__btn--secondary"
                onClick={() => setShowBeneficiaryConfirm(false)}
              >
                아니요, 다시 고를게요
              </button>
            </div>
          </div>
        </div>
      )}

      {step === STEP.UPLOAD && (
        <footer className="upload-footer">
          <p className="upload-footer__notice">
            BODA가 정확하게 분석할 수 있는 보험사는 아래와 같아요
            <span className="upload-footer__info-badge">!</span>
          </p>
          <img src={logosImg} alt="지원 보험사 로고 목록" className="upload-footer__logos" />
        </footer>
      )}

    </div>
  );
}

function FileThumb({ file, onRemove }) {
  const preview = React.useMemo(
    () => (file.type.startsWith('image/') || file.type === 'application/pdf')
      ? URL.createObjectURL(file)
      : null,
    [file]
  );

  React.useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  return (
    <div className="file-thumb">
      <button className="file-thumb__remove" onClick={onRemove} aria-label="파일 제거">
        &times;
      </button>
      {file.type.startsWith('image/') && preview
        ? <img src={preview} alt={file.name} className="file-thumb__preview" />
        : file.type === 'application/pdf' && preview
          ? <embed src={preview} type="application/pdf" className="file-thumb__preview" />
          : <div className="file-thumb__placeholder" />
      }
    </div>
  );
}