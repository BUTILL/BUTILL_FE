import { useState, type Dispatch, type SetStateAction } from "react";
import Toast from "../../components/Toast";
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
  saved: boolean;
  setSaved: (value: boolean) => void;
  saveMessage: string;
};

// 상단 안내 카드의 표시와 닫기 상태
type ManagementIntroProps = {
  introVisible: boolean;
  introClosing: boolean;
  dismissIntro: () => void;
};

// 빈 입력 항목을 목록에 추가
const addItem = (
  setter: Dispatch<SetStateAction<ManageItem[]>>,
  defaults: Partial<Pick<ManageItem, "due" | "description" | "amount">> = {},
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

// 선택한 항목의 입력값만 변경
const updateItem = (
  setter: Dispatch<SetStateAction<ManageItem[]>>,
  id: number,
  key: "name" | "amount" | "due" | "description",
  value: string,
) =>
  setter((items) =>
    items.map((item) =>
      item.id === id
        ? {
            ...item,
            [key]: value,
          }
        : item,
    ),
  );

// 선택한 항목을 목록에서 삭제
const removeItem = (
  setter: Dispatch<SetStateAction<ManageItem[]>>,
  id: number,
) => setter((items) => items.filter((item) => item.id !== id));

// 쉼표가 포함된 입력 금액을 계산용 숫자로 변환
const amountValue = (value: string) =>
  Number(value.replace(/[^0-9]/g, "")) || 0;

// 목록에 있는 항목의 금액을 합산
const total = (items: ManageItem[]) =>
  items.reduce((sum, item) => sum + amountValue(item.amount), 0);

// 두 번째 탭: 고정 지출과 추가 지출 입력
export default function ExpensesTab({
  active,
  leaving,
  saved,
  setSaved,
  saveMessage,
  introVisible,
  introClosing,
  dismissIntro,
  initialFixed,
  initialExtra,
  onSave,
}: ManagementPanelProps &
  ManagementIntroProps & {
    // 서버에 저장된 고정 지출(없으면 기본 항목)과 월별 추가 지출
    initialFixed?: ManageItem[];
    initialExtra: Record<string, ManageItem[]>;
    onSave: (fixed: ManageItem[], extraByMonth: Record<string, ManageItem[]>) => void;
  }) {
  // 월세, 인건비, 공과금의 기본 고정 지출 항목
  const [fixedItems, setFixedItems] = useState<ManageItem[]>(initialFixed ?? [
    {
      id: 1,
      name: "매장 월세",
      amount: "",
      due: "매월 10일",
      description: "건물 임대료 및 기본 관리",
    },
    {
      id: 2,
      name: "직원 · 알바 인건비",
      amount: "",
      due: "매월 10일",
      description: "정직원 급여 및 파트타임 정산",
    },
    {
      id: 3,
      name: "공과금 · 관리비",
      amount: "",
      due: "매월 10일",
      description: "전기, 수도, 가스 및 상가 관리비",
    },
  ]);

  // 좌우 이동으로 선택한 추가 지출 기준 월 (이번 달 기준)
  const [expenseMonthOffset, setExpenseMonthOffset] = useState(0);
  const selectedMonth = monthFromToday(expenseMonthOffset);
  const monthKey = monthKeyOf(selectedMonth);
  const month = selectedMonth.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });

  // 월별 추가 지출 (입력하지 않은 달은 빈 입력 2줄)
  const [extraByMonth, setExtraByMonth] = useState<Record<string, ManageItem[]>>(initialExtra);
  const extraItems = extraByMonth[monthKey] ?? [
    { id: 1, name: "", amount: "" },
    { id: 2, name: "", amount: "" },
  ];
  const setExtraItems: Dispatch<SetStateAction<ManageItem[]>> = (update) =>
    setExtraByMonth((byMonth) => {
      const current = byMonth[monthKey] ?? extraItems;
      return { ...byMonth, [monthKey]: typeof update === "function" ? update(current) : update };
    });
  if (!active) return null;
  return (
    <div
      data-management-panel="2"
      className={
        leaving ? "management-tab-panel is-leaving" : "management-tab-panel"
      }
    >
      {/* 고정·추가 지출 입력 안내 카드 */}
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
        {/* 월마다 반복되는 지출 */}
        <h1>고정 지출</h1>
        <p>월세, 인건비, 공과금처럼 매월 반복해서 나가는 지출을 입력하세요.</p>
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
                placeholder="0"
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
            <AmountPresets
              itemId={item.id}
              setItems={setFixedItems}
              amounts={index === 2 ? [5, 10, 20] : undefined}
            />
            <label className="due-field">
              <span>
                <img src="/management-icons/payment-date.svg" alt="" />
                　지급일
              </span>
              <select
                value={item.due}
                onChange={(event) =>
                  updateItem(setFixedItems, item.id, "due", event.target.value)
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
            amount: "",
            description: "",
            due: "매월 10일",
          })
        }
      >
        <img src="/management-icons/add.png" alt="" /> 고정 지출 항목 추가하기
      </button>
      <p className="management-helper">
        매달 고정적으로 지출되는 새로운 항목(보험료, 렌탈비 등)을 추가할 수
        있습니다.
      </p>
      {/* 추가 지출을 입력할 월 선택 */}
      <div className="month-selector">
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => {
            setExpenseMonthOffset((offset) => offset - 1);
            setSaved(false);
          }}
        >
          ‹
        </button>
        <b>{month}</b>
        {expenseMonthOffset === 0 && <span>당월</span>}
        <button
          type="button"
          aria-label="다음 달"
          onClick={() => {
            setExpenseMonthOffset((offset) => offset + 1);
            setSaved(false);
          }}
        >
          ›
        </button>
      </div>
      <div className="additional-heading">
        {/* 선택한 월에 발생한 추가 지출 */}
        <h1>추가 지출</h1>
        <p>
          갑작스러운 수리비, 비품 구매, 회식비, 카드값 등 이번 달 추가로 발생한
          지출을 입력하세요.
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
                updateItem(setExtraItems, item.id, "name", event.target.value)
              }
            />
            <div className="currency-field">
              <input
                aria-label="지출 금액"
                inputMode="numeric"
                value={item.amount}
                placeholder="0"
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
            <AmountPresets itemId={item.id} setItems={setExtraItems} />
          </article>
        ))}
      </div>
      <button
        className="add-management-item"
        onClick={() =>
          addItem(setExtraItems, {
            amount: "",
          })
        }
      >
        <img src="/management-icons/add.png" alt="" /> 추가 지출 항목 추가하기
      </button>
      <p className="management-helper">
        이번 달 카드값이나 갑작스러운 지출을 빠짐없이 입력해주세요.
      </p>
      {/* 고정 지출과 추가 지출 합계 및 저장 */}
      <ManagementSummary
        title="수정 반영된 예상 월 지출 합계"
        label="예상 지출 합산"
        amount={total(fixedItems) + total(extraItems)}
        saveLabel="지출 변경사항 저장하기"
        saved={saved}
        message={saveMessage}
        onSave={() => onSave(fixedItems, extraByMonth)}
      />
    </div>
  );
}

// 선택한 지출 금액에 버튼의 단위 금액을 더함
function AmountPresets({
  itemId,
  setItems,
  amounts = [10, 50, 100],
}: {
  itemId: number;
  setItems: Dispatch<SetStateAction<ManageItem[]>>;
  amounts?: number[];
}) {
  const addAmount = (amount: number) => {
    setItems((items) =>
      items.map((item) => {
        if (item.id !== itemId) return item;
        const updatedAmount = amountValue(item.amount) + amount * 10_000;
        return {
          ...item,
          amount: updatedAmount.toLocaleString("ko-KR"),
        };
      }),
    );
  };
  return (
    <div className="amount-presets">
      {amounts.map((amount) => (
        <button key={amount} type="button" onClick={() => addAmount(amount)}>
          +{amount}만
        </button>
      ))}
    </div>
  );
}

// 화면 하단의 합계, 저장 버튼과 완료 알림
function ManagementSummary({
  title,
  label,
  amount,
  saveLabel,
  saved,
  message,
  onSave,
}: {
  title: string;
  label: string;
  amount: number;
  saveLabel: string;
  saved: boolean;
  message: string;
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
          <Toast message={message || "저장이 완료되었습니다"} className="management-toast" />
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
