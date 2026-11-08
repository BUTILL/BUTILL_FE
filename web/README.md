# BUTILL 상세 분석 웹

앱과 독립적으로 실행하고 배포하는 반응형 상세 시뮬레이션 웹입니다. 저장소는 공유하지만 별도 Vite 프로젝트로 분리했습니다.

## 로컬 실행

이 폴더에서 다음 명령을 실행합니다.

    npm install
    npm run dev

웹 주소는 http://localhost:5174 입니다. 자금 분석 홈과 /raw-materials 원재료비 상세 분석을 제공하며, 현재 데이터는 예시 값입니다.

## 앱 연결

웹에서 앱으로 돌아가는 주소는 .env.local 의 VITE_BUTILL_APP_URL 로 설정합니다. 로컬 개발 기본값은 http://localhost:5173 입니다. 폰 테스트는 컴퓨터의 로컬 IP를 사용하고, 실제 설치 앱을 만들면 Android App Link, iOS Universal Link 또는 앱 딥링크를 설정합니다.

## 별도 배포

호스팅 서비스에서 web 폴더를 프로젝트 루트로 지정합니다. 빌드 명령은 npm run build 이고, 결과물은 web/dist 에 생성됩니다. 앱 프로젝트의 VITE_SIMULATION_ANALYSIS_URL 은 웹 홈 주소로, VITE_RAW_MATERIALS_WEB_URL 은 웹 주소 뒤에 /raw-materials 를 붙여 지정합니다.

앱과 웹은 향후 같은 백엔드 API와 DB를 사용할 수 있습니다. 실제 연결 전까지 화면에는 예시 데이터가 표시됩니다.
