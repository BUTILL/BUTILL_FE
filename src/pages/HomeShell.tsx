import { useEffect, useState, type SetStateAction } from "react";
import "./HomeShell.css";
import { Icon } from "../components/Icon";
import RawMaterialsPage from "./RawMaterialsPage";
import NotificationsPage from "./NotificationsPage";
import HomePage from "./HomePage";
import GuidePage from "./GuidePage";
import CalendarPage from "./CalendarPage";
import ManagementTabs from "./management/ManagementTabs";
import SimulationPage from "./SimulationPage";
import SupportPage from "./SupportPage";
import TaxPage from "./TaxPage";
import { initialTaxSelections } from "../data/taxOptions";
import { useAccount } from "../lib/account";
import { amountOf, formatAmount } from "../lib/financeInput";
import { buildSchedule } from "../lib/schedule";
import { getPreferences, getTaxSettings, savePreferences, saveTaxSettings, toTaxSelections } from "../lib/storeSettings";
import type { Preferences, TaxEvent } from "../types/api";
import { businessTypeOfName, CUSTOM_BUSINESS_TYPE, toSettingsBusinessType } from "../data/businessOptions";
import {
  FundsSettingsPage,
  ProfileSettingsPage,
  SettingsPage,
} from "./SettingsPage";

type Page =
  | "guide"
  | "notifications"
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
type HomeShellProps = { hasData: boolean; balance: number; runway: number | null; onOpenCalculator: () => void; initialNotifications?: boolean; onBackFromNotifications?: () => void; onDeleteAccount: () => Promise<void>; };
export default function HomeShell({ hasData, balance, runway, onOpenCalculator, initialNotifications = false, onBackFromNotifications, onDeleteAccount }: HomeShellProps) {
  const [page, setPage] = useState<Page>(initialNotifications ? "notifications" : "home");
  const [guideStep, setGuideStep] = useState(0);
  const [notificationOrigin, setNotificationOrigin] = useState<"home" | "guide" | "manage">("home");
  const [rawRefreshCount, setRawRefreshCount] = useState(0);
  const [picked, setPicked] = useState(initialTaxSelections);
  const [annual, setAnnual] = useState(false);
  // 설정 화면 값: 저장된 대표자·매장·자금 정보로 시작
  const account = useAccount();
  const savedInput = account.finance?.input;
  const bills = buildSchedule(savedInput);
  const [savedType] = useState(() => toSettingsBusinessType(account.profile.business_category));
  const [businessName, setBusinessName] = useState(account.profile.representative_name ?? "");
  const [businessType, setBusinessType] = useState(savedType.type);
  const [customBusinessType, setCustomBusinessType] = useState(savedType.custom);
  const [district, setDistrict] = useState(account.store?.region.replace(/^서울\s*/, "") ?? "");
  const [totalFunds, setTotalFunds] = useState(formatAmount(savedInput?.current_cash ?? 0));
  const [reserveRate, setReserveRate] = useState(() => {
    const saved = Number(account.profile.emergency_rate);
    if (saved) return saved;
    if (savedInput?.current_cash) return Math.round((savedInput.reserve_cash / savedInput.current_cash) * 100) || 10;
    return 10;
  });
  // 대표자명·업종·상권 저장 (사용자 정보 + 매장 정보)
  const saveProfileSettings = async () => {
    const name = businessName.trim();
    if (!name) throw new Error("대표자명을 입력해주세요.");
    if (!district) throw new Error("상권 위치를 선택해주세요.");
    const category = businessType === CUSTOM_BUSINESS_TYPE ? customBusinessType.trim() || businessType : businessType;
    await account.saveProfile(
      { representative_name: name, business_category: category },
      { name: `${name}의 매장`.slice(0, 100), business_type: businessTypeOfName(category), region: `서울 ${district}` },
    );
  };
  // 보유 자금·비상 완충금 저장 (경영정보 + 비율은 사용자 정보)
  const saveFundsSettings = async () => {
    const current = account.finance?.input;
    if (!current) throw new Error("사업장 정보를 먼저 입력해주세요.");
    const total = amountOf(totalFunds);
    await account.saveFinance({ ...current, current_cash: total, reserve_cash: Math.round((total * reserveRate) / 100) });
    await account.saveProfile({ emergency_rate: String(reserveRate) }, {});
  };
  const storeId = account.store?.id;
  // 세금 설정·세무 일정과 알림 설정은 서버(매장별)에 저장
  const [taxSchedule, setTaxSchedule] = useState<TaxEvent[] | null>([]);
  const [preferences, setPreferences] = useState<Preferences>({ runway_alert: true, ingredient_alert: true, font_size: "normal" });
  useEffect(() => {
    if (!storeId) return;
    let active = true;
    getTaxSettings(storeId)
      .then((data) => {
        if (!active) return;
        if (data.saved) setPicked(toTaxSelections(data.settings));
        setTaxSchedule(data.schedule);
      })
      .catch(() => active && setTaxSchedule(null));
    getPreferences(storeId)
      .then((data) => active && setPreferences(data.preferences))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [storeId]);
  const saveTax = async () => {
    if (!storeId) throw new Error("사업장 정보를 먼저 입력해주세요.");
    const data = await saveTaxSettings(storeId, picked);
    setTaxSchedule(data.schedule);
  };
  // 알림 켜기/끄기: 화면을 먼저 바꾸고 서버에 저장, 실패하면 되돌림
  const togglePreference = (field: "runway_alert" | "ingredient_alert") => (value: SetStateAction<boolean>) => {
    const previous = preferences;
    const next = { ...previous, [field]: typeof value === "function" ? value(previous[field]) : value };
    setPreferences(next);
    if (storeId) void savePreferences(storeId, next).catch(() => setPreferences(previous));
  };
  const runwayAlert = preferences.runway_alert;
  const ingredientAlert = preferences.ingredient_alert;
  const setRunwayAlert = togglePreference("runway_alert");
  const setIngredientAlert = togglePreference("ingredient_alert");
  useEffect(() => {
    document.getElementById("root")?.scrollTo(0, 0);
  }, [page]);
  return (
    <main className="device">
      <header className={"topbar " + (page === "raw" ? "raw-topbar" : "")}>
        {page === "guide" || page === "notifications" ||
        page === "tax" ||
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
            onClick={() => {
              if (page === "guide" && guideStep > 0) {
                setGuideStep((current) => current - 1);
                document.getElementById("root")?.scrollTo(0, 0);
                return;
              }
              if (page === "notifications" && initialNotifications && onBackFromNotifications) {
                onBackFromNotifications();
                return;
              }
              setPage(
                page === "notifications" ? notificationOrigin : page === "profile-settings" || page === "funds-settings"
                  ? "settings"
                  : "home",
              );
            }}
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
        ) : page === "home" || page === "guide" || page === "manage" ? (
          <button className="bell" type="button" aria-label="알림" onClick={() => { setNotificationOrigin(page); setPage("notifications"); }}>
            <Icon name="bell" />
            <i />
          </button>
        ) : (
          <span className="side" />
        )}
      </header>
      {page === "home" && (
        <HomePage
          hasData={hasData}
          bills={bills}
          balance={balance}
          runway={runway}
          onOpenCalculator={onOpenCalculator}
          onOpenExpense={() => setPage("manage")}
          onOpenGuide={() => { setGuideStep(0); setPage("guide"); }}
          onOpenCalendar={() => setPage("calendar")}
          onOpenTax={() => setPage("tax")}
          onOpenRawMaterials={() => setPage("raw")}
          onOpenSupport={() => setPage("support")}
        />
      )}
      {(page === "guide" || (page === "notifications" && notificationOrigin === "guide")) && <div hidden={page !== "guide"}><GuidePage step={guideStep} setStep={setGuideStep} onFinish={() => setPage("home")} /></div>}
      {page === "notifications" && <NotificationsPage onOpenHome={() => setPage("home")} onOpenRawMaterials={() => setPage("raw")} onOpenTax={() => setPage("tax")} onOpenCalendar={() => setPage("calendar")} />}
      {page === "support" && <SupportPage />}
      {page === "raw" && <RawMaterialsPage refreshCount={rawRefreshCount} />}
      {(page === "manage" || (page === "notifications" && notificationOrigin === "manage")) && <div hidden={page !== "manage"}><ManagementTabs /></div>}
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
          onDeleteAccount={onDeleteAccount}
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
          onSave={saveProfileSettings}
        />
      )}
      {page === "funds-settings" && (
        <FundsSettingsPage
          totalFunds={totalFunds}
          setTotalFunds={setTotalFunds}
          reserveRate={reserveRate}
          setReserveRate={setReserveRate}
          onSave={saveFundsSettings}
        />
      )}
      {page === "calendar" && <CalendarPage bills={bills} />}
      {page === "tax" && (
        <TaxPage
          picked={picked}
          setPicked={setPicked}
          annual={annual}
          setAnnual={setAnnual}
          schedule={taxSchedule}
          onSave={saveTax}
        />
      )}
      {page !== "guide" && page !== "notifications" &&
        page !== "tax" &&
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



