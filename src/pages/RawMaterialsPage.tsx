import "./RawMaterialsPage.css";
import { useEffect, useState } from "react";
import Toast from "../components/Toast";

export default function RawMaterialsPage({
  refreshCount,
}: {
  refreshCount: number;
}) {
  const [notice, setNotice] = useState("");
  const [noticeId, setNoticeId] = useState(0);
  const [editing, setEditing] = useState(false);
  const [unitPrice, setUnitPrice] = useState("");
  const [selectedItem, setSelectedItem] = useState("돼지고기 삼겹살");
  const [weekOffset, setWeekOffset] = useState(0);
  const [reflected, setReflected] = useState(false);
  const [materials, setMaterials] = useState([
    {
      name: "돼지고기 삼겹살",
      tag: "국산 · 1kg",
      source: "축산물품질평가원 경락단가 연동",
      previous: "21,900",
      price: "23,700",
      change: "+8.2%",
      delta: "+1,800원",
      impact: "월 약 +126,000원 증가 예상",
      type: "up",
      bars: [17, 24, 31, 43],
    },
    {
      name: "양파",
      tag: "특품 · 15kg망",
      source: "가락시장 도매 경매 평균가",
      previous: "19,200",
      price: "18,000",
      change: "-6.3%",
      delta: "-1,200원",
      impact: "월 약 -24,000원 절감 효과",
      type: "down",
      bars: [34, 23, 26, 15],
    },
    {
      name: "쌀 신동진",
      tag: "상등급 · 20kg",
      source: "농수산물유통공사 소매/도매가",
      previous: "54,500",
      price: "54,500",
      change: "0.0%",
      delta: "변동 없음",
      impact: "변동 없음 (안정 유지)",
      type: "steady",
      bars: [24, 24, 24, 24],
    },
    {
      name: "계란 특란",
      tag: "1판 · 30구",
      source: "양계협회 고시가 기준",
      previous: "6,600",
      price: "6,900",
      change: "+4.5%",
      delta: "+300원",
      impact: "월 약 +18,000원 증가 예상",
      type: "up",
      bars: [19, 24, 30, 38],
    },
    {
      name: "식용유 대두유",
      tag: "업소용 · 18L 캔",
      source: "식자재 유통 도매몰 종합",
      previous: "48,500",
      price: "50,000",
      change: "+3.1%",
      delta: "+1,500원",
      impact: "월 약 +15,000원 증가 예상",
      type: "up",
      bars: [18, 25, 32, 39],
    },
  ]);
  useEffect(() => {
    if (refreshCount === 0) return;
    setNotice("시세 정보를 새로 확인했어요");
    setNoticeId((v) => v + 1);
  }, [refreshCount]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2500);
    return () => window.clearTimeout(timer);
  }, [noticeId, notice]);
  useEffect(() => {
    if (!reflected) return;
    const timer = window.setTimeout(() => setReflected(false), 2500);
    return () => window.clearTimeout(timer);
  }, [reflected]);
  const showNotice = (message: string) => {
    setNotice(message);
    setNoticeId((v) => v + 1);
  };
  const weekLabel = `2026년 12월 ${3 + weekOffset}주차`;
  const weekStart = new Date(2026, 11, 14 + weekOffset * 7);
  const weekEnd = new Date(2026, 11, 20 + weekOffset * 7);
  const dayLabel = (date: Date) =>
    `2026.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  const periodLabel = `${dayLabel(weekStart)} (월) ~ ${dayLabel(weekEnd)} (일)`;
  const saveUnitPrice = () => {
    const numeric = Number(unitPrice.replace(/[^0-9]/g, ""));
    if (!numeric) {
      showNotice("단가를 숫자로 입력해주세요");
      return;
    }
    setMaterials((old) =>
      old.map((item) =>
        item.name === selectedItem
          ? { ...item, price: numeric.toLocaleString("ko-KR") }
          : item,
      ),
    );
    setEditing(false);
    setUnitPrice("");
    showNotice(`${selectedItem} 단가를 수정했어요`);
  };
  return (
    <section className="raw-page" aria-label="원재료비 변동 분석 화면">
      <div className="raw-source">
        <b>⚙</b>
        <span>
          KAMIS 공공 도매 데이터 &amp; 매장 입력 기반 · 매주 월요일 자동 갱신
        </span>
      </div>
      <section className="raw-period-card">
        <div className="raw-period-row">
          <button
            aria-label="이전 주"
            onClick={() => setWeekOffset((v) => Math.max(-2, v - 1))}
          >
            ‹
          </button>
          <strong>{weekLabel}</strong>
          <button className="this-week" onClick={() => setWeekOffset(0)}>
            이번 주
          </button>
          <button
            aria-label="다음 주"
            onClick={() => setWeekOffset((v) => Math.min(0, v + 1))}
          >
            ›
          </button>
        </div>
        <p>기준 기간: {periodLabel}</p>
        <div className="raw-week-stat">
          <span>↗</span>
          <div>
            <small>주요 5개 품목 평균 변동률</small>
            <b>
              +4.2% 상승 <small>(월 지출 부담 증가 주의)</small>
            </b>
          </div>
        </div>
      </section>
      <div className="raw-list-heading">
        <div>
          <h1>주요 원재료 5개 품목</h1>
          <p>지난 주 대비 도매가 및 식자재 단가 비교</p>
        </div>
        <span>5개 항목 추적 중</span>
      </div>
      <section className="raw-material-list">
        {materials.map((item) => (
          <article className="material-card" key={item.name}>
            <div className="material-top">
              <div>
                <h2>
                  {item.name} <span>{item.tag}</span>
                </h2>
                <small>{item.source}</small>
              </div>
              <div className={"material-change " + item.type}>
                <b>
                  {item.type === "up" ? "▲" : item.type === "down" ? "▼" : "—"}{" "}
                  {item.change}
                </b>
                <small>{item.delta}</small>
              </div>
            </div>
            <div className="material-prices">
              <span>
                지난 주 <b>₩{item.previous}</b>
              </span>
              <span>
                이번 주 단가 <strong>₩{item.price}</strong>
              </span>
            </div>
            <div className="material-chart">
              <span>최근 4주 추이</span>
              <div className="mini-bars">
                {item.bars.map((height, i) => (
                  <div key={i}>
                    <i
                      className={i === 3 ? item.type : "muted"}
                      style={{ height: `${height}px` }}
                    />
                    <small>{["11-4주", "12-1주", "12-2주", "12-3주"][i]}</small>
                  </div>
                ))}
              </div>
            </div>
            <div className={"material-impact " + item.type}>
              <span>
                {item.type === "up" ? "⚠" : item.type === "down" ? "ⓘ" : "ⓘ"}
              </span>
              매장 월 예상 지출 영향: {item.impact}
            </div>
          </article>
        ))}
      </section>
      <section className="raw-advice">
        <div className="advice-title">
          <span>💡</span>
          <b>사장님 대응 권장 팁</b>
        </div>
        <p>
          돼지고기 삼겹살 도매가가 2주 연속 급등세입니다. 다음 주 발주 시 분할
          구매를 진행하거나, 점심 특선 메뉴의 대체 부위 (전지/목살)비율 조율을
          추천드립니다.
        </p>
        <div className="advice-actions">
          <button
            className={reflected ? "reflected" : ""}
            onClick={() => {
              setReflected(true);
              showNotice("원재료비 변동분을 반영했어요");
            }}
          >
            {reflected ? "✓ 변동분 반영 완료" : "↻ 원재료비에 변동분 즉시 반영"}
          </button>
          <button onClick={() => setEditing(true)}>
            원재료 단가 직접 수정하기
          </button>
        </div>
      </section>
      {notice && (
        <Toast key={noticeId} message={notice} className="raw-toast" />
      )}
      {editing && (
        <div className="raw-modal-backdrop" onClick={() => setEditing(false)}>
          <section className="raw-modal" onClick={(e) => e.stopPropagation()}>
            <h2>원재료 단가 직접 수정</h2>
            <p>매장에서 사용하는 원재료의 현재 매입 단가를 입력해주세요.</p>
            <label>
              품목
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                {materials.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
            </label>
            <label>
              현재 단가{" "}
              <span>
                <input
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  inputMode="numeric"
                  placeholder="예: 23,700"
                />{" "}
                원
              </span>
            </label>
            <div>
              <button onClick={() => setEditing(false)}>취소</button>
              <button className="raw-primary" onClick={saveUnitPrice}>
                저장
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
