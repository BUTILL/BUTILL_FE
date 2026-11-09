import { useState } from "react";
import { monthFromToday, monthKeyOf } from "../../lib/financeInput";

// 화면에서 다루는 항목의 이름과 금액
type ManageItem = {
  id: number;
  name: string;
  amount: string;
  due?: string;
  description?: string;
};

// 탭 표시 여부와 전환 상태를 전달하는 속성
type ManagementPanelProps = {
  active: boolean;
  leaving: boolean;
};

// 쉼표가 포함된 입력 금액을 계산용 숫자로 변환
const amountValue = (value: string) =>
  Number(value.replace(/[^0-9]/g, "")) || 0;

// 판매 메뉴 한 줄의 이름, 수량과 단가
type SalesItem = {
  id: number;
  name: string;
  quantity: string;
  unitPrice: string;
};

// 메뉴별 판매 단가와 수량으로 총 판매금액 계산
const menuSalesAmount = (item: SalesItem) =>
  amountValue(item.unitPrice) * amountValue(item.quantity);

// 브라우저에 저장된 월별 매출을 불러옴 (키: 매출 대상 월 YYYY-MM)
function readSalesDrafts(key: string): Record<string, string> {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? "{}");
    if (!stored || typeof stored !== "object" || Array.isArray(stored))
      return {};
    return Object.fromEntries(
      Object.entries(stored).filter(
        ([month, value]) =>
          /^\d{4}-\d{2}$/.test(month) && typeof value === "string",
      ),
    ) as Record<string, string>;
  } catch {
    return {};
  }
}

