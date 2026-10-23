import type { SVGProps } from "react";

type IconName = "dashboard" | "products" | "orders" | "messages" | "settings" | "bell" | "box" | "check" | "trend" | "arrow" | "search" | "heart" | "user" | "logout" | "sparkles" | "package" | "truck" | "leaf";

const paths: Record<IconName, React.ReactNode> = {
  dashboard: <><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/></>,
  products: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.5 7.5 7.5 4.3 7.5-4.3M12 12v9"/></>,
  orders: <><path d="M6 3h12l3 4v14H3V7l3-4Z"/><path d="M3 7h18M8 11h8M8 15h8"/></>,
  messages: <><path d="M21 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 21 11.5Z"/><path d="M8 11h8M8 8h5"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2Z" transform="translate(-1 -1) scale(1.08)"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></>,
  check: <><path d="m5 12 4 4L19 6"/></>,
  trend: <><path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/></>,
  arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  heart: <><path d="M20.8 8.7c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></>,
  sparkles: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14ZM5 3l.7 1.8L7.5 5.5l-1.8.7L5 8l-.7-1.8L2.5 5.5l1.8-.7L5 3Z"/></>,
  package: <><path d="m12 3 8 4v10l-8 4-8-4V7l8-4Z"/><path d="m4 7 8 4 8-4M12 11v10"/></>,
  truck: <><path d="M3 6h12v12H3zM15 10h4l3 4v4h-7"/><circle cx="7.5" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></>,
  leaf: <><path d="M20 4C10 4 4 8 4 15a5 5 0 0 0 5 5c7 0 11-6 11-16Z"/><path d="M4 21c3-6 7-9 13-13"/></>,
};

export default function CraftosaIcon({ name, size = 20, className = "", ...props }: { name: IconName; size?: number; className?: string } & SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>{paths[name]}</svg>;
}
