import { Icon } from "../components/Icon";
import { bills } from "../data/bills";
import "./HomePage.css";

type HomePageProps = {
  onOpenCalendar: () => void;
  onOpenGuide: () => void;
  onOpenTax: () => void;
  onOpenRawMaterials: () => void;
  onOpenSupport: () => void;
};

export default function HomePage({
  onOpenCalendar,
  onOpenGuide,
  onOpenTax,
  onOpenRawMaterials,
  onOpenSupport,
}: HomePageProps) {
  return (
    <section className="home-page">
      <div className="status">
        <span>
          <i />
          POS 정상 연동중 · 오늘 실시간 매출 <b>842,000원</b> 반영
        </span>
        <Icon name="sync" />
      </div>
      <button type="button" className="status guide" onClick={onOpenGuide}>
        <span>
          <i />
          버틸 이용 가이드
        </span>
      </button>
      <section
        className="home-hero"
        aria-label="현재 안전하게 사용할 수 있는 돈"
      >
        <div className="balance-label">
          <Icon name="wallet" /> 현재 안전하게 사용할 수 있는 돈
        </div>
        <strong className="balance">₩ 28,450,000</strong>
        <div className="runway">
          <small>현재 자금으로,</small>
          <b>
            앞으로 <u>8.4개월</u> 버틸 수 있어요
          </b>
          <div className="progress">
            <i />
          </div>
          <div className="progress-label">
            <span>위험 (0개월)</span>
            <span>현재 8.4개월 (안전선: 6개월)</span>
            <span>12개월+</span>
          </div>
        </div>
        <small className="hero-foot">
          자세한 현금 흐름은 터치하여 확인하세요
        </small>
      </section>
      <section className="quick">
        <h2>사장님 입력 목록 및 관리</h2>
        <div className="quick-grid">
          <button className="quick-card" type="button">
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
          <em>총 7건</em>
        </h2>
        {[bills[1], bills[3], bills[0]].map((b, i) => (
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
          지출 내역 더보기 (4건)
        </button>
      </section>
    </section>
  );
}


