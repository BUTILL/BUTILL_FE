# BUTILL 프론트엔드

앱과 상세 분석 웹을 한 저장소에서 관리하지만, 각각 별도의 Vite 앱으로 실행하고 배포할 수 있습니다. 데이터 API와 DB는 백엔드에서 두 프론트엔드가 함께 사용하도록 연결합니다.

## 앱 실행

프로젝트 루트에서 다음 명령을 실행합니다.

    npm install
    npm run dev

기본 주소는 http://localhost:5173 입니다.

## 상세 분석 웹 실행

별도 터미널에서 다음 명령을 실행합니다.

    cd web
    npm install
    npm run dev

기본 주소는 http://localhost:5174 입니다. 웹 프로젝트 설명은 web/README.md 를 참고하세요.

앱의 시뮬레이션과 원재료비 요약 화면은 루트의 .env.local 에서 VITE_SIMULATION_ANALYSIS_URL, VITE_RAW_MATERIALS_WEB_URL 로 웹 주소를 지정합니다. 로컬 기본값은 http://localhost:5174 이고, 원재료비 상세 경로는 /raw-materials 입니다. 폰으로 테스트할 때는 localhost 대신 컴퓨터의 로컬 IP를 사용해야 합니다.

웹에서 앱으로 돌아가는 주소는 web/.env.local 의 VITE_BUTILL_APP_URL 로 지정합니다. 실제 설치 앱에서는 앱 링크 또는 딥링크로 설정합니다.

현재 화면 데이터는 예시 값이며, API와 DB는 아직 연결되지 않았습니다.
