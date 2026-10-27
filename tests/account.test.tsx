import { beforeEach, afterEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { Session } from "@supabase/supabase-js";

const remote = vi.hoisted(() => ({
  session: null as Session | null,
  callback: null as ((event: string, session: Session | null) => void) | null,
  signup: vi.fn(),
  signin: vi.fn(),
  signout: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: (
    _url: string,
    _key: string,
    opts?: {
      auth?: {
        persistSession?: boolean;
        autoRefreshToken?: boolean;
        detectSessionInUrl?: boolean;
        storageKey?: string;
      };
    },
  ) => ({
    auth: {
      onAuthStateChange: (cb: typeof remote.callback) => {
        remote.callback = cb;
        queueMicrotask(() => cb?.("INITIAL_SESSION", remote.session));
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                remote.callback = null;
              },
            },
          },
        };
      },
      getSession: async () => ({
        data: { session: remote.session },
        error: null,
      }),
      signInWithPassword: remote.signin,
      signUp: async (credentials: unknown) => {
        const result = await remote.signup(credentials);
        if (result.data.session && opts?.auth?.persistSession !== false) {
          remote.session = result.data.session;
          remote.callback?.("SIGNED_IN", remote.session);
        }
        return result;
      },
      dispose: vi.fn(),
      updateUser: async () => ({
        data: { user: remote.session?.user },
        error: null,
      }),
      signOut: remote.signout,
    },
  }),
}));

import App from "../src/App";
const session = {
  access_token: "test-token",
  user: { id: "user-a", email: "test@example.com" },
} as Session;
const store = {
  id: "store-a",
  name: "테스트 식당",
  region: "서울",
  business_type: "restaurant",
  status: "operating",
};
const input = {
  start_month: "2026-10-01",
  months: 12,
  current_cash: 25000000,
  reserve_cash: 2500000,
  unpaid_initial_investment: 0,
  monthly_sales: 18000000,
  monthly_ingredient_cost: 6000000,
  fixed_expenses: [{ name: "임대료", amount: 10000000 }],
  irregular_expenses: [],
  monthly_overrides: [],
};
const analysis = {
  initial_available_cash: 22500000,
  cash_runway: {
    initial_balance: 25000000,
    status: "no_shortage_in_period",
    first_shortage_month: null,
    first_depletion_month: null,
  },
  available_runway: {
    initial_balance: 22500000,
    status: "no_shortage_in_period",
    first_shortage_month: null,
    first_depletion_month: null,
  },
  monthly: [
    {
      month: "2026-10-01",
      sales: 18000000,
      net_cashflow: 2000000,
      cash_balance: 27000000,
      available_balance: 24500000,
    },
  ],
  risks: [],
};
let db: {
  stores: (typeof store)[];
  finance: { revision: string; input: typeof input; updated_at: string } | null;
};
let conflict = false;
let failAnalysis = false;
const response = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => {
  vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
  remote.session = session;
  remote.signup.mockReset();
  remote.signin.mockReset();
  remote.signout.mockReset();
  remote.signout.mockImplementation(async () => {
    remote.session = null;
    remote.callback?.("SIGNED_OUT", null);
    return { error: null };
  });
  db = {
    stores: [structuredClone(store)],
    finance: {
      revision: "revision-1",
      input: structuredClone(input),
      updated_at: "2026-10-26T00:00:00Z",
    },
  };
  conflict = false;
  failAnalysis = false;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, opts?: RequestInit) => {
      const path = String(url);
      if (path === "/api/v1/analyses/preview") return response(analysis);
      expect(
        ((opts?.headers ?? {}) as Record<string, string>).Authorization,
      ).toBe("Bearer test-token");
      const data = opts?.body ? JSON.parse(String(opts.body)) : null;
      if (path === "/api/v1/stores?limit=100") return response(db.stores);
      if (path === "/api/v1/stores" && opts?.method === "POST") {
        db.stores = [{ ...store, ...data }];
        return response(db.stores[0], 201);
      }
      if (path === "/api/v1/stores/store-a" && opts?.method === "PATCH") {
        db.stores = [{ ...db.stores[0], ...data }];
        return response(db.stores[0]);
      }
      if (path.endsWith("/finances") && opts?.method === "PUT") {
        if (conflict) return response({ message: "conflict" }, 409);
        expect(data.revision).toBe(db.finance?.revision);
        db.finance = {
          input: data.input,
          revision: "revision-2",
          updated_at: "2026-10-26T01:00:00Z",
        };
        return response(db.finance);
      }
      if (path.endsWith("/finances"))
        return db.finance ? response(db.finance) : response({}, 404);
      if (path.endsWith("/analyses"))
        return failAnalysis
          ? response({}, 503)
          : response(
              {
                id: "analysis-1",
                source_revision: db.finance?.revision,
                result: analysis,
              },
              201,
            );
      if (path.endsWith("/scenarios")) {
        expect(data.base_analysis_id).toBe("analysis-1");
        return response(
          {
            comparison: {
              base: analysis,
              scenarios: [{ analysis, ending_cash_delta: -100 }],
            },
          },
          201,
        );
      }
      throw new Error(`Unexpected request ${path}`);
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("세션 복원 후 DB 기반 홈을 표시하고 로그아웃하면 데이터를 숨긴다", async () => {
  render(<App />);
  expect(await screen.findByText("버틸 이용 가이드")).toBeTruthy();
  expect(await screen.findByText("22,500,000원")).toBeTruthy();
  expect(screen.queryByText(/842,000/)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "설정" }));
  fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
  expect(
    await screen.findByRole("button", { name: /로그인\s*⇥/ }),
  ).toBeTruthy();
  expect(screen.queryByText("테스트 식당")).toBeNull();
  expect(screen.queryByText("버틸 이용 가이드")).toBeNull();
});

