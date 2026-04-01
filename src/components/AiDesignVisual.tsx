import { useId } from "react";

/** Ilustração SVG estilo ferramenta de design + IA — usar fora da primeira secção. */
export function AiDesignVisual({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");

  return (
    <div
      className={`relative mx-auto w-full max-w-[min(100%,380px)] aspect-square ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-violet-600/20 via-fuchsia-500/12 to-purple-600/18 blur-3xl scale-110" />
      <svg
        viewBox="0 0 400 400"
        className="relative h-full w-full drop-shadow-[0_20px_50px_rgba(139,92,246,0.22)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`nm-frame-${uid}`} x1="48" y1="64" x2="352" y2="336" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="0.5" stopColor="#a855f7" stopOpacity="0.38" />
            <stop offset="1" stopColor="#d946ef" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={`nm-blob-${uid}`} x1="120" y1="120" x2="300" y2="280" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a78bfa" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id={`nm-stroke-${uid}`} x1="80" y1="180" x2="320" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e879f9" stopOpacity="0.9" />
            <stop offset="1" stopColor="#c084fc" stopOpacity="0.85" />
          </linearGradient>
          <filter id={`nm-glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          x="52"
          y="72"
          width="296"
          height="256"
          rx="20"
          stroke={`url(#nm-frame-${uid})`}
          strokeWidth="1.5"
          fill="rgba(15,15,25,0.55)"
        />
        <circle cx="76" cy="94" r="4" fill="#f87171" opacity="0.9" />
        <circle cx="94" cy="94" r="4" fill="#fbbf24" opacity="0.9" />
        <circle cx="112" cy="94" r="4" fill="#34d399" opacity="0.9" />

        <ellipse cx="200" cy="210" rx="88" ry="72" fill={`url(#nm-blob-${uid})`} opacity="0.35" />
        <path
          d="M 118 200 Q 200 150 282 200 T 200 260 Q 118 220 118 200"
          stroke={`url(#nm-stroke-${uid})`}
          strokeWidth="2"
          fill="none"
          filter={`url(#nm-glow-${uid})`}
          opacity="0.85"
        />

        <path
          d="M 100 248 C 140 200, 180 288, 220 232 S 300 248, 300 248"
          stroke="#c4b5fd"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        <circle cx="220" cy="232" r="5" fill="#f0abfc" opacity="0.95" />
        <circle cx="140" cy="216" r="4" fill="#e9d5ff" opacity="0.9" />

        <text
          x="168"
          y="188"
          fill="white"
          fillOpacity="0.15"
          fontFamily="system-ui, sans-serif"
          fontSize="42"
          fontWeight="700"
        >
          Aa
        </text>

        <rect x="92" y="124" width="28" height="28" rx="6" fill="#a855f7" opacity="0.85" />
        <rect x="128" y="124" width="28" height="28" rx="6" fill="#ec4899" opacity="0.75" />
        <rect x="164" y="124" width="28" height="28" rx="6" fill="#c084fc" opacity="0.8" />
        <rect x="200" y="124" width="28" height="28" rx="6" fill="#fbbf24" opacity="0.65" />

        <g opacity="0.12" stroke="white" strokeWidth="0.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v-${i}`} x1={120 + i * 22} y1="148" x2={120 + i * 22} y2="292" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`h-${i}`} x1="120" y1={160 + i * 22} x2="280" y2={160 + i * 22} />
          ))}
        </g>

        <circle cx="300" cy="128" r="22" fill="rgba(139,92,246,0.25)" stroke="#c4b5fd" strokeWidth="1.2" />
        <path
          d="M 292 128 L 298 134 L 308 122"
          stroke="#e9d5ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />

        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={72 + i * 58}
            cy={56 + (i % 3) * 12}
            r="1.5"
            fill="#fae8ff"
            opacity={0.4 + (i % 2) * 0.35}
          />
        ))}
      </svg>
    </div>
  );
}
