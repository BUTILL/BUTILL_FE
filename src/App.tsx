import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Icon } from "./components/Icon";
import RawMaterialsPage from "./pages/RawMaterialsPage";
import HomePage from "./pages/HomePage";
import GuidePage from "./pages/GuidePage";
import CalendarPage from "./pages/CalendarPage";
import ManagementPage from "./pages/ManagementPage";
import SimulationPage from "./pages/SimulationPage";
import NotificationsPage from "./pages/NotificationsPage";
import SupportPage from "./pages/SupportPage";
import TaxPage, { initialTaxSelections } from "./pages/TaxPage";
import {
  FundsSettingsPage,
  ProfileSettingsPage,
  SettingsPage,
} from "./pages/SettingsPage";

type Page =
  | "home"
  | "notifications"
  | "guide"
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
  const [renderPage, setRenderPage] = useState<Page>("home");
  const [pageLeaving, setPageLeaving] = useState(false);
  const pageTransitionTimer = useRef<number | undefined>(undefined);
  const [rawRefreshCount, setRawRefreshCount] = useState(0);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const navigatePage = (nextPage: Page) => {
    if (nextPage === page) return;
    if (pageTransitionTimer.current !== undefined) {
      window.clearTimeout(pageTransitionTimer.current);
    }
    setPage(nextPage);
    setPageLeaving(true);
    pageTransitionTimer.current = window.setTimeout(() => {
      setRenderPage(nextPage);
      setPageLeaving(false);
      pageTransitionTimer.current = undefined;
    }, 140);
  };
  const openNotifications = () => {
    setHasUnreadNotifications(false);
    navigatePage("notifications");
  };
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
  useEffect(
    () => () => {
      if (pageTransitionTimer.current !== undefined) {
        window.clearTimeout(pageTransitionTimer.current);
      }
    },
    [],
  );
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [renderPage]);
  return (
    <main className="device">
      <header
        className={"topbar " + (renderPage === "raw" ? "raw-topbar" : "")}
      >
        {renderPage === "tax" ||
        renderPage === "support" ||
        renderPage === "raw" ||
        renderPage === "calendar" ||
        renderPage === "simulation" ||
        renderPage === "settings" ||
        renderPage === "profile-settings" ||
        renderPage === "funds-settings" ||
        renderPage === "notifications" ? (
          <button
            className="back"
            aria-label="이전 화면"
            onClick={() =>
              navigatePage(
                renderPage === "profile-settings" ||
                  renderPage === "funds-settings"
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
        {renderPage === "raw" ? (
          <button
            className="refresh"
            onClick={() => setRawRefreshCount((count) => count + 1)}
            aria-label="새로고침"
          >
            <Icon name="sync" />
          </button>
        ) : renderPage === "home" || renderPage === "guide" ? (
          <button
            className="bell"
            aria-label="알림 확인"
            onClick={openNotifications}
          >
            <Icon name="bell" />
            {hasUnreadNotifications && <i />}
          </button>
        ) : (
          <span className="side" />
        )}
      </header>
      <div
        className={`app-screen-transition${pageLeaving ? " is-leaving" : ""}${renderPage === "manage" ? " management-screen" : ""}`}
        key={renderPage}
      >
        {renderPage === "home" && (
          <HomePage
            onOpenCalendar={() => navigatePage("calendar")}
            onOpenGuide={() => navigatePage("guide")}
            onOpenTax={() => navigatePage("tax")}
            onOpenRawMaterials={() => navigatePage("raw")}
            onOpenSupport={() => navigatePage("support")}
          />
        )}
        {renderPage === "guide" && (
          <GuidePage onFinish={() => navigatePage("home")} />
        )}
        {renderPage === "notifications" && (
          <NotificationsPage
            onOpenRawMaterials={() => navigatePage("raw")}
            onOpenTax={() => navigatePage("tax")}
            onOpenCalendar={() => navigatePage("calendar")}
          />
        )}
        {renderPage === "support" && <SupportPage />}
        {renderPage === "raw" && (
          <RawMaterialsPage refreshCount={rawRefreshCount} />
        )}
        {renderPage === "manage" && <ManagementPage />}
        {renderPage === "simulation" && <SimulationPage />}
        {renderPage === "settings" && (
          <SettingsPage
            onEditProfile={() => navigatePage("profile-settings")}
            onEditFunds={() => navigatePage("funds-settings")}
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
        {renderPage === "profile-settings" && (
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
        {renderPage === "funds-settings" && (
          <FundsSettingsPage
            totalFunds={totalFunds}
            setTotalFunds={setTotalFunds}
            reserveRate={reserveRate}
            setReserveRate={setReserveRate}
          />
        )}
        {renderPage === "calendar" && <CalendarPage />}
        {renderPage === "tax" && (
          <TaxPage
            picked={picked}
            setPicked={setPicked}
            annual={annual}
            setAnnual={setAnnual}
          />
        )}
      </div>
      {renderPage !== "tax" &&
        renderPage !== "support" &&
        renderPage !== "raw" &&
        renderPage !== "calendar" &&
        renderPage !== "guide" &&
        renderPage !== "notifications" && (
          <nav className="bottom">
            <button
              className={renderPage === "home" ? "current" : ""}
              onClick={() => navigatePage("home")}
            >
              <Icon name="home" />
              <small>홈</small>
            </button>
            <button
              type="button"
              className={renderPage === "manage" ? "current" : ""}
              onClick={() => navigatePage("manage")}
            >
              <Icon name="manage" />
              <small>입력/관리</small>
            </button>
            <button
              type="button"
              className={renderPage === "simulation" ? "current" : ""}
              onClick={() => navigatePage("simulation")}
            >
              <Icon name="simulation" />
              <small>시뮬레이션</small>
            </button>
            <button
              type="button"
              className={renderPage.includes("settings") ? "current" : ""}
              onClick={() => navigatePage("settings")}
            >
              <Icon name="settings" />
              <small>설정</small>
            </button>
          </nav>
        )}
    </main>
  );
}
