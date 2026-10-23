"use client";

import Link from "next/link";

type CraftosaLogoProps = {
  href?: string;
  compact?: boolean;
  light?: boolean;
  className?: string;
  tagline?: boolean;
};

export default function CraftosaLogo({
  href = "/",
  compact = false,
  light = false,
  className = "",
  tagline = false,
}: CraftosaLogoProps) {
  return (
    <Link href={href} aria-label="Craftosa home" className={`group inline-flex items-center gap-3 ${className}`}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d7794e] via-[#a95737] to-[#70402d] shadow-lg shadow-[#8b4c35]/20 ring-1 ring-white/60">
        <svg viewBox="0 0 64 64" role="img" aria-label="Craftosa lotus mark" className="h-10 w-10">
          <path d="M32 5 C18 17 18 31 32 43 C46 31 46 17 32 5Z" fill="#e8bd63" stroke="#fff1d5" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M8 22 C10 40 21 49 35 48 C31 34 22 25 8 22Z" fill="#f3a078" stroke="#fff1d5" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M56 22 C42 25 33 34 29 48 C43 49 54 40 56 22Z" fill="#9da878" stroke="#fff1d5" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M18 48 C25 55 39 57 48 48" fill="none" stroke="#fff1d5" strokeWidth="2.4" strokeLinecap="round"/>
          <path d="M32 15 C27 24 28 32 32 37 C36 32 37 24 32 15Z" fill="#a95737"/>
        </svg>
      </span>
      {!compact && (
        <span className="flex min-w-0 flex-col">
          <span className={`font-serif text-[1.8rem] leading-none tracking-[-0.045em] ${light ? "text-white" : "text-[#573728]"}`}>
            Craftosa<span className="text-[#c8784e]">.</span>
          </span>
          {tagline && <span className={`mt-1.5 text-[9px] font-medium tracking-[0.12em] ${light ? "text-white/75" : "text-[#8e7969]"}`}>WHERE IDEAS BECOME HANDMADE CREATIONS</span>}
        </span>
      )}
    </Link>
  );
}
