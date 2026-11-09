import { useState } from "react";
import logoName from "../../assets/logoName.png";
import "./CashRunwayPage.css";
import type { CashFlowResult, MonthlyAmount } from "../../lib/cashflow";
import type { SetPage } from "../../types/navigation";

// 금액 표시
const won = (value: number) => `${Math.round(value).toLocaleString("ko-KR")}원`;
const compact = (value: number) =>
  Math.abs(value) >= 10000
    ? `${Number((value / 10000).toFixed(1)).toLocaleString("ko-KR")}만원`
    : won(value);


type CashRunwayPageProps = {
  setPage?: SetPage;
  result: CashFlowResult | null;
  taxPayments?: MonthlyAmount[];
};

function CashRunwayPage({ setPage, result, taxPayments = [] }: CashRunwayPageProps) {
  return (
    <div className="cash-runway">

      {/* 상단 헤더 */}
      <header className="cash-header">
        <button
          type="button"
          className="cash-back"
          aria-label="뒤로 가기"
          onClick={() => setPage?.("HomePage")}
        >
          ←
        </button>
        <img
          src={logoName}
          alt="BUTILL"
        />
        <button type="button" className="cash-bell" aria-label="알림" onClick={() => setPage?.("NotificationsFromCashRunway")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
          <i />
        </button>
      </header>

      <main className="cash-content">
        {!result ? (
          <section className="cash-panel cash-empty">
            <h1>현금 흐름을 계산할 수 없어요</h1>
            <p>시작 잔액과 월 고정비, 월별 입력 데이터를 확인해 주세요.</p>
          </section>

        ) : (
          <CashRunwayResult result={result} taxPayments={taxPayments} />
        )}
      </main>
    </div>
  );
}

// 계산 결과 화면 (결과가 있을 때만 표시)
function CashRunwayResult({ result, taxPayments }: { result: CashFlowResult; taxPayments: MonthlyAmount[] }) {
  // 리스트 펼침 상태
  const [expanded, setExpanded] = useState(false);

  // 선택 월은 마지막 입력 월
  const selected = result.latest;
  // 선택 월의 부가세 납부액 (지출에 포함된 금액)
  const selectedTax = taxPayments.reduce((sum, payment) => {
    const amount = Number(payment.amount);
    return sum + (payment.month === selected.key && Number.isFinite(amount) && amount > 0 ? amount : 0);
  }, 0);
  // 그래프는 12개월, 리스트는 입력 시작 월부터 6개월
  const chart = result.rows;
  const cashList = chart.slice(0, 6);
  const displayedRunway = result.runway;

  return (
    <>

      {/* 잔액과 운영 기간 */}
      <section className="cash-hero">
        <span>▣ 현재 안전하게 사용할 수 있는 돈</span>
        <strong>₩ {Math.round(result.latest.balance).toLocaleString("ko-KR")}</strong>
        <div className="cash-runway-box">
          <small>현재 자금으로,</small>
          <b>
            {displayedRunway === null ? (
              "월 평균 현금이 줄지 않고 있어요"
            ) : (
              <>앞으로 <u>{displayedRunway.toFixed(1)}개월</u> 버틸 수 있어요</>
            )}
          </b>
          <div className="cash-progress">
            <i style={{ width: `${displayedRunway === null ? 100 : Math.min(100, displayedRunway / 12 * 100)}%` }} />
          </div>
          <div className="cash-progress-label">
            <span>위험 (0개월)</span>
            <span>
              {displayedRunway === null
                ? "월 평균 감소 없음"
                : `현재 ${displayedRunway.toFixed(1)}개월`} (안전선: 6개월)
            </span>
            <span>12개월+</span>
          </div>
        </div>
        <div className="cash-stats">
          <div>
            <small>이번달 매출액</small>
            <b>{compact(result.latest.income)}</b>
            <span>이번달에 발생한 <br/>매출액</span>
          </div>
          <div>
            <small>월 평균 순 증감</small>
            <b>{result.averageNet > 0 ? "+" : ""}{compact(result.averageNet)}</b>
            <span>매달 통장에서 <br/>줄고있는 돈</span>
          </div>
        </div>
      </section>

      {/* 12개월 현금흐름 그래프 */}
      <section className="cash-panel">
        {/* 선택 월 상세 */}
        <div className="cash-detail">
          <div className="cash-detail-heading">
            <b>{selected.label} {selectedTax > 0 ? "(부가세 납부월)" : selected.actual ? "(입력)" : "(예측)"}</b>
            <strong className={selected.net < 0 ? "negative" : "positive"}>{selected.net > 0 ? "+" : ""}{compact(selected.net)}</strong>
          </div>
          
          <div className="cash-detail-grid">
            <div>
              <span>들어온 돈</span>
              <b className="positive">{compact(selected.income)}</b>
            </div>
            <div>
              <span>나간 돈(지출)</span>
              <b className="negative">{compact(selected.expense)}</b>
            </div>
            <div>
              <span>순현금</span>
              <b>{compact(selected.balance)}</b>
            </div>
          </div>
         
          <p>
            💡 {selectedTax > 0
              ? selected.net < 0
                ? <>부가세 {compact(selectedTax)} 일시 납부로 이번 달 지출이<br />평소보다 급증해 잔고가 빠르게 줄어듭니다.</>
                : `부가세 ${compact(selectedTax)} 일시 납부가 이번 달 지출에 반영되었어요.`
              : selected.actual
                ? "입력한 매출과 지출을 반영했어요."
                : "예측된 매출과 지출을 반영했어요."}
          </p>
        </div>
      </section>

      {/* 현금 흐름 리스트 */}
      <section className="cash-panel">
        <h2>⌁ 6개월 현금 흐름 리스트</h2>
        <div className="cash-list">
          {(expanded ? cashList : cashList.slice(0, 3)).map((row) => (
            <div className="cash-list-row" key={row.key}>
              <b className="cash-month-label">{row.label}</b>
              <div className="cash-list-flow">
                <b>수입 {compact(row.income)}</b>
                <b>지출 {compact(row.expense)}</b>
                <span className={row.net < 0 ? "negative" : "positive"}>
                  {row.net > 0 ? "+" : ""}{compact(row.net)} · {row.actual ? "입력" : "예측"}
                </span>
              </div>
              <div className="cash-list-balance">
                <small>순현금</small>
                <b>{compact(row.balance)}</b>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="cash-more"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? "현금 리스트 접기" : "현금 리스트 더보기"}
        </button>
      </section>

    </>
  );
}

export default CashRunwayPage;
