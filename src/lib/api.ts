import { createClient, type SignUpWithPasswordCredentials } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// 로그인 상태 유지 여부 (LoginPage 체크박스)
const REMEMBER_KEY = "butill.remember";
export const setRememberLogin = (remember: boolean) =>
  localStorage.setItem(REMEMBER_KEY, String(remember));

// Supabase Auth: 로그인 유지 시 localStorage, 아니면 sessionStorage에 세션 보관
export const auth =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          storage: {
            getItem: (k: string) => sessionStorage.getItem(k) ?? localStorage.getItem(k),
            setItem: (k: string, value: string) => {
              const remember = localStorage.getItem(REMEMBER_KEY) === "true";
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

export const AUTH_CONFIG_MESSAGE = "인증 연결 설정(.env)을 확인해주세요.";

// 회원가입은 세션을 남기지 않는 별도 Client로 처리 (가입 후 로그인 화면에서 다시 로그인)
export async function signUp(credentials: SignUpWithPasswordCredentials) {
  if (!supabaseUrl || !supabaseKey) throw new Error(AUTH_CONFIG_MESSAGE);
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      storageKey: "butill.signup",
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client.auth.signUp(credentials);
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

// API 주소: VITE_API_BASE_URL이 없으면 개발 서버 프록시(/api → FastAPI) 사용
const apiBase = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "")
  .trim()
  .replace(/\/+$/, "");
const apiUrl = (path: string) => `${apiBase}/api/v1${path}`;

async function request<T>(path: string, method: string, body: unknown, token?: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new ApiError(0, "서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
  const value = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      res.status === 409
        ? "다른 화면에서 수정되었거나 저장 버전이 다릅니다. 새로 불러온 후 수정해주세요."
        : (value?.message ?? "요청을 처리하지 못했습니다."),
      Array.isArray(value?.fields) ? value.fields.map((x: { field: string }) => x.field) : [],
    );
  }
  return value as T;
}

// 로그인한 사용자 토큰으로 호출하는 API
export async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const { data, error } = auth
    ? await auth.auth.getSession()
    : { data: { session: null }, error: null };
  if (error || !data.session) throw new ApiError(401, "로그인이 필요합니다. 다시 로그인해주세요.");
  return request<T>(path, method, body, data.session.access_token);
}

// 인증이 필요 없는 API (계산 미리보기, 지원사업·원재료 가격 조회)
export const publicApi = <T>(path: string, body: unknown) => request<T>(path, "POST", body);
export const publicGet = <T>(path: string) => request<T>(path, "GET", undefined);
