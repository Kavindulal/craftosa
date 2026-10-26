"use client";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageCircle,
  Settings,
  Bell,
  Box,
  Check,
  TrendingUp,
  ArrowUpRight,
  Search,
  Heart,
  UserRound,
  LogOut,
  Sparkles,
  PackageCheck,
  Truck,
  Leaf,
  type LucideIcon,
} from "lucide-react";

export type IconName =
  | "dashboard"
  | "products"
  | "orders"
  | "messages"
  | "settings"
  | "bell"
  | "box"
  | "check"
  | "trend"
  | "arrow"
  | "search"
  | "heart"
  | "user"
  | "logout"
  | "sparkles"
  | "package"
  | "truck"
  | "leaf";

const icons: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  products: Package,
  orders: ShoppingBag,
  messages: MessageCircle,
  settings: Settings,
  bell: Bell,
  box: Box,
  check: Check,
  trend: TrendingUp,
  arrow: ArrowUpRight,
  search: Search,
  heart: Heart,
  user: UserRound,
  logout: LogOut,
  sparkles: Sparkles,
  package: PackageCheck,
  truck: Truck,
  leaf: Leaf,
};

type CraftosaIconProps = {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

export default function CraftosaIcon({
  name,
  size = 20,
  className = "",
  strokeWidth = 1.8,
}: CraftosaIconProps) {
  const Icon = icons[name];

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    />
  );
}
