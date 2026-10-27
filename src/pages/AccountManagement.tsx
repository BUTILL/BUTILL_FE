import { useState, type FormEvent } from "react";
import { useAccount } from "../lib/Account";
import { ApiError, won, type Input } from "../lib/api";
import MoneyInput from "../components/MoneyInput";
import { inputErrors } from "../lib/inputValidation";
import "./ManagementPage.css";
import "./Dashboard.css";
type Tab = "materials" | "fixed" | "additional";
const tabs: [Tab, string][] = [
  ["materials", "원재료비 입력/수정"],
  ["fixed", "고정 지출 수정"],
  ["additional", "매출/추가 지출 입력"],
];
export default function AccountManagement() {
  const account = useAccount();
  const [input, setInput] = useState<Input>(() =>
    structuredClone(account.finance!.input),
  );
  const [tab, setTab] = useState<Tab>("materials");
  const [items, setItems] = useState(() =>
    structuredClone(
      account.finance?.input.ingredient_items?.length
        ? account.finance.input.ingredient_items
        : account.finance?.input.monthly_ingredient_cost
          ? [
              {
                name: "기존 원재료비 합계",
                amount: account.finance.input.monthly_ingredient_cost,
              },
            ]
          : [],
    ),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);
  const [serverFields, setServerFields] = useState<Record<string, string>>({});
  const errors = checked
    ? { ...serverFields, ...inputErrors(input, items) }
    : {};
  const invalid = (label: string) => ({ "aria-invalid": !!errors[label] });
  const [intro, setIntro] = useState(true);
  const total =
    tab === "materials"
      ? items.reduce((s, x) => s + x.amount, 0)
      : tab === "fixed"
        ? input.fixed_expenses.reduce((s, x) => s + x.amount, 0)
        : input.irregular_expenses
            .filter((x) => !x.is_paid)
            .reduce((s, x) => s + x.amount, 0);
  const number = (
    label: string,
    value: number,
    change: (n: number) => void,
  ) => (
    <label>
      {label}
      <MoneyInput
        label={label}
        value={value}
        invalid={!!errors[label]}
        onChange={(v) => change(v === "" ? NaN : Number(v))}
      />
    </label>
  );
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setMessage("");
    const draft = {
      ...input,
      ingredient_items: items,
      monthly_ingredient_cost: items.reduce((s, x) => s + x.amount, 0),
    };
    setChecked(true);
    setServerFields({});
    const issues = inputErrors(draft, items);
    if (Object.keys(issues).length) {
      const first = Object.keys(issues)[0];
      setTab(
        first.startsWith("원재료")
          ? "materials"
          : first.startsWith("고정 지출")
            ? "fixed"
            : first.startsWith("추가 지출") || first.startsWith("월 예상")
              ? "additional"
              : tab,
      );
      setError("입력값의 누락·형식·범위와 분석기간을 확인하세요.");
      return;
    }
    setBusy(true);
    try {
      setMessage(await account.save(draft));
      setInput(draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
      if (e instanceof ApiError && e.status === 422) {
        const fields: Record<string, string> = {};
        const labels: Record<string, string> = {
          current_cash: "보유자금 (원)",
          reserve_cash: "예비자금 (원)",
          unpaid_initial_investment: "미지급 초기 투자비 (원)",
          monthly_sales: "월 예상 매출 (원)",
          start_month: "분석 시작 월",
          months: "분석 개월 수",
        };
        for (const field of e.fields) {
          const path = field.replace(/^body\.(input\.)?/, "");
          const parts = path.split(".");
          if (labels[path]) fields[labels[path]] = "입력값을 확인해주세요.";
          else if (
            [
              "fixed_expenses",
              "irregular_expenses",
              "ingredient_items",
            ].includes(parts[0])
          ) {
            const prefix =
              parts[0] === "fixed_expenses"
                ? "고정 지출"
                : parts[0] === "irregular_expenses"
                  ? "추가 지출"
                  : "원재료";
            const suffix =
              parts[2] === "name"
                ? "이름"
                : parts[2] === "expected_date"
                  ? "예정일"
                  : parts[2] === "due_day"
                    ? "납부일"
                    : prefix === "원재료"
                      ? "월 예상 지출액"
                      : "금액 (원)";
            fields[`${prefix} ${Number(parts[1]) + 1} ${suffix}`] =
              "입력값을 확인해주세요.";
          } else {
            fields["분석 시작 월"] = "분석기간과 항목의 예정일을 확인해주세요.";
            fields["분석 개월 수"] = "분석기간을 확인해주세요.";
          }
        }
        setServerFields(fields);
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="management-page connected-management">
      <div
        className="management-tabs"
        data-active={tab}
        role="tablist"
        aria-label="입력 항목"
      >
        {tabs.map(([id, label]) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === id}
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => {
              setTab(id);
              setIntro(true);
              setMessage("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <form noValidate onSubmit={submit} onChange={() => setServerFields({})}>
        <fieldset disabled={busy}>
          {intro && (
            <section className="management-intro">
              <div>
                <h1>
                  {tab === "materials"
                    ? "주요 원재료비 입력 및 관리"
                    : tab === "fixed"
                      ? "월 필수 고정 지출 수정"
                      : "매출 및 추가 지출 입력"}
                </h1>
                <p>
                  {tab === "materials"
                    ? "매월 구입하는 식재료와 주요 재료의 예상 지출을 등록해주세요."
                    : tab === "fixed"
                      ? "매월 고정적으로 지출하는 비용과 납부일을 수정해주세요."
                      : "예상 매출과 비정기적으로 발생하는 지출을 입력해주세요."}
                </p>
              </div>
              <button
                type="button"
                aria-label="안내 닫기"
                onClick={() => setIntro(false)}
              >
                ×
              </button>
            </section>
          )}
          {tab === "materials" && (
            <>
              <div className="management-item-list">
                {items.map((x, i) => (
                  <section className="management-item" key={i}>
                    <div className="management-item-title">
                      <b>원재료 {i + 1}</b>
                      <button
                        type="button"
                        aria-label={`원재료 ${i + 1} 삭제`}
                        onClick={() =>
                          setItems(items.filter((_, j) => j !== i))
                        }
                      >
                        ♜
                      </button>
                    </div>
                    <label>
                      원재료 또는 품목명
                      <input
                        required
                        maxLength={60}
                        aria-label={`원재료 ${i + 1} 이름`}
                        {...invalid(`원재료 ${i + 1} 이름`)}
                        value={x.name}
                        onChange={(e) =>
                          setItems(
                            items.map((v, j) =>
                              j === i ? { ...v, name: e.target.value } : v,
                            ),
                          )
                        }
                      />
                    </label>
                    {number(`원재료 ${i + 1} 월 예상 지출액`, x.amount, (n) =>
                      setItems(
                        items.map((v, j) =>
                          j === i ? { ...v, amount: n } : v,
                        ),
                      ),
                    )}
                  </section>
                ))}
              </div>
              <button
                className="add-entry"
                type="button"
                disabled={items.length >= 100}
                onClick={() => setItems([...items, { name: "", amount: 0 }])}
              >
                ⊕ 원재료 추가하기
              </button>
              <p className="management-helper">
                원재료별 금액은 월 식재료비 합계에 반영됩니다.
              </p>
            </>
          )}
          {tab === "fixed" && (
            <>
              <div className="management-item-list">
                {input.fixed_expenses.map((x, i) => (
                  <section className="management-item" key={i}>
                    <div className="management-item-title">
                      <b>{x.name || "고정 지출"}</b>
                      <button
                        type="button"
                        aria-label={`고정 지출 ${i + 1} 삭제`}
                        onClick={() =>
                          setInput({
                            ...input,
                            fixed_expenses: input.fixed_expenses.filter(
                              (_, j) => j !== i,
                            ),
                          })
                        }
                      >
                        ♜
                      </button>
                    </div>
                    <label>
                      지출 항목
                      <input
                        required
                        maxLength={60}
                        aria-label={`고정 지출 ${i + 1} 이름`}
                        {...invalid(`고정 지출 ${i + 1} 이름`)}
                        value={x.name}
                        onChange={(e) =>
                          setInput({
                            ...input,
                            fixed_expenses: input.fixed_expenses.map((v, j) =>
                              j === i ? { ...v, name: e.target.value } : v,
                            ),
                          })
                        }
                      />
                    </label>
                    {number(`고정 지출 ${i + 1} 금액 (원)`, x.amount, (n) =>
                      setInput({
                        ...input,
                        fixed_expenses: input.fixed_expenses.map((v, j) =>
                          j === i ? { ...v, amount: n } : v,
                        ),
                      }),
                    )}
                    <div className="amount-presets">
                      {[100000, 500000, 1000000].map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() =>
                            setInput({
                              ...input,
                              fixed_expenses: input.fixed_expenses.map(
                                (v, j) =>
                                  j === i
                                    ? {
                                        ...v,
                                        amount: Math.min(1e12, v.amount + n),
                                      }
                                    : v,
                              ),
                            })
                          }
                        >
                          +{n / 10000}만
                        </button>
                      ))}
                    </div>
                    <label className="due-field">
                      납부일
                      <select
                        aria-label={`고정 지출 ${i + 1} 납부일`}
                        {...invalid(`고정 지출 ${i + 1} 납부일`)}
                        value={x.due_day ?? ""}
                        onChange={(e) =>
                          setInput({
                            ...input,
                            fixed_expenses: input.fixed_expenses.map((v, j) =>
                              j === i
                                ? {
                                    ...v,
                                    due_day: e.target.value
                                      ? Number(e.target.value)
                                      : null,
                                  }
                                : v,
                            ),
                          })
                        }
                      >
                        <option value="">미등록</option>
                        {Array.from({ length: 31 }, (_, n) => (
                          <option key={n} value={n + 1}>
                            매월 {n + 1}일
                          </option>
                        ))}
                      </select>
                    </label>
                  </section>
                ))}
              </div>
              <button
                type="button"
                className="add-entry"
                disabled={input.fixed_expenses.length >= 100}
                onClick={() =>
                  setInput({
                    ...input,
                    fixed_expenses: [
                      ...input.fixed_expenses,
                      { name: "", amount: 0 },
                    ],
                  })
                }
              >
                ⊕ 고정 지출 항목 추가하기
              </button>
              <p className="management-helper">
                해당 날짜가 없는 달은 말일로 표시됩니다. 식재료비는 중복
                입력하지 마세요.
              </p>
            </>
          )}
          {tab === "additional" && (
            <>
              <section className="management-item sales-entry">
                {number("월 예상 매출 (원)", input.monthly_sales, (n) =>
                  setInput({ ...input, monthly_sales: n }),
                )}
              </section>
              <h2 className="entry-heading">추가 지출</h2>
              <div className="management-item-list">
                {input.irregular_expenses.map((x, i) => (
                  <section className="management-item" key={i}>
                    <div className="management-item-title">
                      <b>지출 항목 {i + 1}</b>
                      <button
                        type="button"
                        aria-label={`추가 지출 ${i + 1} 삭제`}
                        onClick={() =>
                          setInput({
                            ...input,
                            irregular_expenses: input.irregular_expenses.filter(
                              (_, j) => j !== i,
                            ),
                          })
                        }
                      >
                        ♜
                      </button>
                    </div>
                    <label>
                      지출 항목명
                      <input
                        required
                        maxLength={60}
                        aria-label={`추가 지출 ${i + 1} 이름`}
                        {...invalid(`추가 지출 ${i + 1} 이름`)}
                        value={x.name}
                        onChange={(e) =>
                          setInput({
                            ...input,
                            irregular_expenses: input.irregular_expenses.map(
                              (v, j) =>
                                j === i ? { ...v, name: e.target.value } : v,
                            ),
                          })
                        }
                      />
                    </label>
                    {number(`추가 지출 ${i + 1} 금액 (원)`, x.amount, (n) =>
                      setInput({
                        ...input,
                        irregular_expenses: input.irregular_expenses.map(
                          (v, j) => (j === i ? { ...v, amount: n } : v),
                        ),
                      }),
                    )}
                    <label>
                      예정일
                      <input
                        aria-label={`추가 지출 ${i + 1} 예정일`}
                        {...invalid(`추가 지출 ${i + 1} 예정일`)}
                        type="date"
                        required
                        value={x.expected_date}
                        onChange={(e) =>
                          setInput({
                            ...input,
                            irregular_expenses: input.irregular_expenses.map(
                              (v, j) =>
                                j === i
                                  ? { ...v, expected_date: e.target.value }
                                  : v,
                            ),
                          })
                        }
                      />
                    </label>
                    <label className="paid-check">
                      <input
                        type="checkbox"
                        checked={x.is_paid}
                        onChange={(e) =>
                          setInput({
                            ...input,
                            irregular_expenses: input.irregular_expenses.map(
                              (v, j) =>
                                j === i
                                  ? { ...v, is_paid: e.target.checked }
                                  : v,
                            ),
                          })
                        }
                      />
                      지급 완료 (분석에서 다시 차감하지 않음)
                    </label>
                  </section>
                ))}
              </div>
              <button
                type="button"
                className="add-entry"
                disabled={input.irregular_expenses.length >= 100}
                onClick={() =>
                  setInput({
                    ...input,
                    irregular_expenses: [
                      ...input.irregular_expenses,
                      {
                        name: "",
                        amount: 0,
                        expected_date: input.start_month,
                        is_paid: false,
                      },
                    ],
                  })
                }
              >
                ⊕ 지출 항목 추가하기
              </button>
              <p className="management-helper">
                미지급 지출의 예정일은 분석기간 안에 입력해주세요.
              </p>
            </>
          )}
          <section className="management-summary">
            <b>수정된 항목의 예상 지출 합계</b>
            <div>
              <span>
                {tab === "materials"
                  ? "예상 원재료비"
                  : tab === "fixed"
                    ? "예상 고정비"
                    : "미지급 추가 지출"}
              </span>
              <strong>{won(Number.isFinite(total) ? total : 0)}</strong>
            </div>
            <button
              type="submit"
              className="management-save"
              aria-label="경영정보 저장 및 분석"
            >
              {busy
                ? "저장 중…"
                : tab === "materials"
                  ? "원재료비 저장하기"
                  : tab === "fixed"
                    ? "고정 지출 변경사항 저장하기"
                    : "추가 지출 변경사항 저장하기"}
            </button>
          </section>
          <details
            className="management-item base-settings"
            open={
              !!(
                errors["분석 시작 월"] ||
                errors["분석 개월 수"] ||
                errors["보유자금 (원)"] ||
                errors["예비자금 (원)"] ||
                errors["미지급 초기 투자비 (원)"]
              ) || undefined
            }
          >
            <summary>분석 기준 · 보유자금 수정</summary>
            <label>
              분석 시작 월
              <input
                type="month"
                {...invalid("분석 시작 월")}
                required
                min="2000-01"
                max="2100-12"
                value={input.start_month.slice(0, 7)}
                onChange={(e) =>
                  setInput({ ...input, start_month: e.target.value + "-01" })
                }
              />
            </label>
            <label>
              분석 개월 수
              <input
                type="number"
                {...invalid("분석 개월 수")}
                min="1"
                max="12"
                required
                value={input.months}
                onChange={(e) =>
                  setInput({ ...input, months: e.target.valueAsNumber })
                }
              />
            </label>
            {(
              [
                ["current_cash", "보유자금"],
                ["reserve_cash", "예비자금"],
                ["unpaid_initial_investment", "미지급 초기 투자비"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                {number(label + " (원)", input[key], (n) =>
                  setInput({ ...input, [key]: n }),
                )}
              </div>
            ))}
            {!!input.monthly_overrides.length && (
              <p>
                기존 월별 변경 조건 {input.monthly_overrides.length}개가
                적용됩니다.
              </p>
            )}
          </details>
        </fieldset>
      </form>
      {message && (
        <p role="status" className="save-toast">
          <span aria-hidden="true">✓ </span>
          <span>{message}</span>
        </p>
      )}
      {error && (
        <p role="alert" className="entry-error">
          {error}
          <br />
          {Object.entries(errors).map(([label, text]) => (
            <span className="input-error-note" key={label}>
              {label}: {text}
            </span>
          ))}
        </p>
      )}
    </section>
  );
}