test("입력 저장은 revision을 보내며 재시작 후 DB의 금액을 복원한다", async () => {
  const view = render(<App />);
  await screen.findByText("버틸 이용 가이드");
  fireEvent.click(screen.getByRole("button", { name: "입력/관리" }));
  fireEvent.change(screen.getByLabelText("보유자금 (원)"), {
    target: { value: "30000000" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "경영정보 저장 및 분석" }),
  );
  expect(
    await screen.findByText("경영정보와 분석 결과가 DB에 저장되었습니다."),
  ).toBeTruthy();
  expect(db.finance?.input.current_cash).toBe(30000000);
  view.unmount();
  render(<App />);
  expect(await screen.findByText("27,500,000원")).toBeTruthy();
});

test("409 충돌은 성공으로 표시하지 않고 입력 초안을 유지한다", async () => {
  conflict = true;
  render(<App />);
  await screen.findByText("버틸 이용 가이드");
  fireEvent.click(screen.getByRole("button", { name: "입력/관리" }));
  fireEvent.change(screen.getByLabelText("보유자금 (원)"), {
    target: { value: "30000000" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "경영정보 저장 및 분석" }),
  );
  expect(await screen.findByText(/다른 화면에서 수정되었거나/)).toBeTruthy();
  expect(
    (screen.getByLabelText("보유자금 (원)") as HTMLInputElement).value,
  ).toBe("30,000,000");
  expect(db.finance?.input.current_cash).toBe(25000000);
  expect(
    screen.queryByText("경영정보와 분석 결과가 DB에 저장되었습니다."),
  ).toBeNull();
});

test("입력 저장 후 분석만 실패하면 부분 성공을 정확히 표시한다", async () => {
  failAnalysis = true;
  render(<App />);
  await screen.findByText("버틸 이용 가이드");
  fireEvent.click(screen.getByRole("button", { name: "입력/관리" }));
  fireEvent.click(
    screen.getByRole("button", { name: "경영정보 저장 및 분석" }),
  );
  expect(
    await screen.findByText(/경영정보는 DB에 저장됐지만 분석 결과 저장에 실패/),
  ).toBeTruthy();
});

