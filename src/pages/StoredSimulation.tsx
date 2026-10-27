import { useState, type FormEvent } from "react";
import { useAccount } from "../lib/Account";
import {
  api,
  runway,
  won,
  type Analysis,
  type SavedAnalysis,
} from "../lib/api";
import "../lib/account.css";

type Comparison = {
  base: Analysis;
  scenarios: { analysis: Analysis; ending_cash_delta: number }[];
};
export default function StoredSimulation({
  onManage,
}: {
  onManage: () => void;
}) {
  const account = useAccount();
  const [sales, setSales] = useState("-15");
  const [food, setFood] = useState("8");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Comparison | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !account.store) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const bps = (text: string) => {
        const n = Number(text);
        if (
          !text.trim() ||
          !Number.isFinite(n) ||
          n < -100 ||
          n > 500 ||
          Math.abs(n * 100 - Math.round(n * 100)) > 1e-8
        )
          throw new Error("변경률을 -100~500%, 소수 둘째 자리까지 입력하세요.");
        return Math.round(n * 100);
      };
      const scenario = {
        name: "직접 설정한 조건",
        sales_change_bps: bps(sales),
        ingredient_change_bps: bps(food),
      };
      const base = await api<SavedAnalysis>(
        `/stores/${account.store.id}/analyses`,
        "POST",
      );
      const saved = await api<{ comparison: Comparison }>(
        `/stores/${account.store.id}/scenarios`,
        "POST",
        { base_analysis_id: base.id, scenario },
      );
      setResult(saved.comparison);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };
  if (!account.finance)
    return (
      <section className="account-page">
        <h1>시나리오 비교</h1>
        <p>경영정보를 먼저 저장해주세요.</p>
        <button onClick={onManage}>입력/관리로 이동</button>
      </section>
    );
  const changed = result?.scenarios[0];
  return (
    <section className="account-page">
      <h1>저장된 경영정보로 비교</h1>
      <p>
        DB의 최신 입력을 기준으로 분석하고 기준 분석·시나리오·비교 결과를 DB에
        저장합니다.
      </p>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>
            매출 변경률 (%)
            <input
              type="number"
              required
              min="-100"
              max="500"
              step="0.01"
              value={sales}
              onChange={(e) => setSales(e.target.value)}
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
              value={food}
              onChange={(e) => setFood(e.target.value)}
            />
          </label>
          <button type="submit">
            {busy ? "분석·저장 중…" : "시나리오 비교 및 DB 저장"}
          </button>
        </fieldset>
      </form>
      <p role="alert">{error}</p>
      {result && changed && (
        <div role="status">
          <p>기준 분석과 시나리오 비교가 DB에 저장되었습니다.</p>
          <h2>기본 조건</h2>
          <p>{runway(result.base.cash_runway)}</p>
          <p>마지막 월 잔액: {won(result.base.monthly.at(-1)!.cash_balance)}</p>
          <h2>변경 조건</h2>
          <p>{runway(changed.analysis.cash_runway)}</p>
          <p>
            마지막 월 잔액: {won(changed.analysis.monthly.at(-1)!.cash_balance)}
          </p>
          <p>기본 대비 차이: {won(changed.ending_cash_delta)}</p>
          {changed.analysis.monthly.map((m) => (
            <p key={m.month}>
              {m.month.slice(0, 7)} · 월말 잔액 {won(m.cash_balance)}
            </p>
          ))}
          <h2>위험 근거</h2>
          {changed.analysis.risks.map((r, i) => (
            <p key={i}>
              {r.month.slice(0, 7)}: {r.message}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
