import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Toast from "../components/Toast";
import "./ManagementPage.css";

type ManageTab = "materials" | "expenses" | "sales";
type ManageItem = {
  id: number;
  name: string;
  amount: string;
  due?: string;
  description?: string;
};

export default function ManagementPage() {
  const [tab, setTab] = useState<ManageTab>("materials");
  const [displayTab, setDisplayTab] = useState<ManageTab>("materials");
  const [tabLeaving, setTabLeaving] = useState(false);
  const tabTransitionTimer = useRef<number | undefined>(undefined);
  const [introVisible, setIntroVisible] = useState(true);
  const [introClosing, setIntroClosing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [materials, setMaterials] = useState<ManageItem[]>([
    { id: 1, name: "", amount: "3,000" },
    { id: 2, name: "", amount: "2,000" },
    { id: 3, name: "", amount: "0" },
  ]);
  const [ingredientNames, setIngredientNames] = useState("");
  const [fixedItems, setFixedItems] = useState<ManageItem[]>([
    {
      id: 1,
      name: "매장 월세",
      amount: "5,000,000",
      due: "매월 10일",
      description: "건물 임대료 및 기본 관리",
    },
    {
      id: 2,
      name: "직원 · 알바 인건비",
      amount: "650,000",
      due: "매월 10일",
      description: "정직원 급여 및 파트타임 정산",
    },
    {
      id: 3,
      name: "공과금 · 관리비",
      amount: "300,000",
      due: "매월 10일",
      description: "전기, 수도, 가스 및 상가 관리비",
    },
  ]);
  const [extraItems, setExtraItems] = useState<ManageItem[]>([
    { id: 1, name: "", amount: "3,000" },
    { id: 2, name: "", amount: "2,000" },
  ]);
  const [sales, setSales] = useState("3,000");

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
  const addItem = (
    setter: Dispatch<SetStateAction<ManageItem[]>>,
    defaults: Partial<Pick<ManageItem, "due" | "description">> = {},
  ) => {
    setter((items) => [
      ...items,
      {
        id: Date.now(),
        name: "",
        amount: "0",
        ...defaults,
      },
    ]);
  };
  const updateItem = (
    setter: Dispatch<SetStateAction<ManageItem[]>>,
    id: number,
    key: "name" | "amount" | "due" | "description",
    value: string,
  ) =>
    setter((items) =>
      items.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  const removeItem = (
    setter: Dispatch<SetStateAction<ManageItem[]>>,
    id: number,
  ) => setter((items) => items.filter((item) => item.id !== id));
  const amountValue = (value: string) =>
    Number(value.replace(/[^0-9]/g, "")) || 0;
  const total = (items: ManageItem[]) =>
    items.reduce((sum, item) => sum + amountValue(item.amount), 0);
  const enteredIngredients = ingredientNames
    .split(/[,，\n]/)
    .map((name) => name.trim())
    .filter(Boolean);
  const month = new Date(2026, 11, 1).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });
  const saveLabel =
    displayTab === "materials"
      ? "원재료비 저장하기"
      : displayTab === "expenses"
        ? "지출 변경사항 저장하기"
        : "매출 저장하기";

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

      {displayTab === "materials" && (
        <div
          className={
            tabLeaving
              ? "management-tab-panel is-leaving"
              : "management-tab-panel"
          }
          key={displayTab}
        >
          {introVisible && (
            <section
              className={`management-intro intro${introClosing ? " intro-closing" : ""}`}
            >
              <div>
                <h1>주요 원재료 입력 및 관리</h1>
                <p>
                  매달 주기적으로 지출되는 주요 재료 및 원가 항목을
                  등록·수정하여 자금 고갈 시점을 정밀하게 예측하세요.
                </p>
              </div>
              <button aria-label="안내 닫기" onClick={dismissIntro}>
                ×
              </button>
            </section>
          )}
          <div className="management-item-list">
            {materials.map((item, index) => (
              <article className="management-item material-entry" key={item.id}>
                <div className="management-item-title">
                  <b>원재료 {index + 1}</b>
                  <button
                    aria-label={`원재료 ${index + 1} 삭제`}
                    onClick={() => removeItem(setMaterials, item.id)}
                  >
                    <img src="/management-icons/delete.svg" alt="" />
                  </button>
                </div>
                <label>
                  메뉴명
                  <input
                    value={item.name}
                    placeholder="메뉴명 입력"
                    onChange={(event) =>
                      updateItem(
                        setMaterials,
                        item.id,
                        "name",
                        event.target.value,
                      )
                    }
                  />
                </label>
                <label>
                  메뉴별 원재료비
                  <div className="currency-field">
                    <input
                      inputMode="numeric"
                      value={item.amount}
                      onChange={(event) =>
                        updateItem(
                          setMaterials,
                          item.id,
                          "amount",
                          event.target.value,
                        )
                      }
                    />
                    <span>원</span>
                  </div>
                </label>
              </article>
            ))}
          </div>
          <button
            className="add-management-item"
            onClick={() => addItem(setMaterials)}
          >
            <img src="/management-icons/add.png" alt="" /> 메뉴별 원재료비 추가
          </button>
          <p className="management-helper">
            매달 주기적으로 지출되는 주요 재료 및 원가 항목을 등록·수정하여 자금
            고갈 시점을 정밀하게 예측하세요.
          </p>
          <label className="ingredient-name-field">
            실제 사용하는 원재료
            <input
              value={ingredientNames}
              onChange={(event) => setIngredientNames(event.target.value)}
              placeholder="예: 대파, 양파"
            />
            <small>여러 재료는 쉼표로 구분해 입력해주세요.</small>
            {enteredIngredients.length > 0 && (
              <div className="ingredient-preview" aria-live="polite">
                <b>입력한 원재료</b>
                <ul>
                  {enteredIngredients.map((name, index) => (
                    <li key={`${name}-${index}`}>{name}</li>
                  ))}
                </ul>
              </div>
            )}
          </label>
          <ManagementSummary
            title="등록된 월 주요 원재료비 합계"
            label="예상 원가 합산"
            amount={total(materials)}
            saveLabel={saveLabel}
            saved={saved}
            onSave={() => setSaved(true)}
          />
        </div>
      )}

      {displayTab === "expenses" && (
        <div
          className={
            tabLeaving
              ? "management-tab-panel is-leaving"
              : "management-tab-panel"
          }
          key={displayTab}
        >
          {introVisible && (
            <section
              className={`management-intro fixed-intro intro${introClosing ? " intro-closing" : ""}`}
            >
              <div>
                <h1>월 고정/추가 지출 관리</h1>
                <p>
                  매월 반복되는 고정 지출과 이번 달 추가 지출을 함께 관리해 현금
                  흐름을 확인하세요.
                </p>
                <span className="management-tip">
                  ⓘ 납부일 미정시 매월 5일 자동 처리
                </span>
              </div>
              <button aria-label="안내 닫기" onClick={dismissIntro}>
                ×
              </button>
            </section>
          )}
          <div className="additional-heading">
            <h1>고정 지출</h1>
            <p>
              월세, 인건비, 공과금처럼 매월 반복해서 나가는 지출을 입력하세요.
            </p>
          </div>
          <div className="management-item-list">
            {fixedItems.map((item, index) => (
              <article className="management-item fixed-entry" key={item.id}>
                <div className="fixed-title">
                  <span>
                    <img
                      src={
                        index === 0
                          ? "/management-icons/store.svg"
                          : index === 1
                            ? "/management-icons/staff.svg"
                            : "/management-icons/utilities.svg"
                      }
                      alt=""
                    />
                  </span>
                  <div className="fixed-title-fields">
                    <input
                      className="fixed-name-input"
                      aria-label={`고정 지출 ${index + 1} 이름`}
                      value={item.name}
                      placeholder={`고정 지출 ${index + 1}`}
                      onChange={(event) =>
                        updateItem(
                          setFixedItems,
                          item.id,
                          "name",
                          event.target.value,
                        )
                      }
                    />
                    <input
                      className="fixed-description-input"
                      aria-label={`${item.name || `고정 지출 ${index + 1}`} 상세 내역`}
                      value={item.description ?? ""}
                      placeholder="상세 내역을 작성해주세요"
                      onChange={(event) =>
                        updateItem(
                          setFixedItems,
                          item.id,
                          "description",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  <button
                    aria-label={`${item.name} 삭제`}
                    onClick={() => removeItem(setFixedItems, item.id)}
                  >
                    <img src="/management-icons/delete.svg" alt="" />
                  </button>
                </div>
                <div className="currency-field">
                  <input
                    inputMode="numeric"
                    value={item.amount}
                    onChange={(event) =>
                      updateItem(
                        setFixedItems,
                        item.id,
                        "amount",
                        event.target.value,
                      )
                    }
                  />
                  <span>원</span>
                </div>
                <div className="amount-presets">
                  {(index === 2
                    ? ["+5만", "+10만", "+20만"]
                    : ["+10만", "+50만", "+100만"]
                  ).map((preset) => (
                    <button
                      key={preset}
                      onClick={() =>
                        updateItem(
                          setFixedItems,
                          item.id,
                          "amount",
                          (
                            amountValue(item.amount) +
                            Number(preset.replace(/[^0-9]/g, "")) * 10000
                          ).toLocaleString("ko-KR"),
                        )
                      }
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <label className="due-field">
                  <span>
                    <img src="/management-icons/payment-date.svg" alt="" />
                    　지급일
                  </span>
                  <select
                    value={item.due}
                    onChange={(event) =>
                      updateItem(
                        setFixedItems,
                        item.id,
                        "due",
                        event.target.value,
                      )
                    }
                  >
                    {[
                      "매월 5일",
                      "매월 10일",
                      "매월 15일",
                      "매월 25일",
                      "직접 선택",
                    ].map((day) => (
                      <option key={day}>{day}</option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
          </div>
          <button
            className="add-management-item"
            onClick={() =>
              addItem(setFixedItems, {
                description: "",
                due: "매월 10일",
              })
            }
          >
            <img src="/management-icons/add.png" alt="" /> 고정 지출 항목
            추가하기
          </button>
          <p className="management-helper">
            매달 고정적으로 지출되는 새로운 항목(보험료, 렌탈비 등)을 추가할 수
            있습니다.
          </p>
          <div className="month-selector">
            <b>{month}</b>
            <span>당월</span>
          </div>
          <div className="additional-heading">
            <h1>추가 지출</h1>
            <p>
              갑작스러운 수리비, 비품 구매, 회식비, 카드값 등 이번 달 추가로
              발생한 지출을 입력하세요.
            </p>
          </div>
          <div className="management-item-list">
            {extraItems.map((item, index) => (
              <article className="management-item extra-entry" key={item.id}>
                <div className="management-item-title">
                  <b>지출 항목 {index + 1}</b>
                  <button
                    aria-label={`지출 항목 ${index + 1} 삭제`}
                    onClick={() => removeItem(setExtraItems, item.id)}
                  >
                    <img src="/management-icons/delete.svg" alt="" />
                  </button>
                </div>
                <input
                  aria-label="지출 항목명"
                  value={item.name}
                  placeholder="지출 항목명"
                  onChange={(event) =>
                    updateItem(
                      setExtraItems,
                      item.id,
                      "name",
                      event.target.value,
                    )
                  }
                />
                <div className="currency-field">
                  <input
                    aria-label="지출 금액"
                    inputMode="numeric"
                    value={item.amount}
                    onChange={(event) =>
                      updateItem(
                        setExtraItems,
                        item.id,
                        "amount",
                        event.target.value,
                      )
                    }
                  />
                  <span>원</span>
                </div>
              </article>
            ))}
          </div>
          <button
            className="add-management-item"
            onClick={() => addItem(setExtraItems)}
          >
            <img src="/management-icons/add.png" alt="" /> 추가 지출 항목
            추가하기
          </button>
          <p className="management-helper">
            이번 달 카드값이나 갑작스러운 지출을 빠짐없이 입력해주세요.
          </p>
          <ManagementSummary
            title="수정 반영된 예상 월 지출 합계"
            label="예상 지출 합산"
            amount={total(fixedItems) + total(extraItems)}
            saveLabel={saveLabel}
            saved={saved}
            onSave={() => setSaved(true)}
          />
        </div>
      )}

      {displayTab === "sales" && (
        <div
          className={
            tabLeaving
              ? "management-tab-panel is-leaving"
              : "management-tab-panel"
          }
          key={displayTab}
        >
          <div className="month-selector">
            <b>{month}</b>
            <span>당월</span>
          </div>
          <article className="sales-entry">
            <label>
              이번달 총 매출액
              <div className="currency-field">
                <input
                  inputMode="numeric"
                  value={sales}
                  onChange={(event) => setSales(event.target.value)}
                />
                <span>원</span>
              </div>
            </label>
          </article>
          <ManagementSummary
            title="이번 달 매출"
            label="입력된 매출"
            amount={amountValue(sales)}
            saveLabel={saveLabel}
            saved={saved}
            onSave={() => setSaved(true)}
          />
        </div>
      )}
    </section>
  );
}

function ManagementSummary({
  title,
  label,
  amount,
  saveLabel,
  saved,
  onSave,
}: {
  title: string;
  label: string;
  amount: number;
  saveLabel: string;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <section className="management-summary">
      <b>{title}</b>
      <div>
        <span>{label}</span>
        <strong>월 {amount.toLocaleString("ko-KR")}원</strong>
      </div>
      <div className="management-save-wrap">
        {saved && (
          <Toast message="저장이 완료되었습니다" className="management-toast" />
        )}
        <button
          className={saved ? "management-save saved" : "management-save"}
          onClick={onSave}
        >
          {saveLabel}
        </button>
      </div>
    </section>
  );
}
