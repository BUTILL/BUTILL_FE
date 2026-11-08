import { useEffect, useState } from "react";
import "./TaxAnalysisWebPage.css";

type TaxKind = "vat" | "income" | "withholding";
type TaxEvent = {
  month: number;
  day: number;
  kind: TaxKind;
  name: string;
  detail: string;
  applies: string;
};

const months = Array.from({ length: 12 }, (_, index) => index + 1);
const monthNames = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];
const withholdingDates = [12, 10, 10, 10, 11, 10, 10, 10, 10, 12, 10, 10];
const events: TaxEvent[] = [
  ...withholdingDates.map((day, index) => ({
    month: index + 1,
    day,
    kind: "withholding" as const,
    name: "원천세 신고·납부",
    detail: `${index + 1}월분 급여 원천세 신고 및 납부`,
    applies: "직원을 고용한 사업장",
  })),
  {
    month: 1,
    day: 26,
    kind: "vat",
    name: "부가가치세 확정신고",
    detail: "2025년 제2기 사업 실적 신고·납부",
    applies: "일반과세자 · 간이과세자",
  },
  {
    month: 4,
    day: 27,
    kind: "vat",
    name: "부가가치세 예정고지",
    detail: "고지서를 받은 경우 예정고지세액 납부",
    applies: "개인 일반과세자 중 고지 대상자",
  },
  {
    month: 6,
    day: 1,
    kind: "income",
    name: "종합소득세 확정신고",
    detail: "2025년 귀속 종합소득세·개인지방소득세 신고·납부",
    applies: "종합소득 신고 대상자",
  },
  {
    month: 7,
    day: 27,
    kind: "vat",
    name: "부가가치세 확정신고",
    detail: "2026년 제1기 사업 실적 신고·납부",
    applies: "일반과세자",
  },
  {
    month: 11,
    day: 2,
    kind: "vat",
    name: "부가가치세 예정고지",
    detail: "고지서를 받은 경우 예정고지세액 납부",
    applies: "개인 일반과세자 중 고지 대상자",
  },
  {
    month: 11,
    day: 30,
    kind: "income",
    name: "종합소득세 중간예납",
    detail: "고지 또는 추계액 신고 대상 여부 확인",
    applies: "중간예납 대상자",
  },
];
const taxKinds: { key: TaxKind | "all"; label: string }[] = [
  { key: "all", label: "전체 일정" },
  { key: "vat", label: "부가가치세" },
  { key: "income", label: "소득세" },
  { key: "withholding", label: "원천세" },
];
const kindLabels: Record<TaxKind, string> = {
  vat: "부가가치세",
  income: "소득세",
  withholding: "원천세",
};
const kindDescriptions: Record<TaxKind, string> = {
  vat: "매출세액에서 공제 가능한 매입세액을 뺀 금액을 신고·납부해요. 개인 일반과세자는 1월·7월 확정신고와 예정고지 대상 여부를 확인하세요.",
  income:
    "사업소득 등 종합소득을 다음 해에 신고해요. 중간예납은 고지 대상 여부에 따라 납부 일정이 생길 수 있어요.",
  withholding:
    "직원 급여를 지급할 때 원천징수한 세금을 신고·납부해요. 일반적으로 다음 달 10일까지 신고합니다.",
};
const sourceLinks = [
  {
    title: "국세청 세무일정",
    href: "https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747&taxMonth=&taxYear=2026",
  },
  {
    title: "부가가치세 안내",
    href: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7693&mi=2401",
  },
  {
    title: "종합소득세 안내",
    href: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7664&mi=2224",
  },
];

