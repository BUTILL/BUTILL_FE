import { useEffect, useMemo } from "react";
import type { CSSProperties } from "react";
import {buildCashFlowRows,createChartGeometry,formatMoney,formatMonth,formatSignedMoney,} from "../data/homeData";
import type { CashFlowRow, DashboardData } from "../data/homeData";
import "../css/Home.css";

// API 응답 또는 상위 화면의 데이터를 전달하면 그래프와 카드가 함께 갱신
type HomeProps = {
  data?: DashboardData | null;
  logoSrc?: string;
  dashboardHref?: string;
  simulationHref?: string;
  rawMaterialsHref?: string;
};

// 대시보드 전체 화면: data는 백엔드 응답 또는 상위 컴포넌트에서 전달
export default function Home({
  data,
  logoSrc = "/figma/brand-source.png",
  dashboardHref = "/",
  simulationHref = "/simulation",
  rawMaterialsHref = "/raw-materials",
}: HomeProps) {
  const rows = useMemo(() => buildCashFlowRows(data), [data]);
  const listRows = rows?.slice(0, 6) ?? [];
  const availableRows = listRows.filter((row) => row.net !== null);
  const averageNet = availableRows.length
    ? availableRows.reduce((sum, row) => sum + (row.net ?? 0), 0) / availableRows.length
    : null;
  const riskRow = rows?.find((row) => row.balance !== null && row.balance <= 0);
  const taxRow = rows?.find((row) => row.taxPayment > 0);
  const complete = rows?.every((row) => row.balance !== null) ?? false;

  // 브라우저 탭 제목
  useEffect(() => {
    document.title = "BUTILL | 현금흐름 정밀 진단";
  }, []);


  return (
    <main className="dashboard-web">
      {/* 상단바: 대시보드 통합, 시뮬레이션, 원재료비 분석 */}
      <header className="dashboard-header">
        <a className="dashboard-logo" href={dashboardHref} aria-label="BUTILL 웹 홈">
          <img src={logoSrc} alt="BUTILL" />
        </a>
        <nav aria-label="웹 메뉴">
          <a className="active" href={dashboardHref} aria-current="page">홈</a>
          <a href={simulationHref}>시뮬레이션</a>
          <a href={rawMaterialsHref}>원재료비 분석</a>
        </nav>
      </header>


      <div className="dashboard-container">
        {/* 본문 제목과 안내 문구 */}
        <section className="dashboard-hero">
          <div>
            <h1>현금흐름 정밀 진단</h1>
            <p>수입과 지출, 앞으로의 잔고 흐름을 한눈에 확인하세요.</p>
          </div>
        </section>


        {!rows ? ( 
          <section className="dashboard-panel dashboard-empty" role="status">
            {/* 데이터 없으면 나타나는 메시지 */}
            <h2>현금흐름 데이터를 확인해 주세요</h2>
            <p>앱 사용 시작 월, 시작 잔액과 월별 수입·지출 데이터가 필요합니다.</p>
          </section>
        ) : (
          <section className="dashboard-workspace" aria-label="현금흐름 분석">
            <div className="dashboard-main">
              {/* 12개월 현금 흐름 그래프*/}
              <article className="dashboard-panel dashboard-chart-panel">
                <div className="dashboard-panel-heading">
                  <div>
                    <h2>12개월 현금흐름 그래프</h2>
                    <p>월별 수입·지출과 통장 잔액의 변화를 비교합니다.</p>
                  </div>
                </div>

                <div className="dashboard-legend" aria-label="그래프 범례">
                  <span>
                    <i className="income-key" aria-hidden="true" />
                    수입(들어온 돈)
                  </span>

                  <span>
                    <i className="expense-key" aria-hidden="true" />
                    지출(나간 돈)
                  </span>

                  <span>
                    <i className="balance-key" aria-hidden="true" />
                    순현금
                  </span>
                </div>
                <CashFlowChart rows={rows} />
              </article>


              {/* 부가세 납부월: 데이터에 부가세 금액이 있는 첫 달을 표시*/}
              <article className="dashboard-panel dashboard-tax">
                {taxRow ? (
                  <>
                    <div className="dashboard-card-heading">
                      <div>
                        <h2>{formatMonth(taxRow.month)} (부가세 납부월)</h2>
                      </div>

                      <strong className={`dashboard-deficit ${taxRow.net !== null && taxRow.net >= 0 ? "positive" : "negative"}`}>
                        {formatMoney(Math.abs(taxRow.net ?? 0))} {taxRow.net === 0 ? "수지 균형" : taxRow.net !== null && taxRow.net < 0 ? "적자" : "흑자"}
                      </strong>
                    </div>

                    <div className="dashboard-tax-metrics">
                      <div>
                        <span>들어온 돈</span>
                        <strong>{formatMoney(taxRow.income)}</strong>
                      </div>
                      <div>
                        <span>나간 돈(지출)</span>
                        <strong className="negative">{formatMoney(taxRow.expense)}</strong>
                      </div>
                      <div>
                        <span>월말 잔액</span>
                        <strong>{formatMoney(taxRow.balance)}</strong>
                      </div>
                    </div>

                    <p className="dashboard-tax-note">
                      <span aria-hidden="true">!</span>
                      이번 달 지출에는 부가세 {formatMoney(taxRow.taxPayment)}이 포함되어 있습니다.
                    </p>
                  </>
                ) : (
                  <>
                    <h2>부가세 납부월</h2>
                    <p className="dashboard-tax-note">표시 기간에 등록된 부가세 납부 내역이 없습니다.</p>
                  </>
                )}
              </article>


              {/* 잔고 소진 월과 진단 내용도 공통 계산 결과를 사용합니다. */}
              <article className="dashboard-panel dashboard-diagnosis">
                <div className="dashboard-card-heading">
                  <div>
                    <h2>캐시런웨이</h2>
                  </div>

                  <span className={`dashboard-risk-badge ${riskRow ? "negative" : complete ? "positive" : ""}`}>
                    {riskRow ? "주의 등급" : complete ? "기간 내 잔고 유지" : "데이터 확인 필요"}
                  </span>
                </div>

                <div className="dashboard-diagnosis-body">
                  <div className="dashboard-runway">
                    <span>현금 소진 예상 시점</span>

                    <strong className={riskRow ? "negative" : complete ? "positive" : ""}>
                      {riskRow ? formatMonth(riskRow.month) : complete ? "기간 내 소진 없음" : "확인 불가"}
                    </strong>

                    <p>
                      {riskRow ? (
                        <>
                          {formatMonth(riskRow.month)}의 순현금이 0원 이하입니다.
                          <br />
                          예측 월의 결과는 전달받은 예상 수입·지출을<br/>기준으로 합니다.
                        </>
                      ) : (
                       complete
                          ? "전달받은 12개월 수입·지출 기준으로 월말 잔고가 0원보다 높게 유지됩니다."
                          : "누락된 월의 수입·지출을 입력하면 이후의 잔고와 소진 여부를 확인할 수 있습니다." )}
                    </p>
                  </div>

                  <div className="dashboard-solutions">
                    <h3>확인할 항목</h3>
                    <ul>
                      <li>월별 수입과 지출의 차이를 확인하세요.</li>
                      <li>고정비와 원재료비의 변화부터 점검하세요.</li>
                      <li>예정된 부가세 납부와 큰 지출을 준비하세요.</li>
                    </ul>
                  </div>
                </div>
              </article>
            </div>


            {/* 6개월 현금 흐름 리스트: 데이터가 없으면 미입력으로 표시 */}
            <aside className="dashboard-panel dashboard-history" aria-label="사용 시작 월부터 6개월 현금 흐름">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>6개월 현금 흐름 리스트</h2>
                  <p>{formatMonth(rows[0].month)}부터 월별 수입·지출과 잔고입니다.</p>
                </div>
              </div>

              <ol className="dashboard-months">
                {listRows.map((row) => (
                  <li key={row.month} data-list-month={row.month}>
                    <div className="dashboard-month-heading">
                      <strong>{formatMonth(row.month)}</strong>
                      <span className={row.net === null ? "" : row.net < 0 ? "negative" : "positive"}>
                        {row.net === null ? "미입력" : formatSignedMoney(row.net)}
                      </span>
                    </div>

                    <dl>
                      <div>
                        <dt>수입{row.isForecast ? " (예측)" : ""}</dt>
                        <dd>{row.income === null ? "미입력" : formatMoney(row.income)}</dd>
                      </div>
                      <div>
                        <dt>지출{row.isForecast ? " (예측)" : ""}</dt>
                        <dd>{row.expense === null ? "미입력" : formatMoney(row.expense)}</dd>
                      </div>
                      <div className="dashboard-closing">
                        <dt>순현금</dt>
                        <dd>{formatMoney(row.balance)}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ol>

              <div className="dashboard-history-summary">
                <span>{availableRows.length ? `${availableRows.length}개월 평균 순증감 (표시된 예측 포함)` : "계산할 월별 데이터가 없습니다"}</span>
                <strong className={averageNet === null ? "" : averageNet < 0 ? "negative" : "positive"}>
                  {averageNet === null ? "확인 불가" : `${formatSignedMoney(averageNet)} / 월`}
                </strong>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}


// 12개월 그래프: 막대, 잔고선, 눈금과 위험 구간을 계산
function CashFlowChart({ rows }: { rows: CashFlowRow[] }) {
  const { x, y, ticks, zeroY } = createChartGeometry(rows);
  const riskIndex = rows.findIndex((row) => row.balance !== null && row.balance <= 0);
  const riskRow = rows[riskIndex];

  // 현재 연도·월과 일치하는 월 이름을 파란색
  const currentDateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const currentMonth = [
    currentDateParts.find((part) => part.type === "year")?.value,
    currentDateParts.find((part) => part.type === "month")?.value,
  ].join("-");

  // 현금 소진 예상 문구 위치 정렬
  const warningStyle: CSSProperties | undefined = riskRow ? {
    left: `${(x(riskIndex) - 13.5) / 880 * 100}%`,
    top: `calc(${y(Math.max(riskRow.income ?? 0, riskRow.expense ?? 0)) / 880 * 100}cqw - 10px)`,
  } : undefined;

  return (
    <div
      className="dashboard-chart-scroll"
      tabIndex={0}
      role="region"
      aria-label="월별 현금흐름 그래프. 좁은 화면에서는 좌우로 스크롤할 수 있습니다."
    >
      <div className="dashboard-chart-canvas">
        {riskRow && (
          <div className="dashboard-chart-warning" style={warningStyle} data-risk-month={riskRow.month}>
            <span aria-hidden="true">⚠</span>
            현금 소진 예상 시점
          </div>
        )}

        <svg
          className="dashboard-chart-svg"
          viewBox="0 0 880 329"
          role="img"
          aria-label={`${formatMonth(rows[0].month)}부터 ${formatMonth(rows[11].month)}까지의 수입, 지출과 잔고${riskRow ? `. ${formatMonth(riskRow.month)}부터 잔고 소진 주의` : ""}`}
        >
          {/* 세로축 금액 눈금과 0원 기준선 */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1="58"
                x2="744"
                y1={y(tick)}
                y2={y(tick)}
                stroke={tick === 0 ? "#748097" : "#e8edf6"}
                strokeDasharray={tick === 0 ? undefined : "3,3"}
              />
              <text x="48" y={y(tick) + 4} textAnchor="end" fill="#748097" fontSize="10">
                {formatMoney(tick)}
              </text>
            </g>
          ))}

          {/* 월별 막대와 달력: 미입력 월은 막대 없이 표시합니다. */}
          {rows.map((row, index) => (
            <g key={row.month} data-chart-month={row.month}>
              {row.taxPayment > 0 && (
                <rect x={x(index) - 20} y="52" width="40" height="224" rx="6" fill="#f0f3fb" />
              )}
              {row.income !== null && row.expense !== null && (
                <>
                  <rect
                    data-series="income"
                    x={x(index) - 13.5}
                    y={y(row.income)}
                    width="12"
                    height={Math.max(0, zeroY - y(row.income))}
                    rx="3"
                    fill="#1769d2"
                    fillOpacity={row.isForecast ? 0.55 : 1}
                  >
                    <title>
                      {formatMonth(row.month)} 수입 {formatMoney(row.income)}
                    </title>
                  </rect>

                  <rect
                    data-series="expense"
                    x={x(index) + 1.5}
                    y={y(row.expense)}
                    width="12"
                    height={Math.max(0, zeroY - y(row.expense))}
                    rx="3"
                    fill="#d83c3c"
                    fillOpacity={row.isForecast ? 0.55 : 1}
                  >
                    <title>
                      {formatMonth(row.month)} 지출 {formatMoney(row.expense)}
                    </title>
                  </rect>
                </>
              )}
              <text
                x={x(index)}
                y="297"
                textAnchor="middle"
                fill={row.month === currentMonth ? "#1769d2" : index === riskIndex ? "#c53b3b" : "#748097"}
                fontSize="11"
                fontWeight={row.month === currentMonth ? 700 : 400}
              >
                {row.label}
              </text>
              {row.month === currentMonth && (
                <text
                  x={x(index)}
                  y="313"
                  textAnchor="middle"
                  fill="#1769d2"
                  fontSize="10"
                >
                  현재
                </text>
              )}
            </g>
          ))}

          {/* 잔고선: 누락 월은 연결하지 않고 0원 통과 지점에서 색상 변경 */}
          {rows.slice(1).map((row, offset) => {
            const previous = rows[offset];
            const index = offset + 1;

            if (previous.balance === null || row.balance === null) return null;

            const crossesZero = (previous.balance > 0 && row.balance < 0) ||
              (previous.balance < 0 && row.balance > 0);
            const crossingX = x(offset) + (x(index) - x(offset)) *
              Math.abs(previous.balance) / (Math.abs(previous.balance) + Math.abs(row.balance));
            const segments = crossesZero ? [
              { x1: x(offset), y1: y(previous.balance), x2: crossingX, y2: zeroY, risk: previous.balance < 0 },
              { x1: crossingX, y1: zeroY, x2: x(index), y2: y(row.balance), risk: row.balance < 0 },
            ] : [
              { x1: x(offset), y1: y(previous.balance), x2: x(index), y2: y(row.balance), risk: previous.balance < 0 || row.balance < 0 },
            ];


            return segments.map((segment, part) => (
              <line
                key={`${row.month}-${part}`}
                x1={segment.x1}
                y1={segment.y1}
                x2={segment.x2}
                y2={segment.y2}
                stroke={segment.risk ? "#c53b3b" : "#203f8c"}
                strokeWidth="3"
                strokeDasharray={segment.risk ? "4,4" : undefined}
                strokeLinecap="round"
              />
            ));
          })}


          {/* 월별 잔고 위치: 데이터가 바뀌면 선과 점의 위치도 변경 */}
          {rows.map((row, index) => row.balance !== null && (
            <circle
              key={row.month}
              data-balance-month={row.month}
              cx={x(index)}
              cy={y(row.balance)}
              r="4.5"
              fill={row.balance <= 0 ? "#c53b3b" : "#203f8c"}
              stroke="#ffffff"
              strokeWidth="2"
            >
              <title>{formatMonth(row.month)} 월말 잔고 {formatMoney(row.balance)}</title>
            </circle>
          ))}
        </svg>
      </div>
    </div>
  );
}

