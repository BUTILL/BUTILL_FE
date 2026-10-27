import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiUrl } from "./endpoint";
import type { Session } from "@supabase/supabase-js";
import {
  api,
  ApiError,
  auth,
  type Store,
  type Finance,
  type Input,
  type Analysis,
  type SavedAnalysis,
} from "./api";

type State = {
  stores: Store[];
  store: Store | null;
  finance: Finance | null;
  analysis: Analysis | null;
};
const empty: State = { stores: [], store: null, finance: null, analysis: null };
type Account = State & {
  session: Session | null;
  ready: boolean;
  loading: boolean;
  error: string;
  reload: (id?: string) => Promise<void>;
  select: (id: string) => void;
  save: (input: Input) => Promise<string>;
  saveStore: (data: Omit<Store, "id">) => Promise<void>;
  onboard: (
    store: Omit<Store, "id">,
    input: Input,
    profile: Record<string, string>,
  ) => Promise<void>;
  signOut: () => Promise<void>;
};
const Context = createContext<Account | null>(null);
export function useAccount() {
  const value = useContext(Context);
  if (!value) throw new Error("Account provider missing");
  return value;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const activeUser = useRef<string | null>(null);
  const saving = useRef(false);
  const load = async (id?: string) => {
    const n = ++generation.current;
    setLoading(true);
    setError("");
    setState(empty);
    try {
      const stores = await api<Store[]>("/stores?limit=100");
      const store = stores.find((s) => s.id === id) ?? stores[0] ?? null;
      let finance: Finance | null = null;
      let analysis: Analysis | null = null;
      if (store) {
        try {
          finance = await api<Finance>(`/stores/${store.id}/finances`);
        } catch (e) {
          if (!(e instanceof ApiError && e.status === 404)) throw e;
        }
        if (finance) {
          const res = await fetch(apiUrl("/analyses/preview"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finance.input),
            signal: AbortSignal.timeout(20000),
          });
          if (!res.ok)
            throw new Error(
              "경영정보는 불러왔지만 분석에 실패했습니다. 다시 불러오세요.",
            );
          analysis = await res.json();
        }
      }
      if (n === generation.current)
        setState({ stores, store, finance, analysis });
    } catch (e) {
      if (n === generation.current)
        setError(e instanceof Error ? e.message : "불러오지 못했습니다.");
    } finally {
      if (n === generation.current) setLoading(false);
    }
  };
  useEffect(() => {
    if (!auth) {
      setReady(true);
      return;
    }
    const { data } = auth.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const id = session?.user.id ?? null;
    if (activeUser.current === id) return;
    activeUser.current = id;
    generation.current++;
    setState(empty);
    setError("");
    if (id) void load();
    else setLoading(false);
  }, [session?.user.id]);
  const save = async (input: Input) => {
    if (!state.store || loading || saving.current)
      throw new Error("매장을 선택하고 불러오기가 끝난 뒤 저장하세요.");
    saving.current = true;
    const id = state.store.id;
    const n = generation.current;
    try {
      const finance = await api<Finance>(`/stores/${id}/finances`, "PUT", {
        input,
        ...(state.finance ? { revision: state.finance.revision } : {}),
      });
      if (n !== generation.current)
        throw new Error(
          "계정 또는 매장이 바뀌었습니다. 저장 결과를 다시 조회하세요.",
        );
      setState((old) => ({ ...old, finance, analysis: null }));
      try {
        const saved = await api<SavedAnalysis>(
          `/stores/${id}/analyses`,
          "POST",
        );
        if (n === generation.current)
          setState((old) => ({ ...old, analysis: saved.result }));
        return "경영정보와 분석 결과가 DB에 저장되었습니다.";
      } catch {
        return "경영정보는 DB에 저장됐지만 분석 결과 저장에 실패했습니다. 홈에서 새로 불러오면 저장된 입력으로 재계산합니다.";
      }
    } finally {
      saving.current = false;
    }
  };
  const saveStore = async (data: Omit<Store, "id">) => {
    if (saving.current || loading)
      throw new Error("현재 작업이 끝난 뒤 다시 시도하세요.");
    saving.current = true;
    try {
      const saved = await api<Store>(
        state.store ? `/stores/${state.store.id}` : "/stores",
        state.store ? "PATCH" : "POST",
        data,
      );
      await load(saved.id);
    } finally {
      saving.current = false;
    }
  };
  const onboard = async (
    data: Omit<Store, "id">,
    input: Input,
    profile: Record<string, string>,
  ) => {
    if (saving.current || loading)
      throw new Error("현재 작업이 끝난 뒤 다시 시도하세요.");
    saving.current = true;
    const n = generation.current;
    try {
      if (!auth) throw new Error("로그인이 필요합니다.");
      const updated = await auth.auth.updateUser({ data: profile });
      if (updated.error) throw new Error("대표자 정보를 저장하지 못했습니다.");
      const store = await api<Store>(
        state.store ? `/stores/${state.store.id}` : "/stores",
        state.store ? "PATCH" : "POST",
        data,
      );
      if (n !== generation.current)
        throw new Error("계정이 변경되었습니다. 다시 로그인하세요.");
      setState((old) => ({
        ...old,
        store,
        stores: [store, ...old.stores.filter((s) => s.id !== store.id)],
      }));
      const finance = await api<Finance>(
        `/stores/${store.id}/finances`,
        "PUT",
        {
          input,
          ...(state.finance ? { revision: state.finance.revision } : {}),
        },
      );
      let analysis: Analysis | null = null;
      try {
        const res = await fetch(apiUrl("/analyses/preview"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: AbortSignal.timeout(20000),
        });
        if (res.ok) analysis = await res.json();
      } catch {
        analysis = null;
      }
      if (n === generation.current)
        setState((old) => ({ ...old, store, finance, analysis }));
    } finally {
      saving.current = false;
    }
  };
  const signOut = async () => {
    if (!auth) return;
    const { error: err } = await auth.auth.signOut({ scope: "local" });
    if (err) throw new Error("로그아웃에 실패했습니다. 다시 시도하세요.");
    generation.current++;
    setState(empty);
    setSession(null);
  };
  return (
    <Context.Provider
      value={{
        ...state,
        session,
        ready,
        loading,
        error,
        reload: load,
        select: (id) => {
          void load(id);
        },
        save,
        saveStore,
        onboard,
        signOut,
      }}
    >
      {children}
    </Context.Provider>
  );
}
