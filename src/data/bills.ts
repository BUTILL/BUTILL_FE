export type Bill = {
  icon: string;
  title: string;
  desc: string;
  amount: string;
  due: string;
  date?: string;
  urgent?: boolean;
};

export const bills: Bill[] = [
  {
    icon: "receipt",
    title: "필수 납부금",
    desc: "부가세/세금 · 4대보험 · 공과금",
    amount: "₩650,000",
    due: "D-12일",
    urgent: true,
  },
  {
    icon: "cash",
    title: "급여",
    desc: "직원 급여\n(정직원 2인 · 알바 1인)",
    amount: "₩3,200,000",
    due: "D-2일",
    date: "매월 10일",
  },
  {
    icon: "store",
    title: "월세",
    desc: "사업장 월세",
    amount: "₩600,000",
    due: "D-2일",
    date: "매월 10일",
  },
  {
    icon: "card",
    title: "카드",
    desc: "사업자 카드 결제 대금 합산",
    amount: "₩800,000",
    due: "D-5일",
    date: "매월 14일",
  },
];
