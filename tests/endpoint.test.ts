import { expect, test } from "vitest";
import { resolveApiUrl } from "../src/lib/endpoint";

test("웹 개발은 Vite 프록시를 사용한다", () =>
  expect(resolveApiUrl("/stores", "", false)).toBe("/api/v1/stores"));
test("Android는 명시한 HTTPS 서버를 사용한다", () =>
  expect(resolveApiUrl("/stores", "https://api.example.com/", true)).toBe(
    "https://api.example.com/api/v1/stores",
  ));
test("주소가 없는 Android에서 localhost에 잘못 요청하지 않는다", () =>
  expect(() => resolveApiUrl("/stores", "", true)).toThrow("배포 서버 주소"));
test("외부 평문 연결과 자격 증명이 든 주소를 차단한다", () => {
  for (const host of [
    "http://api.example.com",
    "http://127.0.0.1:8000",
    "https://user:pass@api.example.com",
    "https://api.example.com/api/v1",
  ])
    expect(() => resolveApiUrl("/stores", host, true)).toThrow();
});
