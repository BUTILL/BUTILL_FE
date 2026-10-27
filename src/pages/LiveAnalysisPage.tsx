import { useState, type FormEvent } from "react";
import "./LiveAnalysisPage.css";

type Month = {
  month: string;
  sales: number;
  ingredient_cost: number;
  fixed_cost: number;
  irregular_cost: number;
  net_cashflow: number;
  cash_balance: number;
  available_balance: number;
};
type Runway = {
  initial_balance: number;
  first_depletion_month: string | null;
  first_shortage_month: string | null;
  status: string;
};
type Analysis = {
  monthly: Month[];
  cash_runway: Runway;
  available_runway: Runway;
  risks: { code: string; month: string; message: string }[];
  warnings: string[];
};
type Result = {
  base: Analysis;
  scenarios: { name: string; analysis: Analysis; ending_cash_delta: number }[];
};
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const start = () =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
const initial = {
  start: start(),
  cash: "25000000",
  reserve: "2500000",
  investment: "0",
  sales: "18000000",
  food: "6000000",
  fixed: "10000000",
  extra: "0",
  salesRate: "-15",
  foodRate: "8",
};
const fields = [
  ["cash", "보유자금"],
  ["reserve", "예비자금"],
  ["investment", "미지급 초기 투자비"],
  ["sales", "월 예상 매출"],
  ["food", "월 식재료비"],
  ["fixed", "월 고정 지출 합계"],
  ["extra", "시작 월 추가 지출"],
] as const;

async function compare(body: unknown, signal: AbortSignal): Promise<Result> {
  const res = await fetch("/api/v1/scenarios/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(
      data?.message ??
        `분석 요청을 처리하지 못했습니다 (${res.status}). 백엔드 실행 상태를 확인하세요.`,
    );
  }
  return res.json();
}

function runway(r: Runway) {
  if (r.initial_balance < 0) return "분석 시작 전부터 자금 부족";
  if (r.initial_balance === 0) return "시작 시점 잔액 0원";
  if (r.first_shortage_month)
    return `${r.first_shortage_month.slice(0, 7)} 월말 자금 부족 예상`;
  if (r.first_depletion_month)
    return `${r.first_depletion_month.slice(0, 7)} 월말 잔액 0원 도달`;
  return "분석한 12개월 내 자금 부족 없음";
}

