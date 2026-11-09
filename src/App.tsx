import { useState } from "react";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import BusinessInfoPage from "./pages/onboarding/BusinessInfoPage";
import FundInfoPage from "./pages/onboarding/FundInfoPage";
import IntroPage from "./pages/onboarding/IntroPage";
import HomeShell from "./pages/HomeShell";
import CalculatingPage, { type CalculationStatus } from "./pages/cashflow/CalculatingPage";
import CashRunwayPage from "./pages/cashflow/CashRunwayPage";
import { fromAnalysis } from "./lib/cashflow";
import { AccountProvider, useAccount } from "./lib/account";
import type { AppPage } from "./types/navigation";

function App() {
  return (
    <AccountProvider>
      <Screens />
    </AccountProvider>
  );
}

function Screens() {
  const account = useAccount();

  // 초기 화면을 로그인 화면으로 설정
  const [page, setPage] = useState<AppPage>("Login");

  // 회원가입 시 입력한 아이디 관리
  const [, setLoginId] = useState("");

  // 로그인 직후(또는 로그인 유지 세션으로 시작할 때) 이동할 화면 결정 대기
  const [routing, setRouting] = useState(false);
  const [checkedSavedSession, setCheckedSavedSession] = useState(false);
  if (account.ready && !checkedSavedSession) {
    setCheckedSavedSession(true);
    if (account.session) setRouting(true);
  }
  // 매장 정보를 다 불러오면: 경영정보가 있으면 홈, 없으면 사업장 정보 입력
  if (routing && account.session && !account.loading) {
    setRouting(false);
    setPage(account.finance ? "HomePage" : "Information");
  }

  // 현금흐름 계산 상태
  const [calcStatus, setCalcStatus] = useState<CalculationStatus>("loading");
  const runAnalysis = () => {
    setCalcStatus("loading");
    account.analyze().then(
      () => setCalcStatus("success"),
      () => setCalcStatus("error"),
    );
  };

  const result = account.analysis ? fromAnalysis(account.analysis) : null;

  // 세션 확인 전에는 화면을 그리지 않음
  if (!account.ready || (routing && page === "Login" && account.session)) return null;

  switch (page) {
    case "Login":
      return <LoginPage setPage={setPage} onLoggedIn={() => setRouting(true)} />;
    case "Signup":
      return <SignupPage setPage={setPage} setLoginId={setLoginId} />;
    case "Information":
      return <BusinessInfoPage setPage={setPage} />;
    case "Information2":
      return <FundInfoPage setPage={setPage} />;
    case "Introduction":
      return <IntroPage setPage={setPage} />;
    case "HomePage":
    case "NotificationsFromCashRunway":
      return (
        <HomeShell
          initialNotifications={page === "NotificationsFromCashRunway"}
          onBackFromNotifications={() => setPage("CashRunway")}
          hasData={Boolean(account.finance && result)}
          balance={result?.latest.balance ?? 0}
          runway={result?.runway ?? null}
          onOpenCalculator={() => {
            runAnalysis();
            setPage("Calculator");
          }}
          onDeleteAccount={async () => {
            await account.deleteAccount();
            setPage("Login");
          }}
        />
      );
    case "Calculator":
      return <CalculatingPage setPage={setPage} status={calcStatus} onRetry={runAnalysis} />;
    case "CashRunway":
      return <CashRunwayPage setPage={setPage} result={result} />;
  }
}

export default App;
