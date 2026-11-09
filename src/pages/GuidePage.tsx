import type { Dispatch, SetStateAction } from "react";
import { Icon } from "../components/Icon";
import logoName from "../assets/logoName.png";
import walletIcon from "../assets/icons/wallet.svg";
import calendarIcon from "../assets/icons/calendar.png";
import riskAlertIcon from "../assets/icons/risk-alert.png";
import bellIcon from "../assets/icons/notification-bell.svg";
import expenseIcon from "../assets/icons/expense-add.svg";
import taxIcon from "../assets/icons/tax-document.svg";
import rawIcon from "../assets/icons/raw-materials-store.svg";
import shieldIcon from "../assets/icons/security-shield.svg";
import homeIcon from "../assets/icons/home.svg";
import manageIcon from "../assets/icons/management-edit.svg";
import simulationIcon from "../assets/icons/simulation-chart.svg";
import settingsIcon from "../assets/icons/settings-gear.svg";
import currentTrendIcon from "../assets/icons/current-trend.png";
import remedyIcon from "../assets/icons/remedy-badge.png";
import riskPointIcon from "../assets/icons/risk-point.png";
import "./GuidePage.css";

// 가이드 단계 목록
const guideSteps = [0, 1, 2];

export default function GuidePage({
  onFinish,
  step,
  setStep,
}: {
  onFinish: () => void;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
}) {
  // 다음 단계 이동 및 가이드 완료
  const advance = () => {
    if (step === guideSteps.length - 1) {
      onFinish();
      return;
    }
    setStep((current) => current + 1);
    document.getElementById("root")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      className={`guide-page${step === 0 ? " guide-page-first" : ""}${step === 1 ? " guide-page-second" : ""}${step === 2 ? " guide-page-third" : ""}`}
    >
      {/* 단계 진행 표시 */}
      <div className="guide-progress" aria-label={`가이드 ${step + 1}단계`}>
        {guideSteps.map((item) => (
          <span className={item <= step ? "active" : ""} key={item} />
        ))}
      </div>

      <div className="guide-content">
        <div className="guide-welcome">💡 처음 오신 사장님을 위한 가이드</div>

        {/* 1단계: 자금 상태와 현금 흐름 예시 */}
        {step === 0 && (
          <>
            <h1 className="guide-title">
              내 가게의 자금 상태를
              <br />
              <strong>한눈에</strong> 쉽게
            </h1>
            
            <p className="guide-description">
              매출은 계속 나오는데,
              <br />여유 자금이 얼마인지 항상 헷갈리셨죠?
              <br />
              <b>BUTILL</b>은 복잡한 장부 계산 없이, 지금 자금으로
              <br className="guide-first-break" /> 버틸 수 있는 기간을 바로 짚어드려요.
            </p>

            <span className="guide-caption">실제 분석 예시 화면</span>
            
            <div className="guide-runway-card">
              <div className="guide-balance-label">
                <Icon name="wallet" /> 현재 안전하게 사용할 수 있는 돈
              </div>
              <strong className="guide-balance">₩ 28,450,000</strong>
              
              <div className="guide-runway-panel">
                <small>현재 자금으로,</small>
                <b>
                  앞으로 <u>8.4개월</u> 버틸 수 있어요
                </b>
                <div className="guide-progress-track">
                  <i />
                </div>
                
                <div className="guide-runway-labels">
                  <span>위험 (0개월)</span>
                  <span>현재 8.4개월 (안전선: 6개월)</span>
                  <span>12개월+</span>
                </div>
              </div>
            </div>
            
            <div className="guide-feature-row">
              <div>
                <img src={calendarIcon} alt="" />
                세금 자동 반영
              </div>
              
              <div>
                <img src={riskAlertIcon} alt="" />
                위험 시기 알림 제공
              </div>
            </div>
            
            {/*가이드화면*/} 
            <span className="guide-caption guide-caption-secondary">
              실제 현금 흐름 예시 화면
            </span>
            
            <div className="guide-example" aria-label="현금 흐름 예시">
              <div className="guide-example-balance">
                <small className="guide-mini-wallet">
                  <img src={walletIcon} alt="" /> 현재 안전하게 사용할 수 있는 돈
                </small>
                <b>₩ 28,000,000</b>
                
                <div className="guide-mini-runway">
                  <small>현재 자금으로,</small>
                  <span>
                    앞으로 <u>8.4개월</u> 버틸 수 있어요
                  </span>
                  
                  <div className="guide-example-track">
                    <i />
                  </div>

                  <div className="guide-mini-labels">
                    <span>위험 (0개월)</span>
                    <span>현재 8.4개월 (안전선: 6개월)</span>
                    <span>12개월+</span>
                  </div>
                </div>

                <div className="guide-example-stats">
                  <span>
                    이번달 매출액
                    <br />
                    <b>1,500 만원</b>
                    <br />
                    이번달에 발생한 매출액
                  </span>

                  <span>
                    월 평균 순 증감
                    <br />
                    <b>-195 만원</b>
                    <br />
                    매달 통장에서 줄고있는 돈
                  </span>
                </div>
              </div>

              {/* 12개월 현금 흐름 그래프 */}
              <div className="guide-mini-chart">
                <div className="guide-mini-chart-title">
                  ⌁ 12개월 현금흐름 그래프 <span className="guide-mini-chart-title-total">● 잔고 </span>　<span className="guide-mini-chart-title-danger">● 위험구간</span>
                </div>

                <div className="guide-example-tags">
                  🔵 수입(들어온 돈)　 🔴 지출(나간 돈)
                  <br />
                  ━━ 통장 잔액선
                </div>

                <svg
                  className="guide-mini-graph"
                  viewBox="0 0 260 150"
                  role="img"
                  aria-label="1월부터 12월까지 월별 수입과 지출, 잔액 예시 그래프"
                >
                  {[20, 60, 100].map((y) => (
                    <line
                      key={y}
                      x1="20"
                      y1={y}
                      x2="258"
                      y2={y}
                      className="guide-graph-grid"
                    />
                  ))}
                  <text x="0" y="23">
                    2천만
                  </text>
                  <text x="0" y="63">
                    1천만
                  </text>
                  <text x="4" y="103" className="guide-graph-zero">
                    0원
                  </text>
                  {[56, 60, 64, 62, 58, 63, 59, 65, 57, 60, 56, 58].map(
                    (income, i) => {
                      const x = 22 + i * 19.5;
                      const expense = [
                        64, 66, 70, 69, 75, 67, 64, 68, 66, 68, 64, 67,
                      ][i];
                     
                      return (
                        <g key={i}>
                          <rect
                            className="guide-bar-income"
                            x={x}
                            y={100 - income}
                            width="6"
                            height={income}
                            rx="1"
                          />
                          <rect
                            className="guide-bar-expense"
                            x={x + 7}
                            y={100 - expense}
                            width="6"
                            height={expense}
                            rx="1"
                          />
                          <text x={x + 6.5} y="110" textAnchor="middle">
                            {i + 1}월
                          </text>
                        </g>
                      );
                    },
                  )}
                  <polyline
                    className="guide-graph-balance"
                    points="28.5,11 48,17 67.5,23 87,30 106.5,44 126,51 145.5,57 165,63 184.5,70 204,80 223.5,100"
                  />
                  {[
                    [28.5, 11],
                    [48, 17],
                    [67.5, 23],
                    [87, 30],
                    [106.5, 44],
                    [126, 51],
                    [145.5, 57],
                    [165, 63],
                    [184.5, 70],
                    [204, 80],
                  ].map(([x, y]) => (
                    <circle
                      key={x}
                      className="guide-graph-dot"
                      cx={x}
                      cy={y}
                      r="2.8"
                    />
                  ))}
                  <polyline
                    className="guide-graph-danger"
                    points="223.5,100 243,116"
                  />
                  {[
                    [223.5, 100],
                    [243, 116],
                  ].map(([x, y], i) => (
                    <circle
                      key={x}
                      className="guide-graph-danger-dot"
                      cx={x}
                      cy={y}
                      r={i === 0 ? 4.5 : 2.5}
                    />
                  ))}
                  
                  <text className="guide-graph-danger-label" x="175" y="24">
                    △ 잔고 소진 구간
                  </text>
                </svg>

                <div className="guide-mini-summary">
                  <b>7월 (부가세 납부월)</b>
                  <strong>-375만원 적자</strong>

                  <div>
                    <span>
                      들어온 돈<br />
                      <b>1,500만</b>
                    </span>
                    <span>
                      나간 돈(지출)
                      <br />
                      <b>1,875만</b>
                    </span>
                    <span>
                      월말 잔액
                      <br />
                      <b>1,305만</b>
                    </span>
                  </div>

                  <small>
                    💡 부가세 180만원 일시 납부로 이번 달 지출이 <br/>평소보다 급증해 잔고가 빠르게 줄어듭니다.
                  </small>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 2단계: 홈 화면과 정보 입력 안내 */}
        {step === 1 && (
          <>
            <h1 className="guide-title guide-title-step-two">
              먼저, 이번 달 가게 상황을 <br/>기록해 주세요
            </h1>

            <p className="guide-description">
              매달 매출과 주요 지출을 입력해 주세요.
              <br />
              입력한 내용을 바탕으로 <b>이번 달 실제로 남은 돈</b>을 <br/>계산합니다.
              입력값이 많으면 더 세밀한 계산이 가능해요.
            </p>

            <span className="guide-caption">실제 홈 화면</span>

            <div className="guide-home-preview" aria-label="홈 화면 예시">
              <div className="guide-preview-header">
                <img
                  className="guide-preview-logo"
                  src={logoName}
                  alt="BUTiLL"
                />

                <span>
                  <img src={bellIcon} alt="" />
                  <i />
                </span>
              </div>

              <div className="guide-preview-status guide-preview-hint">
                💡 버틸 이용 가이드
              </div>

              <div className="guide-preview-hero">
                <small>현재 계산을 위한 정보들이 충분하지 않아요.</small>
                <span>💡 입력/관리 탭에서 매출 정보를 입력해주세요</span>
                <span>💡 세금 관리에서 정보를 입력해주세요</span>
                <small>
                  * 자세한 정보를 입력할수록 계산의 정확도가 올라가요
                </small>
              </div>

              <b className="guide-preview-section-title">
                사장님 입력 목록 및 관리
              </b>

              <div className="guide-preview-cards">
                <div className="highlight">
                  <b>
                    <img src={expenseIcon} alt="" />
                  </b>
                  <strong>
                    지출 관리 <em>•</em>
                  </strong>
                </div>
                <div className="highlight">
                  <b>
                    <img src={taxIcon} alt="" />
                  </b>
                  <strong>
                    세금 관리 <em>•</em>
                  </strong>
                </div>

                <p className="guide-preview-callout">위 메뉴에서 필요한 값을 입력하세요</p>
                <div>
                  <b>
                    <img src={rawIcon} alt="" />
                  </b>
                  <strong>원재료비 변동</strong>
                </div>

                <div>
                  <b>
                    <img src={shieldIcon} alt="" />
                  </b>
                  <strong>비상 자금 진단</strong>
                  <small>소상공인 정책 지원금 매칭</small>
                </div>
              </div>

              <div className="guide-preview-calendar">
                <b>
                  <img src={calendarIcon} alt="" /> 예정 지출 &amp; 세금 캘린더{" "}
                  <span>이번달 예정 0건</span>
                </b>
                <small>아직 예정 지출과 세금 정보가 입력되지 않았어요.</small>
              </div>

              <div className="guide-preview-nav">
                {[
                  [homeIcon, "홈"],
                  [manageIcon, "입력/관리"],
                  [simulationIcon, "시뮬레이션"],
                  [settingsIcon, "설정"],
                ].map(([src, label], index) => (
                  <span className={index === 0 ? "active" : ""} key={label}>
                    <img src={src} alt="" />
                    <small>{label}</small>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}


        {/* 3단계: 시나리오와 버틸 처방전 예시 */}
        {step === 2 && (
          <div className="guide-scenario">
            <h1 className="guide-title">
              우리 가게,
              <br />
              앞으로 <strong><span className="guide-title-emphasis">얼마나 버틸</span> <span className="guide-title-black">수</span></strong> 있을까요?
            </h1>

            <p className="guide-description">
              입력한 정보 기반 현재 자금 상태 바탕으로 BUTILL은 <br/>3가지 시나리오와 위험 극복 방법을 콕! 짚어 드립니다.
            </p>
            
            <span className="guide-caption">실제 시뮬레이션 화면</span>
            
            <div className="guide-scenario-tabs">
              <b>
                기본<small>현재 추세</small>
              </b>
              <span>
                낙관<small>매출 +10%</small>
              </span>
              <span>
                비관<small>매출비 +10%</small>
              </span>
            </div>

            <div className="guide-third-card guide-third-current">
              <div>
                <img src={currentTrendIcon} alt="" />

                <span>
                  <b>현재 추세로</b>
                  <small>지난 3개월 평균 매출 유지 기준</small>
                </span>
              </div>

              <p>
                예상 버틸 기간{" "}
                <strong>
                  약 8개월<small>올해 11월 말 소진 예상</small>
                </strong>
              </p>
            </div>

            <div className="guide-third-card guide-third-chart">
              <h2>기본 시나리오</h2>
              <p>
                현재 추세로 영업이 지속될 시 예상되는 <br/>시나리오를 보여드립니다.
              </p>

              <div className="guide-third-legend">
                🟦 들어오는 돈 (수입)　 🟥 나가는 돈 (지출)　 ━ 남은 잔액
              </div>

              <svg
                className="guide-third-graph"
                viewBox="0 0 280 180"
                role="img"
                aria-label="3월부터 12월까지 수입 지출 및 남은 잔액 예시"
              >
                {[20, 60, 100, 140].map((y) => (
                  <line
                    key={y}
                    x1="5"
                    y1={y}
                    x2="275"
                    y2={y}
                    className="guide-graph-grid"
                  />
                ))}
                {[62, 68, 64, 72, 66, 74, 61, 69, 65, 70].map((v, i) => {
                  const x = 8 + i * 26;
                  const out = [73, 72, 78, 76, 88, 77, 76, 79, 82, 77][i];

                  return (
                    <g key={i}>
                      <rect
                        className="guide-bar-income"
                        x={x}
                        y={140 - v}
                        width="8"
                        height={v}
                        rx="1"
                      />
                      <rect
                        className="guide-bar-expense"
                        x={x + 9}
                        y={140 - out}
                        width="8"
                        height={out}
                        rx="1"
                      />
                      <text x={x + 8} y="155" textAnchor="middle">
                        {i + 3}월
                      </text>
                    </g>
                  );
                })}

                <polyline
                  className="guide-graph-balance"
                  points="16,20 42,31 68,43 94,55 120,70 146,82 172,95 198,109 224,140"
                />
                {[
                  [16, 20],
                  [42, 31],
                  [68, 43],
                  [94, 55],
                  [120, 70],
                  [146, 82],
                  [172, 95],
                  [198, 109],
                ].map(([x, y]) => (
                  <circle
                    className="guide-graph-dot"
                    key={x}
                    cx={x}
                    cy={y}
                    r="3"
                  />
                ))}
                <polyline
                  className="guide-graph-danger"
                  points="224,140 250,160"
                />
                <circle
                  className="guide-graph-danger-dot"
                  cx="224"
                  cy="140"
                  r="5"
                />
                <circle
                  className="guide-graph-danger-dot"
                  cx="250"
                  cy="160"
                  r="2.5"
                />
              </svg>

              <div className="guide-third-risk">▲ 11월 잔고 0원</div>
              <div className="guide-chart-insight">

                <img src={riskPointIcon} alt="" />
                <span>
                  <b>위험 분기점</b>
                  <br />
                  기본 시나리오, 11월 잔고 0원 도달
                </span>
              </div>
            </div>

            <h2 className="guide-third-plan-title">
              <img src={remedyIcon} alt="" /> 대표님을 위한 버틸 처방전{" "}
              <small>비관 상황 극복을 위한</small>
            </h2>

            <div className="guide-third-card guide-third-plan">
              <p>
                가게 상황에 맞게 조건을 조절해 보세요. 위기 상황에서도 <br/>든든하게 버틸 대안이 보입니다.
              </p>
              {[
                [
                  "점심 특선 도입으로 매출 +5%",
                  "객단가 상승 및 테이블회전 강화",
                  "+1.5개월 연장",
                ],
                [
                  "원재료 공동구매로 30만원 절감",
                  "인근 상권 3개 점포 공동 발주",
                  "+1.0개월 연장",
                ],
                [
                  "소상공인 예비자금 250만원 투입",
                  "서울신용보증재단 저리 융자 등",
                  "+1.2개월 연장",
                ],
              ].map(([label, detail, value], index) => (
                <div className="guide-third-option" key={label}>
                  <i className={index < 2 ? "guide-option-selected" : undefined} />
                  <span>
                    <b>{index === 0 ? <>점심 특선 도입으로<br />매출 +5%</> : index === 1 ? <>원재료 공동구매로<br />30만원 절감</> : <>소상공인 예비자금<br />250만원 투입</>}</b>
                    <small>{detail}</small>
                  </span>
                  <strong>{value}</strong>
                </div>
              ))}

              <div className="guide-third-result">
                <span>처방전 적용 후 <br/>예상 버틸 기간</span>
                <strong>◷ 10개월 20일</strong>
                <small>
                  비관 시나리오(11월 고갈)에서<br />0개월 안전하게 연장됩니다.
                </small>

              </div>
              <div className="guide-third-data">
                ▣ 산식 및 세부 데이터 확인 ⌄
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 단계별 안내와 다음 단계·완료 버튼 */}
      <footer className="guide-footer">
        <p>
          {step === 0 && (
            <>
              사장님은 장사에만 집중하세요. 어려운 계산은
              <br />
              <b>BUTILL</b>이 대신할게요.
            </>
          )}

          {step === 1 && (
            <>
              <span className="guide-tax-note">아직 내지 않은 세금도 미리 고려해 드려요.</span>
              <br />
              지금 통장에 있는 돈을 모두 사용할 수 있는 돈으로 착각하지 않도록
              정확한 가용 자금을 지켜드립니다.
            </>
          )}

          {step === 2 && <>이 가이드는 언제든 다시 확인할 수 있어요.</>}
        </p>
        
        <button type="button" onClick={advance}>
          {step === guideSteps.length - 1 ? (
            "완료"
          ) : (
            <>
              다음 단계 <span aria-hidden="true">→</span>
            </>
          )}
        </button>
        <small>◴ 안내 완료까지 약 1분 소요</small>
      </footer>
    </section>
  );
}