// 세 번째 탭: 월별 매출 입력과 합계
export default function SalesTab({
  active,
  leaving,
  materials,
  onSaveSales,
}: ManagementPanelProps & {
  materials: ManageItem[];
  // 해당 월 총 매출액을 경영정보에 저장하고 결과 안내 문구를 반환
  onSaveSales: (monthKey: string, total: number) => Promise<string>;
}) {
  // 선택한 월, 메뉴 추천과 월별 매출 상태
  const [salesMonthOffset, setSalesMonthOffset] = useState(0);
  const [openSalesMenu, setOpenSalesMenu] = useState<number | null>(null);
  const [salesItemsByMonth, setSalesItemsByMonth] = useState<
    Record<string, SalesItem[]>
  >({});
  const [savedDrinksByMonth, setSavedDrinksByMonth] = useState(() =>
    readSalesDrafts("butill-drinks-drafts"),
  );
  const [drinksByMonth, setDrinksByMonth] = useState(savedDrinksByMonth);
  const [otherSalesByMonth, setOtherSalesByMonth] = useState<
    Record<string, string>
  >(() => readSalesDrafts("butill-other-sales-drafts"));

  // 월 선택기에 표시할 기준 월(이번 달 기준)과 실제 매출 대상 월(전월)
  const salesMonth = monthFromToday(salesMonthOffset);
  const previousSalesMonth = monthFromToday(salesMonthOffset - 1);
  const targetMonth = monthKeyOf(previousSalesMonth);
  const [salesDraftStatus, setSalesDraftStatus] = useState<
    Record<
      string,
      {
        value: string;
        message: string;
      }
    >
  >({});

  // 해당 월의 음료·주류 또는 기타 매출을 브라우저에 저장하고, 월 총 매출액을 경영정보에 반영
  const saveSalesDraft = async (kind: "drinks" | "other", value: string) => {
    const key =
      kind === "drinks" ? "butill-drinks-drafts" : "butill-other-sales-drafts";
    const month = targetMonth;
    let message = "저장되었습니다";
    try {
      const updatedDrafts = {
        ...readSalesDrafts(key),
        [month]: value,
      };
      localStorage.setItem(key, JSON.stringify(updatedDrafts));
      if (kind === "drinks") setSavedDrinksByMonth(updatedDrafts);
      message = await onSaveSales(month, totalSales);
      if (message === "저장이 완료되었습니다") message = "저장되었습니다";
    } catch {
      message = "저장하지 못했습니다. 다시 시도해주세요.";
    }
    setSalesDraftStatus((statuses) => ({
      ...statuses,
      [kind + month]: {
        value,
        message,
      },
    }));
  };

  // 해당 월의 메뉴 목록과 기본 입력 줄
  const salesItems = salesItemsByMonth[targetMonth] ?? [
    {
      id: 1,
      name: "",
      quantity: "",
      unitPrice: "",
    },
    {
      id: 2,
      name: "",
      quantity: "",
      unitPrice: "",
    },
  ];
  const updateSalesItems = (items: SalesItem[]) => {
    setSalesItemsByMonth((values) => ({
      ...values,
      [targetMonth]: items,
    }));
  };

  // 저장된 음료·주류 금액과 입력 중인 총 매출액
  const savedDrinks = savedDrinksByMonth[targetMonth];
  const menuSalesTotal = salesItems.reduce(
    (sum, item) => sum + menuSalesAmount(item),
    0,
  );
  const totalSales =
    menuSalesTotal +
    amountValue(drinksByMonth[targetMonth] ?? "") +
    amountValue(otherSalesByMonth[targetMonth] ?? "");

  if (!active) return null;
  return (
    <div
      data-management-panel="3"
      className={
        leaving ? "management-tab-panel is-leaving" : "management-tab-panel"
      }
    >
      {/* 이전·다음 달 이동 */}
      <div className="month-selector">
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => {
            setSalesMonthOffset((offset) => offset - 1);
          }}
        >
          ‹
        </button>
        <b>
          {salesMonth.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
          })}
        </b>
        {salesMonthOffset === 0 && <span>당월</span>}
        <button
          type="button"
          aria-label="다음 달"
          onClick={() => {
            setSalesMonthOffset((offset) => offset + 1);
          }}
        >
          ›
        </button>
      </div>
      {/* 메뉴별, 음료·주류 및 기타 매출의 합계 */}
      <article className="sales-entry">
        <label>
          {previousSalesMonth.getMonth() + 1}월 총 매출액
          <div className="currency-field">
            <input value={totalSales.toLocaleString("ko-KR")} readOnly />
            <span>원</span>
          </div>
        </label>
      </article>
      <div className="additional-heading sales-detail-heading">
        <h1>메뉴별 매출</h1>
        <p>메뉴별 판매 수량과 판매 단가를 입력해주세요.</p>
      </div>
      {/* 메뉴 선택, 판매 수량과 판매 단가 입력 */}
      <div className="management-item-list">
        {salesItems.map((item, index) => (
          <article className="management-item sales-menu-entry" key={item.id}>
            <div className="management-item-title">
              <b>메뉴 {index + 1}</b>
              <button
                type="button"
                aria-label={`메뉴 ${index + 1} 삭제`}
                onClick={() =>
                  updateSalesItems(
                    salesItems.filter((entry) => entry.id !== item.id),
                  )
                }
              >
                <img src="/management-icons/delete.svg" alt="" />
              </button>
            </div>
            <div
              className="sales-menu-picker"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setOpenSalesMenu(null);
              }}
            >
              <label htmlFor={`sales-menu-${item.id}`}>메뉴명</label>
              <div className="sales-menu-input-wrap">
                <input
                  id={`sales-menu-${item.id}`}
                  value={item.name}
                  placeholder="등록된 메뉴명 입력"
                  autoComplete="off"
                  aria-expanded={openSalesMenu === item.id}
                  aria-controls={`sales-menu-options-${item.id}`}
                  onFocus={() => setOpenSalesMenu(item.id)}
                  onChange={(event) => {
                    updateSalesItems(
                      salesItems.map((entry) =>
                        entry.id === item.id
                          ? {
                              ...entry,
                              name: event.target.value,
                            }
                          : entry,
                      ),
                    );
                    setOpenSalesMenu(item.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setOpenSalesMenu(null);
                  }}
                />
                <button
                  type="button"
                  className="sales-menu-toggle"
                  aria-label="등록된 메뉴 목록"
                  aria-expanded={openSalesMenu === item.id}
                  onClick={() =>
                    setOpenSalesMenu(openSalesMenu === item.id ? null : item.id)
                  }
                >
                  ▾
                </button>
              </div>
              {openSalesMenu === item.id && (
                <div
                  className="sales-menu-options"
                  id={`sales-menu-options-${item.id}`}
                >
                  {materials.filter(
                    (material) =>
                      material.name.trim() &&
                      material.name
                        .trim()
                        .toLowerCase()
                        .includes(item.name.trim().toLowerCase()),
                  ).length ? (
                    materials
                      .filter(
                        (material) =>
                          material.name.trim() &&
                          material.name
                            .trim()
                            .toLowerCase()
                            .includes(item.name.trim().toLowerCase()),
                      )
                      .map((material) => (
                        <button
                          type="button"
                          key={material.id}
                          onClick={() => {
                            updateSalesItems(
                              salesItems.map((entry) =>
                                entry.id === item.id
                                  ? {
                                      ...entry,
                                      name: material.name.trim(),
                                    }
                                  : entry,
                              ),
                            );
                            setOpenSalesMenu(null);
                          }}
                        >
                          {material.name.trim()}
                        </button>
                      ))
                  ) : (
                    <span>일치하는 메뉴가 없습니다.</span>
                  )}
                </div>
              )}
            </div>
            <div className="sales-unit-fields">
              <label>
                판매 단가
                <div className="currency-field">
                  <input
                    inputMode="numeric"
                    value={item.unitPrice}
                    placeholder="0"
                    onChange={(event) => {
                      const unitPrice = event.target.value;
                      updateSalesItems(
                        salesItems.map((entry) =>
                          entry.id === item.id ? { ...entry, unitPrice } : entry,
                        ),
                      );
                    }}
                  />
                  <span>원</span>
                </div>
              </label>
              <label>
                판매 수량
                <div className="currency-field">
                  <input
                    inputMode="numeric"
                    value={item.quantity}
                    placeholder="0"
                    onChange={(event) =>
                      updateSalesItems(
                        salesItems.map((entry) =>
                          entry.id === item.id
                            ? {
                                ...entry,
                                quantity: event.target.value,
                              }
                            : entry,
                        ),
                      )
                    }
                  />
                  <span>개</span>
                </div>
              </label>
            </div>
            <p className="menu-sales-total">
              <span>총 판매금액</span>
              <strong>{menuSalesAmount(item).toLocaleString("ko-KR")}원</strong>
            </p>
          </article>
        ))}
      </div>
      
      {/* 각 메뉴의 총 판매금액을 합산한 메뉴 매출액 */}
      <section className="menu-sales-summary" aria-labelledby="menu-sales-summary-title">
        <h2 id="menu-sales-summary-title">메뉴 매출액</h2>
        <p>{menuSalesTotal.toLocaleString("ko-KR")}원</p>
      </section>

      <button
        type="button"
        className="add-management-item"
        onClick={() =>
          updateSalesItems([
            ...salesItems,
            {
              id: Math.max(0, ...salesItems.map((item) => item.id)) + 1,
              name: "",
              quantity: "",
              unitPrice: "",
            },
          ])
        }
      >
        <img src="/management-icons/add.png" alt="" /> 메뉴 품목 추가
      </button>
      {/* 음료·주류 매출 입력 및 저장 */}
      <article className="sales-entry sales-drinks-entry">
        <label>
          음료/주류 매출액
          <div className="currency-field">
            <input
              inputMode="numeric"
              value={drinksByMonth[targetMonth] ?? ""}
              placeholder="0"
              onChange={(event) => {
                setDrinksByMonth((values) => ({
                  ...values,
                  [targetMonth]: event.target.value,
                }));
              }}
            />
            <span>원</span>
          </div>
        </label>
        <div className="material-save-actions">
          <span role="status">
            {salesDraftStatus["drinks" + targetMonth]?.value ===
            (drinksByMonth[targetMonth] ?? "")
              ? salesDraftStatus["drinks" + targetMonth]?.message
              : ""}
          </span>
          <button
            type="button"
            className="material-save-button"
            aria-label="음료/주류 매출액 저장하기"
            onClick={() =>
              saveSalesDraft("drinks", drinksByMonth[targetMonth] ?? "")
            }
          >
            저장하기
          </button>
        </div>
      </article>
      {/* 선택한 월에 저장한 음료·주류 매출 표시 */}
      {savedDrinks !== undefined && (
        <section
          className="sales-entry saved-drinks-sales"
          aria-label="저장한 음료/주류 매출액"
        >
          <p>
            음료/주류 매출액 {amountValue(savedDrinks).toLocaleString("ko-KR")}
            원
          </p>
        </section>
      )}
      {/* 기타 매출 입력 및 저장 */}
      <article className="sales-entry other-sales-entry">
        <label>
          기타 매출액
          <div className="currency-field">
            <input
              inputMode="numeric"
              value={otherSalesByMonth[targetMonth] ?? ""}
              placeholder="0"
              onChange={(event) => {
                const value = event.target.value;
                setOtherSalesByMonth((values) => ({
                  ...values,
                  [targetMonth]: value,
                }));
              }}
            />
            <span>원</span>
          </div>
        </label>
        <div className="material-save-actions">
          <span role="status">
            {salesDraftStatus["other" + targetMonth]?.value ===
            (otherSalesByMonth[targetMonth] ?? "")
              ? salesDraftStatus["other" + targetMonth]?.message
              : ""}
          </span>
          <button
            type="button"
            className="material-save-button"
            aria-label="기타 매출액 저장하기"
            onClick={() =>
              saveSalesDraft("other", otherSalesByMonth[targetMonth] ?? "")
            }
          >
            저장하기
          </button>
        </div>
      </article>
    </div>
  );
}
