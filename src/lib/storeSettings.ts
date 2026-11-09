import { api } from "./api";
import { taxGroups } from "../data/taxOptions";
import type {
  IngredientCostInput,
  IngredientCostsResponse,
  NotificationsResponse,
  Preferences,
  PreferencesResponse,
  TaxSettings,
  TaxSettingsResponse,
} from "../types/api";

// 매장별 설정 API (세금·알림 설정, 원재료 단가, 알림 목록)

// 세금 화면 선택지(한글) ↔ 서버 값(영문 코드)
const TAX_FIELDS: { title: string; field: keyof TaxSettings; values: Record<string, TaxSettings[keyof TaxSettings]> }[] = [
  { title: "사업자 형태", field: "business_entity", values: { 개인: "individual", 법인: "corporation", "등록 전": "unregistered", 모름: "unknown" } },
  { title: "과세 유형", field: "tax_type", values: { 일반과세자: "general", 간이과세자: "simple", 모름: "unknown" } },
  { title: "세무 관리 방식", field: "filing_method", values: { "직접 신고": "self", "세무사 이용": "accountant", "미정/모름": "undecided" } },
  { title: "세금 자금 준비 방식", field: "reserve_method", values: { "매월 세금 확보": "monthly", "납부월 일괄": "lump_sum", 모름: "unknown" } },
  { title: "직원 고용 여부", field: "employees", values: { "직원 있음": "yes", 없음: "no", "채용 / 신고 전": "pending" } },
  {
    title: "납부 방식",
    field: "installments",
    values: Object.fromEntries(
      (taxGroups.find((g) => g.title === "납부 방식")?.choices ?? []).map((choice, i) => [choice, (i + 1) as 1 | 2 | 3 | 4]),
    ),
  },
];

export function toTaxSettings(picked: Record<string, string>): TaxSettings {
  return Object.fromEntries(
    TAX_FIELDS.map(({ title, field, values }) => [field, values[picked[title]] ?? Object.values(values)[0]]),
  ) as TaxSettings;
}

export function toTaxSelections(settings: TaxSettings): Record<string, string> {
  return Object.fromEntries(
    TAX_FIELDS.map(({ title, field, values }) => [
      title,
      Object.keys(values).find((label) => values[label] === settings[field]) ?? Object.keys(values)[0],
    ]),
  );
}

const base = (storeId: string) => `/stores/${storeId}`;

export const getTaxSettings = (storeId: string) => api<TaxSettingsResponse>(`${base(storeId)}/tax-settings`);
export const saveTaxSettings = (storeId: string, picked: Record<string, string>) =>
  api<TaxSettingsResponse>(`${base(storeId)}/tax-settings`, "PUT", toTaxSettings(picked));

export const getPreferences = (storeId: string) => api<PreferencesResponse>(`${base(storeId)}/preferences`);
export const savePreferences = (storeId: string, preferences: Preferences) =>
  api<PreferencesResponse>(`${base(storeId)}/preferences`, "PUT", preferences);

export const getIngredientCosts = (storeId: string) => api<IngredientCostsResponse>(`${base(storeId)}/ingredient-costs`);
export const saveIngredientCosts = (storeId: string, items: IngredientCostInput[]) =>
  api<IngredientCostsResponse>(`${base(storeId)}/ingredient-costs`, "PUT", { items });

export const getNotifications = (storeId: string) => api<NotificationsResponse>(`${base(storeId)}/notifications`);
