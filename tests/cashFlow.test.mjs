import assert from "node:assert/strict";
import test from "node:test";
import {
  addMonths,
  buildCashFlowRows,
  createChartGeometry,
} from "../src/data/homeData.ts";

const example = (changes = {}) => ({
  startMonth: "2026-11",
  openingBalance: 10000000,
  monthlyCashFlows: [
    { month: "2026-11", income: 1000000, expense: 2000000 },
    { month: "2026-12", income: 3000000, expense: 1000000 },
    { month: "2027-01", income: 0, expense: 12000000, taxPayment: 1800000, isForecast: true },
  ],
  ...changes,
});

test("사용 시작 월부터 12개월을 생성하고 연도 전환을 유지한다", () => {
  const rows = buildCashFlowRows(example());
  assert.equal(rows.length, 12);
  assert.deepEqual(rows.slice(0, 3).map((row) => row.month), ["2026-11", "2026-12", "2027-01"]);
  assert.equal(rows[11].month, "2027-10");
  assert.equal(rows.slice(0, 6)[5].month, "2027-04");
  assert.equal(addMonths("2026-12", 1), "2027-01");
});

test("정렬되지 않은 거래와 시작 이전 거래가 있어도 시작 월을 따른다", () => {
  const rows = buildCashFlowRows(example({
    startMonth: "2026-12",
    monthlyCashFlows: example().monthlyCashFlows.toReversed(),
  }));
  assert.equal(rows[0].month, "2026-12");
  assert.equal(rows[0].balance, 12000000);
});

test("수입·지출을 누적하고 부가세를 이중 차감하지 않는다", () => {
  const rows = buildCashFlowRows(example());
  assert.deepEqual(rows.slice(0, 3).map((row) => row.balance), [9000000, 11000000, -1000000]);
  assert.equal(rows[2].taxPayment, 1800000);
  assert.equal(rows[2].isForecast, true);
  assert.equal(rows.find((row) => row.balance !== null && row.balance <= 0).month, "2027-01");
});

test("받은 금액을 변경하면 계산 결과와 그래프 좌표가 함께 변경된다", () => {
  const before = buildCashFlowRows(example());
  const source = example();
  source.monthlyCashFlows[0] = { ...source.monthlyCashFlows[0], income: 21000000 };
  const after = buildCashFlowRows(source);
  assert.equal(after[0].balance - before[0].balance, 20000000);
  const first = createChartGeometry(before);
  const second = createChartGeometry(after);
  assert.notEqual(first.zeroY - first.y(before[0].income), second.zeroY - second.y(after[0].income));
  assert.notEqual(first.y(before[0].balance), second.y(after[0].balance));
});

test("누락 월은 0원으로 채우거나 이후 잔고를 추측하지 않는다", () => {
  const rows = buildCashFlowRows(example({
    monthlyCashFlows: example().monthlyCashFlows.filter((row) => row.month !== "2026-12"),
  }));
  assert.equal(rows[1].income, null);
  assert.equal(rows[1].net, null);
  assert.equal(rows[1].balance, null);
  assert.equal(rows[2].income, 0);
  assert.equal(rows[2].net, -12000000);
  assert.equal(rows[2].balance, null);
});

test("0원 거래는 미입력과 구분하고 전액 0원 그래프도 유효한 좌표를 가진다", () => {
  const data = example({
    openingBalance: 0,
    monthlyCashFlows: [{ month: "2026-11", income: 0, expense: 0 }],
  });
  const rows = buildCashFlowRows(data);
  assert.equal(rows[0].balance, 0);
  assert.equal(rows[0].net, 0);
  const chart = createChartGeometry(rows);
  assert.ok(Number.isFinite(chart.y(0)));
  assert.deepEqual(chart.ticks, [1, 0]);
});

test("중복 월·문자열 금액·잘못된 시작 월·잘못된 세금 금액은 오류로 처리한다", () => {
  assert.equal(buildCashFlowRows(null), null);
  assert.equal(buildCashFlowRows(example({ startMonth: "2026-13" })), null);
  assert.equal(buildCashFlowRows(example({ openingBalance: "1000" })), null);
  assert.equal(buildCashFlowRows(example({ monthlyCashFlows: [example().monthlyCashFlows[0], example().monthlyCashFlows[0]] })), null);
  assert.equal(buildCashFlowRows(example({ monthlyCashFlows: [{ month: "2026-11", income: -1, expense: 0 }] })), null);
  assert.equal(buildCashFlowRows(example({ monthlyCashFlows: [{ month: "2026-11", income: 0, expense: 10, taxPayment: 11 }] })), null);
});
