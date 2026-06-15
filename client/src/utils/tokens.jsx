/* ─── Safar design tokens ─────────────────────────────────────────────────── */
export const T = {
  /* surfaces */
  bg:       "#0a0a0a",
  s1:       "#111111",   // card
  s2:       "#161616",   // input / raised card
  s3:       "#1c1c1c",   // hover state
  sidebar:  "#0f0f0f",   // sidebar bg

  /* borders */
  b1:       "#1f1f1f",
  b2:       "#2a2a2a",
  b3:       "#3f3f46",   // subtle dividers

  /* brand */
  red:      "#dc2626",
  redGlow:  "rgba(220,38,38,0.25)",
  redDim:   "rgba(220,38,38,0.09)",

  /* text */
  white:    "#ffffff",
  subtle:   "#a1a1aa",
  muted:    "#71717a",
  dim:      "#52525b",

  /* semantic */
  green:    "#22c55e",
  amber:    "#f59e0b",
  blue:     "#3b82f6",
  orange:   "#f97316",
  purple:   "#7c3aed",

  /* type */
  display:  "'Space Grotesk', 'Inter', sans-serif",
  body:     "'Inter', system-ui, sans-serif",
};

/* Mode metadata */
export const MODE_META = {
  bus:   { color: T.red,    emoji: "🚌", label: "MTC Bus"     },
  metro: { color: T.orange, emoji: "🚇", label: "Metro"       },
  train: { color: T.purple, emoji: "🚆", label: "Local Train" },
};

export const CROWD_COLOR = { low: T.green, medium: T.amber, high: T.red };

export const ALERT_TYPE = {
  delay:           { color: T.amber,  label: "Delay"           },
  cancellation:    { color: T.red,    label: "Cancelled"       },
  platform_change: { color: T.blue,   label: "Platform Change" },
  disruption:      { color: T.red,    label: "Disruption"      },
  crowd:           { color: T.orange, label: "Crowding"        },
  info:            { color: T.dim,    label: "Info"            },
};

/* Reusable micro-components */
export function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 700,
      background: `${color}18`, color, border: `1px solid ${color}30`,
      whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.02em",
    }}>{label}</span>
  );
}

export function PulseDot({ color = "#22c55e", size = 7 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      borderRadius: "50%", background: color, flexShrink: 0,
      animation: "pulseDot 2s ease-in-out infinite",
    }} />
  );
}

export function Divider({ my = 16 }) {
  return <div style={{ height: 1, background: "#1f1f1f", margin: `${my}px 0` }} />;
}

export function SectionLabel({ children, mb = 8 }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, color: "#52525b",
      textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: mb,
    }}>{children}</div>
  );
}