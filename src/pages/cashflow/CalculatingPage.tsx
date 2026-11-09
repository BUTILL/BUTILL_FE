import { useEffect } from "react";
import logoName from "../../assets/logoName.png";
import "./CalculatingPage.css";
import type { SetPage } from "../../types/navigation";

export type CalculationStatus = "loading" | "error" | "success";

type CalculatingPageProps = {
  setPage: SetPage;
  status?: CalculationStatus;
  progress?: number;
  onRetry?: () => void;
};

type CalculatingContentProps = {
  setPage: SetPage;
  status: CalculationStatus;
  percent: number | null;
  isError: boolean;
  onRetry?: () => void;
};

// status: "loading" | "error" | "success"
// progress: 실제 계산 진행률(0~100). 알 수 없으면 전달하지 않습니다.
function CalculatingPage({ setPage, status = "loading", progress, onRetry }: CalculatingPageProps) {
  // 전달받은 진행률이 유효한 숫자인지 확인하고 0~100 범위로 제한
  const hasProgress = typeof progress === "number" && Number.isFinite(progress);
  const percent = hasProgress ? Math.min(100, Math.max(0, progress)) : null;
  const isError = status === "error";


  // 화면 이동은 effect에서 처리합니다.
  return (
    <CalculatingContent
      setPage={setPage}
      status={status}
      percent={percent}
      isError={isError}
      onRetry={onRetry}
    />
  );
}

function CalculatingContent({ setPage, status, percent, isError, onRetry }: CalculatingContentProps) {
  // 계산 성공 시 결과 화면으로 이동
  useEffect(() => {
    if (status === "success") setPage("CashRunway");
  }, [status, setPage]);


  return (
    <div className="calculator-container">
      {/* 상단 로고와 알림 아이콘 */}
      <header className="calculator-header">
        <button
          type="button"
          className="calculator-back"
          aria-label="홈 화면으로 돌아가기"
          onClick={() => setPage("HomePage")}
        >
          ←
        </button>

        <img src={logoName} alt="BUTILL" className="calculator-logo" />
        <span className="calculator-notification" role="img" aria-label="알림">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
          <span className="calculator-notification-dot" />
        </span>
      </header>

      <main className="calculator-content">
        {/* 계산 진행 상태 또는 오류 안내 */}
        <section className="calculator-message" aria-live="polite">
          {/* 진행률을 표시하는 원형 영역 */}
          <div
            className={`calculator-circle${percent === null && !isError ? " calculator-circle-indeterminate" : ""}`}
            role={!isError ? "progressbar" : undefined}
            aria-label={!isError ? "현금 흐름 계산 진행률" : undefined}
            aria-valuemin={!isError ? 0 : undefined}
            aria-valuemax={!isError ? 100 : undefined}
            aria-valuenow={!isError && percent !== null ? Math.round(percent) : undefined}
          >
            {/* 배경 원과 진행률에 따라 길이가 달라지는 테두리 */}
            <svg className="calculator-ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle className="calculator-ring-track" cx="50" cy="50" r="43" />
              <circle
                className="calculator-ring-fill"
                cx="50" cy="50" r="43"
                pathLength="100"
                strokeDasharray={isError ? "90 100" : percent === null ? "25 100" : `${percent} 100`}
              />
            </svg>
            {/* 원 안에 진행률 또는 오류 표시 */}
            <div className="calculator-circle-label">
              {isError ? (
                <><span className="calculator-error-icon" aria-hidden="true">!</span><span>계산 일시 중지</span></>
              ) : (
                <><strong>{percent === null ? "계산 중" : `${Math.round(percent)}%`}</strong><span>정밀 분석 중</span></>
              )}
            </div>
          </div>

          {/* 오류 여부에 따라 제목과 설명 변경 */}
          {isError ? (
            <>
              <h1>현금 흐름 계산 중<br />문제가 발생했어요</h1>
              <p>일시적인 네트워크 지연 또는 거래 데이터<br />정밀 대조 과정에서 처리가 지연되었을 수 있어요.<br />잠시 후 다시 시도해주세요.</p>
            </>
          ) : (
            <>
              <h1>사장님의 12개월 현금 흐름을<br />정밀하게 계산하고 있어요</h1>
              <p>통장 잔고와 매월 나갈 돈을 꼼꼼하게<br />대조 중입니다. 잠시만 기다려 주세요.</p>
            </>
          )}
        </section>

        {/* 오류 발생 시 재시도와 홈 이동 버튼 표시 */}
        {isError && (
          <div className="calculator-actions">
            <button type="button" className="calculator-retry" onClick={onRetry} disabled={!onRetry}>
              <span aria-hidden="true">⟳</span> 현금흐름 다시 계산하기
            </button>
            <button type="button" className="calculator-home" onClick={() => setPage("HomePage")}>
              홈 화면으로 돌아가기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default CalculatingPage;
