import "./TaxPage.css";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Icon } from "../components/Icon";
import Toast from "../components/Toast";

const groups = [
  {
    title: "사업자 형태",
    choices: ["개인", "법인", "등록 전", "모름"],
    value: "개인",
  },
  {
    title: "과세 유형",
    hint: "개인사업자",
    choices: ["일반과세자", "간이과세자", "모름"],
    value: "일반과세자",
    tip: true,
  },
  {
    title: "세무 관리 방식",
    hint: "월 기장료 반영",
    choices: ["직접 신고", "세무사 이용", "미정/모름"],
    value: "세무사 이용",
  },
  {
    title: "세금 자금 준비 방식",
    choices: ["매월 세금 확보", "납부월 일괄", "모름"],
    value: "매월 세금 확보",
  },
  {
    title: "직원 고용 여부",
    hint: "정직원 / 파트타이머",
    choices: ["직원 있음", "없음", "채용 / 신고 전"],
    value: "직원 있음",
  },
  {
    title: "납부 방식",
    choices: [
      "일시불",
      "50%\\n(2회 분할)",
      "33.3%\\n(3회 분할)",
      "25%\\n(4회 분할)",
    ],
    value: "일시불",
    rows: true,
  },
];

export const initialTaxSelections: Record<string, string> = Object.fromEntries(
  groups.map((group) => [group.title, group.value]),
);

type TaxPageProps = {
  picked: Record<string, string>;
  setPicked: Dispatch<SetStateAction<Record<string, string>>>;
  annual: boolean;
  setAnnual: Dispatch<SetStateAction<boolean>>;
};

export default function TaxPage({
  picked,
  setPicked,
  annual,
  setAnnual,
}: TaxPageProps) {
  const [saved, setSaved] = useState(false);
  const [saveNoticeId, setSaveNoticeId] = useState(0);
  const [showTaxIntro, setShowTaxIntro] = useState(true);
  const [taxIntroClosing, setTaxIntroClosing] = useState(false);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const saveTimer = useRef<number | undefined>(undefined);

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
                  message="저장이 완료되었습니다"
                  className="tax-toast"
                />
              )}
              <button
                className={saved ? "save saved" : "save"}
                onClick={() => {
                  setSaved(true);
                  setSaveNoticeId((v) => v + 1);
                  if (saveTimer.current) window.clearTimeout(saveTimer.current);
                  saveTimer.current = window.setTimeout(() => {
                    setSaved(false);
                    saveTimer.current = undefined;
                  }, 2500);
                }}
              >
                저장
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
        <article className="tax-event urgent">
          <div className="datebox">
            <small>D-62</small>
            <b>7.25</b>
          </div>
          <b>1기 부가가치세 확정신고</b>
          <em>집중 대비</em>
        </article>
        <article className="tax-event">
          <div className="datebox">
            <small>매월</small>
            <b>10일</b>
          </div>
          <div className="tax-copy">
            <b>원천세 &amp; 4대보험</b>
            <em>정기납부</em>
            <small>직원 2인 월 예상 약 65만 원</small>
          </div>
        </article>
        <div className={annual ? "annual-events open" : "annual-events"}>
          <div className="annual-events-inner">
            <article className="tax-event">
              <div className="datebox">
                <small>매년</small>
                <b>5.31</b>
              </div>
              <b>종합소득세 신고</b>
            </article>
          </div>
        </div>
        <button className="annual" onClick={() => setAnnual(!annual)}>
          {annual ? "연간 세무 일정 접기" : "연간 세무 일정 5개 더보기"}
        </button>
      </section>
    </section>
  );
}
