import { useState } from "react";
import "./SimulationPage.css";

type ScenarioKey = "basic" | "optimistic" | "pessimistic";

type Scenario = {
  name: string;
  short: string;
  tone: string;
  headline: string;
  summary: string;
  runway: string;
  runwayNote: string;
  title: string;
  description: string;
  pivot: string;
  line: number[];
  income: number[];
  expense: number[];
  depletedIndex?: number;
};

const months = [
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
];

const scenarios: Record<ScenarioKey, Scenario> = {
  basic: {
    name: "기본",
    short: "현재 추세",
    tone: "blue",
    headline: "현재 추세로",
    summary: "지난 3개월 평균 매출 유지 기준",
    runway: "약 8개월",
    runwayNote: "올해 11월 말 소진 예상",
    title: "기본 시나리오",
    description: "영업이 현재 추세로 지속될 때 예상되는 자금 흐름입니다.",
    pivot: "기본 시나리오, 11월 말 자금 소진 예상",
    line: [44, 64, 85, 109, 128, 139, 149, 157, 165, 173],
    income: [55, 54, 57, 55, 58, 56, 57, 53, 56, 57],
    expense: [67, 66, 67, 69, 87, 68, 70, 72, 73, 74],
  },
  optimistic: {
    name: "낙관",
    short: "매출 +15%",
    tone: "blue",
    headline: "낙관적으로",
    summary: "신메뉴 반응 양호 (매출 +15%)",
    runway: "약 12개월 이상",
    runwayNote: "자금 고갈 염려 없음",
    title: "낙관 시나리오",
    description: "매출이 늘고 지출이 안정적으로 유지될 때의 예상 흐름입니다.",
    pivot: "낙관 시나리오, 12개월 이내 자금 고갈 염려 없음",
    line: [43, 54, 66, 77, 88, 98, 108, 118, 127, 136],
    income: [63, 64, 66, 67, 69, 70, 71, 73, 74, 75],
    expense: [58, 57, 58, 59, 74, 58, 59, 60, 61, 61],
  },
  pessimistic: {
    name: "비관",
    short: "재료비 +10%",
    tone: "red",
    headline: "비관적으로",
    summary: "매출 -15% 감소 & 원재료비 +8% 상승",
    runway: "약 6개월",
    runwayNote: "올해 9월 자금 고갈 위험",
    title: "비관 시나리오",
    description:
      "영업이 비관적으로 지속될 때 예상되는 시나리오를 보여드립니다.",
    pivot: "비관 시나리오, 9월 잔고 0원 도달",
    line: [43, 63, 83, 109, 133, 157, 174, 174, 174, 174],
    income: [52, 51, 53, 52, 55, 52, 49, 49, 48, 47],
    expense: [66, 67, 68, 83, 79, 77, 78, 78, 79, 80],
    depletedIndex: 6,
  },
};

const remedies = [
  {
    title: "점심 특선 도입으로 매출 +5%",
    detail: "객단가 상승 및 테이크아웃 강화",
    extraMonths: 1.5,
  },
  {
    title: "원재료 공동구매로 30만원 절감",
    detail: "인근 상권 3개점 합동 발주",
    extraMonths: 1,
  },
  {
    title: "소상공인 예비자금 250만원 유입",
    detail: "서울신용보증재단 저리 완충금",
    extraMonths: 1.2,
  },
];

function formatRunway(monthsValue: number) {
  const monthsPart = Math.floor(monthsValue);
  const daysPart = Math.round((monthsValue - monthsPart) * 30);
  return daysPart === 0
    ? `${monthsPart}개월`
    : `${monthsPart}개월 ${daysPart}일`;
}

