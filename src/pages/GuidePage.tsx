import { useState } from "react";
import { Icon } from "../components/Icon";
import "./GuidePage.css";

type GuidePageProps = {
  onFinish: () => void;
};

const guideSteps = [0, 1, 2];

export default function GuidePage({ onFinish }: GuidePageProps) {
  const [step, setStep] = useState(0);

  const advance = () => {
    if (step === guideSteps.length - 1) {
      onFinish();
      return;
    }
    setStep((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="guide-page">
      <div className="guide-progress" aria-label={`가이드 ${step + 1}단계`}>
        {guideSteps.map((item) => (
          <span className={item <= step ? "active" : ""} key={item} />
        ))}
      </div>

      <div className="guide-content">
        <div className="guide-welcome">💡 처음 오신 사장님을 위한 가이드</div>

        {step === 0 && (
          <>
            <h1 className="guide-title">
              내 가게의 자금 상태를 <strong>한눈에</strong> 쉽게
            </h1>
            <p className="guide-description">
              매출은 계속 나오는데,
              <br />
              여유 자금이 얼마인지 항상 헷갈리셨죠?
              <br />
              <b>BUTILL은 복잡한 장부 계산 없이, 지금 자금으로 버틸 수 있는 기간을 바로 짚어드려요.</b>
            </p>

            <span className="guide-caption">실제 분석 예시 화면</span>
            <div className="guide-runway-card">
              <div className="guide-balance-label"><Icon name="wallet" /> 현재 안전하게 사용할 수 있는 돈</div>
              <strong className="guide-balance">₩ 28,450,000</strong>
              <div className="guide-runway-panel">
                <small>현재 자금으로,</small>
                <b>앞으로 <u>8.4개월</u> 버틸 수 있어요</b>
                <div className="guide-progress-track"><i /></div>
                <div className="guide-runway-labels">
                  <span>위험 (0개월)</span>
                  <span>현재 8.4개월 (안전선: 6개월)</span>
                  <span>12개월+</span>
                </div>
              </div>
            </div>
            <div className="guide-feature-row">
              <div><img src="/guide-icons/calendar.png" alt="" />세금 자동 반영</div>
              <div><img src="/guide-icons/risk-alert.png" alt="" />위험 시기 알림 제공</div>
            </div>
            <span className="guide-caption guide-caption-secondary">실제 현금 흐름 예시 화면</span>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="guide-title guide-title-step-two">
              먼저, 이번 달 가게 상황을 기록해 주세요
            </h1>
            <p className="guide-description">
              매달 매출과 주요 지출을 입력해 주세요.
              <br />
              입력한 내용을 바탕으로 <b>이번 달 실제로 남은 돈</b>을 계산합니다. 입력값이 많으면 더 세밀한 계산이 가능해요.
            </p>
            <span className="guide-caption">실제 홈 화면</span>
            <div className="guide-home-preview" aria-label="홈 화면 예시">
              <div className="guide-preview-header"><b>BUTiLL</b><span><img src="/figma/notification-bell.svg" alt="" /></span></div>
              <div className="guide-preview-status"><i /> POS 오늘 실시간 매출 842,000원 반영</div>
              <div className="guide-preview-status guide-preview-hint">💡 버틸 이용 가이드</div>
              <div className="guide-preview-hero">
                <small>현재 계산을 위한 정보들이 충분하지 않아요.</small>
                <span>💡 입력/관리 탭에서 매출 정보를 입력해주세요</span>
                <span>💡 세금 관리에서 정보를 입력해주세요</span>
                <small>* 자세한 정보를 입력할수록 계산의 정확도가 올라가요</small>
              </div>
              <b className="guide-preview-section-title">사장님 입력 목록 및 관리</b>
              <div className="guide-preview-cards">
                <div className="highlight"><b>⊕</b><strong>지출 관리</strong></div>
                <div className="highlight"><b>▤</b><strong>세금 관리</strong></div>
                <div><b>♧</b><strong>원재료비 변동</strong></div>
                <div><b>◈</b><strong>비상 자금 진단</strong></div>
              </div>
              <p className="guide-preview-callout">위 메뉴에서 필요한 값을 입력하세요</p>
              <div className="guide-preview-calendar">
                <b>▦ 예정 지출 &amp; 세금 캘린더</b>
                <small>아직 예정 지출과 세금 정보가 입력되지 않았어요.</small>
              </div>
              <div className="guide-preview-nav"><span>⌂<small>홈</small></span><span>▤<small>입력/관리</small></span><span>⌁<small>시뮬레이션</small></span><span>⚙<small>설정</small></span></div>
            </div>
            <p className="guide-description guide-step-two-note">
              아직 내지 않은 세금도 미리 고려해 드려요.
              <br />
              지금 통장에 있는 돈을 모두 사용할 수 있는 돈으로 착각하지 않도록 정확한 가용 자금을 지켜드립니다.
            </p>
          </>
        )}

        {step === 2 && (
          <div className="guide-finish-content">
            <div className="guide-finish-icon">✓</div>
            <h1 className="guide-title">이제 시작할 준비가 끝났어요</h1>
            <p className="guide-description">
              매출과 지출 정보를 입력하면 내 가게의 자금 상황과 예상 버틸 기간을 확인할 수 있어요.
            </p>
            <div className="guide-finish-card">
              <div><img src="/guide-icons/calendar.png" alt="" /><span><b>세금까지 반영한 자금 계산</b><small>예정된 지출을 고려해 가용 자금을 알려드려요.</small></span></div>
              <div><img src="/guide-icons/risk-alert.png" alt="" /><span><b>위험 시기 알림</b><small>자금이 부족해질 시기를 미리 확인할 수 있어요.</small></span></div>
            </div>
          </div>
        )}
      </div>

      <footer className="guide-footer">
        <p>
          {step === 0 && <>사장님은 장사에만 집중하세요. 어려운 계산은<br /><b>BUTILL</b>이 대신할게요.</>}
          {step === 1 && <>입력한 정보가 많을수록<br /><b>더 정확한 분석</b>이 가능해요.</>}
          {step === 2 && <>우리 가게의 자금 흐름을 지금 확인해보세요.</>}
        </p>
        <button type="button" onClick={advance}>
          {step === guideSteps.length - 1 ? "홈으로 돌아가기" : "다음 단계"} <span aria-hidden="true">→</span>
        </button>
        <small>{step === guideSteps.length - 1 ? "가이드가 완료되었습니다" : "◴ 안내 완료까지 약 1분 소요"}</small>
      </footer>
    </section>
  );
}


