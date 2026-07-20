import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import './UploadPage.css';
import Character from '../components/Character';
import NavBar from '../components/NavBar';
import logosImg from '../assets/images/home_bottomicon.png';
import uploadIconSrc from '../assets/icons/upload-icon.svg';
import { uploadPolicy, uploadTerms, checkPolicyStatus, checkTermsStatus, pollUntilDone } from '../api/upload';
import { sendInsuranceCondition } from '../api/chat';

const STEP = {
  CERT_UPLOAD:     'cert-upload',
  CERT_ANALYZING:  'cert-analyzing',
  CERT_DONE:       'cert-done',
  TERMS_UPLOAD:    'terms-upload',
  TERMS_ANALYZING: 'terms-analyzing',
  TERMS_DONE:      'terms-done',
};

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_FILE_TYPE = 'application/pdf';
const MAX_CERT_FILES = 3;

export default function UploadPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { chatSessionId, conditionData, selectedOption, skipCert } = location.state || {};

  const [step, setStep] = useState(skipCert ? STEP.TERMS_UPLOAD : STEP.CERT_UPLOAD);
  const [certFiles, setCertFiles]   = useState([]);
  const [termsFiles, setTermsFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [errorPopup, setErrorPopup] = useState(null);
  const [certProgress, setCertProgress] = useState({ current: 0, total: 0 });
  const [certFailedFiles, setCertFailedFiles] = useState([]);
  const [showMatchConfirm, setShowMatchConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const isCert      = step.startsWith('cert');
  const isUpload    = step === STEP.CERT_UPLOAD    || step === STEP.TERMS_UPLOAD;
  const isAnalyzing = step === STEP.CERT_ANALYZING || step === STEP.TERMS_ANALYZING;
  const isDone      = step === STEP.CERT_DONE      || step === STEP.TERMS_DONE;
  const activeFiles = isCert ? certFiles : termsFiles;
  const hasFiles    = activeFiles.length > 0;

  const showErrorPopup = (code, message) => setErrorPopup({ code, message });

  const addFiles = useCallback((incoming) => {
    const files = Array.from(incoming);
    if (files.length === 0) return;

    const invalidType = files.find((f) => f.type !== ACCEPTED_FILE_TYPE);
    if (invalidType) {
      showErrorPopup('INVALID_FILE_TYPE', '지원하지 않는 파일 형식이에요. PDF 파일만 업로드할 수 있어요.');
      return;
    }

    const tooLarge = files.find((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge) {
      showErrorPopup('FILE_TOO_LARGE', '파일 크기가 너무 커요. 15MB 이하의 PDF만 업로드할 수 있어요.');
      return;
    }

    if (step.startsWith('cert')) {
      if (certFiles.length + files.length > MAX_CERT_FILES) {
        showErrorPopup('POLICY_TOO_MANY_FILES', `보험증권은 최대 ${MAX_CERT_FILES}개까지 업로드할 수 있어요.`);
        return;
      }
      setCertFiles(prev => [...prev, ...files]);
    } else {
      if (termsFiles.length + files.length > 1) {
        showErrorPopup('TERMS_TOO_MANY_FILES', '약관 파일은 1개만 업로드할 수 있어요.');
        return;
      }
      setTermsFiles(prev => [...prev, ...files]);
    }
  }, [step, termsFiles, certFiles]);

  const removeFile = (index) => {
    if (isCert) {
      setCertFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setTermsFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDragOver   = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave  = ()  => setIsDragging(false);
  const handleDrop       = (e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };
  const handleFileChange = (e) => { addFiles(e.target.files); e.target.value = ''; };

  const handleAnalyze = async () => {
    const nextAnalyzing = isCert ? STEP.CERT_ANALYZING : STEP.TERMS_ANALYZING;
    const nextDone      = isCert ? STEP.CERT_DONE      : STEP.TERMS_DONE;
    setStep(nextAnalyzing);
    setIsLoading(true);

    try {
      if (isCert) {
        setCertFailedFiles([]);
        const succeededIds = [];
        const failedNames = [];

        setCertProgress({ current: 0, total: activeFiles.length });
        for (let i = 0; i < activeFiles.length; i++) {
          const file = activeFiles[i];
          try {
            const raw = await uploadPolicy(file, chatSessionId);
            const analysisId = raw?.id ?? raw?.analysisId;
            if (analysisId == null) throw new Error('증권 분석 응답 구조를 이해할 수 없어요.');
            await pollUntilDone(checkPolicyStatus, analysisId, 5000, 120);
            succeededIds.push(analysisId);
          } catch {
            failedNames.push(file.name);
          }
          setCertProgress({ current: i + 1, total: activeFiles.length });
        }

        if (succeededIds.length === 0) {
          const names = failedNames.join(', ');
          throw new Error(`업로드한 증권을 분석할 수 없었어요${names ? ` (${names})` : ''}. 다시 시도해주세요.`);
        }

        if (failedNames.length > 0) {
          setCertFailedFiles(failedNames);
        }
      } else {
        const { id } = await uploadTerms(activeFiles[0], chatSessionId);
        await pollUntilDone(checkTermsStatus, id, 5000, 180);
      }
      setStep(nextDone);
    } catch (error) {
      console.error('업로드 오류:', error);
      showErrorPopup(error.code, error.message || '업로드 중 오류가 발생했어요. 다시 시도해주세요.');
      setStep(isCert ? STEP.CERT_UPLOAD : STEP.TERMS_UPLOAD);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitClick = () => {
    setShowMatchConfirm(true);
  };

  const handleConfirmProceed = () => {
    setShowMatchConfirm(false);
    handleAnalyze();
  };

  const handleConfirmRecheck = () => {
    setShowMatchConfirm(false);
  };

  const handlePopupNext = async () => {
    if (step === STEP.CERT_DONE) {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setStep(STEP.TERMS_UPLOAD);
    }
    if (step === STEP.TERMS_DONE) {
      setIsLoading(true);
      try {
        const result = await sendInsuranceCondition(chatSessionId, conditionData, selectedOption);
        console.log('AI 응답:', result);
        navigate(`/result/option/${selectedOption}`, {
          state: { resultData: result, chatSessionId, conditionData },
        });
      } catch (error) {
        console.error('보험 조건 전송 오류:', error);
        alert('분석 중 오류가 발생했어요. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="upload-page">

      <header className="upload-header">
        <NavBar />
      </header>

      {isUpload && (
        <main className="upload-main">
          <div className="upload-character-area">
            <Character size="lg" animate />
          </div>
          <h1 className="upload-title">
            내 보험, <span className="upload-title__highlight">보다</span>에게 물어봐요
          </h1>
          <p className="upload-subtitle">
            <strong>{isCert ? '보험증권' : '보험약관'}</strong>을 {isCert ? `최대 ${MAX_CERT_FILES}개까지 ` : ''}업로드해주세요
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
                  <p className="upload-box__hint">또는 클릭하여 파일 선택 &middot; PDF만 가능{isCert ? ` · 최대 ${MAX_CERT_FILES}개` : ''}</p>
                </div>
              </div>
            ) : (
              <div className="upload-box__content">
                <div className="upload-box__files">
                  {(isCert ? activeFiles.length < MAX_CERT_FILES : activeFiles.length < 1) && (
                    <button
                      className="upload-box__add-btn"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="파일 추가"
                    >
                      +
                    </button>
                  )}
                  {activeFiles.map((file, i) => (
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

      {isAnalyzing && (
        <main className="upload-main upload-main--analyzing">
          <div className="upload-analyzing__top">
            <Character size="lg" animate />
            <h2 className="upload-analyzing__title">
              <span className="upload-analyzing__highlight">보다</span>가 열심히 읽고 있어요
            </h2>
            <p className="upload-analyzing__notice">
              {isCert && certProgress.total > 1 && `${certProgress.current}/${certProgress.total}번째 증권 분석 중이에요. `}
              분량이 많으면 분석에 최대 {isCert ? '10분' : '15분'} 정도 걸릴 수 있어요.
              <br />
              창을 닫지 말고 잠시만 기다려주세요!
            </p>
          </div>
          <div className="upload-analyzing__doc-card">
            <p className="upload-analyzing__doc-title">
              {isCert ? '보험 증권' : '보험 약관'}
            </p>
            <div className="upload-analyzing__skeleton-group">
              <div className="upload-analyzing__skeleton upload-analyzing__skeleton--short" />
              <div className="upload-analyzing__skeleton upload-analyzing__skeleton--long" />
              <div className="upload-analyzing__skeleton upload-analyzing__skeleton--mid" />
            </div>
            <div className="upload-analyzing__skeleton-group">
              <div className="upload-analyzing__skeleton upload-analyzing__skeleton--short" />
              <div className="upload-analyzing__skeleton upload-analyzing__skeleton--long" />
              <div className="upload-analyzing__skeleton upload-analyzing__skeleton--mid" />
            </div>
            <div className="upload-analyzing__skeleton-group">
              <div className="upload-analyzing__skeleton upload-analyzing__skeleton--short" />
              <div className="upload-analyzing__skeleton upload-analyzing__skeleton--long" />
              <div className="upload-analyzing__skeleton upload-analyzing__skeleton--mid" />
            </div>
          </div>
        </main>
      )}

      {isDone && (
        <div className="upload-popup-overlay">
          <div className="upload-popup">
            <Character size="sm" />
            <h2 className="upload-popup__title">
              {step === STEP.TERMS_DONE ? '증권, 약관 분석이 끝났어요!' : '보험증권 분석이 끝났어요!'}
            </h2>
            <p className="upload-popup__desc">
              {step === STEP.TERMS_DONE ? '이제 보험금을 확인할 수 있어요' : '이번엔 보험약관을 업로드해주세요'}
            </p>
            {step === STEP.CERT_DONE && certFailedFiles.length > 0 && (
              <p className="upload-popup__desc" style={{ color: '#D64545' }}>
                {certFailedFiles.join(', ')} 파일은 분석에 실패했어요. 나머지는 정상 반영됐어요.
              </p>
            )}
            <button
              className="upload-popup__btn"
              onClick={handlePopupNext}
              disabled={isLoading}
            >
              {isLoading ? '분석 중...' : step === STEP.TERMS_DONE ? '결과 보러가기' : '다음으로'}
            </button>
          </div>
        </div>
      )}

      {showMatchConfirm && (
        <div className="upload-popup-overlay">
          <div className="upload-popup">
            <Character size="sm" />
            <h2 className="upload-popup__title">보험사와 피보험자가 같나요?</h2>
            <p className="upload-popup__desc">
              증권과 약관은<br />
              같은 보험사, 같은 사람 것이어야 분석돼요<br />
              다시 한번 확인해봐요
            </p>
            <div className="upload-popup__btn-group">
              <button
                className="upload-popup__btn"
                onClick={handleConfirmProceed}
                disabled={isLoading}
              >
                확인했어요, 계속할게요
              </button>
              <button
                className="upload-popup__btn upload-popup__btn--secondary"
                onClick={handleConfirmRecheck}
                disabled={isLoading}
              >
                다시 확인할게요
              </button>
            </div>
          </div>
        </div>
      )}

      {errorPopup && (
        <div className="upload-popup-overlay">
          <div className="upload-popup">
            <Character size="sm" />
            <h2 className="upload-popup__title">업로드에 문제가 있어요</h2>
            <p className="upload-popup__desc">{errorPopup.message}</p>
            <button
              className="upload-popup__btn"
              onClick={() => setErrorPopup(null)}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {isUpload && (
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