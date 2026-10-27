import { useId, useRef, useLayoutEffect } from "react";
import "./MoneyInput.css";

export default function MoneyInput({
  label,
  value,
  onChange,
  unit = "원",
  invalid = false,
}: {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  unit?: string;
  invalid?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  const raw =
    typeof value === "number" && Number.isNaN(value) ? "" : String(value);
  const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setCustomValidity(
      raw !== "" && (!/^\d+$/.test(raw) || Number(raw) > 1e12)
        ? "0~1조 원 사이의 정수를 입력해주세요."
        : "",
    );
    if (caret.current !== null) {
      let pos = 0;
      let digits = 0;
      while (pos < formatted.length && digits < caret.current) {
        if (/\d/.test(formatted[pos])) digits++;
        pos++;
      }
      el.setSelectionRange(pos, pos);
      caret.current = null;
    }
  });
  const move = (direction: number) => {
    const n = Number(value);
    onChange(
      String(
        Math.min(
          1e12,
          Math.max(
            0,
            (Number.isFinite(n) ? Math.trunc(n) : 0) + direction * 10000,
          ),
        ),
      ),
    );
  };
  return (
    <span className="money-field">
      <span className={"money-box" + (invalid ? " invalid" : "")}>
        <input
          ref={ref}
          type="text"
          aria-label={label}
          aria-invalid={invalid}
          aria-describedby={invalid ? id : undefined}
          value={formatted}
          required
          inputMode="numeric"
          onChange={(e) => {
            const text = e.target.value;
            const next = text.replace(/,/g, "");
            if (!/^\d*$/.test(next)) return;
            const pos = e.target.selectionStart ?? text.length;
            const zeros = next.match(/^0+(?=\d)/)?.[0].length ?? 0;
            caret.current = Math.max(
              0,
              text.slice(0, pos).replace(/,/g, "").length - zeros,
            );
            onChange(next.replace(/^0+(?=\d)/, ""));
          }}
          onKeyDown={(e) => {
            const el = e.currentTarget;
            const pos = el.selectionStart ?? 0;
            if (pos === el.selectionEnd) {
              if (e.key === "Backspace" && formatted[pos - 1] === ",")
                el.setSelectionRange(pos - 1, pos - 1);
              if (e.key === "Delete" && formatted[pos] === ",")
                el.setSelectionRange(pos + 1, pos + 1);
            }
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              move(e.key === "ArrowUp" ? 1 : -1);
            }
          }}
        />
        <span className="money-unit">{unit}</span>
        <span className="money-arrows">
          <button
            type="button"
            aria-label={label + " 1만 원 증가"}
            onClick={() => move(1)}
          >
            ▲
          </button>
          <button
            type="button"
            aria-label={label + " 1만 원 감소"}
            onClick={() => move(-1)}
          >
            ▼
          </button>
        </span>
      </span>
      {invalid && (
        <small className="input-error-note" id={id}>
          0~1조 원 사이의 정수를 입력해주세요.
        </small>
      )}
    </span>
  );
}
