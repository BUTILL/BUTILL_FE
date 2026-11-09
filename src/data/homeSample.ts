import type { DashboardData } from "./homeData";

// API 연결 전 화면 확인용 데이터
// API 연결 후. 서버 응답 객체를 Home의 data에 전달하면 됨
export const sampleDashboardData: DashboardData = {
  startMonth: "2026-07",
  openingBalance: 24450000,
  monthlyCashFlows: [
    { month: "2026-07", income: 15000000, expense: 17000000 },
    { month: "2026-08", income: 15000000, expense: 16800000 },
    { month: "2026-09", income: 14800000, expense: 17000000 },
    { month: "2026-10", income: 16000000, expense: 17500000 },
    { month: "2026-11", income: 15000000, expense: 16950000 },
    { month: "2026-12", income: 12000000, expense: 9500000, isForecast: true },
    { month: "2027-01", income: 15000000, expense: 18750000, taxPayment: 1800000, isForecast: true },
    { month: "2027-02", income: 15000000, expense: 17000000, isForecast: true },
    { month: "2027-03", income: 15000000, expense: 26750000, isForecast: true },
    { month: "2027-04", income: 15000000, expense: 17000000, isForecast: true },
    { month: "2027-05", income: 15000000, expense: 18500000, isForecast: true },
    { month: "2027-06", income: 15000000, expense: 19500000, isForecast: true },
  ],
};
