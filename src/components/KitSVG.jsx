const SIZE_MAP = {
  sm: { width: 80, height: 110 },
  md: { width: 130, height: 178 },
  lg: { width: 200, height: 274 },
};

function getPatternDefs(id, pattern, colors) {
  switch (pattern) {
    case "vertical-stripes-gradient":
      return (
        <defs>
          <linearGradient id={`stripe-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.secondary} stopOpacity="1" />
            <stop offset="50%" stopColor={colors.accent || colors.secondary} stopOpacity="0.7" />
            <stop offset="100%" stopColor={colors.secondary} stopOpacity="1" />
          </linearGradient>
          <pattern id={`pat-${id}`} patternUnits="userSpaceOnUse" width="20" height="100%">
            <rect width="10" height="100%" fill={colors.primary} />
            <rect x="10" width="10" height="100%" fill={`url(#stripe-grad-${id})`} />
          </pattern>
          <clipPath id={`jersey-clip-${id}`}>
            <JerseyPath />
          </clipPath>
        </defs>
      );

    case "red-white-stripes-speckled":
      return (
        <defs>
          <pattern id={`pat-${id}`} patternUnits="userSpaceOnUse" width="20" height="100%">
            <rect width="10" height="100%" fill={colors.primary} />
            <rect x="10" width="10" height="100%" fill={colors.secondary} />
            {[...Array(12)].map((_, i) => (
              <circle
                key={i}
                cx={(i % 3) * 7 + 2}
                cy={Math.floor(i / 3) * 25 + 8}
                r="1.2"
                fill={colors.primary}
                opacity="0.4"
              />
            ))}
          </pattern>
        </defs>
      );

    case "butterfly-allover":
    case "allover-flag-distortion":
      return (
        <defs>
          <pattern id={`pat-${id}`} patternUnits="userSpaceOnUse" width="30" height="30">
            <rect width="30" height="30" fill={colors.primary} />
            <ellipse cx="15" cy="15" rx="6" ry="4" fill={colors.secondary} opacity="0.15" transform="rotate(-30 15 15)" />
            <ellipse cx="15" cy="15" rx="6" ry="4" fill={colors.secondary} opacity="0.15" transform="rotate(30 15 15)" />
          </pattern>
        </defs>
      );

    case "jagged-tonal-stripes":
      return (
        <defs>
          <pattern id={`pat-${id}`} patternUnits="userSpaceOnUse" width="40" height="40">
            <rect width="40" height="40" fill={colors.primary} />
            <polygon points="0,10 20,0 20,10" fill={colors.secondary} opacity="0.15" />
            <polygon points="20,30 40,20 40,30" fill={colors.secondary} opacity="0.15" />
            <polygon points="0,40 20,30 20,40" fill={colors.secondary} opacity="0.12" />
          </pattern>
        </defs>
      );

    case "swirl-floral":
      return (
        <defs>
          <pattern id={`pat-${id}`} patternUnits="userSpaceOnUse" width="40" height="40">
            <rect width="40" height="40" fill={colors.primary} />
            <circle cx="20" cy="20" r="8" fill="none" stroke={colors.secondary} strokeWidth="1.5" opacity="0.3" />
            <path d="M20,12 Q28,16 20,20 Q12,24 20,28" fill="none" stroke={colors.secondary} strokeWidth="1" opacity="0.3" />
          </pattern>
        </defs>
      );

    case "camo-teal-black":
      return (
        <defs>
          <pattern id={`pat-${id}`} patternUnits="userSpaceOnUse" width="50" height="50">
            <rect width="50" height="50" fill={colors.primary} />
            <ellipse cx="12" cy="15" rx="10" ry="7" fill={colors.secondary} opacity="0.4" transform="rotate(20 12 15)" />
            <ellipse cx="35" cy="35" rx="12" ry="6" fill={colors.secondary} opacity="0.35" transform="rotate(-15 35 35)" />
            <ellipse cx="40" cy="10" rx="7" ry="5" fill={colors.secondary} opacity="0.3" transform="rotate(40 40 10)" />
          </pattern>
        </defs>
      );

    case "mantle-shimmer":
      return (
        <defs>
          <radialGradient id={`shimmer-${id}`} cx="50%" cy="10%" r="60%">
            <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
          </radialGradient>
          <pattern id={`pat-${id}`} patternUnits="userSpaceOnUse" width="100%" height="100%">
            <rect width="100%" height="100%" fill={colors.primary} />
            <rect width="100%" height="100%" fill={`url(#shimmer-${id})`} />
          </pattern>
        </defs>
      );

    default:
      return (
        <defs>
          <pattern id={`pat-${id}`} patternUnits="userSpaceOnUse" width="100%" height="100%">
            <rect width="100%" height="100%" fill={colors.primary} />
          </pattern>
        </defs>
      );
  }
}

function JerseyPath() {
  return (
    <path d="
      M 30,0
      L 0,18
      L 12,30
      L 22,22
      L 22,80
      L 78,80
      L 78,22
      L 88,30
      L 100,18
      L 70,0
      Q 62,8 50,8
      Q 38,8 30,0
      Z
    " />
  );
}

function CollarOverlay({ collar, colors }) {
  if (collar === "v-neck") {
    return (
      <path
        d="M 42,0 L 50,16 L 58,0"
        fill="none"
        stroke={colors.accent || colors.secondary}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    );
  }
  if (collar === "polo") {
    return (
      <>
        <rect x="38" y="0" width="24" height="10" rx="2" fill={colors.accent || colors.secondary} opacity="0.9" />
        <line x1="50" y1="10" x2="50" y2="22" stroke={colors.accent || colors.secondary} strokeWidth="2" />
      </>
    );
  }
  return (
    <path
      d="M 34,0 Q 50,12 66,0"
      fill="none"
      stroke={colors.accent || colors.secondary}
      strokeWidth="3"
    />
  );
}

function SideAccents({ pattern, colors }) {
  if (pattern === "v-neck-side-insert" || pattern === "polo-collar-tonal") {
    return (
      <>
        <rect x="22" y="22" width="8" height="58" fill={colors.accent} opacity="0.7" />
        <rect x="70" y="22" width="8" height="58" fill={colors.accent} opacity="0.7" />
      </>
    );
  }
  if (pattern === "allover-flag-distortion") {
    return (
      <>
        <rect x="22" y="22" width="6" height="58" fill={colors.secondary} opacity="0.6" />
        <rect x="72" y="22" width="6" height="58" fill={colors.secondary} opacity="0.6" />
      </>
    );
  }
  return null;
}

export default function KitSVG({ kitData, size = "md" }) {
  if (!kitData) return null;

  const { width, height } = SIZE_MAP[size] || SIZE_MAP.md;
  const { colors, pattern, collar } = kitData;

  const jerseyHeight = Math.round(height * 0.6);
  const shortsY = jerseyHeight + Math.round(height * 0.04);
  const shortsHeight = Math.round(height * 0.33);
  const shortsWidth = Math.round(width * 0.62);
  const shortsX = Math.round((width - shortsWidth) / 2);

  const scaleX = width / 100;
  const scaleY = jerseyHeight / 80;

  const id = `${kitData.type || "kit"}-${colors.primary.replace("#", "")}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${kitData.type} kit`}
    >
      <g transform={`scale(${scaleX}, ${scaleY})`}>
        {getPatternDefs(id, pattern, colors)}

        <JerseyPath fill={`url(#pat-${id})`} />

        <SideAccents pattern={pattern} colors={colors} />

        <CollarOverlay collar={collar} colors={colors} />

        <path
          d="
            M 30,0
            L 0,18
            L 12,30
            L 22,22
            L 22,80
            L 78,80
            L 78,22
            L 88,30
            L 100,18
            L 70,0
            Q 62,8 50,8
            Q 38,8 30,0
            Z
          "
          fill={`url(#pat-${id})`}
          stroke={colors.secondary}
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />
      </g>

      <rect
        x={shortsX}
        y={shortsY}
        width={shortsWidth}
        height={shortsHeight}
        rx={Math.round(width * 0.04)}
        fill={colors.shorts}
      />
      <line
        x1={width / 2}
        y1={shortsY}
        x2={width / 2}
        y2={shortsY + shortsHeight}
        stroke={colors.primary}
        strokeWidth="1"
        strokeOpacity="0.3"
      />
    </svg>
  );
}
