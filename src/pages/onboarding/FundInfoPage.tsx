import { useState, useEffect } from "react";
import type { SetPage } from "../../types/navigation";
import logoName from "../../assets/logoName.png";
import "./FundInfoPage.css";
import { useAccount } from "../../lib/account";
import { categories, toBusinessType } from "../../data/businessOptions";
import type { AnalysisInput } from "../../types/api";

function FundInfoPage({ setPage }: { setPage: SetPage }) {
  const account = useAccount();
  const [saving, setSaving] = useState(false);

  // 스낵바 상태
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  // 1. 대표자 기본 정보
  const [ownerName, setOwnerName] = useState(
    () => localStorage.getItem("information2_ownerName") ?? ""
  );

  // 2. 보유 운영자금 및 완충 자금
  const [operatingFund, setOperatingFund] = useState(
    () => localStorage.getItem("information2_operatingFund") ?? ""
  );

  const [emergencyRate, setEmergencyRate] = useState(
    () => Number(localStorage.getItem("information2_emergencyRate") ?? 10)
  );

  // 3. 월 고정 지출
  const [rent, setRent] = useState(
    () => localStorage.getItem("information2_rent") ?? ""
  );

  const [laborCost, setLaborCost] = useState(
    () => localStorage.getItem("information2_laborCost") ?? ""
  );

  const [managementCost, setManagementCost] = useState(
    () => localStorage.getItem("information2_managementCost") ?? ""
  );

  const [loanPayment, setLoanPayment] = useState(
    () => localStorage.getItem("information2_loanPayment") ?? ""
  );

  // 입력값 변경 시 자동 저장
  useEffect(() => {
    localStorage.setItem("information2_ownerName", ownerName);
    localStorage.setItem("information2_operatingFund", operatingFund);
    localStorage.setItem("information2_emergencyRate", String(emergencyRate));
    localStorage.setItem("information2_rent", rent);
    localStorage.setItem("information2_laborCost", laborCost);
    localStorage.setItem("information2_managementCost", managementCost);
    localStorage.setItem("information2_loanPayment", loanPayment);
  }, [ 
    ownerName, operatingFund,emergencyRate,rent,laborCost,managementCost,loanPayment
  ]);

  // 스낵바 2초 후 자동 닫기
  useEffect(() => {
    if (!snackbarMessage) return;

    const timer = setTimeout(() => {
      setSnackbarMessage("");
    }, 1000);

    return () => clearTimeout(timer);
  }, [snackbarMessage]);


  // 숫자에 쉼표 추가
  const formatMoney = (value: string | number) => {
    return Number(value || 0).toLocaleString("ko-KR");
  };

  // 숫자만 입력받기
  const handleMoneyChange = (value: string, setter: (value: string) => void) => {
    const onlyNumbers = value.replace(/[^0-9]/g, "");
    setter(onlyNumbers);
  };

  // 비상 운영자금 계산
  const emergencyFund = Math.round(
    Number(operatingFund) * emergencyRate / 100
  );

  // 예상 월 고정 지출 합계
  const totalFixedCost =Number(rent) + Number(laborCost) +Number(managementCost) + Number(loanPayment);
 
  // 이전 단계 이동
  const handleBack = () => {
    setPage("Information");
  };

  // 다음 단계 이동
  const handleNext = async () => {
    if (saving) return;

    // 대표자명 입력 확인
    if (!ownerName.trim()) {
      setSnackbarMessage("대표자 이름을 입력해주세요.");
      return;
    }

    // 보유 운영자금 입력 확인
    if (operatingFund === "") {
      setSnackbarMessage("현재 보유 운영자금을 입력해주세요.");
      return;
    }

    // 이전 단계(사업장 기초정보) 선택값
    const businessStatus = localStorage.getItem("businessStatus") ?? "";
    const region = localStorage.getItem("selectedRegion") ?? "";
    const categoryId = localStorage.getItem("selectedCategory") ?? "";
    if (!businessStatus || !region || !categoryId) {
      setSnackbarMessage("이전 단계에서 비즈니스 상태·지역·업종을 선택해주세요.");
      return;
    }

    // 분석 시작 월은 이번 달
    const now = new Date();
    const startMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const input: AnalysisInput = {
      start_month: startMonth,
      months: 12,
      current_cash: Number(operatingFund),
      reserve_cash: emergencyFund,
      unpaid_initial_investment: 0,
      // 매출·원재료비는 입력/관리 화면에서 입력
      monthly_sales: 0,
      monthly_ingredient_cost: 0,
      fixed_expenses: [
        { name: "임대료", amount: Number(rent) },
        { name: "인건비", amount: Number(laborCost) },
        { name: "관리비", amount: Number(managementCost) },
        { name: "금융비용", amount: Number(loanPayment) },
      ],
      irregular_expenses: [],
      monthly_overrides: [],
    };

    setSaving(true);
    try {
      await account.onboard(
        {
          name: `${ownerName.trim()}의 매장`.slice(0, 100),
          business_type: toBusinessType(categoryId),
          region: `서울 ${region}`,
          status: businessStatus === "running" ? "operating" : "planning",
        },
        input,
        {
          representative_name: ownerName.trim(),
          business_category: categories.find((c) => c.id === categoryId)?.name ?? categoryId,
          emergency_rate: String(emergencyRate),
        },
      );
    } catch (e) {
      setSnackbarMessage(e instanceof Error ? e.message : "저장하지 못했습니다. 다시 시도해주세요.");
      return;
    } finally {
      setSaving(false);
    }

    setSnackbarMessage("");
    setPage("Introduction");
  };


  return (
    <div className="information2-background">
      <div className="information2-container">

        {/* 상단 헤더 */}
        <header className="information2-header">
          <button
            type="button"
            className="information2-back"
            onClick={handleBack}
          >
            ←
          </button>

          <img
            src={logoName}
            alt="BUTILL"
            className="information2-logo"
          />
        </header>

        {/* 진행바 */}
        <div className="information2-progress">
          <div className="information2-progress-fill"></div>
        </div>

        {/* 메인 내용 */}
        <main className="information2-content">

          {/* 화면 제목 */}
          <div className="information2-title">
            <h2>사업장 기초 정보 설정</h2>
            <p className="information2-subtitle">
              자금 흐름을 정확히 예측하기 위해
              <br />
              필수 정보를 입력해 주세요.
            </p>
          </div>


          {/* 1. 대표자 기본 정보 */}
          <section className="information2-section">

            <div className="information2-section-title">
              <div className="information2-section-left">
                <span className="information2-step">1</span>
                <h3>대표자 기본 정보</h3>
              </div>

              <span className="information2-required">
                필수 입력
              </span>
            </div>

            <div className="information2-field">
              <label htmlFor="ownerName">대표자명</label>

              <div className="information2-input-box">
                <span className="information2-input-icon">♙</span>

                <input
                  id="ownerName"
                  type="text"
                  placeholder="홍길동"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
            </div>
          </section>


          {/* 2. 보유 운영자금 및 완충 자금 */}
          <section className="information2-section">

            <div className="information2-section-title">
              <div className="information2-section-left">
                <span className="information2-step">2</span>
                <h3>보유 운영 자금 및 완충 자금</h3>
              </div>
            </div>

            {/* 현재 보유 운영자금 */}
            <div className="information2-card">
              <div className="information2-field">
                <label htmlFor="operatingFund">
                  현재 보유 운영자금
                </label>

                <p className="information2-description">
                  사업용 통장 잔고 및 즉시 출금 가능한 비상금
                </p>

                <div className="information2-money-input">
                  <input
                    id="operatingFund"
                    type="text"
                    inputMode="numeric"
                    placeholder="25,000,000"
                    value={
                      operatingFund === ""
                        ? ""
                        : formatMoney(operatingFund)
                    }
                    onChange={(e) =>
                      handleMoneyChange(
                        e.target.value,
                        setOperatingFund
                      )
                    }
                  />

                  <span>원</span>
                </div>
              </div>
            </div>


            {/* 비상 운영자금 비율 선택 */}
            <div className="information2-card">

              <div className="information2-emergency-header">
                <label>비상 완충 비율 선택</label>

                <span>
                  기준 보유액 {formatMoney(Math.floor(Number(operatingFund || 0) / 10000))}만원
                </span>
              </div>

              {/* 비율 선택 버튼 */}
              <div className="information2-rate-buttons">
                {[5, 10, 15, 20].map((rate) => (
                  <button
                    type="button"
                    key={rate}
                    className={
                      emergencyRate === rate
                        ? "information2-rate selected"
                        : "information2-rate"
                    }
                    onClick={() => setEmergencyRate(rate)}
                  >
                    <span>{rate}%</span>

                    {rate === 10 && (
                      <small>권장</small>
                    )}
                  </button>
                ))}
              </div>

              {/* 설정 예비자금 안내 */}
              <div className="information2-emergency-info">

                <span className="information2-emergency-icon">
                  🛡
                </span>

                <div className="information2-emergency-text">
                  <p className="information2-emergency-amount">
                    설정 예비자금: {formatMoney(emergencyFund)}원
                  </p>

                  <p className="information2-emergency-description">
                    보유자금의 {emergencyRate}%를 비상금으로 보존하여
                    급작스러운 매출 하락에 대응합니다.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* 3. 월 고정 지출 */}
          <section className="information2-section">

            <div className="information2-section-title">
              <div className="information2-section-left">
                <span className="information2-step">3</span>
                <h3>월 고정 지출</h3>
              </div>

              <span className="information2-required">
                나중에 입력해도 돼요
              </span>
            </div>

            {/* 월 사업장 임대료 */}
            <div className="information2-field">
              <label htmlFor="rent">
                월 사업장 임대료 (월세)
              </label>

              <div className="information2-input-box">
                <span className="information2-input-icon">▤</span>

                <input
                  id="rent"
                  type="text"
                  inputMode="numeric"
                  placeholder="1,500,000"
                  value={rent === "" ? "" : formatMoney(rent)}
                  onChange={(e) =>
                    handleMoneyChange(e.target.value, setRent)
                  }
                />

                <span className="information2-unit">원/월</span>
              </div>
            </div>

            {/* 월 인건비 */}
            <div className="information2-field">
              <label htmlFor="laborCost">
                월 인건비 (직원 및 파트타이머 급여)
              </label>

              <div className="information2-input-box">
                <span className="information2-input-icon">♧</span>

                <input
                  id="laborCost"
                  type="text"
                  inputMode="numeric"
                  placeholder="3,200,000"
                  value={
                    laborCost === ""
                      ? ""
                      : formatMoney(laborCost)
                  }
                  onChange={(e) =>
                    handleMoneyChange(e.target.value, setLaborCost)
                  }
                />

                <span className="information2-unit">원/월</span>
              </div>
            </div>

            {/* 월 관리비 */}
            <div className="information2-field">
              <label htmlFor="managementCost">
                월 관리금 및 관리비 (전기, 수도, 가스, 인터넷)
              </label>

              <div className="information2-input-box">
                <span className="information2-input-icon">▣</span>

                <input
                  id="managementCost"
                  type="text"
                  inputMode="numeric"
                  placeholder="450,000"
                  value={
                    managementCost === ""
                      ? ""
                      : formatMoney(managementCost)
                  }
                  onChange={(e) =>
                    handleMoneyChange(
                      e.target.value,
                      setManagementCost
                    )
                  }
                />

                <span className="information2-unit">원/월</span>
              </div>
            </div>

            {/* 월 금융비용 */}
            <div className="information2-field">
              <label htmlFor="loanPayment">
                월 금융비용 및 대출 원리금 상환액
              </label>

              <div className="information2-input-box">
                <span className="information2-input-icon">♙</span>

                <input
                  id="loanPayment"
                  type="text"
                  inputMode="numeric"
                  placeholder="800,000"
                  value={
                    loanPayment === ""
                      ? ""
                      : formatMoney(loanPayment)
                  }
                  onChange={(e) =>
                    handleMoneyChange(
                      e.target.value,
                      setLoanPayment
                    )
                  }
                />

                <span className="information2-unit">원/월</span>
              </div>
            </div>

            {/* 예상 월 고정 지출 합계 */}
            <div className="information2-total">
              <span>예상 월 고정 지출 합계</span>

              <strong>
                월 {formatMoney(totalFixedCost)}원
              </strong>
            </div>
          </section>

          {/* 다음 단계 버튼 */}
          <button
            type="button"
            className="information2-next-button"
            onClick={handleNext}
          >
            다음 단계 →
          </button>

          {/* 입력 오류 스낵바 */}
          {snackbarMessage && (
            <div className="information2-snackbar" role="alert">
              <span className="information2-snackbar-icon">ⓘ</span>
              <span>{snackbarMessage}</span>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default FundInfoPage;

