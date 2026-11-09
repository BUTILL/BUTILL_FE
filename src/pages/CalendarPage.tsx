import { Icon } from "../components/Icon";
import type { ScheduledBill } from "../lib/schedule";
import "./CalendarPage.css";

export default function CalendarPage({ bills }: { bills: ScheduledBill[] }) {
  // 앞으로 한 달 동안 예정된 지출 합계와 가장 큰 지출
  const now = new Date();
  const total = bills.reduce((sum, bill) => sum + bill.amountValue, 0);
  const biggest = [...bills].sort((a, b) => b.amountValue - a.amountValue)[0];
  return (
    <section className="calendar-page">
      <div className="hero">
        <small>{now.getMonth() + 1}월 {now.getDate()}일부터 한 달간 예정 지출</small>
        <h1>₩{total.toLocaleString("ko-KR")}</h1>
        <div className="glass">
          {biggest
            ? `가장 큰 지출은 ${biggest.day}일 ${biggest.title} (${biggest.amount})예요.`
            : "아직 예정된 지출이 없어요."}
        </div>
        <div className="glass">필수 납부금을 확인해주세요.</div>
      </div>
      <div className="dates">
        {bills.slice(0, 5).map((bill, i) => (
          <div className={bill.daysLeft <= 7 ? "red" : ""} key={i}>
            <small>{bill.daysLeft === 0 ? "D-day" : `D-${bill.daysLeft}`}</small>
            <b>{bill.day}</b>
            <span>{bill.title.slice(0, 4)}</span>
          </div>
        ))}
      </div>
      <section className="bill-panel">
        <h2>
          <span>
            <Icon name="calendar" />
            예정 지출 &amp; 세금 캘린더
          </span>
          <em>총 {bills.length}건</em>
        </h2>
        {bills.map((b, i) => (
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
