import { useEffect } from "react";
import "./RawMaterialsAnalysisWebPage.css";

type RawItem = {
  name: string;
  package: string;
  previous: number;
  current: number;
  change: string;
  delta: string;
  monthlyImpact: string;
  type: "up" | "down" | "steady";
  source: string;
  dailyPrices: number[];
};

const items: RawItem[] = [
  {
    name: "돼지고기 삼겹살",
    package: "국산 · 1kg",
    previous: 21900,
    current: 23700,
    change: "+8.2%",
    delta: "+1,800원",
    monthlyImpact: "월 약 +126,000원",
    type: "up",
    source: "축산물품질평가원 경락단가 연동 예시",
    dailyPrices: [
      20300, 20400, 20250, 20500, 20700, 20600, 20850, 21000, 20900, 21200,
      21100, 21400, 21500, 21350, 21600, 21800, 21700, 22000, 21800, 22100,
      22300, 22200, 22400, 22800, 22700, 23100, 23400, 23700,
    ],
  },
  {
    name: "양파",
    package: "특품 · 15kg망",
    previous: 19200,
    current: 18000,
    change: "-6.3%",
    delta: "-1,200원",
    monthlyImpact: "월 약 -24,000원",
    type: "down",
    source: "가락시장 도매 경매 평균가 예시",
    dailyPrices: [
      19000, 19100, 18900, 19200, 19300, 19150, 19000, 19200, 19400, 19300,
      19100, 19200, 19050, 19300, 19200, 19100, 18900, 19000, 19100, 18950,
      18800, 18900, 18600, 18400, 18500, 18300, 18100, 18000,
    ],
  },
  {
    name: "쌀 신동진",
    package: "상등급 · 20kg",
    previous: 54500,
    current: 54500,
    change: "0.0%",
    delta: "변동 없음",
    monthlyImpact: "월 지출 변동 없음",
    type: "steady",
    source: "농수산물유통공사 가격 정보 예시",
    dailyPrices: [
      54500, 54400, 54600, 54500, 54300, 54400, 54500, 54600, 54500, 54400,
      54300, 54500, 54600, 54400, 54500, 54300, 54400, 54500, 54600, 54500,
      54400, 54300, 54500, 54600, 54400, 54500, 54600, 54500,
    ],
  },
  {
    name: "계란 특란",
    package: "1판 · 30구",
    previous: 6600,
    current: 6900,
    change: "+4.5%",
    delta: "+300원",
    monthlyImpact: "월 약 +18,000원",
    type: "up",
    source: "양계협회 고시가 기준 예시",
    dailyPrices: [
      6400, 6420, 6380, 6450, 6480, 6440, 6500, 6510, 6490, 6550, 6530, 6580,
      6600, 6570, 6620, 6650, 6610, 6680, 6640, 6700, 6720, 6680, 6750, 6780,
      6740, 6820, 6860, 6900,
    ],
  },
  {
    name: "식용유 대두유",
    package: "업소용 · 18L 캔",
    previous: 48500,
    current: 50000,
    change: "+3.1%",
    delta: "+1,500원",
    monthlyImpact: "월 약 +15,000원",
    type: "up",
    source: "식자재 유통 도매가 예시",
    dailyPrices: [
      48500, 48700, 48600, 48900, 49100, 48800, 49000, 49300, 49100, 48900,
      48700, 49000, 49200, 48500, 48800, 49100, 49300, 49000, 49200, 49500,
      49300, 49600, 49400, 49700, 49500, 49800, 49900, 50000,
    ],
  },
];

const formatPrice = (price: number) => "₩" + price.toLocaleString("ko-KR");
const weekLabels = ["4주 전", "3주 전", "2주 전", "1주 전", "이번 주"];
const weekTickIndexes = [0, 7, 14, 21, 27];
const chartX = (index: number) => 24 + (index * 232) / 27;

