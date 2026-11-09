import logoName from "../../assets/logoName.png";
import type { SetPage } from "../../types/navigation";
import "./IntroPage.css";

function IntroPage({ setPage }: { setPage: SetPage }) {
  // 시작하기 버튼 클릭
  const handleStart = () => {
    setPage("HomePage");
  };
  // 뒤로가기 버튼 클릭
  const handleBack = () => {
    setPage("Information2");
  };

  return (
    <div className="introduction-container">

      {/* 상단 헤더 */}
      <header className="introduction-header">
        <button
          type="button"
          className="introduction-back"
          aria-label="뒤로 가기"
          onClick={handleBack}
        >
          ←
        </button>

        <img
          src={logoName}
          alt="BUTILL"
          className="introduction-logo"
        />
      </header>

      {/* 메인 콘텐츠 */}
      <main className="introduction-content">

        {/* 서비스 소개 */}
        <section className="introduction-welcome">

          <div className="introduction-badge">
            ☻ 버틸은 이렇게 활용해보세요!
          </div>

          <p className="introduction-greeting">
            대표님, 우리 가게 통장 잔고
          </p>

          <h2 className="introduction-title">
            몇 달이나 버틸 수 있을까요?
          </h2>

          <p className="introduction-description">
            복잡한 회계 장부나 계산기는 필요 없습니다.
            통장 잔고와 월세, 인건비만 넣으면
            <strong> '버틸 기간'</strong>을 <br/>딱 계산해 드려요.
          </p>

        </section>

        {/* 버틸의 3가지 약속 */}
        <section className="introduction-features">

          <h3 className="introduction-section-title">
            <span className="introduction-star">★</span>
            버틸(BUTILL)이 사장님께 드리는 3가지 약속
          </h3>

          {/* 첫 번째 기능 */}
          <div className="introduction-feature-card">

            <div className="introduction-feature-top">
              <div className="introduction-feature-icon">
                ⏱
              </div>

              <div>
                <span className="introduction-feature-number">
                  하나,
                </span>

                <h4>내 가게 버틸 시간 즉시 확인</h4>
              </div>
            </div>

            <p>
              매출이 줄어도 현재 남은 통장 잔고로
              가게 운영이 얼마나 버틸 수 있을지
              한눈에 알기 쉽게 짚어드립니다.
            </p>

          </div>

          {/* 두 번째 기능 */}
          <div className="introduction-feature-card">

            <div className="introduction-feature-top">
              <div className="introduction-feature-icon">
                🛡
              </div>

              <div>
                <span className="introduction-feature-number">
                  둘,
                </span>

                <h4>부가세·목돈 나갈 때 든든한 방패</h4>
              </div>
            </div>

            <p>
              갑작스러운 7월 부가세 납부나
              주방 에어컨 고장에도 임대료 밀릴 일 없도록,
              비상 예비비를 자동으로 떼어 계산해 드립니다.
            </p>

          </div>

          {/* 세 번째 기능 */}
          <div className="introduction-feature-card">

            <div className="introduction-feature-top">
              <div className="introduction-feature-icon">
                ▤
              </div>

              <div>
                <span className="introduction-feature-number">
                  셋,
                </span>

                <h4>물가 오를 때 맞춤형 처방전</h4>
              </div>
            </div>

            <p>
              우윳값, 식용유값이 껑충 뛰어도
              가게 문 닫지 않도록,
              비용을 아끼고 버틸 시간을 늘리는
              현실적인 행동 가이드를 전해드립니다.
            </p>

          </div>

        </section>

        {/* 입력 과정 안내 */}
        <section className="introduction-steps">

          <div className="introduction-steps-header">

            <div>
              <h3>사장님은 이것만 해주세요!</h3>
              <p>딱 3가지만 적으면 끝납니다</p>
            </div>

            <span className="introduction-time">
              소요 시간: 1분
            </span>

          </div>

          {/* 1단계 */}
          <div className="introduction-step-card">

            <span className="introduction-step-number">
              1
            </span>

            <div className="introduction-step-text">
              <h4>가게 통장 잔고 입력</h4>
              <p>사업자 통장에 지금 남아있는 금액</p>
            </div>

            <span className="introduction-step-time">
              30초
            </span>

          </div>

          {/* 2단계 */}
          <div className="introduction-step-card">

            <span className="introduction-step-number">
              2
            </span>

            <div className="introduction-step-text">
              <h4>매달 나가는 고정비 확인</h4>
              <p>월세, 직원 인건비, 공과금 등 고정비</p>
            </div>

            <span className="introduction-step-time">
              30초
            </span>

          </div>

          {/* 3단계 */}
          <div className="introduction-step-card">

            <span className="introduction-step-number">
              3
            </span>

            <div className="introduction-step-text">
              <h4>안전 진단서 발급 완료!</h4>
              <p>
                내 가게 버틸 개월 수와 맞춤 처방전 증정
              </p>
            </div>

            <span className="introduction-step-complete">
              즉시 확인
            </span>

          </div>

          {/* 개인정보 안내 */}
          <div className="introduction-security">
            <span className="introduction-lock" aria-hidden="true">🔒</span>

            <p>
              입력하신 모든 숫자는 외부에 저장되지 않고
              안전하게 암호화됩니다.
            </p>
          </div>

        </section>

      </main>

      {/* 하단 시작하기 버튼 */}
      <footer className="introduction-footer">
        <button
          type="button"
          className="introduction-start-button"
          onClick={handleStart}
        >
          시작하기 →
        </button>
      </footer>

    </div>
  );
}

export default IntroPage;