function ScenarioChart({
  scenario,
  selected,
}: {
  scenario: Scenario;
  selected: ScenarioKey;
}) {
  const points = scenario.line
    .map((y, index) => `${20 + index * 33},${y}`)
    .join(" ");
  const zeroPoint = scenario.depletedIndex;

  return (
    <div
      className="simulation-chart"
      role="img"
      aria-label={`${scenario.name} 시나리오 월별 현금 흐름 그래프`}
    >
      <svg viewBox="0 0 340 220" preserveAspectRatio="none">
        {[28, 91, 154, 181].map((y) => (
          <line
            key={y}
            x1="10"
            x2="332"
            y1={y}
            y2={y}
            className="chart-gridline"
          />
        ))}
        {months.map((month, index) => {
          const x = 20 + index * 33;
          const dimmed =
            selected === "pessimistic" &&
            zeroPoint !== undefined &&
            index > zeroPoint;
          return (
            <g key={month} opacity={dimmed ? 0.4 : 1}>
              <rect
                x={x - 10}
                y={180 - scenario.income[index]}
                width="9"
                height={scenario.income[index]}
                rx="2"
                className="chart-income"
              />
              <rect
                x={x + 1}
                y={180 - scenario.expense[index]}
                width="9"
                height={scenario.expense[index]}
                rx="2"
                className="chart-expense"
              />
              <text
                x={x}
                y="207"
                textAnchor="middle"
                className={
                  index === 4
                    ? "month-label current-month"
                    : index === 8
                      ? "month-label future-month"
                      : "month-label"
                }
              >
                {month}
              </text>
            </g>
          );
        })}
        <polyline points={points} className="chart-balance" />
        <circle
          cx="20"
          cy={scenario.line[0]}
          r="4"
          className="chart-start-point"
        />
        {zeroPoint !== undefined && (
          <>
            <circle
              cx={20 + zeroPoint * 33}
              cy={scenario.line[zeroPoint]}
              r="6"
              className="chart-zero-point"
            />
            <rect
              x="165"
              y="25"
              width="138"
              height="25"
              rx="7"
              className="chart-callout"
            />
            <path d="M220 50l7 7 7-7" className="chart-callout-tip" />
            <text
              x="234"
              y="42"
              textAnchor="middle"
              className="chart-callout-text"
            >
              9월 잔고 0원 도달
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

export default function SimulationPage() {
  const [selected, setSelected] = useState<ScenarioKey>("basic");
  const [introVisible, setIntroVisible] = useState(true);
  const [introClosing, setIntroClosing] = useState(false);
  const [checkedRemedies, setCheckedRemedies] = useState([true, true, false]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const scenario = scenarios[selected];
  const addedMonths = remedies.reduce(
    (sum, remedy, index) =>
      sum + (checkedRemedies[index] ? remedy.extraMonths : 0),
    0,
  );
  const adjustedRunway = 6 + addedMonths;

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
            <p>
              기본, 낙관, 비관 3가지 상황별 버틸 기간과 든든한 해결 방안을
              한눈에 비교합니다.
            </p>
          </div>
          <button aria-label="안내 닫기" onClick={closeIntro}>
            ×
          </button>
        </section>
      )}

      <div
        className="scenario-tabs"
        role="tablist"
        aria-label="시뮬레이션 시나리오"
      >
        {(Object.keys(scenarios) as ScenarioKey[]).map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={selected === key}
            className={selected === key ? "selected" : ""}
            onClick={() => setSelected(key)}
          >
            <b>{scenarios[key].name}</b>
            <small>{scenarios[key].short}</small>
          </button>
        ))}
      </div>

      <section className={`scenario-summary ${scenario.tone}`}>
        <div className="scenario-summary-heading">
          <img
            src={`/simulation-icons/${selected === "pessimistic" ? "risk-alert.png" : selected === "optimistic" ? "growth-trend.png" : "current-trend.png"}`}
            alt=""
          />
          <div>
            <h2>{scenario.headline}</h2>
            <p>{scenario.summary}</p>
          </div>
        </div>
        <div className="runway-result">
          <span>예상 버틸 기간</span>
          <div>
            <b>{scenario.runway}</b>
            <small>{scenario.runwayNote}</small>
          </div>
        </div>
      </section>

      <section className="scenario-chart-card">
        <h2>{scenario.title}</h2>
        <p>{scenario.description}</p>
        <div className="chart-legend">
          <span>
            <i className="legend-income" />
            들어오는 돈 (수입)
          </span>
          <span>
            <i className="legend-expense" />
            나가는 돈 (지출)
          </span>
          <span>
            <i className="legend-balance" />
            남은 잔액
          </span>
        </div>
        <ScenarioChart scenario={scenario} selected={selected} />
        <div className="risk-point-note">
          <img src="/simulation-icons/risk-point.png" alt="" />
          <div>
            <b>위험 분기점</b>
            <small>{scenario.pivot}</small>
          </div>
        </div>
      </section>

      {selected === "pessimistic" && (
        <>
          <section className="simulation-recovery">
            <header className="recovery-heading">
              <img src="/simulation-icons/remedy-badge.png" alt="" />
              <b>대표님을 위한 버틸 처방전</b>
              <small>비관 상황 극복을 위한</small>
            </header>
            <p className="recovery-description">
              가게 상황에 맞게 조건을 조절해 보세요. 위기 상황에서도 든든하게
              버틸 해답이 보입니다.
            </p>
            <div className="remedy-list">
              {remedies.map((remedy, index) => (
                <label className="remedy-item" key={remedy.title}>
                  <input
                    type="checkbox"
                    checked={checkedRemedies[index]}
                    onChange={() =>
                      setCheckedRemedies((old) =>
                        old.map((value, i) => (i === index ? !value : value)),
                      )
                    }
                  />
                  <span className="remedy-copy">
                    <b>{remedy.title}</b>
                    <small>{remedy.detail}</small>
                  </span>
                  <strong>+{remedy.extraMonths.toFixed(1)}개월 연장</strong>
                </label>
              ))}
            </div>
            <div className="adjusted-runway">
              <div>
                <span>처방전 적용 후 예상 버틸 기간</span>
                <b>{formatRunway(adjustedRunway)}</b>
              </div>
              <p>비관 시나리오에서 선택한 대응 방안을 반영한 예상치입니다.</p>
            </div>
            <button
              className="simulation-details-toggle"
              onClick={() => setDetailsOpen((open) => !open)}
            >
              <span>산식 및 세부 데이터</span>
              <span
                className={`details-chevron${detailsOpen ? " open" : ""}`}
                aria-hidden="true"
              />
            </button>
            {detailsOpen && (
              <div className="simulation-details">
                <p>
                  최근 3개월 평균 매출과 등록된 월 지출을 기준으로 예상 자금
                  흐름을 계산합니다.
                </p>
                <p>
                  선택한 처방전 연장 효과: <b>+{addedMonths.toFixed(1)}개월</b>
                </p>
              </div>
            )}
          </section>
          <aside className="financial-coach">
            <img src="/simulation-icons/advisor.png" alt="" />
            <div>
              <b>버틸 금융 코파일럿 조언</b>
              <p>
                “원재료값 인상분은 혼자 떠안지 마시고 사이드 메뉴 테스트로
                방어하세요.”
              </p>
            </div>
          </aside>
        </>
      )}
    </section>
  );
}
