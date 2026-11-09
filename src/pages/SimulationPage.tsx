import { useEffect, useState } from "react";
import "./SimulationPage.css";
import { useAccount } from "../lib/account";
import { publicApi } from "../lib/api";
import type { Analysis, AnalysisInput } from "../types/api";

type ScenarioCard = {
  key: "optimistic" | "basic" | "pessimistic";
  title: string;
  subtitle: string;
  runway: string;
  note: string;
  icon: string;
};

// 시나리오별 조건 (bps: 10,000 = 100%)
const scenarioChanges = {
  optimistic: { name: "낙관", sales_change_bps: 1500, ingredient_change_bps: 0, fixed_change_bps: 0 },
  pessimistic: { name: "비관", sales_change_bps: -1500, ingredient_change_bps: 800, fixed_change_bps: 0 },
};

type ComparisonResult = {
  base: Analysis;
  scenarios: { name: string; analysis: Analysis }[];
};

// 분석 결과 → 예상 버틸 기간·안내 문구
function runwayText(analysis: Analysis, key: ScenarioCard["key"]) {
  const runway = analysis.available_runway;
  if (runway.initial_balance <= 0) return { runway: "0개월", note: "시작 시점부터 자금 부족" };
  const month = runway.first_shortage_month ?? runway.first_depletion_month;
  if (!month) return { runway: `약 ${analysis.months}개월 이상`, note: "자금 고갈 염려 없음" };
  const months = runway.full_months_before_shortage ?? Math.max(0, analysis.monthly.findIndex((m) => m.month === month));
  const [year, mon] = month.split("-").map(Number);
  const when = year === new Date().getFullYear() ? `올해 ${mon}월` : `${year}년 ${mon}월`;
  return {
    runway: `약 ${months}개월`,
    note: key === "pessimistic" ? `${when} 자금 고갈 위험` : `${when} 소진 예상`,
  };
}

const scenarioCards: ScenarioCard[] = [
  {
    key: "optimistic",
    title: "낙관적으로",
    subtitle: "신메뉴 반응 양호 (매출 +15%)",
    runway: "약 12개월 이상",
    note: "자금 고갈 염려 없음",
    icon: "/simulation-icons/optimistic-growth-arrow.png",
  },
  {
    key: "basic",
    title: "현재 추세로",
    subtitle: "입력한 매출·지출 유지 기준",
    runway: "약 8개월",
    note: "올해 11월 말 소진 예상",
    icon: "/simulation-icons/current-trend-balance.png",
  },
  {
    key: "pessimistic",
    title: "비관적으로",
    subtitle: "매출 -15% 감소 & 원재료비 +8% 상승",
    runway: "약 5개월",
    note: "올해 9월 자금 고갈 위험",
    icon: "/simulation-icons/pessimistic-warning.png",
  },
];

function ScenarioOverview({ scenario }: { scenario: ScenarioCard }) {
  return (
    <article className={`scenario-overview ${scenario.key}`}>
      <header className="scenario-overview-heading">
        <img src={scenario.icon} alt="" />
        <div>
          <h2>{scenario.title}</h2>
          <p>{scenario.subtitle}</p>
        </div>
      </header>
      <div className="scenario-runway-result">
        <span>예상 버틸 기간</span>
        <div>
          <b>{scenario.runway}</b>
          <small>{scenario.note}</small>
        </div>
      </div>
    </article>
  );
}

