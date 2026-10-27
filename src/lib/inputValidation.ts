import type { Input } from "./api";
export function inputErrors(
  input: Input,
  items: { name: string; amount: number }[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  const money = (key: string, n: number) => {
    if (!Number.isSafeInteger(n) || n < 0 || n > 1e12)
      errors[key] = "금액은 0~1조 원의 정수로 입력해주세요.";
  };
  for (const [key, n] of Object.entries({
    "보유자금 (원)": input.current_cash,
    "예비자금 (원)": input.reserve_cash,
    "미지급 초기 투자비 (원)": input.unpaid_initial_investment,
    "월 예상 매출 (원)": input.monthly_sales,
  }))
    money(key, n);
  const month = /^(20\d{2}|2100)-(0[1-9]|1[0-2])-01$/.test(input.start_month);
  if (!month) errors["분석 시작 월"] = "분석 시작 월을 확인해주세요.";
  if (!Number.isInteger(input.months) || input.months < 1 || input.months > 12)
    errors["분석 개월 수"] = "1~12개월로 입력해주세요.";
  const start = Date.parse(input.start_month + "T00:00:00Z");
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + input.months);
  const entries = [
    ...items.map((x, i) => ({
      x,
      name: `원재료 ${i + 1} 이름`,
      amount: `원재료 ${i + 1} 월 예상 지출액`,
    })),
    ...input.fixed_expenses.map((x, i) => ({
      x,
      name: `고정 지출 ${i + 1} 이름`,
      amount: `고정 지출 ${i + 1} 금액 (원)`,
    })),
    ...input.irregular_expenses.map((x, i) => ({
      x,
      name: `추가 지출 ${i + 1} 이름`,
      amount: `추가 지출 ${i + 1} 금액 (원)`,
    })),
  ];
  for (const { x, name, amount } of entries) {
    if (!x.name.trim() || x.name.length > 60)
      errors[name] = "항목 이름을 1~60자로 입력해주세요.";
    money(amount, x.amount);
  }
  input.irregular_expenses.forEach((x, i) => {
    const date = Date.parse(x.expected_date + "T00:00:00Z");
    if (
      !Number.isFinite(date) ||
      (!x.is_paid && (!month || date < start || date >= end.getTime()))
    )
      errors[`추가 지출 ${i + 1} 예정일`] =
        "미지급 지출의 예정일은 분석기간 안에 입력해주세요.";
  });
  input.fixed_expenses.forEach((x, i) => {
    if (
      x.due_day != null &&
      (!Number.isInteger(x.due_day) || x.due_day < 1 || x.due_day > 31)
    )
      errors[`고정 지출 ${i + 1} 납부일`] = "납부일은 1~31일로 선택해주세요.";
  });
  if (input.monthly_overrides.some((x) => x.month > input.months)) {
    errors["분석 개월 수"] =
      "기존 월별 변경 조건이 포함되도록 분석기간을 설정해주세요.";
  }
  return errors;
}
