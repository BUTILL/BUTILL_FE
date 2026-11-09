# BUTILL App

서울 지역 외식업 소상공인을 위한 현금흐름·Cash Runway 관리 모바일 웹앱 (React 19 + Vite + TypeScript).

## 실행

```bash
npm install
npm run dev        # 개발 서버
npm run build      # 타입 검사 + 빌드
npm run typecheck  # 타입 검사만
npm run lint       # ESLint
npm run dev:web    # 상세 분석 웹 (web/, http://localhost:5174)
```

로컬 백엔드(`BUTILL_BE`)는 `http://127.0.0.1:8000`에서 실행하면 개발 서버가 `/api` 요청을 전달합니다.
환경변수는 `.env.example`을 복사해 `.env`로 만들어 사용합니다.

## 상세 분석 웹 (`web/`)

앱의 시뮬레이션·원재료·세금 화면에서 "자세히" 버튼으로 여는 반응형 웹입니다. 앱과 별도 Vite 프로젝트이며(`web/package.json`), 처음 한 번 `cd web && npm install`이 필요합니다.
같은 내용이 `C:\Projects\BUTILL_WEB`에도 복사되어 있습니다(두 폴더는 서로 동기화되지 않음).
페이지: `/` 시뮬레이션 상세, `/raw-materials` 원재료비 상세, `/tax` 세금 상세. 화면 데이터는 아직 예시 값입니다.

## 폴더 구조

```
src/
├── main.tsx               # 진입점
├── App.tsx                # 최상위 화면 전환 (로그인 → 온보딩 → 홈)
├── index.css              # 전역 스타일
├── assets/                # 번들되는 이미지 (logo, icons/)
├── components/            # 공용 컴포넌트 (Icon, Toast)
├── data/                  # 백엔드 연결 전 예시 데이터 (bills, sampleCashFlow, taxOptions)
├── lib/                   # 화면과 무관한 로직 (cashflow 계산)
├── types/                 # 공용 타입 (화면 이름)
└── pages/
    ├── auth/              # 로그인, 회원가입
    ├── onboarding/        # 사업장 정보 → 자금 정보 → 서비스 소개
    ├── cashflow/          # 계산 중 화면, Cash Runway 결과
    ├── management/        # 입력/관리 탭 (원재료·지출·매출)
    ├── HomeShell.tsx      # 홈 이후 공통 레이아웃 (상단바·하단 탭) 및 화면 전환
    └── *Page.tsx          # 홈, 가이드, 알림, 캘린더, 세금, 원재료 시세, 지원사업, 시뮬레이션, 설정
```

각 화면의 스타일은 같은 이름의 `.css` 파일에 있습니다. `public/`에는 경로(`/figma/...` 등)로 직접 참조하는 이미지가 있습니다.

## 참고

- 백엔드: [BUTILL/BUTILL_BE](https://github.com/BUTILL/BUTILL_BE) (FastAPI + Supabase).
  - 로그인·회원가입·회원탈퇴: Supabase Auth (탈퇴는 RPC `delete_own_account`)
  - 온보딩·입력/관리(원재료비·고정/추가 지출·월 매출)·설정(자금): `PUT /stores/{id}/finances`
  - 설정(대표자·업종·상권): Supabase 사용자 정보 + `PATCH /stores/{id}`
  - 홈·Cash Runway: `/analyses/preview`, 계산 화면은 `POST /stores/{id}/analyses`
  - 시뮬레이션: `/scenarios/compare` (낙관 매출 +15%, 비관 매출 -15%·원재료비 +8%)
  - 원재료 시세: `/ingredient-prices` (KAMIS), 지원사업: `/support-programs` (기업마당)
  - 홈·캘린더 예정 지출: 저장된 고정 지출(지급일)·이번 달 추가 지출로 계산 (`src/lib/schedule.ts`)
  - 백엔드 API가 없는 화면: 세금 진단(화면 안에서만 유지), 알림(예시 문구), 상세 분석 웹(예시 데이터)
  - 매출 탭의 메뉴별·음료·기타 매출 상세는 기기(localStorage)에 저장하고, 월 합계만 서버에 저장
- 앱 화면 일부(시뮬레이션·원재료·세금·설정)는 BUTILL_FE `feature/dashboard-ui` 브랜치(2026-11-08) 버전을 반영했습니다.
