import { useEffect, useState } from "react";
import "./App.css";
import { Icon } from "./components/Icon";
import RawMaterialsPage from "./pages/RawMaterialsPage";
import HomePage from "./pages/HomePage";
import CalendarPage from "./pages/CalendarPage";
import ManagementPage from "./pages/ManagementPage";
import SimulationPage from "./pages/SimulationPage";
import SupportPage from "./pages/SupportPage";
import TaxPage, { initialTaxSelections } from "./pages/TaxPage";
import {
  FundsSettingsPage,
  ProfileSettingsPage,
  SettingsPage,
} from "./pages/SettingsPage";

type Page =
  | "home"
  | "calendar"
  | "tax"
  | "support"
  | "raw"
  | "manage"
  | "simulation"
  | "settings"
  | "profile-settings"
  | "funds-settings";
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [rawRefreshCount, setRawRefreshCount] = useState(0);
  const [picked, setPicked] = useState(initialTaxSelections);
  const [annual, setAnnual] = useState(false);
  const [businessName, setBusinessName] = useState("홍길동");
  const [businessType, setBusinessType] = useState("카페 · 디저트");
  const [customBusinessType, setCustomBusinessType] = useState("");
  const [district, setDistrict] = useState("마포구");
  const [totalFunds, setTotalFunds] = useState("25,000,000");
  const [reserveRate, setReserveRate] = useState(10);
  const [runwayAlert, setRunwayAlert] = useState(true);
  const [ingredientAlert, setIngredientAlert] = useState(true);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);
  return (
    <main className="device">
      <header className={"topbar " + (page === "raw" ? "raw-topbar" : "")}>
        {page === "tax" ||
        page === "support" ||
        page === "raw" ||
        page === "calendar" ||
        page === "simulation" ||
        page === "settings" ||
        page === "profile-settings" ||
        page === "funds-settings" ? (
          <button
            className="back"
            aria-label="이전 화면"
            onClick={() =>
              setPage(
                page === "profile-settings" || page === "funds-settings"
                  ? "settings"
                  : "home",
              )
            }
          >
            ‹
          </button>
        ) : (
          <span className="side" />
        )}
        <div className="brand-logo" aria-label="BUTILL">
          <img src="/figma/brand-source.png" alt="" />
        </div>
        {page === "raw" ? (
          <button
            className="refresh"
            onClick={() => setRawRefreshCount((count) => count + 1)}
            aria-label="새로고침"
          >
            <Icon name="sync" />
          </button>
        ) : page === "home" ? (
          <button className="bell" aria-label="알림">
            <Icon name="bell" />
            <i />
          </button>
        ) : (
          <span className="side" />
        )}
      </header>
      {page === "home" && (
        <HomePage
          onOpenCalendar={() => setPage("calendar")}
          onOpenTax={() => setPage("tax")}
          onOpenRawMaterials={() => setPage("raw")}
          onOpenSupport={() => setPage("support")}
        />
      )}
      {page === "support" && <SupportPage />}
      {page === "raw" && <RawMaterialsPage refreshCount={rawRefreshCount} />}
      {page === "manage" && <ManagementPage />}
      {page === "simulation" && <SimulationPage />}
      {page === "settings" && (
        <SettingsPage
          onEditProfile={() => setPage("profile-settings")}
          onEditFunds={() => setPage("funds-settings")}
          businessName={businessName}
          businessType={businessType}
          district={district}
          totalFunds={totalFunds}
          reserveRate={reserveRate}
          runwayAlert={runwayAlert}
          setRunwayAlert={setRunwayAlert}
          ingredientAlert={ingredientAlert}
          setIngredientAlert={setIngredientAlert}
          customBusinessType={customBusinessType}
        />
      )}
      {page === "profile-settings" && (
        <ProfileSettingsPage
          businessName={businessName}
          setBusinessName={setBusinessName}
          businessType={businessType}
          setBusinessType={setBusinessType}
          customBusinessType={customBusinessType}
          setCustomBusinessType={setCustomBusinessType}
          district={district}
          setDistrict={setDistrict}
        />
      )}
      {page === "funds-settings" && (
        <FundsSettingsPage
          totalFunds={totalFunds}
          setTotalFunds={setTotalFunds}
          reserveRate={reserveRate}
          setReserveRate={setReserveRate}
        />
      )}
      {page === "calendar" && <CalendarPage />}
      {page === "tax" && (
        <TaxPage
          picked={picked}
          setPicked={setPicked}
          annual={annual}
          setAnnual={setAnnual}
        />
      )}
      {page !== "tax" &&
        page !== "support" &&
        page !== "raw" &&
        page !== "calendar" && (
          <nav className="bottom">
            <button
              className={page === "home" ? "current" : ""}
              onClick={() => setPage("home")}
            >
              <Icon name="home" />
              <small>홈</small>
            </button>
            <button
              type="button"
              className={page === "manage" ? "current" : ""}
              onClick={() => setPage("manage")}
            >
              <Icon name="manage" />
              <small>입력/관리</small>
            </button>
            <button
              type="button"
              className={page === "simulation" ? "current" : ""}
              onClick={() => setPage("simulation")}
            >
              <Icon name="simulation" />
              <small>시뮬레이션</small>
            </button>
            <button
              type="button"
              className={page.includes("settings") ? "current" : ""}
              onClick={() => setPage("settings")}
            >
              <Icon name="settings" />
              <small>설정</small>
            </button>
          </nav>
        )}
    </main>
  );
}
