import { useState, type Dispatch, type SetStateAction } from "react";
import MoneyInput from "../components/MoneyInput";
import "./SettingsPage.css";

export type SettingsProps = {
  onEditProfile: () => void;
  onEditFunds: () => void;
  businessName: string;
  businessType: string;
  district: string;
  totalFunds: string;
  reserveRate: number;
  runwayAlert: boolean;
  setRunwayAlert: Dispatch<SetStateAction<boolean>>;
  ingredientAlert: boolean;
  setIngredientAlert: Dispatch<SetStateAction<boolean>>;
  customBusinessType: string;
  reserveCash?: number;
  investment?: number;
};

export const businessTypes = [
  "카페 · 디저트",
  "한식 일반 · 백반",
  "일식 · 돈까스 · 회",
  "양식 · 패스트푸드",
  "주점 · 이자카야 · 펍",
  "베이커리 · 디저트",
  "치킨 · 피자 배달 전문",
  "기타 요식업 직접 입력",
];

const seoulDistricts = [
  "강남구",
  "강동구",
  "강북구",
  "강서구",
  "관악구",
  "광진구",
  "구로구",
  "금천구",
  "노원구",
  "도봉구",
  "동대문구",
  "동작구",
  "마포구",
  "서대문구",
  "서초구",
  "성동구",
  "성북구",
  "송파구",
  "양천구",
  "영등포구",
  "용산구",
  "은평구",
  "종로구",
  "중구",
  "중랑구",
];

export function SettingsPage(props: SettingsProps) {
  const total = Number(props.totalFunds.replace(/[^0-9]/g, "")) || 0;
  const reserve =
    props.reserveCash ?? Math.round((total * props.reserveRate) / 100);
  const available = total - reserve - (props.investment ?? 0);

  return (
    <section className="settings-page">
      <p className="settings-lead">
        초기에 입력하신 정보를 수정하시면 런웨이와
        <br />
        저장 후 분석 결과에 반영됩니다.
      </p>
      <section className="settings-card profile-summary-card">
        <div className="settings-card-heading">
          <h1>사업장 기본 정보</h1>
          <button onClick={props.onEditProfile}>수정</button>
        </div>
        <div className="settings-info-row">
          <span>
            <img src="/settings-icons/person.png" alt="" /> 대표자
          </span>
          <b>{props.businessName}</b>
        </div>
        <div className="settings-info-row">
          <span>
            <img src="/settings-icons/business-type.png" alt="" /> 희망/영업
            업종
          </span>
          <b>
            {props.businessType === "기타 요식업 직접 입력" &&
            props.customBusinessType
              ? props.customBusinessType
              : props.businessType}
          </b>
        </div>
        <div className="settings-info-row">
          <span>
            <img src="/settings-icons/location.png" alt="" /> 상권 위치
          </span>
          <b>{props.district}</b>
        </div>
      </section>

      <section className="settings-card funds-summary-card">
        <div className="settings-card-heading">
          <h1>보유 자금 및 비상 완충금</h1>
          <button onClick={props.onEditFunds}>수정</button>
        </div>
        <p>총 보유 운영자금 (비상금 포함)</p>
        <div className="funds-total">
          <img src="/settings-icons/funds.png" alt="" />
          <b>{total.toLocaleString("ko-KR")}</b>
        </div>
        <p className="reserve-summary-label">비상 완충금 비율</p>
        <div className="reserve-summary">
          <strong>{Number(props.reserveRate.toFixed(2))}%</strong>
          <b>{reserve.toLocaleString("ko-KR")}원</b>
        </div>
        <div className="available-summary">
          <span>
            실제 가용 운영자금<small>완충금·미지급 초기 투자비 제외</small>
          </span>
          <b>{available.toLocaleString("ko-KR")}원</b>
        </div>
      </section>

      <section className="settings-card alert-settings-card">
        <h1>앱 환경 및 위기 알림 설정</h1>
        <SettingsToggle
          title="런웨이 2개월 미만 진입 알림"
          description="준비 중 · 카카오 알림톡은 아직 발송되지 않습니다"
          checked={props.runwayAlert}
          onChange={() => props.setRunwayAlert((value) => !value)}
        />
        <SettingsToggle
          title="KAMIS 원재료 급등 실시간 알림"
          description="준비 중 · 가격 수집 및 알림 연결 예정"
          checked={props.ingredientAlert}
          onChange={() => props.setIngredientAlert((value) => !value)}
        />
      </section>
    </section>
  );
}

function SettingsToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="settings-toggle-row">
      <div>
        <b>{title}</b>
        <small>{description}</small>
      </div>
      <button
        className={`toggle-switch${checked ? " on" : ""}`}
        disabled
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}

