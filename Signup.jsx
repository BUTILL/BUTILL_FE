import { useState } from "react";
import "../css/Signup.css";
import eye from "../eye-regular-full.svg";
import eyeSlash from "../eye-slash-regular-full.svg";

function Signup({ setPage, setLoginId }) {
  const [name, setName] = useState("");
  const [signupId, setSignupId] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordCheck, setSignupPasswordCheck] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  // 회원가입
  const handleSignup = () => {
    const newErrors = {};

    // 이름 입력 확인
    if (!name.trim()) {
      newErrors.name = true;
    }

    // 아이디 또는 이메일 입력 확인
    if (!signupId.trim()) {
      newErrors.signupId = true;
    }

    // 비밀번호 입력 확인
    if (!signupPassword) {
      newErrors.signupPassword = true;
    }

    // 비밀번호 확인 입력 확인
    if (!signupPasswordCheck) {
      newErrors.signupPasswordCheck = true;
    }

   // 입력하지 않은 항목이 있는 경우
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setErrorMessage("모든 항목을 입력해주세요.");
      return;
    }

    // 비밀번호 형식 확인
    const passwordRule =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRule.test(signupPassword)) {
      setErrors({ signupPassword: true });
      setErrorMessage("");
      return;
    }

    // 비밀번호 일치 확인
    if (signupPassword !== signupPasswordCheck) {
      setErrors({
        signupPassword: true,
        signupPasswordCheck: true,
        passwordMismatch: true,
      });

      setErrorMessage("");
      return;
    }

    // 이용약관 동의 확인
    if (!agreeTerms) {
      setErrors({});
      setErrorMessage("이용약관 및 개인정보 처리방침에 동의해주세요.");
      return;
    }

    // 오류 초기화
    setErrors({});
    setErrorMessage("");

    // 회원가입 정보 저장 (임시 프론트엔드 테스트용)
    localStorage.setItem("userId", signupId);
    localStorage.setItem("userPassword", signupPassword);

    // 로그인 아이디 전달
    setLoginId(signupId);

    // 회원가입 완료 스낵바 표시
    setShowSnackbar(true);

    // 1초 후 로그인 화면으로 이동
    setTimeout(() => {
      setPage("login");
    }, 1000);
  };


  // 회원가입 화면
  return (
    <div className="app-background">
      <div className="phone-container">

        <header className="top-bar">
          <button
            className="icon-button"
            onClick={() => setPage("login")}
          >
            ←
          </button>

          <h1>회원가입</h1>

          <div className="empty-space"></div>
        </header>

        <main className="signup-content">
          <h2>계정을 만들어주세요</h2>

          <p className="signup-description">
            BUTILL을 이용하기 위한 계정을 생성합니다.
          </p>

          <div className="form-group">
            <label>이름</label>

            <div className={`input-box ${errors.name ? "input-error" : ""}`}>
              <span className="input-icon">♙</span>

              <input
                type="text"
                placeholder="이름을 입력해주세요"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: false }));
                  setErrorMessage("");
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>아이디 또는 이메일</label>

            <div className={`input-box ${errors.signupId ? "input-error" : ""}`}>
              <span className="input-icon">✉</span>

              <input
                type="text"
                placeholder="아이디 또는 이메일 입력"
                value={signupId}
                onChange={(e) => {
                  setSignupId(e.target.value);
                  setErrors((prev) => ({ ...prev, signupId: false }));
                  setErrorMessage("");
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>비밀번호</label>

            <div className={`input-box ${errors.signupPassword ? "input-error" : ""}`}>
              <span className="input-icon">🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호 입력"
                value={signupPassword}
                onChange={(e) => {
                  setSignupPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, signupPassword: false 
                  }));
                  setErrorMessage("");
                }}
              />

              <button
                type="button"
                className="password-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                <img
                src={showPassword ? eye : eyeSlash}
                alt=""
                />
              </button>
            </div>

            {/* 비밀번호 안내 및 오류 문구 */}
            {errors.passwordMismatch ? (
              <p className="password-error-message">
                ⓘ 비밀번호가 일치하지 않습니다.
              </p>
            ) : errors.signupPassword && signupPassword !== "" ? (
              <p className="password-error-message">
                ⓘ 비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요.
              </p>
            ) : (
              <p className="password-description">
                ⓘ 영문, 숫자, 특수문자 조합 8자 이상
              </p>
            )}
          </div>


          {/*비밀번호 확인*/}
          <div className="form-group">
            <label>비밀번호 확인</label>

            <div
            className={`input-box ${
              errors.signupPasswordCheck ? "input-error" : ""
            }`}
            >
              <span className="input-icon">🔒</span>

              <input
                type={showPasswordCheck ? "text" : "password"}
                placeholder="비밀번호 다시 입력"
                value={signupPasswordCheck}
                onChange={(e) => {
                  setSignupPasswordCheck(e.target.value);
                  setErrors((prev) => ({ 
                    ...prev, 
                    signupPasswordCheck: false,
                    passwordMismatch: false,
                  }));
                  setErrorMessage("");
                }}
              />

              <button
                type="button"
                className="password-eye"
                onClick={() =>
                  setShowPasswordCheck(!showPasswordCheck)
                }
                aria-label={showPasswordCheck ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
              >
                <img
                  src={showPasswordCheck ? eye : eyeSlash}
                  alt=""
                />
              </button>
            </div>
          </div>

          <div className="terms-box">
            <label className="terms-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />

              <span>
                이용약관 및 개인정보 처리방침에 동의합니다{" "}
                <button
                  type="button"
                  className="terms-detail"
                >
                  약관보기
                </button>
              </span>
            </label>
          </div>


          {/* 회원가입 오류 메시지 */}
          {errorMessage && (
            <div className="signup-error-box" role="alert">
              <span className="signup-error-icon">!</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/*회원가입 완료 버튼*/}
          <button
            className={`main-button signup-button ${
              showSnackbar ? "signup-complete" : ""
            }`}
            onClick={handleSignup}
          >
            회원가입 완료 →
          </button>
        </main>

        {showSnackbar && (
          <div className="signup-snackbar">
            <span className="snackbar-icon">✓</span>
            <span>회원가입이 완료되었습니다</span>
          </div>
        )}

      </div>
    </div>
  );
}

export default Signup;
   