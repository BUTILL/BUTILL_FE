import { useState } from "react";
import { afterEach, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MoneyInput from "../src/components/MoneyInput";

afterEach(cleanup);
function Form() {
  const [value, setValue] = useState("");
  return (
    <>
      <MoneyInput label="금액" value={value} onChange={setValue} />
      <output>{value}</output>
    </>
  );
}

test("입력 중 쉼표를 표시하고 계산용 값에는 숫자만 전달한다", async () => {
  const user = userEvent.setup();
  render(<Form />);
  const input = screen.getByLabelText("금액") as HTMLInputElement;
  await user.type(input, "3000000");
  expect(input.value).toBe("3,000,000");
  expect(screen.getByRole("status").textContent).toBe("3000000");
  fireEvent.click(screen.getByRole("button", { name: "금액 1만 원 증가" }));
  expect(input.value).toBe("3,010,000");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(input.value).toBe("3,000,000");
  await user.clear(input);
  expect(input.value).toBe("");
  expect(input.checkValidity()).toBe(false);
});

test("중간 수정과 쉼표 옆 삭제 및 붙여넣기를 지원한다", async () => {
  const user = userEvent.setup();
  render(<Form />);
  const input = screen.getByLabelText("금액") as HTMLInputElement;
  await user.click(input);
  await user.paste("3,000,000");
  input.setSelectionRange(2, 2);
  await user.keyboard("{Backspace}");
  expect(input.value).toBe("0");
  await user.clear(input);
  await user.type(input, "1234567");
  input.setSelectionRange(3, 3);
  await user.keyboard("9");
  expect(input.value).toBe("12,934,567");
  expect(input.selectionStart).toBe(4);
  await user.clear(input);
  await user.type(input, "1000000000001");
  expect(input.checkValidity()).toBe(false);
});
