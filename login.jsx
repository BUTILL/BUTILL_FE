import { useState } from "react";
import "../css/Login.css";
import logo from "../logo.png";
import eye from "../eye-regular-full.svg";
import eyeSlash from "../eye-slash-regular-full.svg";

function Login({ setPage }) {

  // 로그인 입력값
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [keepLogin, setKeepLogin] = useState(false);
  const [loginError, setLoginError] = useState(false);

  // 로그인
  const handleLogin = () => {
    const savedId = localStorage.getItem("userId");
    const savedPassword = localStorage.getItem("userPassword");

    if (!loginId || !loginPassword) {
      setLoginError(true);
      return;
    }

    if (loginId === savedId && loginPassword === savedPassword) {
      setLoginError(false);
      
      localStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("isLoggedIn");

      // 로그인 상태 유지 여부 확인
      if (keepLogin) {
        localStorage.setItem("isLoggedIn", "true");
      } else {
        sessionStorage.setItem("isLoggedIn", "true");
      }

      setShowSnackbar(true);
      
      setTimeout(() => {
      setPage("Information");
    }, 1000);

    } else {
      setLoginError(true);
    }
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
                아이디 또는 비밀번호가 일치하지 않습니다. 
                <br/>
                다시 확인해 주세요.
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
export default Login;
