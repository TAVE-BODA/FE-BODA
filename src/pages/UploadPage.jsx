import React, { useState, useCallback, useRef } from 'react';

import './UploadPage.css';
import Character from '../components/Character';
import NavBar from '../components/NavBar';
import logosImg from '../assets/images/home_bottomicon.png';
import uploadIconSrc from '../assets/icons/upload-icon.svg';

const STEP = {
  CERT_UPLOAD:     'cert-upload',
  CERT_ANALYZING:  'cert-analyzing',
  CERT_DONE:       'cert-done',
  TERMS_UPLOAD:    'terms-upload',
  TERMS_ANALYZING: 'terms-analyzing',
  TERMS_DONE:      'terms-done',
};

export default function UploadPage() {

  const [step, setStep] = useState(STEP.CERT_UPLOAD);
  const [certFiles, setCertFiles]   = useState([]);
  const [termsFiles, setTermsFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const isCert        = step.startsWith('cert');
  const isUpload      = step === STEP.CERT_UPLOAD    || step === STEP.TERMS_UPLOAD;
  const isAnalyzing   = step === STEP.CERT_ANALYZING || step === STEP.TERMS_ANALYZING;
  const isDone        = step === STEP.CERT_DONE      || step === STEP.TERMS_DONE;
  const activeFiles   = isCert ? certFiles : termsFiles;
  const setActiveFiles = isCert ? setCertFiles : setTermsFiles;
  const hasFiles      = activeFiles.length > 0;

  const addFiles = useCallback((incoming) => {
    setActiveFiles(prev => [...prev, ...Array.from(incoming)]);
  }, [setActiveFiles]);

  const removeFile = (index) => {
    setActiveFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop      = (e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };
  const handleFileChange = (e) => { addFiles(e.target.files); e.target.value = ''; };

  const handleAnalyze = async () => {
    const nextAnalyzing = isCert ? STEP.CERT_ANALYZING : STEP.TERMS_ANALYZING;
    const nextDone      = isCert ? STEP.CERT_DONE      : STEP.TERMS_DONE;
    setStep(nextAnalyzing);
    try {
      const formData = new FormData();
      activeFiles.forEach(f => formData.append('files', f));
      // await api.post(isCert ? '/upload/cert' : '/upload/terms', formData);
      await new Promise(r => setTimeout(r, 2000)); // TODO: 실제 API 호출로 교체
      setStep(nextDone);
    } catch {
      setStep(isCert ? STEP.CERT_UPLOAD : STEP.TERMS_UPLOAD);
    }
  };

  const handlePopupNext = () => {
    if (step === STEP.CERT_DONE)  setStep(STEP.TERMS_UPLOAD);
    if (step === STEP.TERMS_DONE) { /* TODO: 결과 페이지로 이동 */ }
  };

  return (
    <div className="upload-page">

      <header className="upload-header">
        <NavBar />
      </header>

      {isUpload && (
        <main className="upload-main">
          {/* 홈페이지와 동일한 캐릭터+타이틀 영역 */}
          <div className="upload-character-area">
            <Character size="lg" animate />
          </div>
          <h1 className="upload-title">
            내 보험, <span className="upload-title__highlight">보다</span>에게 물어봐요
          </h1>
          <p className="upload-subtitle">
            <strong>{isCert ? '보험증권' : '보험약관'}</strong>을 업로드해주세요
          </p>

          {/* 업로드 박스 */}
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
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {!hasFiles ? (
              <div className="upload-box__empty" onClick={() => fileInputRef.current?.click()}>
                <img src={uploadIconSrc} alt="업로드" className="upload-box__icon" />
                <div className="upload-box__empty-text">
                  <p className="upload-box__drop-text">파일을 여기에 드롭하세요</p>
                  <p className="upload-box__hint">또는 클릭하여 파일 선택 &middot; 최대 20MB</p>
                </div>
              </div>
            ) : (
              <div className="upload-box__content">
                <div className="upload-box__files">
                  <button
                    className="upload-box__add-btn"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="파일 추가"
                  >
                    +
                  </button>
                  {activeFiles.map((file, i) => (
                    <FileThumb key={i} file={file} onRemove={() => removeFile(i)} />
                  ))}
                </div>
                <div className="upload-box__bottom">
                  <p className="upload-box__notice">파일을 골랐어요! 분석 후 바로 삭제돼요</p>
                  <button className="upload-box__submit" onClick={handleAnalyze} aria-label="분석 시작">
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
          <Character size="md" animate />
          <h2 className="upload-analyzing__title">
            {isCert ? '보험증권' : '보험약관'}을 분석하고 있어요
          </h2>
          <p className="upload-analyzing__desc">잠시만 기다려주세요...</p>
          <span className="upload-spinner" />
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
            <button className="upload-popup__btn" onClick={handlePopupNext}>
              {step === STEP.TERMS_DONE ? '결과 보러가기' : '다음으로'}
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
    () => file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
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
      {preview
        ? <img src={preview} alt={file.name} className="file-thumb__preview" />
        : <div className="file-thumb__placeholder" />
      }
    </div>
  );
}
