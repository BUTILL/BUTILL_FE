// BUTILL_BE app/schemas 기준 요청·응답 타입 (금액은 원 단위 정수, 날짜는 YYYY-MM-DD)

export type BusinessType = "restaurant" | "cafe";
export type StoreStatus = "planning" | "operating";

export type Store = {
  id: string;
  name: string;
  business_type: BusinessType;
  region: string;
  status: StoreStatus;
};

export type StoreInput = Omit<Store, "id">;

export type ExpenseInput = { name: string; amount: number };
export type FixedExpenseInput = ExpenseInput & { due_day?: number | null };
export type IrregularExpenseInput = ExpenseInput & {
  expected_date: string;
  is_paid: boolean;
};
export type MonthlyOverride = {
  month: number;
  sales?: number;
  ingredient_cost?: number;
  fixed_cost?: number;
};

export type AnalysisInput = {
  start_month: string;
  months: number;
  current_cash: number;
  reserve_cash: number;
  unpaid_initial_investment: number;
  monthly_sales: number;
  monthly_ingredient_cost: number;
  ingredient_items?: ExpenseInput[];
  fixed_expenses: FixedExpenseInput[];
  irregular_expenses: IrregularExpenseInput[];
  monthly_overrides: MonthlyOverride[];
};

export type Finance = {
  store_id: string;
  revision: string;
  input: AnalysisInput;
  updated_at: string;
};

export type Runway = {
  initial_balance: number;
  first_depletion_month: string | null;
  first_shortage_month: string | null;
  shortage_amount: number;
  full_months_before_shortage: number | null;
  status: "shortage" | "depleted" | "no_shortage_in_period";
};

export type AnalysisMonth = {
  month: string;
  sales: number;
  ingredient_cost: number;
  fixed_cost: number;
  irregular_cost: number;
  net_cashflow: number;
  cash_balance: number;
  available_balance: number;
};

export type Analysis = {
  calculation_version: string;
  start_month: string;
  months: number;
  initial_cash: number;
  initial_available_cash: number;
  cash_runway: Runway;
  available_runway: Runway;
  monthly: AnalysisMonth[];
  risks: { code: string; month: string; amount: number; message: string }[];
  warnings: string[];
  persisted: boolean;
};

export type SavedAnalysis = {
  id: string;
  store_id: string;
  source_revision: string;
  input: AnalysisInput;
  result: Analysis;
  created_at: string;
};

// GET /support-programs (기업마당 서울 소상공인 공고, 마감 전)
export type SupportProgram = {
  source: "BIZINFO";
  program_id: string;
  title: string;
  agency: string | null;
  summary: string | null;
  target: string | null;
  category: string | null;
  hashtags: string[];
  apply_start: string | null;
  apply_end: string | null;
  apply_period_text: string | null;
  always_open: boolean;
  url: string | null;
};

export type SupportCollection = {
  source: "BIZINFO";
  collected_at: string;
  status: "success" | "failed";
  error_code: string | null;
  stale: boolean;
  fetched_count: number;
  skipped_count: number;
  matched_count: number;
  programs: SupportProgram[];
};

// GET /ingredient-prices (KAMIS 서울 소매가, 저장된 가격 조회)
export type DailyPrice = {
  price_date: string;
  average_price: number;
  average_price_per_kg: number | null;
  market_count: number;
};

export type PriceSummary = {
  key: string;
  name: string;
  groups: ("common" | "dakgalbi" | "pasta")[];
  status: "success" | "no_data" | "failed";
  error_code: string | null;
  stale: boolean;
  kind_name: string | null;
  rank_name: string | null;
  unit: string | null;
  latest: DailyPrice | null;
  week_change: {
    base_date: string;
    base_price: number;
    latest_date: string;
    latest_price: number;
    change_amount: number;
    change_bps: number;
  } | null;
  daily: DailyPrice[];
  weekly?: { week_start: string; average_price: number; days: number }[];
};

export type IngredientPriceResponse = {
  source: string;
  basis: string;
  collected_at: string | null;
  last_success_at: string | null;
  status: "success" | "partial" | "failed" | "no_data";
  error_code: string | null;
  stale: boolean;
  items: PriceSummary[];
};

// 매장 설정·원재료 단가·알림 (BUTILL_BE docs/store-settings.md)
export type TaxSettings = {
  business_entity: "individual" | "corporation" | "unregistered" | "unknown";
  tax_type: "general" | "simple" | "unknown";
  filing_method: "self" | "accountant" | "undecided";
  reserve_method: "monthly" | "lump_sum" | "unknown";
  employees: "yes" | "no" | "pending";
  installments: 1 | 2 | 3 | 4;
};

export type TaxEvent = { code: string; title: string; due_date: string; days_left: number; note: string | null };

export type TaxSettingsResponse = {
  store_id: string;
  settings: TaxSettings;
  saved: boolean;
  schedule: TaxEvent[];
  basis: string;
};

export type Preferences = { runway_alert: boolean; ingredient_alert: boolean; font_size: "normal" | "large" };
export type PreferencesResponse = { store_id: string; preferences: Preferences; saved: boolean };

export type IngredientCostInput = { price_key: string; unit_price?: number | null; monthly_amount?: number | null };

export type IngredientCostItem = {
  price_key: string;
  name: string;
  unit: string | null;
  market_price: number | null;
  market_price_date: string | null;
  market_status: "success" | "no_data" | "failed";
  week_change_bps: number | null;
  unit_price: number | null;
  unit_price_gap_bps: number | null;
  monthly_amount: number | null;
  monthly_impact: number | null;
};

export type IngredientCostsResponse = {
  store_id: string;
  items: IngredientCostItem[];
  total_monthly_amount: number;
  total_monthly_impact: number;
  runway_impact: {
    base_available_months: number | null;
    adjusted_available_months: number | null;
    base_first_shortage_month: string | null;
    adjusted_first_shortage_month: string | null;
    monthly_cost_increase: number;
  } | null;
  prices_collected_at: string | null;
};

export type AppNotification = {
  type: "runway" | "ingredient" | "expense" | "tax";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  due_date: string | null;
  days_left: number | null;
  target: "home" | "raw_materials" | "calendar" | "tax";
};

export type NotificationsResponse = { store_id: string; generated_at: string; notifications: AppNotification[] };
