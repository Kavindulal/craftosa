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
  const ink = light ? "#fff8ee" : "#55372d";

  return (
    <Link
      href={href}
      aria-label="Craftosa home"
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      <span className={`relative flex shrink-0 items-center justify-center ${compact ? "h-10 w-10" : "h-12 w-12"}`}>
        <svg viewBox="0 0 100 100" role="img" aria-label="Craftosa Sri Lankan heritage emblem" className="h-full w-full">
          <rect x="19" y="19" width="62" height="62" rx="4" fill="none" stroke="#b69a61" strokeWidth="2.4" />
          <rect x="19" y="19" width="62" height="62" rx="4" fill="none" stroke="#b85f45" strokeWidth="2.4" transform="rotate(45 50 50)" />
          <g fill="none" stroke="#f0e5d4" strokeWidth="1.4" opacity=".95">
            <circle cx="50" cy="50" r="24" />
            <circle cx="50" cy="50" r="19" />
            <circle cx="50" cy="50" r="14" />
          </g>
          <g fill="#f8f2e8" stroke={ink} strokeWidth="2.2" strokeLinejoin="round">
            <path d="M50 50 C42 34 29 25 21 23 C22 39 32 49 50 50Z" />
            <path d="M50 50 C58 34 71 25 79 23 C78 39 68 49 50 50Z" />
            <path d="M50 50 C34 58 25 71 23 79 C39 78 49 68 50 50Z" />
            <path d="M50 50 C66 58 75 71 77 79 C61 78 51 68 50 50Z" />
          </g>
          <circle cx="50" cy="50" r="2.2" fill="#b85f45" />
        </svg>
      </span>
      {!compact && (
        <span className="flex min-w-0 flex-col">
          <span
            className={`font-serif text-[1.65rem] leading-none tracking-[0.035em] ${light ? "text-white" : "text-[#55372d]"}`}
            style={{ fontFamily: '"Cinzel", "Times New Roman", serif' }}
          >
            CRAFTOSA
          </span>
          {tagline && (
            <span className={`mt-1.5 text-[8px] font-medium tracking-[0.1em] ${light ? "text-white/75" : "text-[#8e7969]"}`}>
              WHERE IDEAS BECOME HANDMADE CREATIONS
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
