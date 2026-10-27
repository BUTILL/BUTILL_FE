import { useState, type FormEvent } from "react";
import { useAccount } from "../lib/Account";
import { won, type Input, type Store } from "../lib/api";
import { FlowHeader } from "./LoginPage";
import "./AccessFlow.css";
import MoneyInput from "../components/MoneyInput";

const regions = [
  "강남구",
  "강동구",
  "강북구",
  "강서구",
  "관악구",
  "광진구",
  "구로구",
  "금천구",
  "노원구",
  "도봉구",
  "동대문구",
  "동작구",
  "마포구",
  "서대문구",
  "서초구",
  "성동구",
  "성북구",
  "송파구",
  "양천구",
  "영등포구",
  "용산구",
  "은평구",
  "종로구",
  "중구",
  "중랑구",
];
const kinds = [
  "카페 · 디저트",
  "한식 일반 · 백반",
  "일식 · 돈까스 · 회",
  "양식 · 패스트푸드",
  "주점 · 이자카야 · 펍",
  "베이커리 · 디저트",
  "치킨 · 피자 배달 전문",
  "기타 요식업 직접 입력",
];
const fixedNames = [
  "월 사업장 임대료 (월세)",
  "월 인건비 (직원 및 아르바이트 급여)",
  "월 공과금 및 관리비 (전기, 수도, 가스, 인터넷)",
  "월 금융비용 및 대출 원리금 상환액",
];

