import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Toast from "../../components/Toast";

// 화면에서 다루는 항목의 이름과 금액
export type ManageItem = {
  id: number;
  name: string;
  amount: string;
  due?: string;
  description?: string;
};

// 탭 표시 여부와 전환 상태를 전달하는 속성
type ManagementPanelProps = {
  active: boolean;
  leaving: boolean;
  saved: boolean;
  setSaved: (value: boolean) => void;
  saveMessage: string;
};

// 상단 안내 카드의 표시와 닫기 상태
type ManagementIntroProps = {
  introVisible: boolean;
  introClosing: boolean;
  dismissIntro: () => void;
};

// 빈 입력 항목을 목록에 추가
const addItem = (
  setter: Dispatch<SetStateAction<ManageItem[]>>,
  defaults: Partial<Pick<ManageItem, "due" | "description" | "amount">> = {},
) => {
  setter((items) => [
    ...items,
    {
      id: Date.now(),
      name: "",
      amount: "0",
      ...defaults,
    },
  ]);
};

// 선택한 항목의 입력값만 변경
const updateItem = (
  setter: Dispatch<SetStateAction<ManageItem[]>>,
  id: number,
  key: "name" | "amount" | "due" | "description",
  value: string,
) =>
  setter((items) =>
    items.map((item) =>
      item.id === id
        ? {
            ...item,
            [key]: value,
          }
        : item,
    ),
  );

// 선택한 항목을 목록에서 삭제
const removeItem = (
  setter: Dispatch<SetStateAction<ManageItem[]>>,
  id: number,
) => setter((items) => items.filter((item) => item.id !== id));

// 쉼표가 포함된 입력 금액을 계산용 숫자로 변환
const amountValue = (value: string) =>
  Number(value.replace(/[^0-9]/g, "")) || 0;

// 목록에 있는 항목의 금액을 합산
const total = (items: ManageItem[]) =>
  items.reduce((sum, item) => sum + amountValue(item.amount), 0);
type MaterialsTabProps = ManagementPanelProps &
  ManagementIntroProps & {
    materials: ManageItem[];
    setMaterials: Dispatch<SetStateAction<ManageItem[]>>;
    // 서버에서 불러온 원재료(저장된 카드로 표시)
    initialSavedIds: number[];
    onSave: () => void;
  };

