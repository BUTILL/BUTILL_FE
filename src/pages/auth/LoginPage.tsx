import { useState } from "react";
import type { SetPage } from "../../types/navigation";
import { AUTH_CONFIG_MESSAGE, auth, setRememberLogin } from "../../lib/api";
import "./LoginPage.css";
import logo from "../../assets/logo.png";
import eye from "../../assets/eye-regular-full.svg";
import eyeSlash from "../../assets/eye-slash-regular-full.svg";

type LoginPageProps = {
  setPage: SetPage;
  // 로그인 성공 후 다음 화면 결정 (App에서 경영정보 유무로 판단)
  onLoggedIn: () => void;
};

const DEFAULT_LOGIN_ERROR = "아이디 또는 비밀번호가 일치하지 않습니다. \n다시 확인해 주세요.";

function LoginPage({ setPage, onLoggedIn }: LoginPageProps) {

  // 로그인 입력값
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [keepLogin, setKeepLogin] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const [loginErrorMessage, setLoginErrorMessage] = useState(DEFAULT_LOGIN_ERROR);
  const [busy, setBusy] = useState(false);

  // 로그인
  const handleLogin = async () => {
    if (busy) return;

    if (!loginId || !loginPassword) {
      setLoginErrorMessage(DEFAULT_LOGIN_ERROR);
      setLoginError(true);
      return;
    }

    if (!auth) {
      setLoginErrorMessage(AUTH_CONFIG_MESSAGE);
      setLoginError(true);
      return;
    }

    setBusy(true);
    // 로그인 상태 유지 여부 확인
    setRememberLogin(keepLogin);
    const { error } = await auth.auth
      .signInWithPassword({ email: loginId.trim(), password: loginPassword })
      .catch(() => ({ error: { status: 0, code: "network" } }));
    setBusy(false);

    if (error) {
      setLoginErrorMessage(
        error.code === "email_not_confirmed"
          ? "메일에서 가입 인증을 완료한 뒤 로그인해주세요."
          : error.status === 429
            ? "요청이 많습니다. 잠시 후 다시 시도해주세요."
            : error.status === 0
              ? "서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요."
              : DEFAULT_LOGIN_ERROR,
      );
      setLoginError(true);
      return;
    }

    setLoginError(false);
    setShowSnackbar(true);

    setTimeout(() => {
      onLoggedIn();
    }, 1000);
  };

  //로그인 화면
  return (
    <div className="app-background">
      <div className="phone-container">

        <main className="login-content">

          <div className="logo">
            <img src={logo} alt="BUTILL 로고" />
          </div>

          <p className="description">
            서비스를 이용하려면 로그인해 주세요
          </p>

          <div className="form-group">
            <label>아이디 또는 이메일</label>

            <div className={`input-box ${loginError ? "input-error" : ""}`}>
              <span className="input-icon">✉</span>

              <input
                type="text"
                placeholder="아이디 또는 이메일 입력"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  setLoginError(false);
                }}
              />
              {loginError && (
                <span className="error-icon">⊗</span>
              )}
            </div>
          </div>


          <div className="form-group">
            <label>비밀번호</label>

            <div className={`input-box ${loginError ? "input-error" : ""}`}>
              <span className="input-icon">🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호 입력"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setLoginError(false);
                }}
              />

              <button
              type="button"
              className="password-button"
              onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <img src={eyeSlash} alt="비밀번호 숨기기" />
                  ) : (
                    <img src={eye} alt="비밀번호 보기" />
                  )}
                </button>
            </div>
          </div>

          <div className="login-options">

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={keepLogin}
                onChange={(e) => setKeepLogin(e.target.checked)}
              />
              로그인 상태 유지
            </label>

            <div className="find-Id">
              <button>아이디 찾기</button>
              <span>|</span>
              <button>비밀번호 찾기</button>
            </div>

          </div>

          <button
            className="main-button"
            onClick={handleLogin}
          >
            로그인&nbsp;&nbsp; ↪
          </button>

          {/* 로그인 오류 메시지 */}
          {loginError && (
            <div className="login-error-message">
              <span className="login-error-icon">ⓘ</span>
              <span>
                {loginErrorMessage.split("\n").map((line, i) => (
                  <span key={i}>{i > 0 && <br />}{line}</span>
                ))}
              </span>
            </div>
          )}

          <div className="signup-area">
            <span>아직 회원이 아니신가요?</span>

            <button
              type="button"
              onClick={() => setPage("Signup")}
            >
              회원가입
            </button>
          </div>
        </main>

        {/* 로그인 성공 스낵바 */}
        {showSnackbar && (
          <div className="login-snackbar">
            <span className="snackbar-icon">✓</span>

            <span className="snackbar-message">
              로그인이 완료되었습니다
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
export default LoginPage;