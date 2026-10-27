import { useState } from "react";
import { useAccount } from "../lib/Account";
import { auth } from "../lib/api";
import {
  SettingsPage,
  ProfileSettingsPage,
  FundsSettingsPage,
  businessTypes,
} from "./SettingsPage";

export default function StoreSettings() {
  const account = useAccount();
  const store = account.store!;
  const input = account.finance!.input;
  const meta = account.session?.user.user_metadata ?? {};
  const profile = meta.store_profiles?.[store.id] ?? meta;
  const category = String(
    profile.business_category ??
      (store.business_type === "cafe" ? businessTypes[0] : businessTypes[1]),
  );
  const [page, setPage] = useState<"summary" | "profile" | "funds">("summary");
  const [name, setName] = useState(
    String(profile.representative_name ?? meta.display_name ?? ""),
  );
  const [status, setStatus] = useState(store.status);
  const [storeName, setStoreName] = useState(store.name);
  const [kind, setKind] = useState(
    businessTypes.includes(category) ? category : businessTypes[7],
  );
  const [custom, setCustom] = useState(
    businessTypes.includes(category) ? "" : category,
  );
  const [district, setDistrict] = useState(
    store.region.replace(/^서울(?:시|특별시)?\s*/, ""),
  );
  const [cash, setCash] = useState(String(input.current_cash));
  const [rate, setRate] = useState(
    input.current_cash > 0
      ? (input.reserve_cash / input.current_cash) * 100
      : 0,
  );
  const [fundsChanged, setFundsChanged] = useState(false);
  const reserve = fundsChanged
    ? Math.round((Number(cash.replace(/,/g, "")) * rate) / 100)
    : input.reserve_cash;
  const reset = () => {
    setName(String(profile.representative_name ?? meta.display_name ?? ""));
    setStoreName(store.name);
    setStatus(store.status);
    setKind(businessTypes.includes(category) ? category : businessTypes[7]);
    setCustom(businessTypes.includes(category) ? "" : category);
    setDistrict(store.region.replace(/^서울(?:시|특별시)?\s*/, ""));
    setCash(String(input.current_cash));
    setRate(
      input.current_cash > 0
        ? (input.reserve_cash / input.current_cash) * 100
        : 0,
    );
    setFundsChanged(false);
  };
  const saveProfile = async () => {
    const cat = kind === businessTypes[7] ? custom.trim() : kind;
    if (
      !name.trim() ||
      name.trim().length > 100 ||
      !storeName.trim() ||
      storeName.trim().length > 100 ||
      !cat ||
      cat.length > 100 ||
      !district.trim()
    )
      throw new Error(
        "대표자명·매장명·업종·지역을 확인해주세요. 이름과 업종은 100자 이내로 입력해주세요.",
      );
    if (!auth) throw new Error("다시 로그인해주세요.");
    const result = await auth.auth.updateUser({
      data: {
        store_profiles: {
          ...meta.store_profiles,
          [store.id]: {
            representative_name: name.trim(),
            business_category: cat,
          },
        },
      },
    });
    if (result.error)
      throw new Error("대표자 정보를 저장하지 못했습니다. 다시 시도해주세요.");
    try {
      await account.saveStore({
        name: storeName.trim(),
        region:
          district === store.region.replace(/^서울(?:시|특별시)?\s*/, "")
            ? store.region
            : `서울 ${district.trim()}`,
        business_type:
          cat.includes("카페") || cat.includes("베이커리")
            ? "cafe"
            : "restaurant",
        status,
      });
    } catch (e) {
      throw new Error(
        `대표자 정보는 저장됐지만 매장 정보 저장에 실패했습니다. ${e instanceof Error ? e.message : "다시 시도해주세요."}`,
      );
    }
    return "사업장 정보가 저장되었습니다.";
  };
  const saveFunds = async () => {
    const raw = cash.replace(/,/g, "");
    const total = Number(raw);
    if (
      !/^\d+$/.test(raw) ||
      !Number.isSafeInteger(total) ||
      total > 1e12 ||
      !Number.isSafeInteger(reserve) ||
      reserve < 0 ||
      reserve > 1e12
    )
      throw new Error("보유자금은 0~1조 원 사이의 정수로 입력해주세요.");
    return account.save({
      ...input,
      current_cash: total,
      reserve_cash: reserve,
    });
  };
  return (
    <>
      {page !== "summary" && (
        <button
          className="settings-back"
          onClick={() => {
            reset();
            setPage("summary");
          }}
        >
          ← 설정으로
        </button>
      )}
      {page === "summary" ? (
        <SettingsPage
          onEditProfile={() => {
            reset();
            setPage("profile");
          }}
          onEditFunds={() => {
            reset();
            setPage("funds");
          }}
          businessName={String(
            profile.representative_name ?? meta.display_name ?? "미입력",
          )}
          businessType={category}
          customBusinessType=""
          district={store.region}
          totalFunds={String(input.current_cash)}
          reserveRate={
            input.current_cash > 0
              ? (input.reserve_cash / input.current_cash) * 100
              : 0
          }
          reserveCash={input.reserve_cash}
          investment={input.unpaid_initial_investment}
          runwayAlert={false}
          setRunwayAlert={() => {}}
          ingredientAlert={false}
          setIngredientAlert={() => {}}
        />
      ) : page === "profile" ? (
        <ProfileSettingsPage
          status={status}
          setStatus={setStatus}
          businessName={name}
          setBusinessName={setName}
          storeName={storeName}
          setStoreName={setStoreName}
          businessType={kind}
          setBusinessType={setKind}
          customBusinessType={custom}
          setCustomBusinessType={setCustom}
          district={district}
          setDistrict={setDistrict}
          onSave={saveProfile}
        />
      ) : (
        <FundsSettingsPage
          totalFunds={cash}
          setTotalFunds={(v) => {
            setCash(v);
            setFundsChanged(true);
          }}
          reserveRate={rate}
          setReserveRate={(v) => {
            setRate(v);
            setFundsChanged(true);
          }}
          reserveCash={reserve}
          investment={input.unpaid_initial_investment}
          initialFunds={String(input.current_cash)}
          onSave={saveFunds}
        />
      )}
    </>
  );
}
