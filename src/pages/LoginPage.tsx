import { useState, type FormEvent, type ReactNode } from "react";
import { auth, signUp } from "../lib/api";
import "./AccessFlow.css";
import "./AuthScreens.css";

export function FieldIcon({
  type,
}: {
  type: "user" | "mail" | "lock" | "eye";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {type === "user" ? (
        <>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21v-3a7 7 0 0 1 14 0v3z" />
        </>
      ) : type === "mail" ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 6 9 7 9-7" />
        </>
      ) : type === "lock" ? (
        <>
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
        </>
      ) : (
        <>
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

export function FlowHeader({
  title,
  onBack,
}: {
  title?: string;
  onBack: () => void;
}) {
  return (
    <header className={`flow-header ${title ? "" : "logo-header"}`}>
      <button type="button" aria-label="이전 화면" onClick={onBack}>
        ←
      </button>
      {title ? (
        <b>{title}</b>
      ) : (
        <div className="brand-logo" aria-label="BUTILL">
          <img src="/figma/brand-source.png" alt="" />
        </div>
      )}
      <span />
    </header>
  );
}

function InputShell({
  icon,
  invalid,
  children,
}: {
  icon: "user" | "mail" | "lock";
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={`access-input ${invalid ? "invalid" : ""}`}>
      <FieldIcon type={icon} />
      {children}
    </span>
  );
}

export default function LoginPage() {
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [checked, setChecked] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [remember, setRemember] = useState(
    localStorage.getItem("butill.remember") !== "false",
  );
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState("");
  const [busy, setBusy] = useState(false);
  const mismatch = signup && checked && password !== confirm;
  const weak =
    signup &&
    checked &&
    !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/.test(password);
  const changeMode = () => {
    setSignup(!signup);
    setMessage("");
    setNotice("");
    setPassword("");
    setConfirm("");
    setChecked(false);
    setVisible(false);
    setConfirmVisible(false);
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth || busy) return;
    setChecked(true);
    setMessage("");
    setNotice("");
    if (
      signup &&
      (password !== confirm ||
        !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/.test(password))
    )
      return;
    if (signup && !agreed) {
      setMessage("MVP 이용 안내를 확인하고 동의해주세요.");
      return;
    }
    setBusy(true);
    localStorage.setItem("butill.remember", String(remember));
    try {
      const result = signup
        ? await signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo:
                import.meta.env.VITE_AUTH_REDIRECT_URL ||
                window.location.origin,
              data: {
                display_name: name.trim(),
                demo_consent_version: "demo-v1",
                demo_consent_at: new Date().toISOString(),
              },
            },
          })
        : await auth.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error)
        setMessage(
          result.error.status === 429
            ? "요청이 많습니다. 잠시 후 다시 시도해주세요."
            : result.error.code === "email_not_confirmed"
              ? "메일에서 가입 인증을 완료한 뒤 로그인해주세요."
              : signup
                ? "가입하지 못했습니다. 입력한 정보를 확인해주세요."
                : "아이디 또는 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.",
        );
      else if (signup) {
        setSignup(false);
        setNotice(
          result.data.session
            ? "회원가입이 완료되었습니다. 로그인해주세요."
            : "가입 요청이 접수되었습니다. 이메일 인증 후 로그인해주세요.",
        );
        setVisible(false);
        setConfirmVisible(false);
        setPassword("");
        setConfirm("");
        setChecked(false);
      }
    } catch {
      setMessage("서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main
      className={`device access-page ${signup ? "signup-screen" : "login-screen"}`}
    >
      {signup ? (
        <FlowHeader title="회원가입" onBack={changeMode} />
      ) : (
        <div className="login-brand">
          <div className="login-mark">
            <img src="/auth/logo.png" alt="BUTILL" />
          </div>
          <p>서비스를 이용하려면 로그인해 주세요</p>
        </div>
      )}
      <div className="access-body">
        {signup && (
          <div className="flow-intro">
            <h1>계정을 만들어주세요</h1>
            <p>BUTILL을 이용하기 위한 계정을 생성합니다.</p>
          </div>
        )}
        {!auth && (
          <p role="alert" className="access-error">
            인증 연결 설정을 확인해주세요.
          </p>
        )}
        <form onSubmit={submit}>
          <fieldset disabled={busy || !auth}>
            {signup && (
              <label className="access-label">
                이름
                <InputShell icon="user">
                  <input
                    required
                    maxLength={100}
                    value={name}
                    autoComplete="name"
                    placeholder="이름을 입력해주세요"
                    onChange={(e) => setName(e.target.value)}
                  />
                </InputShell>
              </label>
            )}
            <label className="access-label">
              아이디(이메일)
              <InputShell icon="mail" invalid={!!message && !signup}>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  placeholder="아이디 또는 이메일 입력"
                  onChange={(e) => setEmail(e.target.value)}
                />
                {email && (
                  <button
                    type="button"
                    aria-label="아이디 지우기"
                    onClick={() => setEmail("")}
                  >
                    ⊗
                  </button>
                )}
              </InputShell>
            </label>
            <label className="access-label">
              비밀번호
              <InputShell icon="lock" invalid={weak || (!!message && !signup)}>
                <input
                  type={visible ? "text" : "password"}
                  required
                  autoComplete={signup ? "new-password" : "current-password"}
                  value={password}
                  placeholder="비밀번호 입력"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                >
                  <img
                    className="password-eye"
                    src={
                      visible
                        ? "/auth/eye-regular-full.svg"
                        : "/auth/eye-slash-regular-full.svg"
                    }
                    alt=""
                  />
                </button>
              </InputShell>
            </label>
            {signup && (
              <p className={weak ? "field-error" : "field-hint"}>
                {weak ? "ⓘ 올바르지 않은 비밀번호입니다. " : "ⓘ "}영문, 숫자,
                특수문자 조합 8자 이상
              </p>
            )}
            {signup && (
              <>
                <label className="access-label confirm-label">
                  비밀번호 확인
                  <InputShell icon="lock" invalid={mismatch}>
                    <input
                      type={confirmVisible ? "text" : "password"}
                      required
                      value={confirm}
                      autoComplete="new-password"
                      placeholder="비밀번호 다시 입력"
                      aria-invalid={mismatch}
                      aria-describedby={
                        mismatch ? "password-mismatch" : undefined
                      }
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={
                        confirmVisible
                          ? "확인 비밀번호 숨기기"
                          : "확인 비밀번호 보기"
                      }
                      aria-pressed={confirmVisible}
                      onClick={() => setConfirmVisible(!confirmVisible)}
                    >
                      <img
                        className="password-eye"
                        src={
                          confirmVisible
                            ? "/auth/eye-regular-full.svg"
                            : "/auth/eye-slash-regular-full.svg"
                        }
                        alt=""
                      />
                    </button>
                  </InputShell>
                </label>
                {mismatch && (
                  <p
                    id="password-mismatch"
                    role="alert"
                    className="field-error"
                  >
                    비밀번호가 일치하지 않습니다. 다시 확인해주세요.
                  </p>
                )}
                <div className="consent-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    MVP 이용 안내 및 정보 처리에 동의합니다
                  </label>
                  <button type="button" onClick={() => setDialog("terms")}>
                    약관보기
                  </button>
                </div>
              </>
            )}
            {!signup && (
              <div className="login-options">
                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  로그인 상태 유지
                </label>
                <span>
                  <button type="button" onClick={() => setDialog("id")}>
                    아이디 찾기
                  </button>
                  <i />{" "}
                  <button type="button" onClick={() => setDialog("password")}>
                    비밀번호 찾기
                  </button>
                </span>
              </div>
            )}
            {message && signup && (
              <p role="alert" className="access-error">
                ⓘ {message}
              </p>
            )}
            {notice && (
              <p role="status" className="access-notice">
                {notice}
              </p>
            )}
            <button className="flow-primary auth-submit" type="submit">
              {busy ? "처리 중…" : signup ? "회원가입" : "로그인  ⇥"}
            </button>
            {message && !signup && (
              <p role="alert" className="access-error">
                ⓘ {message}
              </p>
            )}
          </fieldset>
        </form>
        {!signup && (
          <p className="signup-link">
            아직 회원이 아니신가요?{" "}
            <button onClick={changeMode}>회원가입</button>
          </p>
        )}
      </div>
      {dialog && (
        <div className="flow-modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="이용 안내"
            className="flow-modal"
          >
            <h2>
              {dialog === "terms"
                ? "MVP 이용 안내"
                : dialog === "id"
                  ? "아이디 찾기"
                  : "비밀번호 찾기"}
            </h2>
            <p>
              {dialog === "terms"
                ? "이 앱은 발표·검증용 MVP입니다. 이름·이메일은 Supabase 인증 계정에, 입력한 매장·경영정보는 분석과 재조회 목적으로 DB에 저장합니다. 테스트 정보로 이용해주세요. 정식 서비스 이용약관과 개인정보 처리방침은 별도로 마련할 예정입니다."
                : dialog === "id"
                  ? "가입할 때 사용한 이메일이 아이디입니다. 아이디 자동 조회 기능은 아직 제공하지 않습니다."
                  : "비밀번호 재설정 기능은 아직 제공하지 않습니다. 테스트 계정은 Supabase 관리자에게 문의해주세요."}
            </p>
            <button className="flow-primary" onClick={() => setDialog("")}>
              확인
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
