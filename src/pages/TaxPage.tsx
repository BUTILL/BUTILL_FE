import "./TaxPage.css";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Icon } from "../components/Icon";
import Toast from "../components/Toast";
import { taxGroups as groups } from "../data/taxOptions";
import type { TaxEvent } from "../types/api";

type TaxPageProps = {
  picked: Record<string, string>;
  setPicked: Dispatch<SetStateAction<Record<string, string>>>;
  annual: boolean;
  setAnnual: Dispatch<SetStateAction<boolean>>;
  schedule: TaxEvent[] | null;
  onSave: () => Promise<void>;
};

// 다가오는 세무 일정 카드 (D-day, 월.일)
function TaxEventCard({ event }: { event: TaxEvent }) {
  const [, month, day] = event.due_date.split("-").map(Number);
  return (
    <article className={event.days_left <= 14 ? "tax-event urgent" : "tax-event"}>
      <div className="datebox">
        <small>{event.days_left === 0 ? "오늘" : `D-${event.days_left}`}</small>
        <b>
          {month}.{day}
        </b>
      </div>
      <div className="tax-copy">
        <b>{event.title}</b>
        {event.note && <small>{event.note}</small>}
      </div>
    </article>
  );
}

export default function TaxPage({
  picked,
  setPicked,
  annual,
  setAnnual,
  schedule,
  onSave,
}: TaxPageProps) {
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("저장이 완료되었습니다");
  const [saving, setSaving] = useState(false);
  const [saveNoticeId, setSaveNoticeId] = useState(0);
  const [showTaxIntro, setShowTaxIntro] = useState(true);
  const [taxIntroClosing, setTaxIntroClosing] = useState(false);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const saveTimer = useRef<number | undefined>(undefined);
  const detailUrl =
    import.meta.env.VITE_TAX_ANALYSIS_WEB_URL || "http://localhost:5174/tax";

  return (
    <section className="tax-page">
      {showTaxIntro && (
        <div className={"intro " + (taxIntroClosing ? "intro-closing" : "")}>
          <div>
            <h1>세금 진단 및 납부일정</h1>
            <p>
              버틸 앱에 세금 납부 일정 정보를 입력해주세요.
              <br />더 정확한 가용 자금을 계산할 수 있어요
            </p>
          </div>
          <button
            aria-label="안내 닫기"
            onClick={() => {
              setTaxIntroClosing(true);
              window.setTimeout(() => {
                setShowTaxIntro(false);
                setTaxIntroClosing(false);
              }, 230);
            }}
          >
            ×
          </button>
        </div>
      )}
      <button
        className="tax-diagnosis-toggle"
        type="button"
        aria-expanded={showDiagnosis}
        onClick={() => setShowDiagnosis((shown) => !shown)}
      >
        <span className="tax-diagnosis-copy">
          <b>세금 진단 정보</b>
          <small>사업자 형태와 납부 방식을 설정해요</small>
        </span>
        <span
          className={
            showDiagnosis
              ? "tax-diagnosis-chevron open"
              : "tax-diagnosis-chevron"
          }
          aria-hidden="true"
        />
      </button>
      <div
        className={showDiagnosis ? "diagnosis-panel open" : "diagnosis-panel"}
      >
        <div className="diagnosis-panel-inner">
          <div className="form">
            {groups.map((g, i) => (
              <section
                className={
                  "choice-card " +
                  (g.tip ? "has-tip " : "") +
                  (g.rows ? "rows-card" : "")
                }
                key={g.title}
              >
                <div className="choice-heading">
                  <span>
                    <i>{i + 1}</i>
                    <b>{g.title}</b>
                  </span>
                  {g.hint && <small>{g.hint}</small>}
                </div>
                <div className={g.rows ? "options two-rows" : "options"}>
                  {g.choices.map((c) => (
                    <button
                      className={
                        picked[g.title] === c ? "option selected" : "option"
                      }
                      key={c}
                      onClick={() =>
                        setPicked((old) => ({ ...old, [g.title]: c }))
                      }
                    >
                      {c.split("\\n").map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </button>
                  ))}
                </div>
                {g.tip && (
                  <div className="tip">
                    ⓘ　부가가치세 연 2회 확정신고 대상 (1월 · 7월)
                  </div>
                )}
              </section>
            ))}
            <div className="save-wrap">
              {saved && (
                <Toast
                  key={saveNoticeId}
                  message={saveMessage}
                  className="tax-toast"
                />
              )}
              <button
                className={saved ? "save saved" : "save"}
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await onSave();
                    setSaveMessage("저장이 완료되었습니다");
                  } catch (e) {
                    setSaveMessage(e instanceof Error ? e.message : "저장하지 못했습니다.");
                  } finally {
                    setSaving(false);
                  }
                  setSaved(true);
                  setSaveNoticeId((v) => v + 1);
                  if (saveTimer.current) window.clearTimeout(saveTimer.current);
                  saveTimer.current = window.setTimeout(() => {
                    setSaved(false);
                    saveTimer.current = undefined;
                  }, 2500);
                }}
              >
                {saving ? "저장 중" : "저장"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <section className="schedule">
        <h2>
          <span>
            <Icon name="calendar" />
            다가오는 세무 일정
          </span>
        </h2>
        {schedule === null && <p className="tax-schedule-empty">세무 일정을 불러오지 못했어요.</p>}
        {schedule?.slice(0, 2).map((event) => <TaxEventCard key={event.code} event={event} />)}
        <div className={annual ? "annual-events open" : "annual-events"}>
          <div className="annual-events-inner">
            {schedule?.slice(2).map((event) => <TaxEventCard key={event.code} event={event} />)}
          </div>
        </div>
        <button className="annual" onClick={() => setAnnual(!annual)}>
          {annual ? "연간 세무 일정 접기" : `연간 세무 일정 ${Math.max(0, (schedule?.length ?? 0) - 2)}개 더보기`}
        </button>
      </section>
      <section className="tax-detail-web">
        <div>
          <span className="tax-detail-kicker">상세 분석 웹</span>
          <h2>연간 세무 일정과 세금 정보를 확인해 보세요</h2>
          <p>월별 납부 일정과 세금별 안내를 웹에서 한눈에 볼 수 있어요.</p>
        </div>
        <a href={detailUrl}>
          세금 일정 자세히 보기 <span aria-hidden="true">→</span>
        </a>
      </section>
    </section>
  );
}
