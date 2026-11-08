import { useEffect, useState } from "react";
import Toast from "../components/Toast";
import "./RawMaterialsPage.css";

type MaterialType = "up" | "down" | "steady";
type Material = {
  name: string;
  tag: string;
  previous: string;
  price: string;
  change: string;
  type: MaterialType;
};

const initialMaterials: Material[] = [
  {
    name: "돼지고기 삼겹살",
    tag: "국산 · 1kg",
    previous: "21,900",
    price: "23,700",
    change: "+8.2%",
    type: "up",
  },
  {
    name: "양파",
    tag: "특품 · 15kg망",
    previous: "19,200",
    price: "18,000",
    change: "-6.3%",
    type: "down",
  },
  {
    name: "쌀 신동진",
    tag: "상등급 · 20kg",
    previous: "54,500",
    price: "54,500",
    change: "0.0%",
    type: "steady",
  },
  {
    name: "계란 특란",
    tag: "1판 · 30구",
    previous: "6,600",
    price: "6,900",
    change: "+4.5%",
    type: "up",
  },
  {
    name: "식용유 대두유",
    tag: "업소용 · 18L 캔",
    previous: "48,500",
    price: "50,000",
    change: "+3.1%",
    type: "up",
  },
];

export default function RawMaterialsPage({
  refreshCount,
}: {
  refreshCount: number;
}) {
  const [notice, setNotice] = useState("");
  const [noticeId, setNoticeId] = useState(0);
  const [editing, setEditing] = useState(false);
  const [unitPrice, setUnitPrice] = useState("");
  const [selectedItem, setSelectedItem] = useState(initialMaterials[0].name);
  const [materials, setMaterials] = useState(initialMaterials);
  const detailUrl =
    import.meta.env.VITE_RAW_MATERIALS_WEB_URL ||
    "http://localhost:5174/raw-materials";
  const risingMaterials = materials.filter((item) => item.type === "up");
  const topIncrease = [...risingMaterials].sort(
    (a, b) =>
      Number.parseFloat(b.change.replace("+", "")) -
      Number.parseFloat(a.change.replace("+", "")),
  )[0];

  useEffect(() => {
    if (refreshCount === 0) return;
    setNotice("원재료 시세를 새로 확인했어요");
    setNoticeId((value) => value + 1);
  }, [refreshCount]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2500);
    return () => window.clearTimeout(timer);
  }, [noticeId, notice]);

  const showNotice = (message: string) => {
    setNotice(message);
    setNoticeId((value) => value + 1);
  };

  const saveUnitPrice = () => {
    const numeric = Number(unitPrice.replace(/[^0-9]/g, ""));
    if (!numeric) {
      showNotice("단가를 숫자로 입력해주세요");
      return;
    }

    setMaterials((old) =>
      old.map((item) => {
        if (item.name !== selectedItem) return item;
        const previousPrice = Number(item.previous.replace(/[^0-9]/g, ""));
        const difference = numeric - previousPrice;
        const percentage = (difference / previousPrice) * 100;
        const type: MaterialType =
          difference > 0 ? "up" : difference < 0 ? "down" : "steady";
        return {
          ...item,
          price: numeric.toLocaleString("ko-KR"),
          change: `${percentage > 0 ? "+" : ""}${percentage.toFixed(1)}%`,
          delta:
            difference === 0
              ? "변동 없음"
              : `${difference > 0 ? "+" : ""}${difference.toLocaleString("ko-KR")}원`,
          type,
        };
      }),
    );
    setEditing(false);
    setUnitPrice("");
    showNotice(`${selectedItem} 단가를 수정했어요`);
  };

  return (
    <section className="raw-page" aria-label="원재료비 변동 요약">
      <div className="raw-source">
        <span className="raw-source-dot" aria-hidden="true" />
        <span>
          KAMIS 공공 도매 데이터 &amp; 매장 입력 기반 · 매주 월요일 자동 갱신
        </span>
      </div>

      <section className="raw-overview">
        <div>
          <small>이번 주 가장 많이 오른 품목</small>
          <h1>{topIncrease?.name ?? "가격 변동 없음"}</h1>
          <p>
            관심 원재료 {materials.length}개 중 가격 상승{" "}
            {risingMaterials.length}개
          </p>
        </div>
        {topIncrease && (
          <strong className="raw-overview-change">{topIncrease.change}</strong>
        )}
      </section>

      <section className="raw-short-list">
        <header className="raw-short-heading">
          <div>
            <h2>이번 주 원재료 가격 변동</h2>
            <p>지난 주와 비교한 단가 변동</p>
          </div>
          <span>{materials.length}개 품목</span>
        </header>
        <div className="raw-short-items">
          {materials.map((item) => (
            <article className="raw-short-item" key={item.name}>
              <div className="raw-short-name">
                <b>{item.name}</b>
                <small>{item.tag}</small>
              </div>
              <div className="raw-short-price">
                <strong>₩{item.price}</strong>
                <small>지난주 ₩{item.previous}</small>
                <span className={"raw-change " + item.type}>
                  {item.type === "up" ? "▲" : item.type === "down" ? "▼" : "—"}{" "}
                  {item.change}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <button className="raw-unit-edit" onClick={() => setEditing(true)}>
        원재료 단가 수정
      </button>

      <section className="raw-detail-link">
        <div>
          <span className="raw-detail-kicker">상세 분석 웹</span>
          <h2>4주 추이와 매장 지출 영향을 확인해 보세요</h2>
          <p>품목별 시세 흐름과 대응 권장 팁을 웹에서 볼 수 있어요.</p>
        </div>
        <a href={detailUrl}>
          자세히 분석하기 <span aria-hidden="true">→</span>
        </a>
      </section>

      {notice && (
        <Toast key={noticeId} message={notice} className="raw-toast" />
      )}

      {editing && (
        <div className="raw-modal-backdrop" onClick={() => setEditing(false)}>
          <section
            className="raw-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>원재료 단가 수정</h2>
            <p>매장에서 사용하는 원재료의 현재 매입 단가를 입력해주세요.</p>
            <label>
              품목
              <select
                value={selectedItem}
                onChange={(event) => setSelectedItem(event.target.value)}
              >
                {materials.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
            </label>
            <label>
              현재 단가
              <span>
                <input
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(event.target.value)}
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
