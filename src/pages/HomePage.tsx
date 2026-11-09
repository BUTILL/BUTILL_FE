///<reference types="vite/client" />
import { Icon } from "../components/Icon";
import type { ScheduledBill } from "../lib/schedule";
import "./HomePage.css";

type HomePageProps = {
  onOpenCalculator: () => void;
  onOpenExpense: () => void;
  onOpenGuide: () => void;
  hasData: boolean;
  // 저장된 고정·추가 지출로 만든 예정 지출 (가까운 순)
  bills: ScheduledBill[];
  balance: number;
  runway: number | null;
  onOpenCalendar: () => void;
  onOpenTax: () => void;
  onOpenRawMaterials: () => void;
  onOpenSupport: () => void;
};

export default function HomePage({
  onOpenCalculator,
  onOpenExpense,
  onOpenGuide,
  hasData,
  bills,
  balance,
  runway,
  onOpenCalendar,
  onOpenTax,
  onOpenRawMaterials,
  onOpenSupport,
}: HomePageProps) {
  return (
    <section className="home-page">
      <button type="button" className="status guide" onClick={onOpenGuide}>
        <span>
          <i />
          버틸 이용 가이드
        </span>
      </button>
      <button
        type="button"
        className="home-hero"
        onClick={hasData ? onOpenCalculator : undefined}
        disabled={!hasData}
        aria-label="현재 안전하게 사용할 수 있는 돈과 현금 흐름 확인"
      >

        {hasData ? <>
        <div className="balance-label">
          <Icon name="wallet" /> 현재 안전하게 사용할 수 있는 돈
        </div>
        <strong className="balance">₩ {Math.round(balance).toLocaleString("ko-KR")}</strong>
        
        <div className="runway">
          <small>현재 자금으로,</small>
          <b>
            {runway === null ? "월 평균 현금이 줄지 않고 있어요" : <>앞으로 <u>{runway.toFixed(1)}개월</u> 버틸 수 있어요</>}
          </b>
          <div className="progress">
            <i style={{ width: `${runway === null ? 100 : Math.min(100, runway / 12 * 100)}%` }} />
          </div>
          <div className="progress-label">
            <span>위험 (0개월)</span>
            <span>{runway === null ? "월 평균 감소 없음" : `현재 ${runway.toFixed(1)}개월 (안전선: 6개월)`}</span>
            <span>12개월+</span>
          </div>
        </div>
        <small className="hero-foot">
          자세한 현금 흐름은 터치하여 확인하세요
        </small>
        </> : (
          <div className="home-empty">
            <p>아직 계산을 위한 정보들이 충분하지 않아요.</p>
            <span>💡 입력/관리 탭에서 매출 정보를 입력해주세요</span>
            <span>💡 세금 관리 탭에서 정보를 입력해주세요</span>
            <small>*자세한 정보를 입력할수록 계산의 정확도가 올라가요</small>
          </div>
        )}
      </button>

      <section className="quick">
        <h2>사장님 입력 목록 및 관리</h2>

        <div className="quick-grid">
          <button className="quick-card" type="button" onClick={onOpenExpense}>
            <span className="quick-icon">
              <Icon name="expense" />
            </span>
            <b>지출 관리</b>
          </button>

          <button className="quick-card" onClick={onOpenTax}>
            <span className="quick-icon">
              <Icon name="tax" />
            </span>
            <b>세금 관리</b>
          </button>

          <button className="quick-card" onClick={onOpenRawMaterials}>
            <span className="quick-icon">
              <Icon name="raw" />
            </span>
            <b>원재료비 변동</b>
          </button>

          <button className="quick-card support" onClick={onOpenSupport}>
            <span className="quick-icon">
              <Icon name="shield" />
            </span>
            <b>지원금</b>
            <small>소상공인 정책 지원금 매칭</small>
          </button>
        </div>
      </section>

      <section className="bill-panel home-bills">
        <h2>
          <span>
            <Icon name="calendar" />
            예정 지출 &amp; 세금 캘린더
          </span>
          <em>{hasData && bills.length ? `총 ${bills.length}건` : "이번달 예정 0건"}</em>
        </h2>

        {hasData && bills.length ? <>
        {bills.slice(0, 3).map((b, i) => (
          <article className={"bill " + (b.urgent ? "urgent" : "")} key={i}>
            <span className="bill-icon">
              <Icon name={b.icon} />
            </span>
            <div className="bill-copy">
              {b.date && <em>{b.date}</em>}
              <b>{b.title}</b>
              <small>{b.desc}</small>
            </div>
            <div className="bill-money">
              <b>{b.amount}</b>
              <small>{b.due}</small>
            </div>
          </article>
        ))}

        <button className="more-bills" onClick={onOpenCalendar}>
          지출 내역 더보기
        </button>
        </> : <p className="home-bills-empty">아직 예정 지출과 세금 정보가 입력되지 않았어요.</p>}
      </section>
    </section>
  );
}