export default function LiveAnalysisPage() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(0);
  const [dirty, setDirty] = useState(false);
  const change = (key: keyof typeof initial, value: string) => {
    setForm((old) => ({ ...old, [key]: value }));
    setDirty(true);
  };
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const money = (key: keyof typeof initial) => {
        const n = Number(form[key]);
        if (!form[key].trim() || !Number.isSafeInteger(n) || n < 0 || n > 1e12)
          throw new Error("금액은 0~1조 원 사이의 정수로 입력하세요.");
        return n;
      };
      const rate = (value: string) => {
        const n = Number(value);
        if (
          !value.trim() ||
          !Number.isFinite(n) ||
          n < -100 ||
          n > 500 ||
          Math.abs(n * 100 - Math.round(n * 100)) > 1e-8
        )
          throw new Error(
            "변경률은 -100~500% 범위에서 소수 둘째 자리까지 입력하세요.",
          );
        return Math.round(n * 100);
      };
      const extra = money("extra");
      const base = {
        start_month: `${form.start}-01`,
        months: 12,
        current_cash: money("cash"),
        reserve_cash: money("reserve"),
        unpaid_initial_investment: money("investment"),
        monthly_sales: money("sales"),
        monthly_ingredient_cost: money("food"),
        fixed_expenses: [{ name: "월 고정 지출 합계", amount: money("fixed") }],
        irregular_expenses: extra
          ? [
              {
                name: "시작 월 추가 지출",
                amount: extra,
                expected_date: `${form.start}-01`,
                is_paid: false,
              },
            ]
          : [],
      };
      const data = await compare(
        {
          base,
          scenarios: [
            { name: "매출 증가 (+15%)", sales_change_bps: 1500 },
            {
              name: "직접 설정한 조건",
              sales_change_bps: rate(form.salesRate),
              ingredient_change_bps: rate(form.foodRate),
            },
          ],
        },
        AbortSignal.timeout(15000),
      );
      setResult(data);
      setSelected(0);
      setDirty(false);
    } catch (err) {
      setError(
        err instanceof Error &&
          err.name !== "TimeoutError" &&
          err.name !== "TypeError"
          ? err.message
          : "백엔드에 연결하지 못했거나 응답 시간이 초과되었습니다. 잠시 후 다시 시도하세요.",
      );
    } finally {
      setBusy(false);
    }
  };
  const options = result
    ? [
        { name: "기본 조건", analysis: result.base, ending_cash_delta: 0 },
        ...result.scenarios,
      ]
    : [];
  const item = options[selected];
  return (
    <section className="live-analysis">
      <h1>실제 데이터로 시뮬레이션</h1>
      <p>
        입력한 금액을 백엔드에서 계산합니다. 이 화면의 입력과 결과는 DB에
        저장하지 않으며 화면을 나가면 초기화됩니다.
      </p>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>
            분석 시작 월
            <input
              type="month"
              required
              min="2000-01"
              max="2100-12"
              value={form.start}
              onChange={(e) => change("start", e.target.value)}
            />
          </label>
          {fields.map(([key, label]) => (
            <label key={key}>
              {label} (원)
              <input
                type="number"
                required
                min="0"
                max="1000000000000"
                step="1"
                value={form[key]}
                onChange={(e) => change(key, e.target.value)}
              />
            </label>
          ))}
          <p>
            식재료비와 고정 지출을 중복 입력하지 마세요. 예비자금은 지출이 아닌
            별도 안전자금입니다.
          </p>
          <h2>비교할 조건</h2>
          <label>
            월 매출 변경률 (%)
            <input
              type="number"
              required
              min="-100"
              max="500"
              step="0.01"
              value={form.salesRate}
              onChange={(e) => change("salesRate", e.target.value)}
            />
          </label>
          <label>
            식재료비 변경률 (%)
            <input
              type="number"
              required
              min="-100"
              max="500"
              step="0.01"
              value={form.foodRate}
              onChange={(e) => change("foodRate", e.target.value)}
            />
          </label>
          <button type="submit">
            {busy ? "백엔드 계산 중…" : "분석 및 시나리오 비교"}
          </button>
        </fieldset>
      </form>
      {error && (
        <p role="alert" className="live-error">
          {error}
        </p>
      )}
      {dirty && result && (
        <p role="status">
          입력값이 변경되었습니다. 다시 분석하면 결과에 반영됩니다.
        </p>
      )}
      {item && (
        <div aria-live="polite">
          <div className="live-tabs">
            {options.map((o, i) => (
              <button
                key={o.name}
                aria-pressed={i === selected}
                onClick={() => setSelected(i)}
              >
                {o.name}
              </button>
            ))}
          </div>
          <h2>{item.name}</h2>
          <p>
            <b>현금 기준: {runway(item.analysis.cash_runway)}</b>
          </p>
          <p>예비자금 제외 기준: {runway(item.analysis.available_runway)}</p>
          <p>
            마지막 월 잔액: {won(item.analysis.monthly.at(-1)!.cash_balance)}
          </p>
          {selected !== 0 && (
            <p>
              기본 조건 대비 마지막 월 잔액 차이: {won(item.ending_cash_delta)}
            </p>
          )}
          <div className="live-table">
            <table>
              <thead>
                <tr>
                  <th>월</th>
                  <th>매출</th>
                  <th>총지출</th>
                  <th>순현금흐름</th>
                  <th>잔액</th>
                </tr>
              </thead>
              <tbody>
                {item.analysis.monthly.map((m) => (
                  <tr key={m.month}>
                    <td>{m.month.slice(0, 7)}</td>
                    <td>{won(m.sales)}</td>
                    <td>
                      {won(m.ingredient_cost + m.fixed_cost + m.irregular_cost)}
                    </td>
                    <td>{won(m.net_cashflow)}</td>
                    <td>{won(m.cash_balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2>위험 판단 근거</h2>
          {item.analysis.risks.length ? (
            <ul>
              {item.analysis.risks.map((r, i) => (
                <li key={`${r.code}-${i}`}>
                  {r.month.slice(0, 7)}: {r.message}
                </li>
              ))}
            </ul>
          ) : (
            <p>입력 조건에서 감지된 위험 항목이 없습니다.</p>
          )}
          {item.analysis.warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      )}
    </section>
  );
}
