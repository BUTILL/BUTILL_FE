//백엔드 응답으로 전달할 데이터 형식
//금액은 문자열이 아닌 원 단위
export type MonthlyCashFlowInput = {
  month: string; //YYYY-MM
  income: number;
  expense: number; //부가세를 포함한 전체 지출
  taxPayment?: number; //지출 중 부가세 금액: 잔고에서 다시 차감하면 안 됨
  isForecast?: boolean;
};

export type DashboardData = {
  startMonth: string; //앱 사용을 시작한 월
  openingBalance: number; //시작 월의 수입·지출을 반영하기 전 사용자의 잔액
  monthlyCashFlows: MonthlyCashFlowInput[];
};

export type CashFlowRow = {
  month: string;
  label: string;
  income: number | null;
  expense: number | null;
  net: number | null;
  balance: number | null;
  taxPayment: number;
  isForecast: boolean;
};

//시간대와 관계없이 연도·월을 계산
export function isValidMonth(month: unknown): month is string {
  return typeof month === "string" && /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(month);
}

export function addMonths(month: string, offset: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const total = year * 12 + monthNumber - 1 + offset;

  return `${Math.floor(total / 12)}-${String(total % 12 + 1).padStart(2, "0")}`;
}

export function formatMonth(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);

  return `${year}년 ${monthNumber}월`;
}

// 화면에 표시할 때만 쉼표와 단위 붙임
export function formatMoney(value: number | null): string {
  if (value === null) return "확인 불가";
  if (value === 0) return "0원";

  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const unit = absolute >= 100000000 ? 100000000 : absolute >= 10000 ? 10000 : 1;
  const suffix = unit === 100000000 ? "억원" : unit === 10000 ? "만원" : "원";

  return `${sign}${(absolute / unit).toLocaleString("ko-KR", {
    maximumFractionDigits: unit === 1 ? 0 : 2,
  })}${suffix}`;
}

export function formatSignedMoney(value: number | null): string {
  return value !== null && value > 0 ? `+${formatMoney(value)}` : formatMoney(value);
}

// 그래프·목록·부가세 카드·캐시런웨이에서 공통으로 사용하는 12개월 계산 결과
export function buildCashFlowRows(data: DashboardData | null | undefined): CashFlowRow[] | null {
  if (
    !data ||
    !isValidMonth(data.startMonth) ||
    Number(data.startMonth.slice(0, 4)) > 9998 ||
    !Number.isSafeInteger(data.openingBalance) ||
    !Array.isArray(data.monthlyCashFlows)
  ) {
    return null;
  }

  const entries = new Map<string, MonthlyCashFlowInput>();

  for (const item of data.monthlyCashFlows) {
    // 중복 월과 잘못된 금액은 임의로 고치지 않고 데이터 오류로 처리
    if (
      !item ||
      !isValidMonth(item.month) ||
      !Number.isSafeInteger(item.income) || item.income < 0 ||
      !Number.isSafeInteger(item.expense) || item.expense < 0 ||
      (item.isForecast !== undefined && typeof item.isForecast !== "boolean") ||
      (item.taxPayment !== undefined && (
        !Number.isSafeInteger(item.taxPayment) ||
        item.taxPayment < 0 || item.taxPayment > item.expense
      )) ||
      entries.has(item.month)
    ) {
      return null;
    }

    entries.set(item.month, item);
  }

  let runningBalance: number | null = data.openingBalance;
  const rows: CashFlowRow[] = [];

  // 앱 사용 시작 월부터 12개월을 만들고 목록에서는 앞 6개월을 사용
  for (let index = 0; index < 12; index += 1) {
    const month = addMonths(data.startMonth, index);
    const item = entries.get(month);
    const net = item ? item.income - item.expense : null;

    //누락 월은 누적 잔고 확인 불가로 표시
    runningBalance = runningBalance !== null && net !== null ? runningBalance + net : null;

    if (runningBalance !== null && !Number.isSafeInteger(runningBalance)) return null;

    rows.push({
      month,
      label: `${Number(month.slice(5))}월`,
      income: item?.income ?? null,
      expense: item?.expense ?? null,
      net,
      balance: runningBalance,
      taxPayment: item?.taxPayment ?? 0,
      isForecast: item?.isForecast ?? false,
    });
  }
  return rows;
}

//받은 금액에 맞춰 세로축 범위와 그래프 좌표 계산
export function createChartGeometry(rows: CashFlowRow[]) {
  const values = rows.flatMap((row) => [row.income, row.expense, row.balance])
    .filter((value): value is number => value !== null);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(1, ...values);
  const roughStep = (maximum - minimum) / 5;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const step = Math.max(1, (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude);
  const axisMinimum = Math.floor(minimum / step) * step;
  const axisMaximum = Math.ceil(maximum / step) * step;
  const y = (value: number) => 58 + (axisMaximum - value) / (axisMaximum - axisMinimum) * 212;
  const x = (index: number) => 58 + (index + 0.5) * (686 / 12);
  const ticks = Array.from(
    { length: Math.round((axisMaximum - axisMinimum) / step) + 1 },
    (_, index) => axisMaximum - index * step,
  );

  return { x, y, ticks, zeroY: y(0) };
}

