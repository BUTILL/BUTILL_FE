import type { BusinessType } from "../types/api";

// 사업장 기초정보 화면 선택 항목 (서울시 자치구, 업종)
export const regions = ["강남구","강동구","강북구","강서구","관악구","광진구","구로구","금천구","노원구","도봉구","동대문구","동작구",
  "마포구","서대문구","서초구", "성동구", "성북구","송파구","양천구","영등포구","용산구","은평구","종로구", "중구","중랑구"
];

export const categories = [ {
    id: "cafe",
    name: "카페 · 디저트" },
  {
    id: "korean",
    name: "한식 일반 · 백반"},
  {
    id: "japanese",
    name: "일식 · 돈까스 · 회"},
  {
    id: "western",
    name: "양식 · 패스트푸드"},
  {
    id: "pub",
    name: "주점 · 이자카야 · 펍"},
  {
    id: "bakery",
    name: "베이커리 · 디저트"},
  {
    id: "chicken",
    name: "치킨 · 피자배달전문"},
  {
    id: "etc",
    name: "기타 외식업 직접입력"
  }
];

// 업종 → 백엔드 business_type (카페·베이커리는 cafe, 나머지는 restaurant)
export const toBusinessType = (categoryId: string): BusinessType =>
  categoryId === "cafe" || categoryId === "bakery" ? "cafe" : "restaurant";

// 설정 화면의 업종 표기 (온보딩 표기와 띄어쓰기가 조금 다름)
export const settingsBusinessTypes = [
  "카페 · 디저트",
  "한식 일반 · 백반",
  "일식 · 돈까스 · 회",
  "양식 · 패스트푸드",
  "주점 · 이자카야 · 펍",
  "베이커리 · 디저트",
  "치킨 · 피자 배달 전문",
  "기타 요식업 직접 입력",
];
export const CUSTOM_BUSINESS_TYPE = "기타 요식업 직접 입력";

// 저장된 업종명을 설정 화면 표기에 맞춤 (목록에 없으면 직접 입력으로 처리)
export function toSettingsBusinessType(saved: string | undefined) {
  const normalize = (value: string) => value.replace(/\s/g, "");
  const found = settingsBusinessTypes.find((type) => normalize(type) === normalize(saved ?? ""));
  if (found) return { type: found, custom: "" };
  if (!saved) return { type: settingsBusinessTypes[0], custom: "" };
  if (normalize(saved).startsWith("기타")) return { type: CUSTOM_BUSINESS_TYPE, custom: "" };
  return { type: CUSTOM_BUSINESS_TYPE, custom: saved };
}

// 업종명 → 백엔드 business_type
export const businessTypeOfName = (name: string): BusinessType =>
  name.includes("카페") || name.includes("베이커리") ? "cafe" : "restaurant";
