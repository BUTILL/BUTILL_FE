import { useEffect, useState, type FormEvent } from "react";
import "./SimulationAnalysisWebPage.css";

type ScenarioKey = "basic" | "optimistic" | "pessimistic";
type Scenario = {
  key: ScenarioKey;
  name: string;
  label: string;
  period: string;
  color: string;
  tint: string;
  fundsInTenThousands: number[];
  assumptions: string[];
  insight: string;
};
type ScenarioAssumptions = Record<ScenarioKey, string[]>;

const assumptionStorageKey = "butill-simulation-assumptions";

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
  "1월",
  "2월",
];
const scenarios: Scenario[] = [
  {
    key: "basic",
    name: "기본 시나리오",
    label: "현재 추세 유지",
    period: "약 8개월",
    color: "#1769d2",
    tint: "#edf4ff",
    fundsInTenThousands: [
      2845, 2450, 2070, 1690, 1320, 960, 610, 260, -80, -450, -800, -1150,
    ],
    assumptions: ["최근 3개월 평균 매출 유지", "입력한 월 지출 유지"],
    insight: "현재 운영 흐름이 이어질 때의 자금 변화를 보여줍니다.",
  },
  {
    key: "optimistic",
    name: "낙관 시나리오",
    label: "매출 성장",
    period: "약 12개월 이상",
    color: "#149447",
    tint: "#edf8f1",
    fundsInTenThousands: [
      2845, 2880, 2960, 3040, 2950, 3120, 3290, 3460, 3630, 3800, 3970, 4140,
    ],
    assumptions: ["신메뉴 반응 양호", "매출 15% 증가 가정"],
    insight: "신메뉴 매출이 늘어나는 경우를 가정한 자금 흐름입니다.",
  },
  {
    key: "pessimistic",
    name: "비관 시나리오",
    label: "매출 감소 · 원가 상승",
    period: "약 5개월",
    color: "#d83c3c",
    tint: "#fff0ef",
    fundsInTenThousands: [
      2845, 2150, 1600, 1050, 530, -20, -500, -900, -1250, -1600, -1900, -2200,
    ],
    assumptions: ["매출 15% 감소 가정", "원재료비 8% 상승 가정"],
    insight: "매출과 원재료비가 불리하게 변할 때의 위험 구간입니다.",
  },
];
const ticks = [5000, 4000, 3000, 2000, 1000, 0, -1000, -2000, -3000];
const chartX = (index: number) => 58 + (index * 760) / 11;
const chartY = (value: number) => 24 + ((5000 - value) / 8000) * 220;
const formatAxisTick = (value: number) =>
  value === 0 ? "0" : `${value < 0 ? "-" : ""}${Math.abs(value) / 1000}천만`;