export default function TaxAnalysisWebPage() {
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedKind, setSelectedKind] = useState<TaxKind | "all">("all");

  useEffect(() => {
    document.title = "BUTILL | 연간 세금 관리";
  }, []);

  const visibleEvents = events
    .filter((event) => event.month === selectedMonth)
    .filter((event) => selectedKind === "all" || event.kind === selectedKind)
    .sort((a, b) => a.day - b.day);

  return (
    <main className="analysis-web tax-web">
      <header className="analysis-header">
        <a className="analysis-logo" href="/" aria-label="BUTILL 웹 홈">
          <img src="/figma/brand-source.png" alt="BUTILL" />
        </a>
        <nav aria-label="웹 메뉴">
          <a href="/">자금 시뮬레이션</a>
          <a href="/raw-materials">원재료비 분석</a>
          <a className="active" href="/tax">
            세금 관리
          </a>
        </nav>
      </header>

      <div className="analysis-container tax-container">
        <section className="analysis-hero tax-hero">
          <div>
            <span className="analysis-kicker">BUTILL TAX PLANNER · 2026</span>
            <h1>일 년 세금 일정을 미리 확인하세요</h1>
            <p>
              사업자 유형과 직원 고용 정보를 기준으로 주요 신고·납부 일정을
              한곳에 모았어요.
            </p>
          </div>
          <span className="analysis-sample-tag">
            <i /> 예시 프로필 기준
          </span>
        </section>

        <section className="tax-profile-strip" aria-label="적용한 예시 프로필">
          <div>
            <small>적용 프로필</small>
            <strong>개인사업자 · 일반과세자</strong>
          </div>
          <span>직원 있음</span>
          <span>세무사 이용</span>
          <p>앱에 입력한 사용자 정보와 연결되면 이 프로필이 자동 반영돼요.</p>
        </section>

        <section className="tax-summary-grid" aria-label="연간 일정 요약">
          <article>
            <span>연간 주요 일정</span>
            <strong>{events.length}건</strong>
            <small>예시 프로필 기준</small>
          </article>
          <article>
            <span>부가가치세</span>
            <strong>
              {events.filter((event) => event.kind === "vat").length}회
            </strong>
            <small>확정신고 및 예정고지</small>
          </article>
          <article>
            <span>직원 원천세</span>
            <strong>매월</strong>
            <small>다음 달 신고·납부</small>
          </article>
        </section>

        <section className="tax-calendar-section">
          <div className="tax-section-heading">
            <div>
              <span className="analysis-kicker">ANNUAL TAX CALENDAR</span>
              <h2>2026년 연간 세무 일정</h2>
            </div>
            <div className="tax-filters" role="group" aria-label="세목 필터">
              {taxKinds.map((kind) => (
                <button
                  key={kind.key}
                  type="button"
                  className={selectedKind === kind.key ? "active" : ""}
                  aria-pressed={selectedKind === kind.key}
                  onClick={() => setSelectedKind(kind.key)}
                >
                  {kind.label}
                </button>
              ))}
            </div>
          </div>

          <div className="tax-month-grid">
            {months.map((month) => {
              const monthEvents = events
                .filter((event) => event.month === month)
                .filter(
                  (event) =>
                    selectedKind === "all" || event.kind === selectedKind,
                )
                .sort((a, b) => a.day - b.day);
              return (
                <button
                  key={month}
                  type="button"
                  className={
                    selectedMonth === month ? "tax-month selected" : "tax-month"
                  }
                  aria-pressed={selectedMonth === month}
                  onClick={() => setSelectedMonth(month)}
                >
                  <span className="tax-month-title">
                    <b>{monthNames[month - 1]}</b>
                    <small>
                      {monthEvents.length
                        ? `${monthEvents.length}건`
                        : "일정 없음"}
                    </small>
                  </span>
                  {monthEvents.length ? (
                    <span className="tax-month-events">
                      {monthEvents.slice(0, 2).map((event) => (
                        <span
                          className={`tax-mini-event ${event.kind}`}
                          key={`${event.day}-${event.name}`}
                        >
                          <b>{event.day}일</b>
                          <span>{event.name}</span>
                        </span>
                      ))}
                      {monthEvents.length > 2 && (
                        <small>외 {monthEvents.length - 2}건</small>
                      )}
                    </span>
                  ) : (
                    <span className="tax-month-empty">
                      등록된 주요 일정이 없어요
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <section className="tax-month-detail" aria-live="polite">
            <div className="tax-month-detail-heading">
              <div>
                <span className="analysis-kicker">MONTHLY DETAILS</span>
                <h3>{monthNames[selectedMonth - 1]} 세무 일정</h3>
              </div>
              <span>{visibleEvents.length}건</span>
            </div>
            {visibleEvents.length ? (
              <div className="tax-event-list">
                {visibleEvents.map((event) => (
                  <article
                    className="tax-event-row"
                    key={`${event.month}-${event.day}-${event.name}`}
                  >
                    <div className={`tax-event-date ${event.kind}`}>
                      <b>
                        {String(event.month).padStart(2, "0")}.
                        {String(event.day).padStart(2, "0")}
                      </b>
                      <small>2026년</small>
                    </div>
                    <div className="tax-event-description">
                      <span className={`tax-kind-tag ${event.kind}`}>
                        {kindLabels[event.kind]}
                      </span>
                      <h4>{event.name}</h4>
                      <p>{event.detail}</p>
                    </div>
                    <small className="tax-event-applies">{event.applies}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="tax-empty-state">
                선택한 세목의 일정이 없는 달이에요.
              </p>
            )}
          </section>
        </section>

        <section className="tax-info-section">
          <div className="tax-section-heading">
            <div>
              <span className="analysis-kicker">TAX GUIDE</span>
              <h2>세금별로 알아두세요</h2>
            </div>
            <span>세부 대상 여부는 국세청 고지와 신고 안내를 확인하세요.</span>
          </div>
          <div className="tax-info-grid">
            {(Object.keys(kindLabels) as TaxKind[]).map((kind) => (
              <article className={`tax-info-card ${kind}`} key={kind}>
                <span className={`tax-kind-tag ${kind}`}>
                  {kindLabels[kind]}
                </span>
                <h3>
                  {kind === "vat"
                    ? "매출·매입을 정리해 신고해요"
                    : kind === "income"
                      ? "연간 사업소득을 정산해요"
                      : "직원 급여에서 세금을 원천징수해요"}
                </h3>
                <p>{kindDescriptions[kind]}</p>

              </article>
            ))}
          </div>
        </section>

        <aside className="tax-notice">
          <strong>일정 안내</strong>
          <p>
            이 화면은 2026년 국세청 세무일정을 바탕으로 만든 예시예요. 실제
            신고·납부 기한과 대상 여부는 사업자 유형, 고지 여부, 휴일 등에 따라
            달라질 수 있습니다. 앱 입력 정보와 세액 계산은 백엔드 연동 후
            적용됩니다.
          </p>
          <div>
            {sourceLinks.map((source) => (
              <a
                key={source.title}
                href={source.href}
                target="_blank"
                rel="noreferrer"
              >
                {source.title} ↗
              </a>
            ))}
          </div>
        </aside>
        <footer className="analysis-footer">
          <span>BUTILL</span>
          <span>앱 입력 정보 연동 전 예시 일정입니다.</span>
        </footer>
      </div>
    </main>
  );
}