function SaveSettingsButton({
  label,
  onSave,
}: {
  label: string;
  onSave: () => Promise<string>;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="settings-save-wrap">
      {message && <p role="status">{message}</p>}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={busy}
        className="settings-save"
        onClick={async () => {
          if (busy) return;
          setBusy(true);
          setMessage("");
          setError("");
          try {
            setMessage(await onSave());
          } catch (e) {
            setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "저장 중…" : label}
      </button>
    </div>
  );
}

type ProfileSettingsPageProps = {
  onSave: () => Promise<string>;
  status: "planning" | "operating";
  setStatus: Dispatch<SetStateAction<"planning" | "operating">>;
  storeName: string;
  setStoreName: Dispatch<SetStateAction<string>>;
  businessName: string;
  setBusinessName: Dispatch<SetStateAction<string>>;
  businessType: string;
  setBusinessType: Dispatch<SetStateAction<string>>;
  customBusinessType: string;
  setCustomBusinessType: Dispatch<SetStateAction<string>>;
  district: string;
  setDistrict: Dispatch<SetStateAction<string>>;
};

export function ProfileSettingsPage({
  status,
  setStatus,
  onSave,
  storeName,
  setStoreName,
  businessName,
  setBusinessName,
  businessType,
  setBusinessType,
  customBusinessType,
  setCustomBusinessType,
  district,
  setDistrict,
}: ProfileSettingsPageProps) {
  return (
    <section className="settings-edit-page">
      <form
        onSubmit={(event) => event.preventDefault()}
        className="settings-edit-form"
      >
        <div className="profile-edit-card">
          <label className="profile-name-label">
            대표자명
            <div>
              <img src="/settings-icons/person.png" alt="" />
              <input
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
              />
            </div>
          </label>
          <label className="profile-name-label settings-store-name">
            매장명
            <div>
              <input
                maxLength={100}
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
          </label>
          <label className="profile-name-label settings-store-name">
            운영 상태
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "planning" | "operating")
              }
            >
              <option value="planning">창업 준비 중</option>
              <option value="operating">운영 중</option>
            </select>
          </label>
          <h2>희망 / 영업 업종</h2>
          <div className="industry-grid">
            {businessTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={businessType === type ? "chosen" : ""}
                onClick={() => setBusinessType(type)}
              >
                {type}
                {businessType === type && <i>✓</i>}
              </button>
            ))}
          </div>
          {businessType === "기타 요식업 직접 입력" && (
            <label className="custom-industry-input">
              업종을 직접 입력해주세요
              <input
                autoFocus
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="예: 반찬가게, 분식점 등"
                value={customBusinessType}
                onChange={(event) => setCustomBusinessType(event.target.value)}
              />
            </label>
          )}
          <h2 className="district-heading">상권 위치</h2>
          <div className="district-grid">
            {seoulDistricts.map((name) => (
              <button
                key={name}
                type="button"
                className={district === name ? "chosen" : ""}
                onClick={() => setDistrict(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <SaveSettingsButton label="수정 완료" onSave={onSave} />
      </form>
    </section>
  );
}

type FundsSettingsPageProps = {
  onSave: () => Promise<string>;
  initialFunds: string;
  investment: number;
  reserveCash: number;
  totalFunds: string;
  setTotalFunds: Dispatch<SetStateAction<string>>;
  reserveRate: number;
  setReserveRate: Dispatch<SetStateAction<number>>;
};

export function FundsSettingsPage({
  onSave,
  initialFunds,
  investment,
  reserveCash,
  totalFunds,
  setTotalFunds,
  reserveRate,
  setReserveRate,
}: FundsSettingsPageProps) {
  const total = Number(totalFunds.replace(/[^0-9]/g, "")) || 0;
  const reserve = reserveCash;
  const available = total - reserve - investment;
  const adjustFunds = (amount: number) =>
    setTotalFunds(
      Math.min(
        1e12,
        Number(totalFunds.replace(/[^0-9]/g, "")) + amount,
      ).toString(),
    );

  return (
    <section className="settings-edit-page funds-edit-page">
      <article className="funds-edit-card">
        <h1>보유 자금 및 비상 완충금</h1>
        <label className="funds-input-label">
          총 보유 운영자금 (비상금 포함)
          <MoneyInput
            label="총 보유 운영자금 (비상금 포함)"
            value={totalFunds}
            onChange={setTotalFunds}
          />
        </label>
        <div className="funds-presets">
          {[
            [1000000, "+100만"],
            [5000000, "+500만"],
            [10000000, "+1,000만"],
          ].map(([amount, label]) => (
            <button key={label} onClick={() => adjustFunds(Number(amount))}>
              {label}
            </button>
          ))}
          <button onClick={() => setTotalFunds(initialFunds)}>원복</button>
        </div>
        <div className="reserve-editor">
          <div className="reserve-editor-heading">
            <span>비상 완충금 비율</span>
            <b>
              {Number(reserveRate.toFixed(2))}% (
              {reserve.toLocaleString("ko-KR")}원)
            </b>
          </div>
          <div className="reserve-rate-grid">
            {[5, 10, 15, 20].map((rate) => (
              <button
                key={rate}
                className={reserveRate === rate ? "selected" : ""}
                onClick={() => setReserveRate(rate)}
              >
                <b>{rate}%</b>
                <small>
                  {Math.round((total * rate) / 100).toLocaleString("ko-KR")}원
                </small>
              </button>
            ))}
          </div>
        </div>
        <div className="funds-result">
          <div className="funds-result-top">
            <span>
              <b>실제 가용 운영자금</b>
              <small>
                완충금·미지급 투자비 제외
                <br />
                순수 방어 자금
              </small>
            </span>
            <strong>{available.toLocaleString("ko-KR")}원</strong>
          </div>
          <p>
            <img src="/settings-icons/reserve.png" alt="" />
            <b>{reserve.toLocaleString("ko-KR")}원</b>은 급격한 매출 감소,
            부가세 납부 등에 대비해 계산에서 제외하는 금액입니다.
          </p>
        </div>
      </article>
      <SaveSettingsButton label="수정 완료" onSave={onSave} />
    </section>
  );
}