function AnalysisChart({ selectedKey }: { selectedKey: ScenarioKey }) {
  return (
    <div className="analysis-chart">
      <svg
        viewBox="0 0 880 290"
        role="img"
        aria-label="기본·낙관·비관 시나리오별 월별 가용자금 예시 그래프"
      >
        {ticks.map((tick) => {
          const y = chartY(tick);
          return (
            <g key={tick}>
              <line
                x1="58"
                x2="830"
                y1={y}
                y2={y}
                className={
                  tick === 0 ? "analysis-zero-line" : "analysis-gridline"
                }
              />
              <text
                x="44"
                y={y + 4}
                textAnchor="end"
                className="analysis-axis-label"
              >
                {formatAxisTick(tick)}
              </text>
            </g>
          );
        })}
        {months.map((month, index) => (
          <text
            key={month}
            x={chartX(index)}
            y="276"
            textAnchor="middle"
            className="analysis-month-label"
          >
            {month}
          </text>
        ))}
        {scenarios.map((item) => {
          const points = item.fundsInTenThousands.map(
            (value, index) => [chartX(index), chartY(value)] as const,
          );
          const line = points
            .map(([x, y], index) => `${index ? "L" : "M"} ${x} ${y}`)
            .join(" ");
          const isSelected = item.key === selectedKey;
          const zero = chartY(0);
          const area = `${line} L ${points[11][0]} ${zero} L ${points[0][0]} ${zero} Z`;

          return (
            <g key={item.key}>
              {isSelected && <path d={area} fill={item.color} opacity="0.07" />}
              <path
                d={line}
                fill="none"
                stroke={item.color}
                className={`analysis-line ${isSelected ? "selected" : "muted"}`}
              />
              <circle
                cx={points[11][0]}
                cy={points[11][1]}
                r={isSelected ? 5 : 4}
                fill={item.color}
                opacity={isSelected ? 1 : 0.28}
                stroke="#fff"
                strokeWidth="3"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function loadSavedAssumptions(): ScenarioAssumptions {
  const defaults = Object.fromEntries(
    scenarios.map(({ key, assumptions }) => [key, assumptions]),
  ) as ScenarioAssumptions;

  try {
    const saved = localStorage.getItem(assumptionStorageKey);
    if (!saved) return defaults;

    const parsed = JSON.parse(saved) as Partial<ScenarioAssumptions>;
    return {
      basic: Array.isArray(parsed.basic)
        ? parsed.basic.filter((item): item is string => typeof item === "string")
        : defaults.basic,
      optimistic: Array.isArray(parsed.optimistic)
        ? parsed.optimistic.filter((item): item is string => typeof item === "string")
        : defaults.optimistic,
      pessimistic: Array.isArray(parsed.pessimistic)
        ? parsed.pessimistic.filter((item): item is string => typeof item === "string")
        : defaults.pessimistic,
    };
  } catch {
    return defaults;
  }
}

export default function SimulationAnalysisWebPage() {
  const [selectedKey, setSelectedKey] = useState<ScenarioKey>("basic");
  const [assumptions, setAssumptions] = useState<ScenarioAssumptions>(
    loadSavedAssumptions,
  );
  const [newAssumption, setNewAssumption] = useState("");
  const scenario =
    scenarios.find(({ key }) => key === selectedKey) ?? scenarios[0];

  useEffect(() => {
    document.title = "BUTILL | 시뮬레이션 상세 분석";
  }, []);

  useEffect(() => {
    localStorage.setItem(assumptionStorageKey, JSON.stringify(assumptions));
  }, [assumptions]);

  const updateAssumption = (index: number, value: string) => {
    setAssumptions((current) => ({
      ...current,
      [selectedKey]: current[selectedKey].map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }));
  };

  const removeAssumption = (index: number) => {
    setAssumptions((current) => ({
      ...current,
      [selectedKey]: current[selectedKey].filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const addAssumption = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = newAssumption.trim();
    if (!value) return;

    setAssumptions((current) => ({
      ...current,
      [selectedKey]: [...current[selectedKey], value],
    }));
    setNewAssumption("");
  };

  const applyExampleAssumptions = () => {
    setAssumptions((current) => ({
      ...current,
      [selectedKey]: [...scenario.assumptions],
    }));
  };

  return (
    <main className="analysis-web">
      <header className="analysis-header">
        <a className="analysis-logo" href="/" aria-label="BUTILL 웹 홈">
          <img src="/figma/brand-source.png" alt="BUTILL" />
        </a>
        <nav aria-label="웹 메뉴">
          <a className="active" href="/">
            자금 시뮬레이션
          </a>
          <a href="/raw-materials">원재료비 분석</a>
          <a href="/tax">세금 관리</a>
        </nav>
      </header>

      <div className="analysis-container">
        <section className="analysis-hero">
          <div>
            <span className="analysis-kicker">BUTILL 자금 진단</span>
            <h1>가게 상황별 자금 흐름을 자세히 살펴보세요</h1>
            <p>
              매출과 원재료비 변화에 따라 앞으로 사용할 수 있는 자금이 어떻게
              달라지는지 비교합니다.
            </p>
          </div>
          <span className="analysis-sample-tag">
            <i /> 화면 예시 데이터
          </span>
        </section>

        <section
          className="analysis-metrics"
          aria-label="시나리오별 예상 버틸 기간"
        >
          {[scenarios[0], scenarios[2], scenarios[1]].map((item) => (
            <article className={`scenario-metric ${item.key}`} key={item.key}>
              <span>{item.name}</span>
              <strong>{item.period}</strong>
              <small>{item.label}</small>
            </article>
          ))}
        </section>

        <section className="analysis-workspace">
          <article className="analysis-panel analysis-chart-panel">
            <div className="analysis-panel-heading">
              <div>
                <span className="analysis-kicker">SCENARIO COMPARISON</span>
                <h2>시나리오별 가용자금 흐름</h2>
                <p>예시 입력값을 기준으로 계산한 월별 가용자금입니다.</p>
              </div>
              <span className="analysis-period">12개월 전망</span>
            </div>
            <div
              className="analysis-tabs"
              role="tablist"
              aria-label="시나리오 선택"
            >
              {scenarios.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={selectedKey === item.key}
                  className={selectedKey === item.key ? "selected" : ""}
                  onClick={() => setSelectedKey(item.key)}
                >
                  <i style={{ background: item.color }} />
                  <span>
                    <b>{item.name}</b>
                    <small>{item.label}</small>
                  </span>
                </button>
              ))}
            </div>
            <div className="analysis-chart-heading">
              <strong>{scenario.name}</strong>
              <span>
                {scenario.key === "pessimistic"
                  ? "자금 부족 주의"
                  : scenario.key === "optimistic"
                    ? "가용자금 증가 가능"
                    : "가용자금 감소 추세"}
              </span>
            </div>
            <AnalysisChart selectedKey={selectedKey} />
            <div className="analysis-chart-footnote">
              <span>가용자금 (만원)</span>
              <span>※ 실제 분석은 입력값 연동 후 제공됩니다.</span>
            </div>
          </article>

          <aside className="analysis-panel analysis-summary-panel">
            <span className="analysis-kicker">SELECTED SCENARIO</span>
            <h2>{scenario.name}</h2>
            <p>{scenario.insight}</p>
            <div
              className="analysis-runway-box"
              style={{ background: scenario.tint, color: scenario.color }}
            >
              <span>예상 버틸 기간</span>
              <strong>{scenario.period}</strong>
              <small>
                {scenario.key === "pessimistic"
                  ? "약 5개월 뒤 자금 고갈 위험"
                  : scenario.key === "optimistic"
                    ? "자금 고갈 염려 없음"
                    : "올해 11월 말 소진 예상"}
              </small>
            </div>
            <div className="analysis-assumptions">
              <h3>시나리오 가정</h3>
              <p className="analysis-assumptions-help">
                이 시나리오에서 예상하는 상황을 직접 입력해 보세요.
              </p>
              <div className="analysis-assumptions-list">
                {assumptions[selectedKey].map((item, index) => (
                  <div
                    className="analysis-assumption-row"
                    key={`${selectedKey}-${index}`}
                  >
                    <input
                      aria-label={`시나리오 가정 ${index + 1}`}
                      value={item}
                      onChange={(event) =>
                        updateAssumption(index, event.target.value)
                      }
                      placeholder="예: 매출 10% 증가"
                    />
                    <button
                      type="button"
                      aria-label={`시나리오 가정 ${index + 1} 삭제`}
                      onClick={() => removeAssumption(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <form className="analysis-assumption-add" onSubmit={addAssumption}>
                <input
                  aria-label="새 시나리오 가정"
                  value={newAssumption}
                  onChange={(event) => setNewAssumption(event.target.value)}
                  placeholder="새 가정을 입력하세요"
                />
                <button type="submit">추가</button>
              </form>
              <button
                className="analysis-assumption-examples"
                type="button"
                onClick={applyExampleAssumptions}
              >
                예시 시나리오 적용
              </button>
            </div>
            <div className={`analysis-status ${scenario.key}`}>
              <i />
              <span>
                <b>
                  {scenario.key === "pessimistic"
                    ? "주의가 필요해요"
                    : scenario.key === "optimistic"
                      ? "흐름이 양호해요"
                      : "현재 추세를 확인하세요"}
                </b>
                <small>{scenario.insight}</small>
              </span>
            </div>
          </aside>
        </section>

        <section className="analysis-advice-heading">
          <div className="analysis-advice-icon">!</div>
          <div>
            <span className="analysis-kicker">BUTILL ACTION GUIDE</span>
            <h2>사장님을 위한 대응 제안</h2>
            <p>현재 상황에 맞는 항목부터 확인해 보세요.</p>
          </div>
        </section>
        <section className="analysis-advice-grid">
          <article>
            <span>01</span>
            <div>
              <h3>메뉴별 원가 확인</h3>
              <p>가격이 오른 재료와 메뉴별 원가를 함께 확인해 보세요.</p>
            </div>
            <b>원재료비</b>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>매출 흐름 점검</h3>
              <p>최근 매출 변화와 시간대별 운영 현황을 비교해 보세요.</p>
            </div>
            <b>매출</b>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>다가오는 지출 준비</h3>
              <p>세금과 고정 지출 일정을 확인하고 필요한 자금을 준비하세요.</p>
            </div>
            <b>지출</b>
          </article>
        </section>
        <footer className="analysis-footer">
          <span>BUTILL</span>
          <span>입력된 예시 데이터로 구성한 화면입니다.</span>
        </footer>
      </div>
    </main>
  );
}
