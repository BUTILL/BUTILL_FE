import { apiUrl } from "./endpoint";
import {
  createClient,
  type SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const auth =
  url && key?.startsWith("sb_publishable_")
    ? createClient(url, key, {
        auth: {
          storage: {
            getItem: (k: string) =>
              sessionStorage.getItem(k) ?? localStorage.getItem(k),
            setItem: (k: string, value: string) => {
              const remember =
                localStorage.getItem("butill.remember") !== "false";
              (remember ? sessionStorage : localStorage).removeItem(k);
              (remember ? localStorage : sessionStorage).setItem(k, value);
            },
            removeItem: (k: string) => {
              localStorage.removeItem(k);
              sessionStorage.removeItem(k);
            },
          },
        },
      })
    : null;

export async function signUp(credentials: SignUpWithPasswordCredentials) {
  if (!auth) throw new Error("인증 연결 설정을 확인해주세요.");
  const client = createClient(url, key, {
    auth: {
      storageKey: "butill.signup",
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  try {
    return await client.auth.signUp(credentials);
  } finally {
    await client.auth.dispose();
  }
}

export class ApiError extends Error {
  status: number;
  fields: string[];
  constructor(status: number, message: string, fields: string[] = []) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const { data, error } = auth
    ? await auth.auth.getSession()
    : { data: { session: null }, error: null };
  if (error || !data.session)
    throw new ApiError(401, "로그인이 필요합니다. 다시 로그인하세요.");
  const endpoint = apiUrl(path);
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new ApiError(
      0,
      "서버 응답을 확인하지 못했습니다. 저장 여부를 새로 조회한 후 다시 시도하세요.",
    );
  }
  const value = await res.json().catch(() => null);
  if (!res.ok)
    throw new ApiError(
      res.status,
      res.status === 409
        ? "다른 화면에서 수정되었거나 저장 버전이 다릅니다. 새로 불러온 후 수정하세요."
        : (value?.message ?? "요청을 처리하지 못했습니다."),
      Array.isArray(value?.fields)
        ? value.fields.map((x: { field: string }) => x.field)
        : [],
    );
  return value;
}

export type Input = {
  start_month: string;
  months: number;
  current_cash: number;
  reserve_cash: number;
  unpaid_initial_investment: number;
  monthly_sales: number;
  monthly_ingredient_cost: number;
  ingredient_items?: { name: string; amount: number }[];
  fixed_expenses: { name: string; amount: number; due_day?: number | null }[];
  irregular_expenses: {
    name: string;
    amount: number;
    expected_date: string;
    is_paid: boolean;
  }[];
  monthly_overrides: {
    month: number;
    sales?: number;
    ingredient_cost?: number;
    fixed_cost?: number;
  }[];
};
export type Store = {
  id: string;
  name: string;
  business_type: "cafe" | "restaurant";
  region: string;
  status: "planning" | "operating";
};
export type Finance = { revision: string; input: Input; updated_at: string };
export type Analysis = {
  initial_available_cash: number;
  cash_runway: {
    initial_balance: number;
    first_shortage_month: string | null;
    first_depletion_month: string | null;
    status: string;
  };
  available_runway: {
    initial_balance: number;
    first_shortage_month: string | null;
    first_depletion_month: string | null;
    status: string;
  };
  monthly: {
    month: string;
    sales: number;
    net_cashflow: number;
    cash_balance: number;
    available_balance: number;
  }[];
  risks: { code: string; month: string; message: string }[];
};
export type SavedAnalysis = {
  id: string;
  source_revision: string;
  result: Analysis;
};
export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
export function runway(r: Analysis["cash_runway"]) {
  if (r.initial_balance < 0) return "시작 시점부터 자금 부족";
  if (r.initial_balance === 0) return "시작 시점 잔액 0원";
  if (r.first_shortage_month)
    return `${r.first_shortage_month.slice(0, 7)} 월말 자금 부족 예상`;
  if (r.first_depletion_month)
    return `${r.first_depletion_month.slice(0, 7)} 월말 잔액 0원 도달`;
  return "분석기간 내 자금 부족 없음";
}
