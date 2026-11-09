import type { AnalysisInput, FixedExpenseInput, IrregularExpenseInput } from "../types/api";

// 입력/관리 화면 ↔ 백엔드 경영정보(AnalysisInput) 변환

// 쉼표가 포함된 입력 금액을 숫자로 변환
export const amountOf = (value: string) => Number(value.replace(/[^0-9]/g, "")) || 0;
export const formatAmount = (value: number) => (value ? value.toLocaleString("ko-KR") : "");

// YYYY-MM 형식의 월 키
export const monthKeyOf = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
// 이번 달 기준으로 offset만큼 이동한 달의 1일
export const monthFromToday = (offset: number) => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + offset, 1);
};
// 두 월 키 사이의 개월 차이 (b - a)
const monthDiff = (a: string, b: string) => {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
};

type NamedAmount = { name: string; amount: string };

// 이름·금액이 모두 비어 있는 줄은 제외하고, 이름이 없으면 기본 이름 사용
const filled = <T extends NamedAmount>(items: T[], fallback: (index: number) => string) =>
  items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.name.trim() || amountOf(item.amount) > 0)
    .map(({ item, index }) => ({
      item,
      name: (item.name.trim() || fallback(index)).slice(0, 60),
      amount: amountOf(item.amount),
    }));

// 원재료비 탭: 메뉴별 원재료비 → ingredient_items, 합계 → monthly_ingredient_cost
export function withMaterials(input: AnalysisInput, materials: NamedAmount[]): AnalysisInput {
  const items = filled(materials, (i) => `원재료 ${i + 1}`).map(({ name, amount }) => ({ name, amount }));
  return {
    ...input,
    ingredient_items: items,
    monthly_ingredient_cost: items.reduce((sum, item) => sum + item.amount, 0),
  };
}

// 지급일 표시("매월 10일") ↔ due_day
export const dueLabel = (dueDay: number | null | undefined) => (dueDay ? `매월 ${dueDay}일` : "직접 선택");
const dueDayOf = (label: string | undefined) => {
  const day = Number(label?.match(/(\d+)일/)?.[1]);
  return day >= 1 && day <= 31 ? day : null;
};

// 고정 지출 → fixed_expenses
export function withFixedExpenses(
  input: AnalysisInput,
  items: (NamedAmount & { due?: string })[],
): AnalysisInput {
  const fixed: FixedExpenseInput[] = filled(items, (i) => `고정 지출 ${i + 1}`).map(({ item, name, amount }) => ({
    name,
    amount,
    due_day: dueDayOf(item.due),
  }));
  return { ...input, fixed_expenses: fixed };
}

// 분석 기간(시작 월부터 months개월) 안의 달인지
export function monthInPeriod(input: AnalysisInput, monthKey: string) {
  const diff = monthDiff(input.start_month.slice(0, 7), monthKey);
  return diff >= 0 && diff < input.months;
}

// 월별 추가 지출 → irregular_expenses (분석 시작 전 달은 이미 지출한 것으로 처리)
export function withExtraExpenses(
  input: AnalysisInput,
  byMonth: Record<string, NamedAmount[]>,
): AnalysisInput {
  const start = input.start_month.slice(0, 7);
  const irregular: IrregularExpenseInput[] = [];
  for (const [monthKey, items] of Object.entries(byMonth)) {
    const before = monthDiff(start, monthKey) < 0;
    if (!before && !monthInPeriod(input, monthKey)) {
      if (filled(items, () => "").length)
        throw new Error("분석 기간(12개월) 이후의 추가 지출은 저장할 수 없어요.");
      continue;
    }
    for (const { name, amount } of filled(items, (i) => `추가 지출 ${i + 1}`)) {
      irregular.push({ name, amount, expected_date: `${monthKey}-01`, is_paid: before });
    }
  }
  return { ...input, irregular_expenses: irregular };
}

// 저장된 추가 지출을 월별 목록으로 묶기
export function extraExpensesByMonth(input: AnalysisInput | undefined) {
  const byMonth: Record<string, { id: number; name: string; amount: string }[]> = {};
  input?.irregular_expenses.forEach((item, index) => {
    const key = item.expected_date.slice(0, 7);
    (byMonth[key] ??= []).push({ id: index + 1, name: item.name, amount: formatAmount(item.amount) });
  });
  return byMonth;
}

// 월 매출 → 분석 시작 전 달이면 기준 월 매출(monthly_sales), 기간 안이면 해당 월 변경값
export function withMonthlySales(input: AnalysisInput, monthKey: string, total: number): AnalysisInput {
  const diff = monthDiff(input.start_month.slice(0, 7), monthKey);
  if (diff < 0) return { ...input, monthly_sales: total };
  if (diff >= input.months) throw new Error("분석 기간(12개월) 이후의 매출은 저장할 수 없어요.");
  const month = diff + 1;
  const others = input.monthly_overrides.filter((o) => o.month !== month);
  const current = input.monthly_overrides.find((o) => o.month === month);
  return {
    ...input,
    // 분석 첫 달 매출은 기준 월 매출로도 사용
    ...(month === 1 ? { monthly_sales: total } : {}),
    monthly_overrides: [...others, { ...current, month, sales: total }].sort((a, b) => a.month - b.month),
  };
}
