import { useState } from "react";
import "./SimulationPage.css";

type ScenarioCard = {
  key: "optimistic" | "basic" | "pessimistic";
  title: string;
  subtitle: string;
  runway: string;
  note: string;
  icon: string;
};

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
    subtitle: "지난 3개월 평균 매출 유지 기준",
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
        {scenarioCards.map((scenario) => (
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