// 첫 번째 탭: 원재료비 입력 및 수정
export default function MaterialsTab({
  active,
  leaving,
  saved,
  saveMessage,
  introVisible,
  introClosing,
  dismissIntro,
  materials,
  setMaterials,
  initialSavedIds,
  onSave,
}: MaterialsTabProps) {
  // 저장 후 메뉴판 제목으로 이동하기 위한 참조
  const storeMenuHeading = useRef<HTMLHeadingElement>(null);

  // 저장한 순서와 수정 중인 원재료를 따로 관리
  const [savedMaterialIds, setSavedMaterialIds] = useState<number[]>(initialSavedIds);
  const [editingMaterialIds, setEditingMaterialIds] = useState<number[]>([]);

  // 입력 중인 카드를 먼저, 저장한 카드를 아래에 표시
  const materialDrafts = materials.filter(
    (item) => !savedMaterialIds.includes(item.id),
  );
  const savedMaterials = savedMaterialIds.flatMap((id) =>
    materials.filter((item) => item.id === id),
  );
  const orderedMaterials = [...materialDrafts, ...savedMaterials];

  // 원재료비를 중간 저장하고 우리 가게 메뉴판으로 이동
  const saveMaterial = (id: number) => {
    setSavedMaterialIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    setEditingMaterialIds((ids) => ids.filter((editingId) => editingId !== id));
    window.requestAnimationFrame(() => {
      storeMenuHeading.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
      });
    });
  };

  // 실제 사용하는 원재료의 입력값, 저장 목록과 삭제 상태
  const [ingredientNames, setIngredientNames] = useState("");
  const [savedIngredients, setSavedIngredients] = useState<string[]>([]);
  const [ingredientsSaved, setIngredientsSaved] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<string | null>(
    null,
  );

  // 쉼표로 구분한 원재료를 저장하고 입력칸을 비움
  const saveIngredients = () => {
    const names = ingredientNames
      .split(/[,，\n]/)
      .map((name) => name.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    setSavedIngredients((ingredients) => [
      ...new Set([...ingredients, ...names]),
    ]);
    setIngredientNames("");
    setIngredientToDelete(null);
    setIngredientsSaved(true);
  };
  if (!active) return null;
  return (
    <div
      data-management-panel="1"
      className={
        leaving ? "management-tab-panel is-leaving" : "management-tab-panel"
      }
    >
      {/* 원재료 입력 안내 카드 */}
      {introVisible && (
        <section
          className={`management-intro intro${introClosing ? " intro-closing" : ""}`}
        >
          <div>
            <h1>주요 원재료 입력 및 관리</h1>
            <p>
              매달 주기적으로 지출되는 주요 재료 및 원가 항목을 등록·수정하여
              자금 고갈 시점을 정밀하게 예측하세요.
            </p>
          </div>
          <button aria-label="안내 닫기" onClick={dismissIntro}>
            ×
          </button>
        </section>
      )}

      {/* 원재료별 메뉴명, 금액과 중간 저장 */}
      <div className="management-item-list">
        {orderedMaterials.map((item) => {
          const index = materials.findIndex(
            (material) => material.id === item.id,
          );
          const isSaved = savedMaterialIds.includes(item.id);
          const isReadOnly = isSaved && !editingMaterialIds.includes(item.id);
          return (
            <article className="management-item material-entry" key={item.id}>
              <div className="management-item-title">
                <b>원재료 {index + 1}</b>

                <button
                  aria-label={`원재료 ${index + 1} 삭제`}
                  onClick={() => {
                    removeItem(setMaterials, item.id);
                    setSavedMaterialIds((ids) =>
                      ids.filter((id) => id !== item.id),
                    );
                    setEditingMaterialIds((ids) =>
                      ids.filter((id) => id !== item.id),
                    );
                  }}
                >
                  <img src="/management-icons/delete.svg" alt="" />
                </button>
              </div>

              {isReadOnly ? (
                <div>
                  <p>
                    메뉴명 <strong>{item.name || "미입력"}</strong>
                  </p>
                  <p>
                    메뉴별 원재료비{" "}
                    <strong>
                      {amountValue(item.amount).toLocaleString("ko-KR")}원
                    </strong>
                  </p>
                </div>
              ) : (
                <>
                  <label>
                    메뉴명
                    <input
                      value={item.name}
                      placeholder="메뉴명 입력"
                      onChange={(event) =>
                        updateItem(
                          setMaterials,
                          item.id,
                          "name",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    메뉴별 원재료비
                    <div className="currency-field">
                      <input
                        inputMode="numeric"
                        value={item.amount}
                        placeholder="0"
                        onChange={(event) =>
                          updateItem(
                            setMaterials,
                            item.id,
                            "amount",
                            event.target.value,
                          )
                        }
                      />
                      <span>원</span>
                    </div>
                  </label>
                </>
              )}

              <div className="material-save-actions">
                <button
                  type="button"
                  className="material-save-button"
                  onClick={() => {
                    if (isReadOnly)
                      setEditingMaterialIds((ids) => [...ids, item.id]);
                    else saveMaterial(item.id);
                  }}
                >
                  {isReadOnly ? "수정하기" : "저장하기"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <button
        className="add-management-item"
        onClick={() =>
          addItem(setMaterials, {
            amount: "",
          })
        }
      >
        <img src="/management-icons/add.png" alt="" /> 메뉴별 원재료비 추가
      </button>

      <p className="management-helper">
        매달 주기적으로 지출되는 주요 재료 및 원가 항목을 등록·수정하여 자금
        고갈 시점을 정밀하게 예측하세요.
      </p>

      {/* 저장한 원재료의 메뉴별 원재료비 목록 */}
      <section
        className="ingredient-name-field"
        aria-labelledby="store-menu-title"
      >
        <h2
          ref={storeMenuHeading}
          id="store-menu-title"
          style={{
            fontSize: 14,
          }}
        >
          우리 가게 메뉴판
        </h2>

        <table className="menu-material-table">
          <thead>
            <tr>
              <th scope="col">메뉴명</th>
              <th scope="col">원재료비</th>
            </tr>
          </thead>
          <tbody>
            {savedMaterials.length === 0 ? (
              <tr>
                <td colSpan={2}>
                  <small>원재료 박스를 저장하면 메뉴가 여기에 표시됩니다.</small>
                </td>
              </tr>
            ) : (
              savedMaterials.map((item) => (
                <tr key={item.id}>
                  <td>{item.name || "미입력"}</td>
                  <td>{amountValue(item.amount).toLocaleString("ko-KR")}원</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* 실제 사용하는 원재료 입력과 저장 목록 */}
      <section className="ingredient-name-field">
        <label htmlFor="actual-ingredients">실제 사용하는 원재료</label>
        <input
          id="actual-ingredients"
          value={ingredientNames}
          onChange={(event) => {
            setIngredientNames(event.target.value);
            setIngredientsSaved(false);
          }}
          placeholder="예: 대파, 양파"
        />
        <small>여러 재료는 쉼표로 구분해 입력해주세요.</small>
        {savedIngredients.length > 0 && (
          <div className="ingredient-preview" aria-live="polite">
            <b>입력한 원재료</b>
            <ul>
              {savedIngredients.map((name) => (
                <IngredientChip
                  key={name}
                  name={name}
                  showDelete={ingredientToDelete === name}
                  onShowDelete={() => setIngredientToDelete(name)}
                  onHideDelete={() => setIngredientToDelete(null)}
                  onDelete={() => {
                    setSavedIngredients((ingredients) =>
                      ingredients.filter((ingredient) => ingredient !== name),
                    );
                    setIngredientToDelete(null);
                    setIngredientsSaved(false);
                  }}
                />
              ))}
            </ul>
          </div>
        )}
        <div className="material-save-actions">
          <span role="status">
            {ingredientsSaved ? "중간 저장되었습니다" : ""}
          </span>
          <button
            type="button"
            className="material-save-button"
            onClick={saveIngredients}
          >
            저장하기
          </button>
        </div>
      </section>
      {/* 원재료비 합계와 전체 저장 */}
      <ManagementSummary
        title="등록된 월 주요 원재료비 합계"
        label="예상 원가 합산"
        amount={total(materials)}
        saveLabel="원재료비 저장하기"
        saved={saved}
        message={saveMessage}
        onSave={onSave}
      />
    </div>
  );
}

// 저장한 원재료를 길게 눌렀을 때 삭제 버튼을 표시
function IngredientChip({
  name,
  showDelete,
  onShowDelete,
  onHideDelete,
  onDelete,
}: {
  name: string;
  showDelete: boolean;
  onShowDelete: () => void;
  onHideDelete: () => void;
  onDelete: () => void;
}) {
  const pressTimer = useRef<number | undefined>(undefined);
  const cancelPress = () => window.clearTimeout(pressTimer.current);
  useEffect(() => () => window.clearTimeout(pressTimer.current), []);
  return (
    <li
      className="saved-ingredient"
      onBlur={(event) => {
        if (showDelete && !event.currentTarget.contains(event.relatedTarget))
          onHideDelete();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onHideDelete();
      }}
    >
      <button
        type="button"
        className="ingredient-chip"
        aria-expanded={showDelete}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          cancelPress();
          pressTimer.current = window.setTimeout(onShowDelete, 500);
        }}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onPointerLeave={cancelPress}
        onContextMenu={(event) => {
          event.preventDefault();
          cancelPress();
          onShowDelete();
        }}
        onClick={(event) => {
          if (event.detail === 0) onShowDelete();
        }}
      >
        {name}
      </button>
      {showDelete && (
        <button
          type="button"
          className="ingredient-delete-button"
          aria-label={`${name} 삭제하기`}
          onClick={onDelete}
        >
          삭제하기
        </button>
      )}
    </li>
  );
}

// 화면 하단의 합계, 저장 버튼과 완료 알림
function ManagementSummary({
  title,
  label,
  amount,
  saveLabel,
  saved,
  message,
  onSave,
}: {
  title: string;
  label: string;
  amount: number;
  saveLabel: string;
  saved: boolean;
  message: string;
  onSave: () => void;
}) {
  return (
    <section className="management-summary">
      <b>{title}</b>
      <div>
        <span>{label}</span>
        <strong>월 {amount.toLocaleString("ko-KR")}원</strong>
      </div>
      <div className="management-save-wrap">
        {saved && (
          <Toast message={message || "저장이 완료되었습니다"} className="management-toast" />
        )}
        <button
          className={saved ? "management-save saved" : "management-save"}
          onClick={onSave}
        >
          {saveLabel}
        </button>
      </div>
    </section>
  );
}
