import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { api, ApiError, auth, publicApi } from "./api";
import type { Analysis, AnalysisInput, Finance, SavedAnalysis, Store, StoreInput } from "../types/api";

type State = {
  store: Store | null;
  finance: Finance | null;
  analysis: Analysis | null;
};

type Account = State & {
  session: Session | null;
  ready: boolean; // 세션 확인 완료 여부
  loading: boolean; // 매장·경영정보 불러오는 중
  error: string;
  reload: () => Promise<void>;
  onboard: (store: StoreInput, input: AnalysisInput, profile: Record<string, string>) => Promise<void>;
  analyze: () => Promise<Analysis>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  saveFinance: (input: AnalysisInput) => Promise<void>;
  saveProfile: (profile: Record<string, string>, store: Partial<StoreInput>) => Promise<void>;
  profile: Record<string, string>;
};

const empty: State = { store: null, finance: null, analysis: null };
const AccountContext = createContext<Account | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error("AccountProvider가 필요합니다.");
  return value;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!auth);
  const [state, setState] = useState<State>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // 계정이 바뀐 뒤 도착한 이전 요청 결과를 무시하기 위한 번호
  const generation = useRef(0);

  // 매장 → 경영정보 → 미리보기 분석 순서로 불러오기 (n: 요청 번호)
  const fetchAccount = async (n: number) => {
    try {
      const stores = await api<Store[]>("/stores?limit=1");
      const store = stores[0] ?? null;
      let finance: Finance | null = null;
      let analysis: Analysis | null = null;
      if (store) {
        try {
          finance = await api<Finance>(`/stores/${store.id}/finances`);
        } catch (e) {
          if (!(e instanceof ApiError && e.status === 404)) throw e;
        }
        // 화면 표시용 계산은 저장하지 않는 미리보기로 처리
        if (finance) analysis = await publicApi<Analysis>("/analyses/preview", finance.input);
      }
      if (n === generation.current) setState({ store, finance, analysis });
    } catch (e) {
      if (n === generation.current) setError(e instanceof Error ? e.message : "불러오지 못했습니다.");
    } finally {
      if (n === generation.current) setLoading(false);
    }
  };

  const load = async () => {
    const n = ++generation.current;
    setLoading(true);
    setError("");
    await fetchAccount(n);
  };

  useEffect(() => {
    if (!auth) return;
    const { data } = auth.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // 로그인 사용자가 바뀌면 이전 사용자 정보를 비우고 새로 불러옴
  const userId = session?.user.id ?? null;
  const [activeUser, setActiveUser] = useState<string | null>(null);
  if (activeUser !== userId) {
    setActiveUser(userId);
    setState(empty);
    setError("");
    setLoading(Boolean(userId));
  }
  useEffect(() => {
    const n = ++generation.current;
    if (userId) void fetchAccount(n);
  }, [userId]);

  // 온보딩 저장: 대표자 정보 → 매장 생성/수정 → 경영정보 저장
  const onboard = async (storeInput: StoreInput, input: AnalysisInput, profile: Record<string, string>) => {
    if (!auth) throw new Error("로그인이 필요합니다.");
    const n = generation.current;
    const updated = await auth.auth.updateUser({ data: profile });
    if (updated.error) throw new Error("대표자 정보를 저장하지 못했습니다.");
    const store = await api<Store>(
      state.store ? `/stores/${state.store.id}` : "/stores",
      state.store ? "PATCH" : "POST",
      storeInput,
    );
    const finance = await api<Finance>(`/stores/${store.id}/finances`, "PUT", {
      input,
      ...(state.finance ? { revision: state.finance.revision } : {}),
    });
    if (n !== generation.current) throw new Error("계정이 변경되었습니다. 다시 로그인해주세요.");
    // 미리보기 실패 시에도 저장은 완료된 상태이므로 분석 없이 진행
    const analysis = await publicApi<Analysis>("/analyses/preview", input).catch(() => null);
    if (n === generation.current) setState({ store, finance, analysis });
  };

  // 저장된 경영정보로 분석 실행 후 결과 저장
  const analyze = async () => {
    if (!state.store) throw new Error("사업장 정보를 먼저 입력해주세요.");
    const n = generation.current;
    const saved = await api<SavedAnalysis>(`/stores/${state.store.id}/analyses`, "POST");
    if (n === generation.current) setState((old) => ({ ...old, analysis: saved.result }));
    return saved.result;
  };

  const signOut = async () => {
    if (!auth) return;
    const { error: err } = await auth.auth.signOut({ scope: "local" });
    if (err) throw new Error("로그아웃에 실패했습니다. 다시 시도해주세요.");
  };

  // 경영정보 수정 저장 (입력/관리·자금 설정) 후 화면용 미리보기 분석 갱신
  const saveFinance = async (input: AnalysisInput) => {
    if (!state.store) throw new Error("사업장 정보를 먼저 입력해주세요.");
    const n = generation.current;
    const finance = await api<Finance>(`/stores/${state.store.id}/finances`, "PUT", {
      input,
      ...(state.finance ? { revision: state.finance.revision } : {}),
    });
    if (n !== generation.current) return;
    setState((old) => ({ ...old, finance }));
    const analysis = await publicApi<Analysis>("/analyses/preview", input).catch(() => null);
    if (n === generation.current && analysis) setState((old) => ({ ...old, analysis }));
  };

  // 대표자 정보(사용자 정보)와 매장 정보 수정
  const saveProfile = async (profile: Record<string, string>, storeInput: Partial<StoreInput>) => {
    if (!auth || !state.store) throw new Error("사업장 정보를 먼저 입력해주세요.");
    const updated = await auth.auth.updateUser({ data: profile });
    if (updated.error) throw new Error("대표자 정보를 저장하지 못했습니다.");
    if (updated.data.user) setSession((old) => (old ? { ...old, user: updated.data.user! } : old));
    // 매장 정보 변경이 없으면 사용자 정보만 저장
    if (!Object.keys(storeInput).length) return;
    const store = await api<Store>(`/stores/${state.store.id}`, "PATCH", storeInput);
    setState((old) => ({ ...old, store }));
  };

  // 회원 탈퇴: 매장·경영정보·분석 기록과 계정을 함께 삭제 (Supabase RPC delete_own_account)
  const deleteAccount = async () => {
    if (!auth) throw new Error("로그인이 필요합니다.");
    const { error: err } = await auth.rpc("delete_own_account", { confirmed: true });
    if (err) throw new Error("회원 탈퇴를 처리하지 못했습니다. 다시 로그인한 뒤 시도해주세요.");
    // 서버에서 세션이 삭제되므로 기기에 남은 세션만 정리
    await auth.auth.signOut({ scope: "local" }).catch(() => undefined);
  };

  return (
    <AccountContext.Provider
      value={{
        ...state,
        session,
        ready,
        loading,
        error,
        reload: load,
        onboard,
        analyze,
        signOut,
        deleteAccount,
        saveFinance,
        saveProfile,
        profile: (session?.user.user_metadata ?? {}) as Record<string, string>,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
