import { Capacitor } from "@capacitor/core";

export function resolveApiUrl(
  path: string,
  base: string,
  native: boolean,
): string {
  const host = base.trim().replace(/\/+$/, "");
  if (!path.startsWith("/")) throw new Error("API 경로가 올바르지 않습니다.");
  if (!host) {
    if (native)
      throw new Error(
        "배포 서버 주소가 아직 설정되지 않았습니다. 서버 연결 후 앱을 다시 설치해주세요.",
      );
    return `/api/v1${path}`;
  }
  const url = new URL(host);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw new Error("API 주소에는 서버의 기본 주소만 설정해주세요.");
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      !native &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  )
    throw new Error("외부 API 주소에는 HTTPS가 필요합니다.");
  return `${host}/api/v1${path}`;
}

export const apiUrl = (path: string) =>
  resolveApiUrl(
    path,
    import.meta.env.VITE_API_BASE_URL ?? "",
    Capacitor.isNativePlatform(),
  );
