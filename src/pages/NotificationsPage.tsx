import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { useAccount } from "../lib/account";
import { getNotifications } from "../lib/storeSettings";
import type { AppNotification } from "../types/api";
import "./NotificationsPage.css";

type NotificationsPageProps = {
  onOpenHome: () => void;
  onOpenRawMaterials: () => void;
  onOpenTax: () => void;
  onOpenCalendar: () => void;
};

// 알림 종류별 표시 (아이콘·카드 색·이동 버튼)
const KIND = {
  runway: { label: "자금 위험", icon: "wallet", className: "tax-notification", action: "현금 흐름 확인하기" },
  ingredient: { label: "원재료비 변동", icon: "raw", className: "ingredient-notification", action: "원재료비 변동 확인하기" },
  expense: { label: "예정 지출", icon: "receipt", className: "expense-notification", action: "지출 일정 확인하기" },
  tax: { label: "세금 일정", icon: "tax", className: "tax-notification", action: "세금 일정 확인하기" },
} as const;

export default function NotificationsPage({
  onOpenHome,
  onOpenRawMaterials,
  onOpenTax,
  onOpenCalendar,
}: NotificationsPageProps) {
  const account = useAccount();
  const storeId = account.store?.id;
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    let active = true;
    getNotifications(storeId)
      .then((data) => active && setItems(data.notifications))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [storeId]);

  const open = { home: onOpenHome, raw_materials: onOpenRawMaterials, tax: onOpenTax, calendar: onOpenCalendar };
  const now = (items ?? []).filter((n) => n.severity !== "info");
  const upcoming = (items ?? []).filter((n) => n.severity === "info");

  const card = (n: AppNotification) => {
    const kind = KIND[n.type];
    return (
      <article className={`notification-card ${kind.className}`} key={`${n.type}-${n.title}-${n.due_date ?? ""}`}>
        <div className="notification-icon">
          <Icon name={kind.icon} />
        </div>
        <div className="notification-content">
          <div className="notification-meta">
            <span>{kind.label}</span>
            {n.days_left !== null && (
              <b className={n.severity === "info" ? "notification-due" : "notification-due urgent"}>
                {n.days_left === 0 ? "오늘" : `D-${n.days_left}`}
              </b>
            )}
          </div>
          <h3>{n.title}</h3>
          <p>{n.message}</p>
          <button type="button" onClick={open[n.target]}>
            {kind.action} <span aria-hidden="true">→</span>
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="notifications-page">
      <header className="notifications-heading">
        <h1>알림</h1>
        <p>놓치기 쉬운 자금과 세무 소식을 모았어요.</p>
      </header>

      {!storeId && <p className="notifications-footnote">사업장 정보를 입력하면 알림을 볼 수 있어요.</p>}
      {storeId && items === null && !failed && <p className="notifications-footnote">알림을 불러오는 중이에요.</p>}
      {failed && <p className="notifications-footnote">알림을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.</p>}
      {items !== null && items.length === 0 && <p className="notifications-footnote">지금은 새 알림이 없어요.</p>}

      {now.length > 0 && (
        <section className="notification-group">
          <h2>지금 확인할 알림</h2>
          {now.map(card)}
        </section>
      )}
      {upcoming.length > 0 && (
        <section className="notification-group">
          <h2>다가오는 일정</h2>
          {upcoming.map(card)}
        </section>
      )}

      {items !== null && items.length > 0 && (
        <p className="notifications-footnote">알림은 입력한 경영정보, 세금 설정, 원재료 시세를 바탕으로 만들어져요.</p>
      )}
    </section>
  );
}
