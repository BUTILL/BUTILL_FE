import "./SupportPage.css";
import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { publicGet } from "../lib/api";
import type { SupportCollection, SupportProgram } from "../types/api";

type ProgramCard = {
  key: string;
  tag: string;
  status: string;
  title: string;
  description: string;
  detail: string;
  url?: string;
  tall?: boolean;
};

const officialUrl = "https://www.semas.or.kr/";

// 공고를 불러오지 못했을 때 보여줄 기본 안내
const fallbackPrograms: ProgramCard[] = [
  {
    key: "general",
    tag: "운영·경영 안정",
    status: "기본 지원",
    title: "소상공인 일반경영안정자금",
    description:
      "원자재 구입, 계절성 재고 확보 및 매장 운영비가 필요할 때 살펴볼 수 있는 대표적인 정책자금입니다.",
    detail: "지원 대상과 신청 조건을 확인하세요.",
  },
  {
    key: "emergency",
    tag: "매출 감소 · 재해 피해",
    status: "긴급 지원",
    title: "재해·위기 극복 긴급경영안정자금",
    description:
      "매출 감소나 자연재해 등으로 일시적인 경영 위기에 놓인 소상공인을 위한 지원 제도입니다.",
    detail: "지원 대상과 공고 내용을 확인하세요.",
    tall: true,
  },
  {
    key: "refinance",
    tag: "고금리 대출 부담 완화",
    status: "금융 부담 완화",
    title: "소상공인 대환대출",
    description:
      "기존 고금리 대출의 상환 부담을 낮출 수 있도록 지원하는 대환대출 정보를 확인해보세요.",
    detail: "대상 대출과 세부 요건을 확인하세요.",
  },
  {
    key: "youth",
    tag: "청년 · 신규 창업",
    status: "특례 보증",
    title: "청년 및 신규창업 특례보증",
    description:
      "창업 초기 사업주의 자금 조달을 돕는 보증 지원 정보를 확인할 수 있습니다.",
    detail: "신청 가능 여부와 취급 기관을 확인하세요.",
  },
];

// 마감일까지 남은 일수 (오늘 기준)
const daysUntil = (date: string) => {
  const today = new Date();
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = date.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - start) / 86400000);
};

const shorten = (text: string, max: number) => (text.length > max ? `${text.slice(0, max).trim()}…` : text);

// 기업마당 공고 → 카드 표시 형식
const toCard = (program: SupportProgram): ProgramCard => {
  const left = program.apply_end ? daysUntil(program.apply_end) : null;
  return {
    key: program.program_id,
    tag: program.category ?? "지원사업",
    status: program.always_open || left === null ? "상시 모집" : left === 0 ? "오늘 마감" : `마감 D-${left}`,
    title: program.title,
    description: shorten(program.summary ?? "공고 내용은 상세 페이지에서 확인하세요.", 90),
    detail: [program.agency, program.always_open ? null : program.apply_period_text].filter(Boolean).join(" · ") ||
      "지원 대상과 신청 조건을 확인하세요.",
    url: program.url ?? undefined,
  };
};

// 마감이 가까운 공고 먼저, 상시 모집은 뒤로
const byDeadline = (a: SupportProgram, b: SupportProgram) =>
  (a.apply_end ?? "9999").localeCompare(b.apply_end ?? "9999");

export default function SupportPage() {
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [noticeClosing, setNoticeClosing] = useState(false);
  const [programs, setPrograms] = useState<ProgramCard[]>(fallbackPrograms);

  // 기업마당 지원사업 공고 불러오기 (실패하면 기본 안내 유지)
  useEffect(() => {
    let active = true;
    publicGet<SupportCollection>("/support-programs")
      .then((data) => {
        if (active && data.programs.length) setPrograms([...data.programs].sort(byDeadline).map(toCard));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="support-page">
      {noticeVisible && (
        <section
          className={`support-intro intro${noticeClosing ? " intro-closing" : ""}`}
        >
          <div>
            <span className="support-kicker">사장님을 위한 지원 정보</span>
            <h1>우리 매장에 딱 맞는 정책자금</h1>
            <p>
              매장의 비상 완충금이 부족하다면, 사장님께 꼭 맞는 정부 정책
              지원금을 살펴보고 신청해보세요.
            </p>
          </div>
          <button
            className="support-close"
            aria-label="안내 닫기"
            onClick={() => {
              setNoticeClosing(true);
              window.setTimeout(() => {
                setNoticeVisible(false);
                setNoticeClosing(false);
              }, 230);
            }}
          >
            ×
          </button>
        </section>
      )}
      <div className="program-list">
        {programs.map((program) => (
          <article
            className={
              "program-card " + (program.tall ? "program-card-tall" : "")
            }
            key={program.key}
          >
            <div className="program-meta">
              <span className="program-tag">{program.tag}</span>
              <span className="program-status">{program.status}</span>
            </div>
            <h2>{program.title}</h2>
            <p>{program.description}</p>
            <div className="program-footer">
              <span>{program.detail}</span>
              <a href={program.url ?? officialUrl} target="_blank" rel="noreferrer">
                자세히 <b>›</b>
              </a>
            </div>
          </article>
        ))}
        <a
          className="official-link"
          href={officialUrl}
          target="_blank"
          rel="noreferrer"
        >
          <span className="official-mark">
            <Icon name="shield" />
          </span>
          <span className="official-copy">
            <b>소상공인시장진흥공단 공식 안내</b>
            <small>정책자금 공고와 신청 정보를 확인하세요</small>
          </span>
          <span className="official-arrow">↗</span>
        </a>
        <p className="support-note">
          지원 대상과 신청 조건은 사업별 공고에서 확인해주세요.
        </p>
      </div>
    </section>
  );
}
