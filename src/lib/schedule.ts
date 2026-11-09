import type { Bill } from "../data/bills";
import type { AnalysisInput } from "../types/api";

// 예정 지출 일정: 저장된 고정 지출(지급일)과 이번 달 추가 지출로 홈·캘린더 목록 생성

// 지급일이 정해지지 않은 고정 지출은 매월 5일로 처리 (입력/관리 화면 안내와 동일)
const DEFAULT_DUE_DAY = 5;

export type ScheduledBill = Bill & { day: number; daysLeft: number; amountValue: number };

const iconOf = (name: string) =>
  /월세|임대/.test(name) ? "store" : /인건비|급여|알바|직원/.test(name) ? "cash" : /카드/.test(name) ? "card" : "receipt";

const won = (value: number) => `₩${value.toLocaleString("ko-KR")}`;

export function buildSchedule(input: AnalysisInput | undefined, today = new Date()): ScheduledBill[] {
  if (!input) return [];
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const bills: ScheduledBill[] = [];

  for (const item of input.fixed_expenses) {
    if (!item.amount) continue;
    const day = item.due_day ?? DEFAULT_DUE_DAY;
    // 이번 달 지급일이 지났으면 다음 달 지급일
    let due = new Date(start.getFullYear(), start.getMonth(), day);
    if (due < start) due = new Date(start.getFullYear(), start.getMonth() + 1, day);
    const daysLeft = Math.round((due.getTime() - start.getTime()) / 86400000);
    bills.push({
      icon: iconOf(item.name),
      title: item.name,
      desc: "고정 지출",
      amount: won(item.amount),
      due: daysLeft === 0 ? "오늘" : `D-${daysLeft}일`,
      date: `매월 ${day}일`,
      urgent: daysLeft <= 3,
      day: due.getDate(),
      daysLeft,
      amountValue: item.amount,
    });
  }

  // 이번 달에 예정된(아직 지출하지 않은) 추가 지출
  const monthKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
  for (const item of input.irregular_expenses) {
    if (item.is_paid || !item.amount || item.expected_date.slice(0, 7) !== monthKey) continue;
    bills.push({
      icon: iconOf(item.name),
      title: item.name,
      desc: "추가 지출",
      amount: won(item.amount),
      due: "이번 달",
      date: `${start.getMonth() + 1}월 추가 지출`,
      day: Number(item.expected_date.slice(8, 10)),
      daysLeft: 0,
      amountValue: item.amount,
    });
  }

  return bills.sort((a, b) => a.daysLeft - b.daysLeft);
}