export default function Onboarding() {
  const account = useAccount();
  const [step, setStep] = useState(1);
  const [month] = useState(() =>
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
    }).format(new Date()),
  );
  const [status, setStatus] = useState<Store["status"]>(
    account.store?.status ?? "planning",
  );
  const [region, setRegion] = useState(
    account.store?.region.replace(/^서울\s*/, "") ?? "",
  );
  const [kind, setKind] = useState("카페 · 디저트");
  const [custom, setCustom] = useState("");
  const [name, setName] = useState(
    String(account.session?.user.user_metadata?.display_name ?? ""),
  );
  const [storeName, setStoreName] = useState(account.store?.name ?? "");
  const [cash, setCash] = useState("");
  const [rate, setRate] = useState(10);
  const [costs, setCosts] = useState(["", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const amount = (v: string) => Number(v.replaceAll(",", "")) || 0;
  const total = costs.reduce((n, v) => n + amount(v), 0);
  const reserve = Math.round((amount(cash) * rate) / 100);
  const validMoney = (v: string) =>
    /^\d+$/.test(v) && Number.isSafeInteger(Number(v)) && Number(v) <= 1e12;
  const next = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === 1) {
      if (!region || !kind || (kind === kinds[7] && !custom.trim())) {
        setError("지역과 업종을 선택해주세요.");
        return;
      }
      setStep(2);
    } else {
      if (
        !name.trim() ||
        !validMoney(cash) ||
        costs.some((v) => !validMoney(v))
      ) {
        setError(
          "대표자명과 모든 금액을 확인해주세요. 금액은 0~1조 원의 정수로 입력하세요.",
        );
        return;
      }
      setStep(3);
    }
    window.scrollTo(0, 0);
  };
  const start = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const input: Input = {
      start_month: `${month}-01`,
      months: 12,
      current_cash: amount(cash),
      reserve_cash: reserve,
      unpaid_initial_investment: 0,
      monthly_sales: 0,
      monthly_ingredient_cost: 0,
      fixed_expenses: costs.map((v, i) => ({
        name: fixedNames[i],
        amount: amount(v),
      })),
      irregular_expenses: [],
      monthly_overrides: [],
    };
    try {
      await account.onboard(
        {
          name: storeName.trim() || `${name.trim()}의 매장`.slice(0, 100),
          business_type:
            kind.includes("카페") || kind.includes("베이커리")
              ? "cafe"
              : "restaurant",
          region: `서울 ${region}`,
          status,
        },
        input,
        {
          representative_name: name.trim(),
          business_category: kind === kinds[7] ? custom.trim() : kind,
        },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="device onboard-page">
      <FlowHeader
        onBack={() => {
          if (step > 1) {
            setStep(step - 1);
            setError("");
            window.scrollTo(0, 0);
          } else
            void account
              .signOut()
              .catch(() => setError("로그아웃하지 못했습니다."));
        }}
      />
      <div className="onboard-body">
        {step === 1 ? (
          <form id="onboard-form" onSubmit={next}>
            <fieldset disabled={busy}>
              <div className="onboard-intro">
                <h1>
                  어떤 상황의
                  <br />
                  대표님이신가요?
                </h1>
                <p>
                  지역과 업종을 선택하고 우리 가게의 현금 흐름 관리를
                  시작해보세요.
                </p>
              </div>
              <section className="onboard-section">
                <h2 className="section-label">
                  현재 비즈니스 상태<small>필수 선택</small>
                </h2>
                <div className="status-choices">
                  {(["planning", "operating"] as const).map((s, i) => (
                    <button
                      type="button"
                      key={s}
                      className={`choice-card ${status === s ? "active" : ""}`}
                      aria-pressed={status === s}
                      onClick={() => setStatus(s)}
                    >
                      <span className="choice-symbol">
                        {i === 0 ? "♙" : "▤"}
                      </span>
                      {i === 0 ? "창업 준비자" : "사업장 운영 중"}
                      {status === s && <span className="choice-tick">●</span>}
                    </button>
                  ))}
                </div>
              </section>
              <section className="onboard-section">
                <h2 className="section-label">
                  희망 지역 <small>(서울시)</small>
                </h2>
                <div className="region-choices">
                  {regions.map((r) => (
                    <button
                      type="button"
                      aria-pressed={region === r}
                      className={region === r ? "active" : ""}
                      key={r}
                      onClick={() => setRegion(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </section>
              <section className="onboard-section">
                <h2 className="section-label">희망 / 영위 업종</h2>
                <div className="kind-choices">
                  {kinds.map((k) => (
                    <button
                      type="button"
                      aria-pressed={kind === k}
                      className={kind === k ? "active" : ""}
                      key={k}
                      onClick={() => setKind(k)}
                    >
                      {k}
                      {kind === k && <b>●</b>}
                    </button>
                  ))}
                </div>
                {kind === kinds[7] && (
                  <label className="onboard-field">
                    업종 직접 입력
                    <input
                      required
                      maxLength={100}
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                    />
                  </label>
                )}
              </section>
            </fieldset>
          </form>
        ) : step === 2 ? (
          <form id="onboard-form" onSubmit={next}>
            <fieldset disabled={busy}>
              <div className="onboard-intro">
                <h1>사업장 기초 정보 설정</h1>
                <p>
                  자금 고갈을 방지하고 정확한 현금 흐름을 예측하기 위해 필수
                  정보를 입력해 주세요.
                </p>
              </div>
              <h2 className="onboard-step-title">
                <span>1</span>대표자 기본 정보<small>필수 입력</small>
              </h2>
              <label className="onboard-field">
                대표자명
                <input
                  required
                  maxLength={100}
                  value={name}
                  placeholder="이름을 입력해주세요"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="onboard-field">
                매장명 (선택)
                <input
                  maxLength={100}
                  value={storeName}
                  placeholder="미입력 시 대표자명으로 매장을 등록합니다"
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </label>
              <h2 className="onboard-step-title">
                <span>2</span>보유 운영 자금 및 완충 자금
              </h2>
              <section className="money-card">
                <h3>현재 보유 운영자금</h3>
                <p>사용할 통장 잔고 및 즉시 출금 가능한 비상금</p>
                <MoneyInput
                  label="현재 보유 운영자금"
                  value={cash}
                  onChange={setCash}
                  invalid={!!error && !validMoney(cash)}
                />
              </section>
              <section className="money-card">
                <h3>비상 완충 비율 선택</h3>
                <div className="reserve-options">
                  {[5, 10, 15, 20].map((r) => (
                    <button
                      type="button"
                      key={r}
                      aria-pressed={rate === r}
                      className={rate === r ? "active" : ""}
                      onClick={() => setRate(r)}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
                <div className="reserve-detail">
                  ♧ 설정 예비자금: {won(reserve)}
                  <small>
                    보유자금의 {rate}%를 비상금으로 보존하여 급작스러운 매출
                    하락에 대응합니다.
                  </small>
                </div>
              </section>
              <h2 className="onboard-step-title">
                <span>3</span>월 고정 지출<small>나중에 입력해도 돼요</small>
              </h2>
              {fixedNames.map((n, i) => (
                <label key={n} className="onboard-field">
                  {n}
                  <MoneyInput
                    label={n}
                    value={costs[i]}
                    unit="원/월"
                    invalid={!!error && !validMoney(costs[i])}
                    onChange={(value) =>
                      setCosts(costs.map((v, j) => (i === j ? value : v)))
                    }
                  />
                </label>
              ))}
              <p className="field-hint">
                지출이 없으면 0을 입력하세요. 식재료비와 매출은 등록 후
                입력/관리에서 추가할 수 있어요.
              </p>
              <div className="fixed-total">
                예상 월 고정 지출 합계<strong>월 {won(total)}</strong>
              </div>
            </fieldset>
          </form>
        ) : (
          <>
            <span className="guide-badge">● 버틸은 이렇게 활용해보세요!</span>
            <h1 className="guide-title">
              대표님, 우리 가게 통장 잔고
              <br />
              <strong>몇 달이나 버틸 수 있을까요?</strong>
            </h1>
            <p className="guide-lead">
              복잡한 회계 공부나 계산기는 필요 없습니다. 통장 잔고와 월세,
              인건비만 넣으면 버틸 기간을 계산해 드려요.
            </p>
            <p className="section-label">✦ 버틸이 사장님께 드리는 3가지 약속</p>
            <article className="guide-card">
              <h3>
                ◷ 하나,
                <br />내 가게 버틸 시간 확인
              </h3>
              <p>
                매출과 지출을 입력하면 통장 잔고로 가게 운영이 언제까지 가능한지
                월별로 확인합니다.
              </p>
            </article>
            <article className="guide-card">
              <h3>
                ♧ 둘,
                <br />
                부가세·목돈 나갈 때 든든한 방패
              </h3>
              <p>
                정기 지출과 비정기 지출을 구분해 입력하고, 비상 예비자금을
                제외한 가용자금을 함께 확인합니다.
              </p>
            </article>
            <article className="guide-card">
              <h3>
                ✧ 셋,
                <br />
                조건 변경으로 살펴보는 대응 방향
              </h3>
              <p>
                매출 감소나 식재료비 상승 조건을 바꿔보고, 자금 흐름과 위험
                근거를 비교합니다.
              </p>
            </article>
            <section className="guide-steps">
              <p>
                사장님은 이것만 해주세요!
                <br />딱 3가지만 적으면 끝납니다.
              </p>
              {[
                "가게 통장 잔고 입력",
                "매달 나가는 고정비 확인",
                "매출·식재료비 추가 후 분석 확인",
              ].map((s, i) => (
                <article key={s}>
                  <span>{i + 1}</span>
                  {s}
                </article>
              ))}
              <p className="guide-security">
                입력 정보는 로그인한 본인 매장에 저장됩니다. 월말 기준
                예상치이며 실제 결과와 다를 수 있습니다.
              </p>
            </section>
          </>
        )}
        {error && (
          <p role="alert" className="access-error">
            {error}
          </p>
        )}
      </div>
      <footer className="flow-footer">
        {step < 3 ? (
          <button type="submit" form="onboard-form" className="flow-primary">
            다음 단계 →
          </button>
        ) : (
          <button
            disabled={busy}
            className="flow-primary"
            onClick={() => void start()}
          >
            {busy ? "매장·기초 정보 저장 중…" : "시작하기 →"}
          </button>
        )}
      </footer>
    </main>
  );
}