test("최초 등록 단계가 매장과 자금·고정비를 함께 저장한다", async () => {
  db.stores = [];
  db.finance = null;
  render(<App />);
  await screen.findByRole("heading", { name: /어떤 상황의/ });
  fireEvent.click(screen.getByRole("button", { name: "마포구" }));
  fireEvent.click(screen.getByRole("button", { name: /다음 단계/ }));
  fireEvent.change(screen.getByLabelText("대표자명"), {
    target: { value: "홍길동" },
  });
  fireEvent.change(screen.getByLabelText("매장명 (선택)"), {
    target: { value: "새 식당" },
  });
  fireEvent.change(screen.getByLabelText("현재 보유 운영자금"), {
    target: { value: "25000000" },
  });
  for (const n of [
    "월 사업장 임대료 (월세)",
    "월 인건비 (직원 및 아르바이트 급여)",
    "월 공과금 및 관리비 (전기, 수도, 가스, 인터넷)",
    "월 금융비용 및 대출 원리금 상환액",
  ])
    fireEvent.change(screen.getByLabelText(n), { target: { value: "100000" } });
  fireEvent.click(screen.getByRole("button", { name: /다음 단계/ }));
  expect(
    screen.getByRole("heading", { name: /대표님, 우리 가게/ }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /시작하기/ }));
  await screen.findByText("버틸 이용 가이드");
  expect(db.finance?.input.current_cash).toBe(25000000);
  expect(db.finance?.input.reserve_cash).toBe(2500000);
  expect(db.finance?.input.fixed_expenses.length).toBe(4);
});

test("회원가입 확인 비밀번호가 다르면 인증 요청을 보내지 않는다", async () => {
  remote.session = null;
  render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: "회원가입" }));
  fireEvent.change(screen.getByLabelText("이름"), {
    target: { value: "테스트" },
  });
  fireEvent.click(screen.getByRole("checkbox", { name: /MVP 이용 안내/ }));
  fireEvent.change(screen.getByLabelText("아이디(이메일)"), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByLabelText("비밀번호", { exact: true }), {
    target: { value: "test-password-1" },
  });
  fireEvent.change(screen.getByLabelText("비밀번호 확인"), {
    target: { value: "test-password-2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "회원가입" }));
  expect(
    await screen.findByText("비밀번호가 일치하지 않습니다. 다시 확인해주세요."),
  ).toBeTruthy();
  expect(remote.signup).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").id).toBe("password-mismatch");
  fireEvent.change(screen.getByLabelText("비밀번호 확인"), {
    target: { value: "test-password-1" },
  });
  expect(
    screen.queryByText("비밀번호가 일치하지 않습니다. 다시 확인해주세요."),
  ).toBeNull();
});

test("가입 응답에 세션이 없으면 로그인 성공으로 취급하지 않는다", async () => {
  remote.session = null;
  remote.signup.mockResolvedValue({ data: { session: null }, error: null });
  render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: "회원가입" }));
  fireEvent.change(screen.getByLabelText("이름"), {
    target: { value: "테스트" },
  });
  fireEvent.click(screen.getByRole("checkbox", { name: /MVP 이용 안내/ }));
  fireEvent.change(screen.getByLabelText("아이디(이메일)"), {
    target: { value: "test@example.com" },
  });
  for (const name of ["비밀번호", "비밀번호 확인"])
    fireEvent.change(screen.getByLabelText(name, { exact: true }), {
      target: { value: "test-password-1" },
    });
  fireEvent.click(screen.getByRole("button", { name: "회원가입" }));
  expect(await screen.findByText(/가입 요청이 접수되었습니다/)).toBeTruthy();
  expect(screen.queryByText("테스트 식당")).toBeNull();
  expect(screen.queryByText("버틸 이용 가이드")).toBeNull();
});

test("시나리오는 저장된 기준 분석 ID를 사용해 DB 저장 요청한다", async () => {
  render(<App />);
  await screen.findByText("버틸 이용 가이드");
  fireEvent.click(
    screen.getByRole("button", { name: "시뮬레이션", exact: true }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "시나리오 비교 및 DB 저장" }),
  );
  expect(
    await screen.findByText("기준 분석과 시나리오 비교가 DB에 저장되었습니다."),
  ).toBeTruthy();
});

test("늦게 끝난 DB 조회가 로그아웃한 계정 정보를 되살리지 않는다", async () => {
  let release: ((value: Response) => void) | undefined;
  vi.mocked(fetch).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  render(<App />);
  await screen.findByRole("status");
  await act(async () => {
    remote.session = null;
    remote.callback?.("SIGNED_OUT", null);
  });
  await act(async () => {
    release?.(response([store]));
  });
  await waitFor(() =>
    expect(screen.getByRole("button", { name: /로그인\s*⇥/ })).toBeTruthy(),
  );
  expect(screen.queryByText("테스트 식당")).toBeNull();
  expect(screen.queryByText("버틸 이용 가이드")).toBeNull();
});

