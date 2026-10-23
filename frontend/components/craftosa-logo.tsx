"use client";

import Link from "next/link";

type CraftosaLogoProps = {
  href?: string;
  compact?: boolean;
  light?: boolean;
  className?: string;
};

export default function CraftosaLogo({
  href = "/",
  compact = false,
  light = false,
  className = "",
}: CraftosaLogoProps) {
  return (
    <Link href={href} aria-label="Craftosa home" className={`inline-flex items-center gap-3 ${className}`}>
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#a65d3f] via-[#8b4c35] to-[#633522] shadow-md shadow-[#8b4c35]/20">
        <svg viewBox="0 0 44 44" role="img" aria-label="Craftosa mark" className="h-9 w-9">
          <path d="M29.8 10.8c-8.9-3.2-17.3 2.5-17.3 11.3 0 8.5 8.4 14.2 17.3 11" fill="none" stroke="#fff7ed" strokeWidth="4.2" strokeLinecap="round"/>
          <path d="M18.1 21.8c3.1-6.5 8.5-8.3 13.2-8.1-1.1 5.4-5.6 9.2-13.2 8.1Z" fill="#f3c69f"/>
          <path d="M18.4 23.2c2.9 5.7 7.8 7.6 12.9 7.4-1.1-5.1-5.7-8.6-12.9-7.4Z" fill="#f3c69f"/>
          <circle cx="31.8" cy="22" r="2" fill="#fff7ed"/>
        </svg>
      </span>
      {!compact && <span className={`text-2xl font-bold tracking-tight ${light ? "text-white" : "text-[#35271f]"}`}>craftosa<span className="text-[#c27a56]">.</span></span>}
    </Link>
  );
}
