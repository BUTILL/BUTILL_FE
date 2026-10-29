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

const graphMonths = [
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
  "1월",
  "2월",
];
const graphLines = [
  {
    label: "기본 시나리오",
    tone: "basic",
    values: [100, 96, 91, 86, 66, 60, 53, 44, 36, 29, 22, 15],
  },
  {
    label: "비관 시나리오",
    tone: "pessimistic",
    values: [100, 80, 61, 44, 29, 19, 4, -10, -22, -33, -43, -50],
  },
  {
    label: "낙관 시나리오",
    tone: "optimistic",
    values: [100, 104, 108, 115, 106, 112, 119, 126, 133, 140, 147, 153],
  },
];
const graphTicks = [150, 100, 50, 0, -50];
const chartX = (index: number) => 43 + (index * 294) / (graphMonths.length - 1);
const chartY = (value: number) => 34 + ((150 - value) / 200) * 160;

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

function ScenarioComparisonChart() {
  return (
    <div
      className="scenario-comparison-chart"
      role="img"
      aria-label="3월부터 다음 해 2월까지 기본, 비관, 낙관 시나리오별 가용자금 비교 그래프"
    >
      <svg viewBox="0 0 360 232" preserveAspectRatio="xMidYMid meet">
        {graphTicks.map((tick) => {
          const y = chartY(tick);
          return (
            <g key={tick}>
              <line
                x1="43"
                x2="344"
                y1={y}
                y2={y}
                className="comparison-gridline"
              />
              <text
                x="31"
                y={y + 3}
                textAnchor="end"
                className="comparison-axis-label"
              >
                {tick}
              </text>
            </g>
          );
        })}
        {graphMonths.map((month, index) => (
          <text
            key={month}
            x={chartX(index)}
            y="218"
            textAnchor="middle"
            className="comparison-month-label"
          >
            {month}
          </text>
        ))}
        {graphLines.map((line) => {
          const points = line.values
            .map((value, index) => `${chartX(index)},${chartY(value)}`)
            .join(" ");
          const lastX = chartX(line.values.length - 1);
          const lastY = chartY(line.values[line.values.length - 1]);
          return (
            <g key={line.tone}>
              <polyline
                points={points}
                className={`comparison-line ${line.tone}`}
              />
              <circle
                cx={lastX}
                cy={lastY}
                r="3.1"
                className={`comparison-point ${line.tone}`}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function SimulationPage() {
  const [introVisible, setIntroVisible] = useState(true);
  const [introClosing, setIntroClosing] = useState(false);

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

      <section className="scenario-chart-card">
        <h2>시나리오별 그래프</h2>
        <p>시나리오별 가용자금 상황을 비교해 보세요.</p>
        <div className="comparison-legend">
          {graphLines.map((line) => (
            <span key={line.tone}>
              <i className={line.tone} />
              {line.label}
            </span>
          ))}
        </div>
        <small className="comparison-chart-caption">가용자금 기준</small>
        <ScenarioComparisonChart />
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