test("탭 이동 후에도 원재료 초안을 유지하고 납부일과 함께 저장한다", async () => {
  render(<App />);
  await screen.findByText("버틸 이용 가이드");
  fireEvent.click(screen.getByRole("button", { name: "입력/관리" }));
  fireEvent.click(screen.getByRole("button", { name: /원재료 추가하기/ }));
  fireEvent.change(screen.getByLabelText("원재료 2 이름"), {
    target: { value: "원두" },
  });
  fireEvent.change(screen.getByLabelText("원재료 2 월 예상 지출액"), {
    target: { value: "50000" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "고정 지출 수정" }));
  fireEvent.change(screen.getByLabelText("고정 지출 1 납부일"), {
    target: { value: "31" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "경영정보 저장 및 분석" }),
  );
  await screen.findByText("경영정보와 분석 결과가 DB에 저장되었습니다.");
  expect(db.finance?.input.monthly_ingredient_cost).toBe(6050000);
  expect(db.finance?.input.fixed_expenses[0]).toMatchObject({ due_day: 31 });
  expect(db.finance?.input).toMatchObject({
    ingredient_items: [
      { name: "기존 원재료비 합계", amount: 6000000 },
      { name: "원두", amount: 50000 },
    ],
  });
});

test("현금 카드에서 실제 분석 그래프와 월별 현금 흐름을 연다", async () => {
  render(<App />);
  await screen.findByText("버틸 이용 가이드");
  fireEvent.click(screen.getByRole("button", { name: "현금 흐름 분석 열기" }));
  expect(
    screen.getByRole("img", { name: "월별 수입, 지출과 월말 잔액 그래프" }),
  ).toBeTruthy();
  expect(screen.getByText("월말 잔고")).toBeTruthy();
});

test("가입 세션이 발급돼도 직접 로그인하기 전에는 매장 설정을 열지 않는다", async () => {
  remote.session = null;
  db.stores = [];
  db.finance = null;
  remote.signup.mockResolvedValue({ data: { session }, error: null });
  remote.signin.mockImplementation(async () => {
    remote.session = session;
    remote.callback?.("SIGNED_IN", session);
    return { data: { session }, error: null };
  });
  render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: "회원가입" }));
  fireEvent.change(screen.getByLabelText("이름"), {
    target: { value: "테스트" },
  });
  fireEvent.change(screen.getByLabelText("아이디(이메일)"), {
    target: { value: "test@example.com" },
  });
  fireEvent.click(screen.getByRole("checkbox", { name: /MVP 이용 안내/ }));
  for (const name of ["비밀번호", "비밀번호 확인"])
    fireEvent.change(screen.getByLabelText(name, { exact: true }), {
      target: { value: "test-password-1" },
    });
  fireEvent.click(screen.getByRole("button", { name: "회원가입" }));
  await screen.findByText("회원가입이 완료되었습니다. 로그인해주세요.");
  expect(remote.session).toBeNull();
  expect(remote.signin).not.toHaveBeenCalled();
  expect(screen.queryByRole("heading", { name: /어떤 상황의/ })).toBeNull();
  expect(
    (screen.getByLabelText("비밀번호", { exact: true }) as HTMLInputElement)
      .value,
  ).toBe("");
  expect(
    (screen.getByLabelText("아이디(이메일)") as HTMLInputElement).value,
  ).toBe("test@example.com");
  expect(screen.queryByLabelText("비밀번호 확인")).toBeNull();
  fireEvent.change(screen.getByLabelText("비밀번호", { exact: true }), {
    target: { value: "test-password-1" },
  });
  fireEvent.click(screen.getByRole("button", { name: /로그인.*⇥/ }));
  await screen.findByRole("heading", { name: /어떤 상황의/ });
  expect(remote.signin).toHaveBeenCalledWith({
    email: "test@example.com",
    password: "test-password-1",
  });
});

