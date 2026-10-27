import { useState } from "react";
import { Icon } from "../components/Icon";
import { useAccount } from "../lib/Account";
import { won, runway } from "../lib/api";
import "./HomePage.css";
import "./Dashboard.css";

export function CashCard({ onOpen }: { onOpen?: () => void }) {
  const { finance, analysis } = useAccount();
  const input = finance?.input;
  const cash = input
    ? input.current_cash - input.reserve_cash - input.unpaid_initial_investment
    : 0;
  const months = analysis?.monthly ?? [];
  const n = months.findIndex((m) => m.available_balance <= 0);
  const pct =
    analysis && analysis.available_runway.initial_balance > 0
      ? n < 0
        ? 100
        : (n / Math.max(months.length, 1)) * 100
      : 0;
  return (
    <button
      className="home-hero cash-card"
      onClick={onOpen}
      disabled={!onOpen}
      aria-label="현금 흐름 분석 열기"
    >
      <div className="balance-label">
        <Icon name="wallet" /> 분석 시작 시 사용할 수 있는 돈
      </div>
      <strong className="balance">{won(cash)}</strong>
      <div className="runway">
        <small>예비자금을 제외한 현재 자금으로,</small>
        <b>
          {analysis
            ? runway(analysis.available_runway)
            : "현금 흐름을 확인해주세요"}
        </b>
        <div className="progress">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-label">
          <span>자금 부족</span>
          <span>입력한 {input?.months ?? 12}개월 기준 · 월말 잔액</span>
        </div>
      </div>
      <small className="hero-foot">
        {onOpen
          ? "자세한 현금 흐름은 터치하여 확인하세요"
          : "보유자금 − 예비자금 − 미지급 초기 투자비"}
      </small>
    </button>
  );
}

