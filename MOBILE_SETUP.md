# Android 발표용 빌드

현재 React + Vite 화면을 Capacitor 8.5.3으로 Android에 포함한다.
앱 ID는 `com.butill.app`, 앱 이름은 `버틸`이다. 스토어 배포 전에는 팀에서 앱 ID를 확정한다.

## API와 인증 설정

`D:\Butill\Frontend\.env.local`의 기존 Supabase 공개 설정은 유지한다.
`.env.production.local`의 `VITE_API_BASE_URL=https://butill-api.onrender.com`을 APK 빌드에 사용한다. `/api/v1`은 붙이지 않는다. PC 개발은 `.env.local`에 API 주소를 두지 않고 로컬 프록시를 사용한다.
이 값이 비어 있으면 PC 개발은 Vite 프록시를 사용하고 Android는 연결 미설정 안내를 표시한다.
2026-10-27 HTTPS 서버 연결 APK 빌드 완료. 실제 휴대폰 검증은 아직 필요하다. 설치 파일: `D:\Butill\releases\butill-mvp-20261027.apk`.

`VITE_AUTH_REDIRECT_URL`은 이메일 인증 완료 후 이동할 공개 웹 주소로 설정한다.
같은 주소를 Supabase Auth Redirect URLs에 등록해야 한다.
네이티브 이메일 인증 복귀 딥링크는 아직 구성하지 않았다. 현재 발표 검증은 미리 인증된 테스트 계정의 이메일·비밀번호 로그인으로 진행한다.
서버의 Supabase 비밀 키를 VITE 변수에 넣으면 안 된다.

## 백엔드 배포

FastAPI 실행 명령:

```
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port $PORT --no-access-log
```

환경변수: `SUPABASE_URL`, `SUPABASE_KEY`, `BUTILL_ANALYSIS_ONLY=0`, `BUTILL_CORS_ORIGINS=https://localhost`.
Android의 로컬 화면 origin은 `https://localhost`이며 API 주소와 다르다.
웹 프론트도 별도 배포하면 그 HTTPS origin을 CORS 목록에 쉼표로 추가한다.
`GET /health`는 서버 상태만 확인한다. 실제 로그인·매장 조회·저장으로 DB 연결도 검증한다.

Render Free / Singapore에 `butill-api` 서비스를 배포했다. 서버: https://butill-api.onrender.com . 작업 브랜치: feature/mvp-analysis, 검토용 Draft PR: https://github.com/BUTILL/BUTILL_BE/pull/17 .
무료 Render는 15분 미사용 시 절전 상태가 될 수 있어 발표 전에 서버를 확인한다.

## 빌드

```
npm run android:apk
```

필요 시 `JAVA_HOME`은 Android Studio의 `jbr`, `android/local.properties`는 이 PC의 Android SDK 경로로 설정한다.
결과: `android/app/build/outputs/apk/debug/app-debug.apk`.
환경변수를 바꿀 때마다 웹 빌드·Capacitor 동기화·APK 재빌드가 필요하다.
개발용 debug 서명이며 스토어 제출용 서명은 아니다.

## 휴대폰 검증

USB 디버깅을 켜고 PC를 허용한 뒤 `adb devices`에서 기기를 확인한다.
APK 설치 후 테스트 계정 로그인, 입력 저장, 앱 종료·재실행 후 값 복원, 분석, 로그아웃을 확인한다.
서버 연결 및 실기기 검증이 끝나기 전에는 NFR-06, SEC-05를 완료로 표시하지 않는다.

## 2026-10-27 검증 결과

- 원격 HTTPS /health 정상
- 테스트 계정 로그인, 기존 입력값 보존 저장·재조회, 분석 저장·재조회 통과
- 인증 없는 경영정보 요청 401 확인
- 백엔드 테스트 40개, 프론트엔드 테스트 15개 통과
- APK에 HTTPS API 주소 포함 확인
- USB 기기 미연결: 설치·재실행·실기기 화면 검증은 남음
