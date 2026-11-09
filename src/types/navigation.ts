// App 최상위 화면 이름
export type AppPage =
  | "Login"
  | "Signup"
  | "Information"
  | "Information2"
  | "Introduction"
  | "HomePage"
  | "NotificationsFromCashRunway"
  | "Calculator"
  | "CashRunway";

export type SetPage = (page: AppPage) => void;
