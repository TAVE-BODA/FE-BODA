# BODA FE
BODA FE의 디자인 시스템 수정사항을 업로드한 브랜치입니다. 

## 디자인 시스템

모든 색상, 폰트 크기, 굵기는 `src/index.css`의 CSS 변수로 관리.
새 컴포넌트 작업 시 특수한 컬러 사용을 제외하고 하드코딩 대신 반드시 아래 토큰을 사용.

### 배경 그라디언트

```css
background: var(--gradient-bg);
```

### 컬러 토큰

**메인 컬러**

| 변수 | 값 | 용도 |
|---|---|---|
| `--Main-00` | `#f8fdff` | 가장 연한 배경 |
| `--Main-01` | `#f1fbff` | 선택 상태 배경 |
| `--Main-02` | `#c5eeff` | |
| `--Main-03` | `#96dfff` | |
| `--Main-04` | `#63c3ff` | |
| `--Main-05` | `#229cff` | **Primary** — 버튼, 테두리, 강조 |
| `--Main-06` | `#057dee` | Hover 상태 |
| `--Main-07` | `#084cb2` | 버튼 텍스트 |
| `--Main-08` | `#0a356d` | Dark navy |

**그레이스케일**

| 변수 | 값 | 용도 |
|---|---|---|
| `--gray-white` | `#FFFFFF` | 카드, 버블 배경 |
| `--gray-01` | `#FBFBFB` | 인풋 배경 |
| `--gray-02` | `#F0F2F3` | 테두리, 비활성 배경 |
| `--gray-03` | `#CACDCF` | 구분선, 비활성 텍스트 |
| `--gray-04` | `#ADB1B4` | 플레이스홀더, 비활성 텍스트 |
| `--gray-05` | `#808386` | 서브 텍스트 |
| `--gray-06` | `#575A5F` | 보조 텍스트 |
| `--gray-07` | `#343537` | 기본 텍스트 |
| `--gray-08` | `#242527` | 진한 텍스트 |
| `--gray-black` | `#101010` | 제목, 강조 텍스트 |

### 타이포그래피 토큰

피그마 타이포 스케일을 참고하여 `font-size`와 `font-weight`를 조합해서 사용.

**폰트 크기**

| 변수 | 값 | 피그마 |
|---|---|---|
| `--text-display` | `48px` | Display |
| `--text-heading` | `40px` | Heading |
| `--text-title` | `36px` | Title |
| `--text-body1` | `24px` | Body1 |
| `--text-body2` | `20px` | Body2 |
| `--text-body3` | `16px` | Body3 |
| `--text-body4` | `14px` | Body4 |
| `--text-body5` | `12px` | Body5 |

**폰트 굵기**

| 변수 | 값 | 피그마 |
|---|---|---|
| `--weight-bold` | `700` | B |
| `--weight-semibold` | `600` | — |
| `--weight-medium` | `500` | M |
| `--weight-regular` | `400` | R |

**사용 예시**

```css
/* 피그마에서 Body2/M 으로 표기된 텍스트 */
.button {
  font-size: var(--text-body2);
  font-weight: var(--weight-medium);
}

/* 피그마에서 Heading/B 으로 표기된 텍스트 */
.page-title {
  font-size: var(--text-heading);
  font-weight: var(--weight-bold);
}
```

---

## 프로젝트 구조

```
src/
├── index.css             # 디자인 토큰 (전역 CSS 변수)
├── main.jsx              # 앱 진입점
├── App.jsx               # 라우팅
├── assets/               # 이미지 리소스
├── components/
│   ├── InsuranceModal.jsx
│   └── InsuranceModal.css
└── pages/
    ├── LoginPage.jsx / .css
    ├── HomePage.jsx / .css
    └── ChatPage.jsx / .css
```

---

## 로컬 실행

```bash
npm install
npm run dev
```
