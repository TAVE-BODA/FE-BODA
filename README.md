# FE-BODA

### 브랜치 관리 

본 프로젝트는 저장소를 안정적으로 관리하기 위해 기능별로 브랜치를 분리하여 사용합니다.

### 주요 브랜치 
* **`main`**: 제품으로 출시될 수 있는 가장 안정적인 최신 상용화 버전 브랜치
* **`develop`**: 다음 출시 버전을 개발하는 중심 브랜치로, 모든 기능 개발 브랜치의 기반 

### 기능 브랜치 
새로운 작업은 항상 `develop` 브랜치로부터 생성하며, 작업이 완료되면 `develop` 브랜치로 Pull Request(PR)를 보냅니다.

| 브랜치 접두사 | 설명 | 예시 |
| :--- | :--- | :--- |
| `feature/` | 새로운 기능 개발 및 UI 구현 | `feature/login`, `feature/signup` |
| `fix/` | 버그 수정 | `fix/login-error` |
| `refactor/` | 코드 리팩토링 (기능 변화 없음) | `refactor/auth-context` |
| `chore/` | 빌드 업무 수정, 패키지 매니저 설정 등 | `chore/install-axios` |
| `docs/` | 문서 수정 (README 등) | `docs/update-readme` |

---

## 프로젝트 폴더 구조

```text
src/
├── assets/          # 이미지, 폰트, 아이콘 등 정적 파일
│   └── images/
├── components/      # 여러 페이지에서 재사용되는 공용 UI 컴포넌트
├── pages/           # 라우팅의 기준이 되는 페이지 단위 컴포넌트
│   ├── Page.jsx
│   └── pages.css
├── styles/          # 전역 스타일 및 테마 설정
├── App.jsx          # 최상위 라우터 및 프로바이더 설정
└── main.jsx         # 애플리케이션 진입점 (Entry Point)
