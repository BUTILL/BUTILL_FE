import { useEffect, useRef, useState } from "react";
import "./MaterialsTab.css";
import "./ExpensesTab.css";
import "./SalesTab.css";
import MaterialsTab, { type ManageItem } from "./MaterialsTab";
import ExpensesTab from "./ExpensesTab";
import SalesTab from "./SalesTab";
import { useAccount } from "../../lib/account";
import {
  dueLabel,
  extraExpensesByMonth,
  formatAmount,
  withExtraExpenses,
  withFixedExpenses,
  withMaterials,
  withMonthlySales,
} from "../../lib/financeInput";
import type { AnalysisInput } from "../../types/api";

type ManageTab = "materials" | "expenses" | "sales";

export default function ManagementTabs() {
  const account = useAccount();
  const savedInput = account.finance?.input;
  const [tab, setTab] = useState<ManageTab>("materials");
  const [displayTab, setDisplayTab] = useState<ManageTab>("materials");
  const [tabLeaving, setTabLeaving] = useState(false);
  const tabTransitionTimer = useRef<number | undefined>(undefined);
  const [introVisible, setIntroVisible] = useState(true);
  const [introClosing, setIntroClosing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const saving = useRef(false);
  // 저장된 메뉴별 원재료비를 불러오고, 없으면 빈 입력 3줄
  const [materials, setMaterials] = useState<ManageItem[]>(() =>
    savedInput?.ingredient_items?.length
      ? savedInput.ingredient_items.map((item, index) => ({
          id: index + 1,
          name: item.name,
          amount: formatAmount(item.amount),
        }))
      : [
          { id: 1, name: "", amount: "" },
          { id: 2, name: "", amount: "" },
          { id: 3, name: "", amount: "" },
        ],
  );
  const [loadedMaterialIds] = useState(() => savedInput?.ingredient_items?.map((_, index) => index + 1) ?? []);
  // 저장된 고정 지출(없으면 기본 항목)과 월별 추가 지출
  const [initialFixed] = useState<ManageItem[] | undefined>(() =>
    savedInput?.fixed_expenses.length
      ? savedInput.fixed_expenses.map((item, index) => ({
          id: index + 1,
          name: item.name,
          amount: formatAmount(item.amount),
          due: dueLabel(item.due_day),
          description: "",
        }))
      : undefined,
  );
  const [initialExtra] = useState(() => extraExpensesByMonth(savedInput));

  // 경영정보 일부를 바꿔 저장하고 결과 안내 (저장 실패 시 원인 표시)
  const saveFinance = async (change: (input: AnalysisInput) => AnalysisInput) => {
    if (saving.current) return "저장 중입니다. 잠시만 기다려주세요.";
    const current = account.finance?.input;
    if (!current) return "사업장 정보를 먼저 입력해주세요.";
    saving.current = true;
    try {
      await account.saveFinance(change(current));
      return "저장이 완료되었습니다";
    } catch (e) {
      return e instanceof Error ? e.message : "저장하지 못했습니다. 다시 시도해주세요.";
    } finally {
      saving.current = false;
    }
  };
  const saveAndNotify = async (change: (input: AnalysisInput) => AnalysisInput) => {
    setSaveMessage(await saveFinance(change));
    setSaved(true);
  };

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 2400);
    return () => window.clearTimeout(timer);
  }, [saved]);

  useEffect(
    () => () => {
      if (tabTransitionTimer.current !== undefined) {
        window.clearTimeout(tabTransitionTimer.current);
      }
    },
    [],
  );

  const changeTab = (nextTab: ManageTab) => {
    if (nextTab === tab) return;
    if (tabTransitionTimer.current !== undefined) {
      window.clearTimeout(tabTransitionTimer.current);
    }
    setTab(nextTab);
    setTabLeaving(true);
    setSaved(false);
    tabTransitionTimer.current = window.setTimeout(() => {
      setDisplayTab(nextTab);
      setIntroVisible(true);
      setIntroClosing(false);
      setTabLeaving(false);
      tabTransitionTimer.current = undefined;
    }, 140);
  };
  const dismissIntro = () => {
    setIntroClosing(true);
    window.setTimeout(() => {
      setIntroVisible(false);
      setIntroClosing(false);
    }, 230);
  };

  const panelProps = { leaving: tabLeaving, saved, setSaved, saveMessage };
  const introProps = { introVisible, introClosing, dismissIntro };

  return (
    <section className="management-page">
      <nav
        className="management-tabs"
        aria-label="입력/관리 메뉴"
        data-active={tab}
      >
        <button
          className={tab === "materials" ? "active" : ""}
          onClick={() => changeTab("materials")}
        >
          원재료비 입력/수정
        </button>
        <button
          className={tab === "expenses" ? "active" : ""}
          onClick={() => changeTab("expenses")}
        >
          고정/추가 지출
        </button>
        <button
          className={tab === "sales" ? "active" : ""}
          onClick={() => changeTab("sales")}
        >
          매출 입력
        </button>
      </nav>

      <MaterialsTab
        {...panelProps}
        {...introProps}
        active={displayTab === "materials"}
        materials={materials}
        setMaterials={setMaterials}
        initialSavedIds={loadedMaterialIds}
        onSave={() => saveAndNotify((input) => withMaterials(input, materials))}
      />
      <ExpensesTab
        {...panelProps}
        {...introProps}
        active={displayTab === "expenses"}
        initialFixed={initialFixed}
        initialExtra={initialExtra}
        onSave={(fixed, extraByMonth) =>
          saveAndNotify((input) => withExtraExpenses(withFixedExpenses(input, fixed), extraByMonth))
        }
      />
      <SalesTab
        leaving={tabLeaving}
        active={displayTab === "sales"}
        materials={materials}
        onSaveSales={(monthKey, total) => saveFinance((input) => withMonthlySales(input, monthKey, total))}
      />
    </section>
  );
}
