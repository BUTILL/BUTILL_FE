import type { ReactNode } from "react";

export function Icon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  const exactIcons: Record<string, string> = {
    bell: "notification-bell.svg",
    sync: "sync-status.svg",
    wallet: "wallet.svg",
    expense: "expense-add.svg",
    tax: "tax-document.svg",
    shield: "security-shield.svg",
    raw: "raw-materials-store.svg",
    calendar: "calendar.svg",
    cash: "cash.svg",
    card: "payment-card.svg",
    receipt: "receipt.svg",
    home: "home.svg",
    manage: "management-edit.svg",
    simulation: "simulation-chart.svg",
    settings: "settings-gear.svg",
  };
  const paths: Record<string, ReactNode> = {
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    sync: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M3 9h18M16 14h2" />
      </>
    ),
    expense: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
    tax: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h5" />
      </>
    ),
    raw: (
      <>
        <path d="M3 15h18l-2-7H7l-4 7Z" />
        <path d="M5 15v4h14v-4M8 8l2-4h6l2 4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    cash: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <circle cx="12" cy="12.5" r="3" />
        <path d="M6 9h.01M18 16h.01" />
      </>
    ),
    store: (
      <>
        <path d="M3 10h18l-2-6H5l-2 6Z" />
        <path d="M5 10v10h14V10M9 20v-6h6v6M3 10c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
    receipt: (
      <>
        <path d="M5 3 7 4.5 9 3l3 1.5L15 3l2 1.5L19 3v18l-2-1.5-2 1.5-3-1.5L9 21l-2-1.5L5 21z" />
        <path d="M8 9h8M8 13h8M8 17h5" />
      </>
    ),
    simulation: (
      <>
        <path d="M4 19V5M4 19h17" />
        <path d="m7 15 4-5 3 3 6-8" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2Z" />
      </>
    ),
  };
  return exactIcons[name] ? (
    <img
      className="figma-icon"
      src={`/figma/${exactIcons[name]}`}
      alt=""
      aria-hidden="true"
    />
  ) : (
    <svg {...common}>{paths[name] || paths.expense}</svg>
  );
}
