import { useState } from "react";
import { useAccount } from "../lib/Account";
import { won } from "../lib/api";
import { CashCard } from "./StoredHome";
export default function CashAnalysis({ onManage }: { onManage: () => void }) {
  const { analysis, finance, reload, store } = useAccount();
  const [expanded, setExpanded] = useState(false);
  if (!analysis)
    return (
      <section className="flow-state">
        <div className="state-ring">!</div>
        <h2>현금 흐름 분석을 불러오지 못했어요</h2>
        <p>입력한 정보를 확인한 뒤 다시 시도해주세요.</p>
        <button className="flow-primary" onClick={() => void reload(store?.id)}>
          현금 흐름 다시 계산하기
        </button>
        <button className="more-bills" onClick={onManage}>
          입력 정보 확인하기
        </button>
      </section>
    );
  const rows = analysis.monthly;
  const max = Math.max(
    1,
    ...rows.flatMap((m) => [
      m.sales,
      m.sales - m.net_cashflow,
      Math.abs(m.cash_balance),
    ]),
  );
  const min = Math.min(0, ...rows.map((m) => m.cash_balance));
  const top = max * 1.1;
  const y = (n: number) => 20 + ((top - n) / (top - min)) * 170;
  const x = (i: number) => 30 + (i * 280) / Math.max(rows.length, 1);
  const width = Math.min(10, 100 / Math.max(rows.length, 1));
  const first = rows[0];
  const risk =
    rows.find((m) => m.available_balance < 0) ?? rows[rows.length - 1];
  return (
    <section className="home-page dashboard cash-analysis">
      <CashCard />
      {first && (
        <div className="cash-metrics">
          <article>
            <small>첫 달 예상 매출</small>
            <b>{won(first.sales)}</b>
          </article>
          <article>
            <small>첫 달 순현금흐름</small>
            <b>{won(first.net_cashflow)}</b>
          </article>
        </div>
      )}
      <section className="analysis-panel">
        <h2>↗ {finance?.input.months}개월 현금흐름 그래프</h2>
        <div className="chart-legend">
          <span>■ 수입</span>
          <span>■ 지출</span>
          <span>━ 월말 잔액</span>
        </div>
        <svg
          viewBox="0 0 330 220"
          role="img"
          aria-label="월별 수입, 지출과 월말 잔액 그래프"
        >
          {[0, max / 2, max].map((n) => (
            <g key={n}>
              <line x1="24" x2="320" y1={y(n)} y2={y(n)} stroke="#e8eaf3" />
              <text x="2" y={y(n) - 4} fontSize="7" fill="#7b8193">
                {Math.round(n / 10000)}만
              </text>
            </g>
          ))}
          <line
            x1="24"
            x2="320"
            y1={y(0)}
            y2={y(0)}
            stroke="#ff8e91"
            strokeDasharray="3 3"
          />
          {rows.map((m, i) => (
            <g key={m.month}>
              <rect
                x={x(i)}
                y={y(m.sales)}
                width={width}
                height={Math.max(0, y(0) - y(m.sales))}
                fill="#3079ec"
              />
              <rect
                x={x(i) + width + 1}
                y={y(m.sales - m.net_cashflow)}
                width={width}
                height={Math.max(0, y(0) - y(m.sales - m.net_cashflow))}
                fill="#ff6c72"
              />
              <text
                x={x(i) + width}
                y="210"
                textAnchor="middle"
                fontSize="7"
                fill="#646c80"
              >
                {Number(m.month.slice(5, 7))}월
              </text>
            </g>
          ))}
          <polyline
            points={rows
              .map((m, i) => `${x(i) + width},${y(m.cash_balance)}`)
              .join(" ")}
            fill="none"
            stroke="#0b2a6d"
            strokeWidth="2"
          />
        </svg>
        <small className="muted">금액: 만 원 · 입력값에 따른 월말 예상치</small>
        {risk && (
          <article className="risk-box">
            <h3>
              {Number(risk.month.slice(5, 7))}월{" "}
              {risk.available_balance < 0
                ? "가용자금 부족 예상"
                : "분석기간 마지막 달"}
            </h3>
            <div className="risk-numbers">
              <span>
                들어오는 돈<b>{won(risk.sales)}</b>
              </span>
              <span>
                나가는 돈<b>{won(risk.sales - risk.net_cashflow)}</b>
              </span>
              <span>
                월말 잔액<b>{won(risk.cash_balance)}</b>
              </span>
            </div>
            {analysis.risks.map((r, i) => (
              <p key={i}>{r.message}</p>
            ))}
          </article>
        )}
      </section>
      <section className="analysis-panel">
        <h2>↗ 월별 현금 흐름 리스트</h2>
        {rows.slice(0, expanded ? rows.length : 3).map((m) => (
          <article className="cash-month" key={m.month}>
            <span>{Number(m.month.slice(5, 7))}월</span>
            <div>
              <b>수입 {won(m.sales)}</b>
              <b>지출 {won(m.sales - m.net_cashflow)}</b>
              <small className={m.net_cashflow < 0 ? "negative" : ""}>
                {won(m.net_cashflow)}
              </small>
            </div>
            <div>
              <small>월말 잔고</small>
              <b>{won(m.cash_balance)}</b>
            </div>
          </article>
        ))}
        {rows.length > 3 && (
          <button className="more-bills" onClick={() => setExpanded(!expanded)}>
            {expanded ? "접기" : `전체 내역 더보기 (${rows.length}개월)`}
          </button>
        )}
      </section>
    </section>
  );
}