test("비밀번호 표시 상태에 따라 원본 눈 아이콘이 바뀐다", async () => {
  remote.session = null;
  render(<App />);
  const input = await screen.findByLabelText("비밀번호", { exact: true });
  const button = screen.getByRole("button", { name: "비밀번호 보기" });
  expect(input.getAttribute("type")).toBe("password");
  expect(button.querySelector("img")?.getAttribute("src")).toContain(
    "eye-slash-",
  );
  fireEvent.click(button);
  expect(input.getAttribute("type")).toBe("text");
  expect(button.querySelector("img")?.getAttribute("src")).toContain(
    "eye-regular-",
  );
  fireEvent.click(button);
  expect(input.getAttribute("type")).toBe("password");
});

test("친구의 설정 화면에서 자금만 저장하고 기존 지출은 보존한다", async () => {
  render(<App />);
  await screen.findByText("버틸 이용 가이드");
  fireEvent.click(screen.getByRole("button", { name: "설정" }));
  expect(
    await screen.findByRole("heading", { name: "사업장 기본 정보" }),
  ).toBeTruthy();
  expect(
    screen
      .getAllByRole("switch")
      .every((el) => (el as HTMLButtonElement).disabled),
  ).toBe(true);
  fireEvent.click(screen.getAllByRole("button", { name: "수정" })[1]);
  fireEvent.change(screen.getByLabelText("총 보유 운영자금 (비상금 포함)"), {
    target: { value: "30000000" },
  });
  fireEvent.click(screen.getByRole("button", { name: "수정 완료" }));
  await screen.findByText("경영정보와 분석 결과가 DB에 저장되었습니다.");
  expect(db.finance?.input.current_cash).toBe(30000000);
  expect(db.finance?.input.reserve_cash).toBe(3000000);
  expect(db.finance?.input.fixed_expenses).toEqual(input.fixed_expenses);
  expect(db.finance?.input.monthly_sales).toBe(input.monthly_sales);
  fireEvent.click(screen.getByRole("button", { name: /설정으로/ }));
  expect(await screen.findByText("30,000,000")).toBeTruthy();
});

test("설정의 자금 수정 취소와 저장 실패는 성공으로 처리하지 않는다", async () => {
  render(<App />);
  await screen.findByText("버틸 이용 가이드");
  fireEvent.click(screen.getByRole("button", { name: "설정" }));
  fireEvent.click(screen.getAllByRole("button", { name: "수정" })[1]);
  fireEvent.change(screen.getByLabelText("총 보유 운영자금 (비상금 포함)"), {
    target: { value: "30000000" },
  });
  fireEvent.click(screen.getByRole("button", { name: /설정으로/ }));
  expect(screen.getByText("25,000,000")).toBeTruthy();
  fireEvent.click(screen.getAllByRole("button", { name: "수정" })[1]);
  conflict = true;
  fireEvent.click(screen.getByRole("button", { name: "수정 완료" }));
  await screen.findByText(/다른 화면에서 수정되었거나/);
  expect(
    screen.queryByText("경영정보와 분석 결과가 DB에 저장되었습니다."),
  ).toBeNull();
  expect(db.finance?.input.current_cash).toBe(25000000);
});

test("설정에서 매장 기본 정보를 저장하고 다시 요약을 보여준다", async () => {
  render(<App />);
  await screen.findByText("버틸 이용 가이드");
  fireEvent.click(screen.getByRole("button", { name: "설정" }));
  fireEvent.click(screen.getAllByRole("button", { name: "수정" })[0]);
  fireEvent.change(screen.getByLabelText("대표자명"), {
    target: { value: "테스트 대표" },
  });
  fireEvent.change(screen.getByLabelText("매장명"), {
    target: { value: "수정한 매장" },
  });
  fireEvent.click(screen.getByRole("button", { name: "마포구" }));
  fireEvent.click(screen.getByRole("button", { name: "카페 · 디저트" }));
  fireEvent.click(screen.getByRole("button", { name: "수정 완료" }));
  await screen.findByText("사업장 정보가 저장되었습니다.");
  fireEvent.click(screen.getByRole("button", { name: /설정으로/ }));
  await screen.findByRole("heading", { name: "사업장 기본 정보" });
  expect(db.stores[0]).toMatchObject({
    name: "수정한 매장",
    region: "서울 마포구",
    business_type: "cafe",
    status: "operating",
  });
  expect(db.finance?.input).toEqual(input);
});