export function expenseRows(
  input: NonNullable<ReturnType<typeof useAccount>["finance"]>["input"],
  month: string,
) {
  const last = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5, 7)),
    0,
  ).getDate();
  return [
    ...input.fixed_expenses.map((x, i) => ({
      ...x,
      id: `fixed-${i}`,
      date: x.due_day
        ? `${month}-${String(Math.min(last, x.due_day)).padStart(2, "0")}`
        : "",
      fixed: true,
    })),
    ...input.irregular_expenses
      .filter((x) => !x.is_paid && x.expected_date.startsWith(month))
      .map((x, i) => ({
        ...x,
        id: `extra-${i}`,
        date: x.expected_date,
        due_day: null,
        fixed: false,
      })),
  ].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
}
export function BillList({
  month,
  limit,
  onMore,
}: {
  month: string;
  limit?: number;
  onMore?: () => void;
}) {
  const { finance } = useAccount();
  const rows = finance ? expenseRows(finance.input, month) : [];
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
  }).format(new Date());
  return (
    <section className="bill-panel home-bills">
      <h2>
        <span>
          <Icon name="calendar" /> 예정 지출 &amp; 세금 캘린더
        </span>
        <em>총 {rows.length}건</em>
      </h2>
      {!rows.length && (
        <p className="empty-copy">
          아직 예정 지출과 세금 정보가 입력되지 않았어요.
        </p>
      )}
      {rows.slice(0, limit ?? rows.length).map((x) => {
        const d = x.date
          ? Math.round((Date.parse(x.date) - Date.parse(today)) / 86400000)
          : null;
        return (
          <article
            className={
              "bill " + (d !== null && d >= 0 && d <= 3 ? "urgent" : "")
            }
            key={x.id}
          >
            <span className="bill-icon">
              <Icon name={x.fixed ? "cash" : "receipt"} />
            </span>
            <div className="bill-copy">
              <em>
                {x.fixed
                  ? x.date
                    ? `매월 ${x.due_day}일`
                    : "납부일 미등록"
                  : x.date.slice(5).replace("-", "/")}
              </em>
              <b>{x.name}</b>
              <small>{x.fixed ? "월 고정 지출" : "추가 지출 · 미지급"}</small>
            </div>
            <div className="bill-money">
              <b>{won(x.amount)}</b>
              <small>
                {d === null
                  ? "날짜 입력 필요"
                  : d === 0
                    ? "오늘"
                    : d < 0
                      ? "예정일 지남"
                      : `D-${d}`}
              </small>
            </div>
          </article>
        );
      })}
      {onMore && rows.length > 0 && (
        <button className="more-bills" onClick={onMore}>
          지출 내역 더보기 ({rows.length}건)
        </button>
      )}
    </section>
  );
}
export function StoredCalendar({ onManage }: { onManage: () => void }) {
  const { finance } = useAccount();
  const [month, setMonth] = useState(
    finance?.input.start_month.slice(0, 7) ?? "",
  );
  const rows = finance ? expenseRows(finance.input, month) : [];
  const largest = rows.reduce<(typeof rows)[number] | null>(
    (a, b) => (!a || b.amount > a.amount ? b : a),
    null,
  );
  return (
    <section className="home-page dashboard">
      <label className="month-pick">
        조회 월
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
        />
      </label>
      <section className="home-hero calendar-hero">
        <small>{month.replace("-", "년 ")}월 예정 지출</small>
        <strong className="balance">
          {won(rows.reduce((s, x) => s + x.amount, 0))}
        </strong>
        <p>
          {largest
            ? `가장 큰 지출은 ${largest.name} (${won(largest.amount)})이에요.`
            : "등록된 지출이 없습니다."}
        </p>
        <p>납부일과 지급 상태를 확인해주세요.</p>
      </section>
      {!!rows.filter((x) => x.date).length && (
        <div className="date-strip">
          {rows
            .filter((x) => x.date)
            .slice(0, 5)
            .map((x) => (
              <div key={x.id}>
                <b>{Number(x.date.slice(-2))}</b>
                <small>{x.name}</small>
              </div>
            ))}
        </div>
      )}
      <BillList month={month} />
      <button className="more-bills" onClick={onManage}>
        지출 입력·수정하기
      </button>
    </section>
  );
}
export default function StoredHome({
  onManage,
  onAnalysis,
  onCalendar,
}: {
  onManage: () => void;
  onAnalysis: () => void;
  onCalendar: () => void;
}) {
  const { store, finance, reload, analysis } = useAccount();
  const [info, setInfo] = useState("");
  const ready = !!finance && finance.input.monthly_sales > 0;
  return (
    <section className="home-page dashboard">
      <div className="status">
        <span>
          <i />
          저장된 경영정보 기준 · POS 미연동
        </span>
        <button
          aria-label="새로 불러오기"
          onClick={() => void reload(store?.id)}
        >
          <Icon name="sync" />
        </button>
      </div>
      <button
        className="status guide"
        onClick={() =>
          setInfo(
            "입력/관리에서 매출과 지출을 저장하고, 파란 자금 카드를 눌러 월별 현금 흐름을 확인하세요.",
          )
        }
      >
        <span>
          <i />
          버틸 이용 가이드
        </span>
      </button>
      {ready ? (
        <CashCard onOpen={onAnalysis} />
      ) : (
        <section className="home-hero empty-hero">
          <div>
            <p>아직 계산을 위한 정보들이 충분하지 않아요.</p>
            <button onClick={onManage}>
              💡 입력/관리 탭에서 매출 정보를 입력해주세요
            </button>
            <button onClick={onManage}>
              💡 우리 가게의 지출 정보를 확인해주세요
            </button>
            <small>* 매출이 0원인 경우에도 현금 분석은 확인할 수 있어요.</small>
            <button onClick={onAnalysis}>현재 입력으로 현금 분석 보기 →</button>
          </div>
        </section>
      )}
      {!analysis && ready && (
        <p role="alert">
          분석 결과를 불러오지 못했습니다. 새로 불러오기를 눌러주세요.
        </p>
      )}
      <section className="quick">
        <h2>사장님 입력 목록 및 관리</h2>
        <div className="quick-grid">
          {[
            ["expense", "지출 관리"],
            ["tax", "세금 관리"],
            ["raw", "원재료비 변동"],
            ["shield", "지원금"],
          ].map(([icon, label], i) => (
            <button
              className="quick-card"
              key={icon}
              onClick={() =>
                i === 3
                  ? setInfo(
                      "지원금 자동 매칭은 준비 중입니다. 현재는 입력한 경영정보의 현금 흐름을 분석할 수 있습니다.",
                    )
                  : i === 2
                    ? setInfo(
                        "원재료 가격정보 자동 수집은 준비 중입니다. 입력/관리에서 직접 원재료비를 입력할 수 있습니다.",
                      )
                    : onManage()
              }
            >
              <span className="quick-icon">
                <Icon name={icon} />
              </span>
              <b>{label}</b>
              {i === 3 && <small>소상공인 정책 지원금 매칭</small>}
            </button>
          ))}
        </div>
      </section>
      <BillList
        month={finance?.input.start_month.slice(0, 7) ?? ""}
        limit={3}
        onMore={onCalendar}
      />
      {info && (
        <div className="flow-modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="이용 안내"
            className="flow-modal"
          >
            <h2>버틸 이용 안내</h2>
            <p>{info}</p>
            <button className="flow-primary" onClick={() => setInfo("")}>
              확인
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
