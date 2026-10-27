import { useEffect, useState } from "react";
import "./App.css";
import { Icon } from "./components/Icon";
import { AccountProvider, useAccount } from "./lib/Account";
import LoginPage from "./pages/LoginPage";
import Onboarding from "./pages/Onboarding";
import StoredHome, { StoredCalendar } from "./pages/StoredHome";
import CashAnalysis from "./pages/CashAnalysis";
import AccountManagement from "./pages/AccountManagement";
import StoreSettings from "./pages/StoreSettings";
import StoredSimulation from "./pages/StoredSimulation";

type Page =
  "home" | "manage" | "simulation" | "settings" | "analysis" | "calendar";
function AppContent() {
  const account = useAccount();
  const [page, setPage] = useState<Page>("home");
  const [error, setError] = useState("");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);
  if (!account.ready)
    return (
      <main className="device account-page">
        <p>로그인 상태 확인 중…</p>
      </main>
    );
  if (!account.session) return <LoginPage />;
  if (
    !account.loading &&
    !account.error &&
    (!account.store || !account.finance)
  )
    return <Onboarding key={account.session.user.id} />;
  const formKey = `${account.session.user.id}-${account.store?.id}`;
  return (
    <main className="device">
      <header className="topbar">
        <button
          className="side header-action"
          aria-label="홈으로"
          onClick={() => setPage("home")}
        >
          {page === "analysis" || page === "calendar" ? "←" : ""}
        </button>
        <div className="brand-logo" aria-label="BUTILL">
          <img src="/figma/brand-source.png" alt="" />
        </div>
        <span className="side">
          <Icon name="bell" />
        </span>
      </header>
      {page === "settings" && (
        <div className="settings-session">
          <span>{account.session.user.email}</span>
          <button
            disabled={account.loading}
            onClick={() => {
              void account.signOut().catch((e: Error) => setError(e.message));
            }}
          >
            로그아웃
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="account-notice">
          {error}
        </p>
      )}
      {account.error && (
        <div className="account-page">
          <p role="alert">{account.error}</p>
          <button onClick={() => void account.reload(account.store?.id)}>
            다시 불러오기
          </button>
        </div>
      )}
      {account.loading ? (
        <section className="flow-state" role="status">
          <div className="state-ring loading" />
          <h2>
            사장님의 현금 흐름을
            <br />
            계산하고 있어요
          </h2>
          <p>
            저장된 정보를 불러오는 중입니다.
            <br />
            잠시만 기다려주세요.
          </p>
        </section>
      ) : (
        !account.error && (
          <>
            {account.stores.length > 1 && (
              <label className="account-notice">
                현재 매장
                <select
                  value={account.store?.id ?? ""}
                  onChange={(e) => account.select(e.target.value)}
                >
                  {account.stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {!account.store || page === "settings" ? (
              <StoreSettings key={account.store?.id ?? "new"} />
            ) : page === "home" ? (
              <StoredHome
                onManage={() => setPage("manage")}
                onAnalysis={() => setPage("analysis")}
                onCalendar={() => setPage("calendar")}
              />
            ) : page === "analysis" ? (
              <CashAnalysis onManage={() => setPage("manage")} />
            ) : page === "calendar" ? (
              <StoredCalendar onManage={() => setPage("manage")} />
            ) : page === "manage" ? (
              <AccountManagement key={formKey} />
            ) : (
              <StoredSimulation
                key={formKey}
                onManage={() => setPage("manage")}
              />
            )}
          </>
        )
      )}
      <nav className="bottom">
        {(["home", "manage", "simulation", "settings"] as const).map((p, i) => (
          <button
            key={p}
            className={
              page === p ||
              (p === "home" && (page === "analysis" || page === "calendar"))
                ? "current"
                : ""
            }
            disabled={account.loading}
            onClick={() => setPage(p)}
          >
            <Icon name={p} />
            <small>{["홈", "입력/관리", "시뮬레이션", "설정"][i]}</small>
          </button>
        ))}
      </nav>
    </main>
  );
}
export default function App() {
  return (
    <AccountProvider>
      <AppContent />
    </AccountProvider>
  );
}