function PriceTrend({ item }: { item: RawItem }) {
  const min = Math.min(...item.dailyPrices) * 0.96;
  const max = Math.max(...item.dailyPrices) * 1.04;
  const points = item.dailyPrices.map((price, index) => ({
    price,
    x: chartX(index),
    y: 85 - ((price - min) / (max - min || 1)) * 62,
  }));
  const line = points
    .map(
      (point, index) => (index === 0 ? "M " : "L ") + point.x + " " + point.y,
    )
    .join(" ");

  return (
    <div className="raw-web-trend">
      <svg
        viewBox="0 0 280 112"
        role="img"
        aria-label={item.name + " 최근 28일 일별 단가 추이"}
      >
        <line x1="24" x2="256" y1="87" y2="87" className="raw-web-axis" />
        <line x1="24" x2="256" y1="55" y2="55" className="raw-web-grid" />
        <line x1="24" x2="256" y1="23" y2="23" className="raw-web-grid" />
        {weekTickIndexes.map((index) => (
          <line
            key={index}
            x1={chartX(index)}
            x2={chartX(index)}
            y1="20"
            y2="88"
            className="raw-web-week-divider"
          />
        ))}
        <path d={line} className={"raw-web-line " + item.type} />
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={index === points.length - 1 ? 3.5 : 1.8}
            className={"raw-web-point " + item.type}
          >
            <title>
              {index === points.length - 1 ? "오늘" : `${27 - index}일 전`} ·{" "}
              {formatPrice(point.price)}
            </title>
          </circle>
        ))}
        {weekTickIndexes.map((index, labelIndex) => (
          <text
            key={weekLabels[labelIndex]}
            x={points[index].x}
            y="106"
            textAnchor="middle"
            className="raw-web-week-label"
          >
            {weekLabels[labelIndex]}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function RawMaterialsAnalysisWebPage() {
  const risingCount = items.filter((item) => item.type === "up").length;

  useEffect(() => {
    document.title = "BUTILL | 원재료비 상세 분석";
  }, []);

  return (
    <main className="analysis-web raw-web">
      <header className="analysis-header">
        <a className="analysis-logo" href="/" aria-label="BUTILL 웹 홈">
          <img src="/figma/brand-source.png" alt="BUTILL" />
        </a>
        <nav aria-label="웹 메뉴">
          <a href="/">자금 시뮬레이션</a>
          <a className="active" href="/raw-materials">
            원재료비 분석
          </a>
          <a href="/tax">세금 관리</a>
        </nav>
      </header>

      <div className="analysis-container">
        <section className="analysis-hero">
          <div>
            <span className="analysis-kicker">BUTILL 원재료 시세</span>
            <h1>주요 원재료 가격 변화를 확인하세요</h1>
            <p>
              최근 4주 단가와 매장 지출 영향을 비교해 다음 발주를 준비할 수
              있어요.
            </p>
          </div>
          <span className="analysis-sample-tag">
            <i /> 화면 예시 데이터
          </span>
        </section>

        <section className="raw-web-metrics">
          <article>
            <span>추적 중인 원재료</span>
            <strong>5개 품목</strong>
            <small>주간 시세 예시</small>
          </article>
          <article>
            <span>이번 주 가격 상승</span>
            <strong>{risingCount}개 품목</strong>
            <small>관심 품목 중 상승 항목</small>
          </article>
          <article>
            <span>가장 큰 단가 상승</span>
            <strong className="raw-web-highlight">삼겹살 +8.2%</strong>
            <small>지난 주 대비 1kg 기준</small>
          </article>
        </section>

        <section className="raw-web-section-heading">
          <div>
            <span className="analysis-kicker">WEEKLY PRICE TRACKER</span>
            <h2>품목별 최근 4주 단가</h2>
          </div>
          <span>이번 주 기준</span>
        </section>

        <section className="raw-web-items">
          {items.map((item) => (
            <article className={"raw-web-card " + item.type} key={item.name}>
              <header className="raw-web-card-header">
                <div>
                  <h3>{item.name}</h3>
                  <span>{item.package}</span>
                </div>
                <strong className={"raw-web-change " + item.type}>
                  {item.type === "up" ? "▲" : item.type === "down" ? "▼" : "—"}{" "}
                  {item.change}
                </strong>
              </header>
              <div className="raw-web-prices">
                <div>
                  <span>지난 주</span>
                  <b>{formatPrice(item.previous)}</b>
                </div>
                <div>
                  <span>이번 주</span>
                  <b>{formatPrice(item.current)}</b>
                </div>
                <div>
                  <span>변동 금액</span>
                  <b className={"raw-web-delta " + item.type}>{item.delta}</b>
                </div>
              </div>
              <div className="raw-web-chart-title">
                <b>일별 단가 · 최근 4주 흐름</b>
              </div>
              <PriceTrend item={item} />
              <div className={"raw-web-impact " + item.type}>
                <span>예상 매장 월 지출 영향</span>
                <b>{item.monthlyImpact}</b>
              </div>
              <small className="raw-web-source">{item.source}</small>
            </article>
          ))}
        </section>

        <section className="raw-web-advice">
          <div className="raw-web-advice-mark">!</div>
          <div>
            <span className="analysis-kicker">BUTILL ACTION GUIDE</span>
            <h2>이번 주 대응 제안</h2>
            <p>
              삼겹살 단가가 지난 주보다 8.2% 올랐어요. 다음 발주를 나누어
              진행하거나 대체 부위의 가격을 함께 비교해 보세요.
            </p>
          </div>
        </section>

        <footer className="analysis-footer">
          <span>BUTILL</span>
          <span>시세와 지출 영향은 화면 예시 값입니다.</span>
        </footer>
      </div>
    </main>
  );
}
