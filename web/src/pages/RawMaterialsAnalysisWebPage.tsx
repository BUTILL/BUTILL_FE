import { useEffect, useState } from "react";
import "./RawMaterialsAnalysisWebPage.css";

type RawItem = {
  name: string;
  package: string;
  previous: number;
  current: number;
  change: string;
  delta: string;
  type: "up" | "down" | "steady";
  source: string;
  dailyPrices: number[];
  dailyDates: string[];
  changeValue: number;
};

// GET /api/v1/ingredient-prices 응답 중 이 화면에서 쓰는 값
type PriceSummary = {
  key: string;
  name: string;
  status: "success" | "no_data" | "failed";
  rank_name: string | null;
  unit: string | null;
  latest: { price_date: string; average_price: number } | null;
  week_change: { base_price: number; change_amount: number; change_bps: number } | null;
  daily: { price_date: string; average_price: number }[];
};
type PriceResponse = { collected_at: string | null; status: string; items: PriceSummary[] };

// 앱 원재료 화면과 같은 주요 5개 품목
const TRACKED_ITEMS = ["pork_belly", "onion", "rice", "egg", "garlic"];
const apiBase = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "").trim().replace(/\/+$/, "");

function toRawItem(item: PriceSummary): RawItem | null {
  if (!item.latest) return null;
  const bps = item.week_change?.change_bps ?? 0;
  const diff = item.week_change?.change_amount ?? 0;
  const daily = item.daily.slice(-28);
  return {
    name: item.name,
    package: [item.rank_name, item.unit].filter(Boolean).join(" · "),
    previous: item.week_change?.base_price ?? item.latest.average_price,
    current: item.latest.average_price,
    change: `${bps > 0 ? "+" : ""}${(bps / 100).toFixed(1)}%`,
    delta: diff === 0 ? "변동 없음" : `${diff > 0 ? "+" : ""}${diff.toLocaleString("ko-KR")}원`,
    type: bps > 0 ? "up" : bps < 0 ? "down" : "steady",
    source: `KAMIS 서울 소매가 · ${item.latest.price_date} 조사`,
    dailyPrices: daily.map((d) => d.average_price),
    dailyDates: daily.map((d) => d.price_date),
    changeValue: bps,
  };
}

const formatPrice = (price: number) => "₩" + price.toLocaleString("ko-KR");
const weekLabels = ["4주 전", "3주 전", "2주 전", "1주 전", "이번 주"];
function PriceTrend({ item }: { item: RawItem }) {
  const last = Math.max(1, item.dailyPrices.length - 1);
  const chartX = (index: number) => 24 + (index * 232) / last;
  const weekTickIndexes = [0, 1, 2, 3, 4].map((i) => Math.round((i * last) / 4));
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
        aria-label={item.name + " 최근 4주 일별 단가 추이"}
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
              {item.dailyDates[index]} ·{" "}
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
  const [items, setItems] = useState<RawItem[] | null>(null);
  const [collectedAt, setCollectedAt] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const risingCount = (items ?? []).filter((item) => item.type === "up").length;
  const topRise = [...(items ?? [])].filter((item) => item.type === "up").sort((a, b) => b.changeValue - a.changeValue)[0];

  useEffect(() => {
    document.title = "BUTILL | 원재료비 상세 분석";
    fetch(`${apiBase}/api/v1/ingredient-prices?group=common`, { signal: AbortSignal.timeout(20000) })
      .then((res) => (res.ok ? (res.json() as Promise<PriceResponse>) : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        const list = TRACKED_ITEMS.map((key) => data.items.find((item) => item.key === key))
          .map((item) => (item ? toRawItem(item) : null))
          .filter((item): item is RawItem => item !== null);
        setItems(list);
        setCollectedAt(data.collected_at);
        if (!list.length) setFailed(true);
      })
      .catch(() => setFailed(true));
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
            <i /> {collectedAt ? `시세 수집 ${collectedAt.slice(0, 10)}` : failed ? "시세를 불러오지 못했어요" : "시세 불러오는 중"}
          </span>
        </section>

        <section className="raw-web-metrics">
          <article>
            <span>추적 중인 원재료</span>
            <strong>{items?.length ?? 0}개 품목</strong>
            <small>KAMIS 서울 소매가 기준</small>
          </article>
          <article>
            <span>이번 주 가격 상승</span>
            <strong>{risingCount}개 품목</strong>
            <small>관심 품목 중 상승 항목</small>
          </article>
          <article>
            <span>가장 큰 단가 상승</span>
            <strong className="raw-web-highlight">{topRise ? `${topRise.name} ${topRise.change}` : "상승 품목 없음"}</strong>
            <small>지난 주 대비</small>
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
          {(items ?? []).map((item) => (
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
                <b>앱 원재료 화면에서 월 사용금액을 입력하면 계산돼요</b>
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
              {topRise
                ? `${topRise.name} 단가가 지난 주보다 ${topRise.change} 올랐어요. 다음 발주를 나누어 진행하거나 대체 재료의 가격을 함께 비교해 보세요.`
                : "이번 주에는 크게 오른 품목이 없어요. 평소 발주 계획을 유지해도 좋아요."}
            </p>
          </div>
        </section>

        <footer className="analysis-footer">
          <span>BUTILL</span>
          <span>시세는 참고 정보이며 매장 식재료비에 자동 반영하지 않습니다.</span>
        </footer>
      </div>
    </main>
  );
}