export default function SimulationPage() {
  const account = useAccount();
  const input: AnalysisInput | undefined = account.finance?.input;
  const [comparison, setComparison] = useState<{ input: AnalysisInput; result: ComparisonResult | null } | null>(null);

  // 저장된 경영정보로 기본·낙관·비관 시나리오 비교 (저장하지 않는 계산)
  useEffect(() => {
    if (!input) return;
    let active = true;
    publicApi<ComparisonResult>("/scenarios/compare", {
      base: input,
      scenarios: [scenarioChanges.optimistic, scenarioChanges.pessimistic],
    })
      .then((result) => active && setComparison({ input, result }))
      .catch(() => active && setComparison({ input, result: null }));
    return () => {
      active = false;
    };
  }, [input]);

  // 계산 결과를 카드에 반영 (경영정보가 없거나 계산 전·실패 시 안내)
  const result = comparison?.input === input ? comparison?.result : undefined;
  const cards = scenarioCards.map((card) => {
    if (!input) return { ...card, runway: "-", note: "사업장 정보를 입력하면 계산돼요" };
    if (result === undefined) return { ...card, runway: "계산 중", note: "" };
    if (result === null) return { ...card, runway: "-", note: "계산하지 못했어요. 잠시 후 다시 확인해주세요" };
    const key = card.key;
    const analysis =
      key === "basic"
        ? result.base
        : result.scenarios.find((item) => item.name === scenarioChanges[key].name)?.analysis;
    return analysis ? { ...card, ...runwayText(analysis, card.key) } : card;
  });
  const [introVisible, setIntroVisible] = useState(true);
  const [introClosing, setIntroClosing] = useState(false);
  const analysisWebUrl =
    import.meta.env.VITE_SIMULATION_ANALYSIS_URL || "http://localhost:5174/";
  const closeIntro = () => {
    setIntroClosing(true);
    window.setTimeout(() => {
      setIntroVisible(false);
      setIntroClosing(false);
    }, 230);
  };

  return (
    <section className="simulation-page">
      {introVisible && (
        <section
          className={`simulation-intro intro${introClosing ? " intro-closing" : ""}`}
        >
          <div>
            <h1>
              만약 매출이 줄거나
              <br />
              재료비가 오르면?
            </h1>
            <p>기본, 낙관, 비관 3가지 상황별 버틸 기간을 한눈에 비교합니다.</p>
          </div>
          <button type="button" aria-label="안내 닫기" onClick={closeIntro}>
            ×
          </button>
        </section>
      )}

      <div className="scenario-overview-list">
        {cards.map((scenario) => (
          <ScenarioOverview scenario={scenario} key={scenario.key} />
        ))}
      </div>



      <section className="store-diagnosis-card">
        <header className="store-diagnosis-heading">
          <div>
            <h2>현재 가게 상황 점검</h2>
            <p>가게 운영에서 놓치기 쉬운 항목을 확인해 보세요.</p>
          </div>
        </header>
        <div className="store-diagnosis-list">
          <article className="store-diagnosis-item cost-risk">
            <div className="store-diagnosis-label">
              <b>원재료비 부담</b>
              <span>원가 점검</span>
            </div>
            <p>
              식용유나 돼지고기 단가가 오르면 메뉴별 원재료비가 빠르게 늘 수
              있어요.
            </p>
            <small>
              대응 제안 · 대체 재료 가격과 메뉴별 원가를 함께 비교해 보세요.
            </small>
          </article>
          <article className="store-diagnosis-item labor-risk">
            <div className="store-diagnosis-label">
              <b>인건비 비중 확인</b>
              <span>고정 지출</span>
            </div>
            <p>
              매출이 줄어도 인건비가 유지되면 매달 사용할 수 있는 자금이 줄어들
              수 있어요.
            </p>
            <small>
              대응 제안 · 시간대별 매출과 근무 일정을 함께 확인해 보세요.
            </small>
          </article>
          <article className="store-diagnosis-item sales-risk">
            <div className="store-diagnosis-label">
              <b>매출 감소 대비</b>
              <span>매출 흐름</span>
            </div>
            <p>매출 감소가 이어지면 예상보다 자금이 빨리 소진될 수 있어요.</p>
            <small>
              대응 제안 · 최근 3개월 매출과 다가오는 지출 일정을 점검해 보세요.
            </small>
          </article>
        </div>
      </section>

      <section className="simulation-detail-web">
        <div className="simulation-detail-copy">
          <span className="simulation-detail-kicker">시나리오 상세 분석</span>
          <h2>자금 흐름을 자세히 확인해 보세요</h2>
          <p>월별 그래프와 시나리오별 분석을 웹에서 확인할 수 있어요.</p>
        </div>
        <a className="simulation-detail-link" href={analysisWebUrl}>
          자세한 분석 및 그래프 보러 가기 <span aria-hidden="true">→</span>
        </a>
      </section>

      <aside className="financial-coach">
        <img src="/simulation-icons/financial-coach-advisor.png" alt="" />
        <div>
          <b>버틸 금융 조언</b>
          <p>
            “매장 상황이 어렵다면 사장님께 꼭 맞는 지원금은 무엇이 있는지 확인해
            보세요.”
          </p>
        </div>
      </aside>
    </section>
  );
}
