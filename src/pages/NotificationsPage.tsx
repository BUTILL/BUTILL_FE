import { Icon } from "../components/Icon";
import "./NotificationsPage.css";

type NotificationsPageProps = {
  onOpenRawMaterials: () => void;
  onOpenTax: () => void;
  onOpenCalendar: () => void;
};

export default function NotificationsPage({
  onOpenRawMaterials,
  onOpenTax,
  onOpenCalendar,
}: NotificationsPageProps) {
  return (
    <section className="notifications-page">
      <header className="notifications-heading">
        <h1>알림</h1>
        <p>놓치기 쉬운 자금과 세무 소식을 모았어요.</p>
      </header>

      <section className="notification-group">
        <h2>오늘</h2>
        <article className="notification-card ingredient-notification">
          <div className="notification-icon">
            <Icon name="raw" />
          </div>
          <div className="notification-content">
            <div className="notification-meta">
              <span>원재료비 변동</span>
              <time>10분 전</time>
            </div>
            <h3>주요 원재료 가격이 올랐어요</h3>
            <p>
              식용유와 돼지고기 단가 변동이 감지됐어요. 원재료비 영향을 확인해
              보세요.
            </p>
            <button type="button" onClick={onOpenRawMaterials}>
              원재료비 변동 확인하기 <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      </section>

      <section className="notification-group">
        <h2>다가오는 일정</h2>
        <article className="notification-card tax-notification">
          <div className="notification-icon">
            <Icon name="tax" />
          </div>
          <div className="notification-content">
            <div className="notification-meta">
              <span>세금 일정</span>
              <b className="notification-due urgent">D-3</b>
            </div>
            <h3>부가가치세 예정 신고가 얼마 남지 않았어요</h3>
            <p>
              신고 기한이 가까워지고 있어요. 세금 관리에서 납부 예정 금액과
              일정을 확인해 주세요.
            </p>
            <button type="button" onClick={onOpenTax}>
              세금 일정 확인하기 <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>

        <article className="notification-card expense-notification">
          <div className="notification-icon">
            <Icon name="tax" />
          </div>
          <div className="notification-content">
            <div className="notification-meta">
              <span>예정 지출</span>
              <b className="notification-due">D-5</b>
            </div>
            <h3>사업자 카드 결제가 예정되어 있어요</h3>
            <p>예정 지출을 미리 확인하고 이번 주 자금 흐름을 준비해 보세요.</p>
            <button type="button" onClick={onOpenCalendar}>
              지출 일정 확인하기 <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      </section>

      <p className="notifications-footnote">
        알림은 입력된 예시 정보를 바탕으로 표시됩니다.
      </p>
    </section>
  );
}
