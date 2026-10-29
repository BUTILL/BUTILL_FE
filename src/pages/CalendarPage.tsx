import { Icon } from "../components/Icon";
import { bills } from "../data/bills";
import "./CalendarPage.css";

export default function CalendarPage() {
  return (
    <section className="calendar-page">
      <div className="hero">
        <small>2025년 3월 예정 지출</small>
        <h1>₩5,000,000</h1>
        <div className="glass">
          가장 큰 지출은 10일 직원 급여 (₩3,200,000)예요.
        </div>
        <div className="glass">필수 납부금을 확인해주세요.</div>
      </div>
      <div className="dates">
        {[
          ["D-2", "10", "급여"],
          ["D-6", "14", "카드"],
          ["D-12", "20", "공과금"],
          ["D-17", "25", "원천세"],
          ["D-23", "31", "임대료"],
        ].map((d, i) => (
          <div
            className={i === 0 || i === 2 || i === 3 ? "red" : ""}
            key={d[1]}
          >
            <small>{d[0]}</small>
            <b>{d[1]}</b>
            <span>{d[2]}</span>
          </div>
        ))}
      </div>
      <section className="bill-panel">
        <h2>
          <span>
            <Icon name="calendar" />
            예정 지출 &amp; 세금 캘린더
          </span>
          <em>총 7건</em>
        </h2>
        {[...bills, ...bills.slice(1, 4)].map((b, i) => (
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
      </section>
    </section>
  );
}
