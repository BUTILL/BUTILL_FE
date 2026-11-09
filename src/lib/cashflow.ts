import type { Analysis } from "../types/api";

// 월별 금액 (원 단위, 월은 YYYY-MM)
export type MonthlyAmount = { month: string; amount: number };

export type CashFlowRow = {
  key: string;
  label: string;
  actual: boolean;
  income: number;
  expense: number;
  net: number;
  balance: number;
};

export type CashFlowResult = {
  rows: CashFlowRow[];
  latest: CashFlowRow;
  averageNet: number;
  runway: number | null;
};

// 백엔드 분석 결과(Analysis)를 화면용 현금흐름 형식으로 변환
// - 첫 달(분석 시작 월)은 입력값 기준, 이후는 예측
// - 잔액은 비상금·미지급 투자금을 뺀 가용잔액 기준
export function fromAnalysis(analysis: Analysis): CashFlowResult | null {
  if (!analysis.monthly.length) return null;
  const rows = analysis.monthly.map((m, index): CashFlowRow => ({
    key: m.month.slice(0, 7),
    label: `${Number(m.month.slice(5, 7))}월`,
    actual: index === 0,
    income: m.sales,
    expense: m.ingredient_cost + m.fixed_cost + m.irregular_cost,
    net: m.net_cashflow,
    balance: m.available_balance,
  }));
  const averageNet = rows.reduce((total, row) => total + row.net, 0) / rows.length;
  const latest = rows[0];
  return {
    rows,
    latest,
    averageNet,
    runway: averageNet < 0 ? Math.max(0, latest.balance) / -averageNet : null,
  };
}
