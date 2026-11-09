import { useEffect, useState } from "react";
import Toast from "../components/Toast";
import { publicGet } from "../lib/api";
import { useAccount } from "../lib/account";
import { getIngredientCosts, saveIngredientCosts } from "../lib/storeSettings";
import type { IngredientCostInput, IngredientPriceResponse, PriceSummary } from "../types/api";
import "./RawMaterialsPage.css";

type MaterialType = "up" | "down" | "steady";
type Material = {
  key: string;
  name: string;
  tag: string;
  previous: string;
  price: string;
  change: string;
  type: MaterialType;
  delta?: string;
};

// 화면에 보여줄 주요 5개 품목 (KAMIS common 그룹)
const TRACKED_ITEMS = ["pork_belly", "onion", "rice", "egg", "garlic"];

// KAMIS 시세 → 목록 표시 형식
function toMaterial(item: PriceSummary): Material | null {
  if (!item.latest) return null;
  const bps = item.week_change?.change_bps ?? 0;
  return {
    key: item.key,
    name: item.name,
    tag: [item.rank_name, item.unit].filter(Boolean).join(" · "),
    previous: (item.week_change?.base_price ?? item.latest.average_price).toLocaleString("ko-KR"),
    price: item.latest.average_price.toLocaleString("ko-KR"),
    change: `${bps > 0 ? "+" : ""}${(bps / 100).toFixed(1)}%`,
    type: bps > 0 ? "up" : bps < 0 ? "down" : "steady",
  };
}

// 매장 단가를 반영한 표시 값 (1주 전 시세 대비 변동)
function withUnitPrice(item: Material, numeric: number): Material {
  const previousPrice = Number(item.previous.replace(/[^0-9]/g, ""));
  const difference = numeric - previousPrice;
  const percentage = (difference / previousPrice) * 100;
  const type: MaterialType = difference > 0 ? "up" : difference < 0 ? "down" : "steady";
  return {
    ...item,
    price: numeric.toLocaleString("ko-KR"),
    change: `${percentage > 0 ? "+" : ""}${percentage.toFixed(1)}%`,
    delta: difference === 0 ? "변동 없음" : `${difference > 0 ? "+" : ""}${difference.toLocaleString("ko-KR")}원`,
    type,
  };
}

export default function RawMaterialsPage({
  refreshCount,
}: {
  refreshCount: number;
}) {
  const [notice, setNotice] = useState("");
  const [noticeId, setNoticeId] = useState(0);
  const [editing, setEditing] = useState(false);
  const [unitPrice, setUnitPrice] = useState("");
  const [selectedName, setSelectedItem] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "done" | "failed">("loading");
  const storeId = useAccount().store?.id;
  // 서버에 저장된 매장 원재료 단가 (다른 품목 값을 지우지 않도록 전체 목록 보관)
  const [savedCosts, setSavedCosts] = useState<IngredientCostInput[]>([]);
  const selectedItem = selectedName || materials[0]?.name || "";
  const detailUrl =
    import.meta.env.VITE_RAW_MATERIALS_WEB_URL ||
    "http://localhost:5174/raw-materials";
  const risingMaterials = materials.filter((item) => item.type === "up");
  const topIncrease = [...risingMaterials].sort(
    (a, b) =>
      Number.parseFloat(b.change.replace("+", "")) -
      Number.parseFloat(a.change.replace("+", "")),
  )[0];

  // 상단 새로고침 버튼을 누를 때마다 안내 표시
  const [seenRefreshCount, setSeenRefreshCount] = useState(0);
  if (refreshCount !== seenRefreshCount) {
    setSeenRefreshCount(refreshCount);
    setNotice("원재료 시세를 새로 확인했어요");
    setNoticeId((value) => value + 1);
  }

  // KAMIS 서울 소매가 불러오기 (새로고침 시 다시 조회)
  useEffect(() => {
    let active = true;
    const costs = storeId ? getIngredientCosts(storeId).catch(() => null) : Promise.resolve(null);
    Promise.all([publicGet<IngredientPriceResponse>("/ingredient-prices?group=common"), costs])
      .then(([data, saved]) => {
        if (!active) return;
        const unitPrices = new Map((saved?.items ?? []).filter((c) => c.unit_price).map((c) => [c.price_key, c.unit_price!]));
        setSavedCosts((saved?.items ?? []).map(({ price_key, unit_price, monthly_amount }) => ({ price_key, unit_price, monthly_amount })));
        const items = TRACKED_ITEMS.map((key) => data.items.find((item) => item.key === key))
          .map((item) => (item ? toMaterial(item) : null))
          .filter((item): item is Material => item !== null)
          .map((item) => (unitPrices.has(item.key) ? withUnitPrice(item, unitPrices.get(item.key)!) : item));
        setMaterials(items);
        setLoadState(items.length ? "done" : "failed");
      })
      .catch(() => {
        if (active) setLoadState("failed");
      });
    return () => {
      active = false;
    };
  }, [refreshCount, storeId]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2500);
    return () => window.clearTimeout(timer);
  }, [noticeId, notice]);

  const showNotice = (message: string) => {
    setNotice(message);
    setNoticeId((value) => value + 1);
  };

  const saveUnitPrice = async () => {
    const numeric = Number(unitPrice.replace(/[^0-9]/g, ""));
    if (!numeric) {
      showNotice("단가를 숫자로 입력해주세요");
      return;
    }
    const target = materials.find((item) => item.name === selectedItem);
    if (!target) return;
    if (!storeId) {
      showNotice("사업장 정보를 먼저 입력해주세요");
      return;
    }
    const next = [
      ...savedCosts.filter((c) => c.price_key !== target.key),
      { ...savedCosts.find((c) => c.price_key === target.key), price_key: target.key, unit_price: numeric },
    ];
    try {
      await saveIngredientCosts(storeId, next);
    } catch (e) {
      showNotice(e instanceof Error ? e.message : "단가를 저장하지 못했어요");
      return;
    }
    setSavedCosts(next);
    setMaterials((old) => old.map((item) => (item.name === selectedItem ? withUnitPrice(item, numeric) : item)));
    setEditing(false);
    setUnitPrice("");
    showNotice(`${selectedItem} 단가를 저장했어요`);
  };

  return (
    <section className="raw-page" aria-label="원재료비 변동 요약">
      <div className="raw-source">
        <span className="raw-source-dot" aria-hidden="true" />
        <span>
          KAMIS 서울 소매가 데이터 &amp; 매장 입력 기반 · 매일 자동 갱신
        </span>
      </div>

      <section className="raw-overview">
        <div>
          <small>이번 주 가장 많이 오른 품목</small>
          <h1>{loadState === "loading" ? "불러오는 중" : (topIncrease?.name ?? "가격 변동 없음")}</h1>
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
          {loadState === "failed" && !materials.length && (
            <p>시세 정보를 불러오지 못했어요. 상단 새로고침으로 다시 시도해주세요.</p>
          )}
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
