import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Train, MapPin, Navigation, ChevronLeft, Bell, Clock,
  AlertTriangle, RefreshCw, Users, Zap, ArrowRight,
  CheckCircle, XCircle, Info, ArrowUpDown, Loader,
  ChevronDown, Accessibility, Radio, Map, BarChart2,
  TrendingUp, Volume2, Shield,
} from "lucide-react";

/* ─── Design tokens ─── */
const T = {
  red: "#dc2626", redGlow: "rgba(220,38,38,0.28)", redDim: "rgba(220,38,38,0.10)",
  bg: "#0a0a0a", surface: "#111111", surface2: "#161616", surface3: "#1c1c1c",
  border: "#1f1f1f", border2: "#262626",
  muted: "#52525b", muted2: "#71717a", subtle: "#a1a1aa", white: "#ffffff",
  green: "#22c55e", amber: "#f59e0b", orange: "#f97316", purple: "#7c3aed", blue: "#3b82f6",
  display: "'Space Grotesk', 'Inter', sans-serif",
  body: "'Inter', system-ui, sans-serif",
};

/* ─── Global CSS injected once ─── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #262626; border-radius: 99px; }
  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.85)} }
  @keyframes fade-up   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
  .fade-up   { animation: fade-up .35s ease both; }
  .spin      { animation: spin .9s linear infinite; }
`;

function InjectStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

/* ─── Mock data ─── */
const POPULAR_STOPS = [
  { name: "Churchgate",     lat: 18.9322, lng: 72.8264 },
  { name: "CST",            lat: 18.9400, lng: 72.8354 },
  { name: "Mumbai Central", lat: 18.9694, lng: 72.8194 },
  { name: "Dadar",          lat: 19.0178, lng: 72.8478 },
  { name: "Bandra",         lat: 19.0596, lng: 72.8295 },
  { name: "Andheri",        lat: 19.1136, lng: 72.8697 },
  { name: "Ghatkopar",      lat: 19.0863, lng: 72.9082 },
  { name: "Borivali",       lat: 19.2307, lng: 72.8567 },
  { name: "Thane",          lat: 19.1893, lng: 72.9624 },
  { name: "Kurla",          lat: 19.0726, lng: 72.8795 },
  { name: "Virar",          lat: 19.4590, lng: 72.8125 },
  { name: "Panvel",         lat: 18.9894, lng: 73.1175 },
];

const TIME_BUDGETS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "90 min", value: 90 },
  { label: "Any",    value: 999 },
];

const MODE_META = {
  bus:   { color: T.red,    emoji: "🚌", label: "MTC Bus"      },
  metro: { color: T.orange, emoji: "🚇", label: "Metro"        },
  train: { color: T.purple, emoji: "🚆", label: "Local Train"  },
};

const CROWD_COLOR = { low: T.green, medium: T.amber, high: T.red };

const MOCK_ROUTES = [
  {
    id: "opt-1", mode: "train", route_name: "Western Railway Fast",
    board_stop: "Churchgate", alight_stop: "Andheri",
    walk_to_board_km: 0.3, total_minutes: 28, eta: "09:14",
    delay_minutes: 0, crowd_level: "low", delay_confidence: 0.92,
    disrupted: false, platform: "Platform 3", fare: "₹25",
    transfer_window: "Safe – 8 min buffer",
    features: ["AC", "Ladies coach", "Luggage rack"],
  },
  {
    id: "opt-2", mode: "metro", route_name: "Metro Line 2A",
    board_stop: "Dahisar E", alight_stop: "Andheri",
    walk_to_board_km: 0.6, total_minutes: 34, eta: "09:20",
    delay_minutes: 0, crowd_level: "medium", delay_confidence: 0.96,
    disrupted: false, platform: "Platform 1", fare: "₹40",
    transfer_window: "Comfortable",
    features: ["AC", "Step-free access", "Lifts available"],
  },
  {
    id: "opt-3", mode: "bus", route_name: "Route 11 (Express)",
    board_stop: "Churchgate Bus Stop", alight_stop: "Andheri Station",
    walk_to_board_km: 0.15, total_minutes: 42, eta: "09:28",
    delay_minutes: 5, crowd_level: "high", delay_confidence: 0.71,
    disrupted: false, platform: "Bay 4", fare: "₹18",
    transfer_window: "Tight – 3 min buffer",
    features: ["Low-floor entry", "GPS tracked"],
  },
  {
    id: "opt-4", mode: "train", route_name: "Western Railway Slow",
    board_stop: "Churchgate", alight_stop: "Andheri",
    walk_to_board_km: 0.3, total_minutes: 38, eta: "09:24",
    delay_minutes: 7, crowd_level: "high", delay_confidence: 0.65,
    disrupted: true, platform: "Platform 1", fare: "₹25",
    transfer_window: "At risk",
    features: ["Ladies coach"],
  },
];

const MOCK_ALERTS = [
  {
    id: 1, type: "delay", severity: "high",
    title: "Western Railway — Signal fault near Bandra",
    message: "Trains running 7+ min late on Western line. Platform changes possible at Dadar.",
    time: "2 min ago",
  },
  {
    id: 2, type: "platform_change", severity: "medium",
    title: "Metro Line 1 — Platform change at Andheri",
    message: "Now departing from Platform 2. Follow signage at concourse.",
    time: "5 min ago",
  },
  {
    id: 3, type: "crowd", severity: "medium",
    title: "Churchgate → Andheri — High occupancy",
    message: "Coaches 1–4 severely crowded. Board from coaches 6–9 for faster boarding.",
    time: "8 min ago",
  },
  {
    id: 4, type: "info", severity: "low",
    title: "Route 11 Bus — Normal operations",
    message: "All stops on schedule. Bay 4 confirmed at Churchgate.",
    time: "12 min ago",
  },
];

const ALERT_TYPE = {
  delay:           { color: T.amber,  icon: Clock,          label: "Delay"           },
  cancellation:    { color: T.red,    icon: XCircle,        label: "Cancelled"       },
  platform_change: { color: T.blue,   icon: RefreshCw,      label: "Platform Change" },
  disruption:      { color: T.red,    icon: AlertTriangle,  label: "Disruption"      },
  crowd:           { color: T.orange, icon: Users,          label: "Crowding"        },
  info:            { color: T.muted2, icon: Info,           label: "Info"            },
};

const MODES_STATUS = [
  { id: "train", label: "Local Rail", color: T.purple, status: "delayed",  delay: 7,  vehicles: 87  },
  { id: "metro", label: "Metro",      color: T.orange, status: "normal",   delay: 0,  vehicles: 32  },
  { id: "bus",   label: "MTC Bus",    color: T.red,    status: "normal",   delay: 2,  vehicles: 148 },
];
const STATUS_COLOR = { normal: T.green, delayed: T.amber, disrupted: T.red };
const STATUS_LABEL = { normal: "On time", delayed: "Delayed", disrupted: "Disrupted" };

/* ─── Tiny helpers ─── */
function PulseDot({ color = T.green }) {
  return (
    <span className="pulse-dot" style={{
      display: "inline-block", width: 7, height: 7,
      borderRadius: "50%", background: color, flexShrink: 0,
    }} />
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 10, padding: "2px 7px", borderRadius: 99, fontWeight: 600,
      background: `${color}1a`, color, border: `1px solid ${color}30`,
      whiteSpace: "nowrap", flexShrink: 0,
    }}>{label}</span>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, color: T.muted,
      textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 6,
    }}>{children}</div>
  );
}

/* ─── Live clock ─── */
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span style={{ fontFamily: T.display, fontSize: 13, color: T.muted, fontVariantNumeric: "tabular-nums" }}>
      {t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

/* ─── Stop picker ─── */
function StopPicker({ label, value, onChange, icon: Icon, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const filtered = POPULAR_STOPS.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <SectionLabel>{label}</SectionLabel>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "11px 14px", borderRadius: 11,
          background: T.surface2, border: `1px solid ${open ? "rgba(220,38,38,0.4)" : T.border2}`,
          cursor: "pointer", textAlign: "left", transition: "border-color 0.15s",
        }}
      >
        <Icon size={13} color={T.red} style={{ flexShrink: 0 }} />
        <span style={{
          flex: 1, fontSize: 13, fontFamily: T.body,
          color: value ? T.white : T.muted,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {value?.name || placeholder}
        </span>
        <ChevronDown size={11} color={T.muted} style={{
          flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s",
        }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 200,
          background: T.surface2, border: `1px solid ${T.border2}`,
          borderRadius: 12, overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        }}>
          <div style={{ padding: "8px 10px", borderBottom: `1px solid ${T.border}` }}>
            <input
              autoFocus value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search stops…"
              style={{
                width: "100%", background: "transparent", border: "none",
                outline: "none", fontSize: 13, color: T.white,
                padding: "4px 6px", fontFamily: T.body,
              }}
            />
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {filtered.length === 0
              ? <div style={{ padding: 16, fontSize: 12, color: T.muted, textAlign: "center" }}>No stops found</div>
              : filtered.map(s => (
                <button
                  key={s.name}
                  onClick={() => { onChange(s); setOpen(false); setQuery(""); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", background: "transparent",
                    border: "none", cursor: "pointer", textAlign: "left",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surface3}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <MapPin size={11} color={T.red} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: T.subtle, fontFamily: T.body }}>{s.name}</span>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Step dot ─── */
function StepDot({ n, active, done }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: done ? T.red : active ? "rgba(220,38,38,0.12)" : T.surface2,
      border: `1.5px solid ${done || active ? T.red : T.border2}`,
      fontSize: 12, fontWeight: 700, fontFamily: T.display,
      color: done ? T.white : active ? T.red : T.muted,
      transition: "all 0.25s",
    }}>
      {done ? <CheckCircle size={13} /> : n}
    </div>
  );
}

/* ─── Route card ─── */
function RouteCard({ option, rank, onSelect, selected }) {
  const [expanded, setExpanded] = useState(false);
  const m = MODE_META[option.mode] || MODE_META.bus;
  const isBest = rank === 0 && !option.disrupted;
  const isSelected = selected?.id === option.id;

  return (
    <div
      onClick={() => { onSelect(option); setExpanded(e => !e); }}
      style={{
        borderRadius: 14, overflow: "hidden",
        border: `1px solid ${isSelected ? T.red : option.disrupted ? "rgba(239,68,68,0.22)" : isBest ? "rgba(220,38,38,0.22)" : T.border2}`,
        background: isSelected ? "rgba(220,38,38,0.06)" : option.disrupted ? "rgba(239,68,68,0.03)" : T.surface2,
        transition: "all 0.2s ease", cursor: "pointer",
      }}
    >
      {isBest && (
        <div style={{
          padding: "5px 14px", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", background: "rgba(220,38,38,0.10)", color: T.red,
          borderBottom: "1px solid rgba(220,38,38,0.15)",
        }}>
          ★ Recommended
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: `${m.color}14`, border: `1px solid ${m.color}25`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{m.emoji}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.white, fontFamily: T.display }}>{option.route_name}</span>
            {option.disrupted && <Badge label="⚠ Disrupted" color={T.red} />}
            {option.delay_minutes > 0 && !option.disrupted && <Badge label={`+${option.delay_minutes}m delay`} color={T.amber} />}
          </div>
          <div style={{ fontSize: 11, color: T.muted }}>
            {option.board_stop} → {option.alight_stop} · {option.fare} · {option.platform}
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontFamily: T.display, fontWeight: 700, fontSize: 24,
            color: option.disrupted ? T.red : T.white, lineHeight: 1,
          }}>
            {option.total_minutes}
            <span style={{ fontSize: 12, fontWeight: 400, color: T.muted, marginLeft: 3 }}>m</span>
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>arr {option.eta}</div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
            {[
              { label: "Crowd",      value: option.crowd_level, color: CROWD_COLOR[option.crowd_level], cap: true },
              { label: "Walk",       value: `${Math.round(option.walk_to_board_km * 1000)}m to board`, color: T.subtle },
              { label: "Platform",   value: option.platform, color: T.subtle },
              { label: "Transfer",   value: option.transfer_window, color: option.transfer_window?.includes("At risk") || option.transfer_window?.includes("Tight") ? T.amber : T.green },
              { label: "Delay",      value: option.delay_minutes > 0 ? `+${option.delay_minutes} min` : "On time", color: option.delay_minutes > 0 ? T.red : T.green },
              { label: "Confidence", value: `${Math.round(option.delay_confidence * 100)}%`, color: option.delay_confidence > 0.85 ? T.green : T.amber },
            ].map(({ label, value, color, cap }) => (
              <div key={label} style={{
                background: T.surface, borderRadius: 10, padding: "10px 12px", border: `1px solid ${T.border}`,
              }}>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color, textTransform: cap ? "capitalize" : "none" }}>{value}</div>
              </div>
            ))}
          </div>

          {option.features?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {option.features.map(f => (
                <span key={f} style={{
                  fontSize: 10, padding: "3px 8px", borderRadius: 6, fontWeight: 500,
                  background: T.surface, border: `1px solid ${T.border}`, color: T.muted2,
                }}>{f}</span>
              ))}
            </div>
          )}

          <button
            onClick={e => { e.stopPropagation(); alert(`Tracking ${option.route_name}…`); }}
            style={{
              marginTop: 12, width: "100%", padding: "10px", borderRadius: 10, border: "none",
              background: option.disrupted ? T.amber : T.red,
              color: T.white, fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: `0 0 20px ${option.disrupted ? "rgba(245,158,11,0.3)" : T.redGlow}`,
              fontFamily: T.display,
            }}
          >
            {option.disrupted ? "⚠ Use alternate route above" : "Select & track this route →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Sidebar: Alerts ─── */
function AlertsPanel({ alerts }) {
  const highCount = alerts.filter(a => a.severity === "high").length;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Bell size={13} color={T.red} />
        <span style={{ fontFamily: T.display, fontWeight: 600, fontSize: 13, color: T.white }}>Live Alerts</span>
        <PulseDot color={T.red} />
        {highCount > 0 && (
          <span style={{ marginLeft: "auto", fontSize: 10, padding: "1px 7px", borderRadius: 99, background: `${T.red}18`, color: T.red, border: `1px solid ${T.red}28`, fontWeight: 700 }}>
            {highCount} critical
          </span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {alerts.map(a => {
          const meta = ALERT_TYPE[a.type] || ALERT_TYPE.info;
          const Icon = meta.icon;
          return (
            <div key={a.id} style={{
              padding: "12px 14px", borderRadius: 12,
              background: `${meta.color}08`, border: `1px solid ${meta.color}20`,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Icon size={12} color={meta.color} style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.white }}>{a.title}</span>
                    <Badge label={meta.label} color={meta.color} />
                  </div>
                  <div style={{ fontSize: 11, color: T.muted2, lineHeight: 1.55 }}>{a.message}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>{a.time}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Sidebar: Network status ─── */
function NetworkStatus() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Radio size={13} color={T.red} />
        <span style={{ fontFamily: T.display, fontWeight: 600, fontSize: 13, color: T.white }}>Network Status</span>
        <PulseDot color={T.green} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {MODES_STATUS.map(m => (
          <div key={m.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px", borderRadius: 11,
            background: T.surface2, border: `1px solid ${T.border}`,
          }}>
            <div style={{ width: 3, height: 32, borderRadius: 99, background: m.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.subtle }}>{m.label}</span>
                <span style={{
                  fontSize: 10, padding: "1px 6px", borderRadius: 99, fontWeight: 600,
                  background: `${STATUS_COLOR[m.status]}18`, color: STATUS_COLOR[m.status],
                  border: `1px solid ${STATUS_COLOR[m.status]}28`,
                }}>{STATUS_LABEL[m.status]}</span>
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>
                {m.vehicles} active
                {m.delay > 0 && <span style={{ color: T.amber, marginLeft: 8 }}>avg +{m.delay} min</span>}
              </div>
            </div>
            <PulseDot color={STATUS_COLOR[m.status]} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <SectionLabel>Interchange congestion</SectionLabel>
        {[
          { name: "Dadar (WR ↔ CR)",          level: "high"   },
          { name: "Andheri (Metro ↔ WR)",      level: "medium" },
          { name: "Ghatkopar (Metro ↔ CR)",    level: "low"    },
        ].map(ic => (
          <div key={ic.name} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 0", borderBottom: `1px solid ${T.border}`,
          }}>
            <span style={{ fontSize: 11, color: T.subtle }}>{ic.name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: CROWD_COLOR[ic.level], textTransform: "capitalize" }}>{ic.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Sidebar: Smart transfers ─── */
function SmartTransfers({ selected }) {
  if (!selected) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Zap size={13} color={T.red} />
        <span style={{ fontFamily: T.display, fontWeight: 600, fontSize: 13, color: T.white }}>Smart Transfers</span>
      </div>
      <div style={{ textAlign: "center", padding: "32px 16px", background: T.surface2, borderRadius: 12, border: `1px solid ${T.border}` }}>
        <Zap size={24} color={T.border2} style={{ marginBottom: 10 }} />
        <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>Select a route to see<br />transfer window analysis</div>
      </div>
    </div>
  );

  const windowStatus = selected.transfer_window?.includes("At risk") ? "risk"
    : selected.transfer_window?.includes("Tight") ? "tight" : "safe";
  const WS = {
    safe:  { color: T.green, label: "Safe transfer",  icon: CheckCircle   },
    tight: { color: T.amber, label: "Tight window",   icon: AlertTriangle },
    risk:  { color: T.red,   label: "At risk",        icon: XCircle       },
  };
  const ws = WS[windowStatus];
  const WIcon = ws.icon;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Zap size={13} color={T.red} />
        <span style={{ fontFamily: T.display, fontWeight: 600, fontSize: 13, color: T.white }}>Smart Transfers</span>
      </div>
      <div style={{ padding: 14, borderRadius: 12, background: `${ws.color}08`, border: `1px solid ${ws.color}22`, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <WIcon size={14} color={ws.color} />
          <span style={{ fontSize: 13, fontWeight: 600, color: ws.color }}>{ws.label}</span>
        </div>
        <div style={{ fontSize: 12, color: T.muted2, lineHeight: 1.6 }}>{selected.transfer_window}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { label: "Walk between modes", value: `${Math.round(selected.walk_to_board_km * 1000)}m` },
          { label: "Route",              value: `${selected.board_stop} → ${selected.alight_stop}` },
          { label: "Delay confidence",   value: `${Math.round(selected.delay_confidence * 100)}%` },
          { label: "Current delay",      value: selected.delay_minutes > 0 ? `+${selected.delay_minutes} min` : "On time" },
        ].map(({ label, value }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 12px", borderRadius: 8, background: T.surface2, border: `1px solid ${T.border}`,
          }}>
            <span style={{ fontSize: 11, color: T.muted }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.subtle }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Sidebar: Crowd insight ─── */
function CrowdInsight({ selected }) {
  const tips = {
    low:    { coach: "Even distribution across all coaches.",                              boarding: "Any door — no rush.",                color: T.green },
    medium: { coach: "Coaches 5–7 slightly crowded. Try coaches 1–4 or 8–9.",             boarding: "Board from first or last carriage.", color: T.amber },
    high:   { coach: "Coaches 1–4 overcrowded. Coaches 6–9 offer more space.",            boarding: "Board from rear entry for quicker access.", color: T.red },
  };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Users size={13} color={T.red} />
        <span style={{ fontFamily: T.display, fontWeight: 600, fontSize: 13, color: T.white }}>Crowd Insights</span>
      </div>
      {!selected ? (
        <div style={{ textAlign: "center", padding: "32px 16px", background: T.surface2, borderRadius: 12, border: `1px solid ${T.border}` }}>
          <Users size={24} color={T.border2} style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>Select a route to see<br />crowd and coach data</div>
        </div>
      ) : (() => {
        const tip = tips[selected.crowd_level] || tips.low;
        return (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {["low", "medium", "high"].map(l => {
                const active = selected.crowd_level === l;
                return (
                  <div key={l} style={{
                    flex: 1, padding: "10px 6px", borderRadius: 9, textAlign: "center",
                    background: active ? `${CROWD_COLOR[l]}16` : T.surface2,
                    border: `1px solid ${active ? CROWD_COLOR[l] + "35" : T.border}`,
                    transition: "all 0.2s",
                  }}>
                    <div style={{ fontSize: 11, textTransform: "capitalize", fontWeight: 600, color: active ? CROWD_COLOR[l] : T.muted }}>{l}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ padding: "12px 14px", borderRadius: 10, background: `${tip.color}08`, border: `1px solid ${tip.color}20`, fontSize: 12, color: T.subtle, lineHeight: 1.6 }}>
                {tip.coach}
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Boarding tip</div>
                <div style={{ fontSize: 12, color: T.subtle }}>{tip.boarding}</div>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={12} color={T.muted} />
                <span style={{ fontSize: 11, color: T.muted }}>Ladies coach available on local trains</span>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}

/* ─── Sidebar tabs ─── */
const SIDE_TABS = [
  { id: "alerts",    icon: Bell,   label: "Alerts"   },
  { id: "network",   icon: Radio,  label: "Network"  },
  { id: "transfers", icon: Zap,    label: "Transfer" },
  { id: "crowd",     icon: Users,  label: "Crowd"    },
];

/* ════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════ */
export default function CommuterDashboard() {
  const navigate = useNavigate();
  const [step, setStep]                   = useState(1);
  const [origin, setOrigin]               = useState(null);
  const [dest, setDest]                   = useState(null);
  const [timeBudget, setTimeBudget]       = useState(null);
  const [accessibility, setAccessibility] = useState(false);
  const [loading, setLoading]             = useState(false);
  const [routes, setRoutes]               = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [sideTab, setSideTab]             = useState("alerts");

  const swap = () => { setOrigin(dest); setDest(origin); };

  const searchRoutes = () => {
    setLoading(true);
    setTimeout(() => {
      setRoutes(MOCK_ROUTES.filter(r => r.total_minutes <= (timeBudget?.value || 999)));
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  const reset = () => {
    setStep(1); setOrigin(null); setDest(null);
    setTimeBudget(null); setRoutes([]); setSelectedRoute(null);
  };

  const STEPS = ["Choose stops", "Set time budget", "Pick your ride"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg, fontFamily: T.body, overflow: "hidden" }}>
      <InjectStyles />

      {/* ── Topbar ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", borderBottom: `1px solid ${T.border}`,
        background: T.surface, flexShrink: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", alignItems: "center", padding: 4 }}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: T.red, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 16px ${T.redGlow}` }}>
              <Train size={14} color="#fff" />
            </div>
            <div>
              <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.white }}>SAFAR</span>
              <span style={{ marginLeft: 8, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.10em" }}>Commuter</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <LiveClock />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={11} color={T.muted} />
            <span style={{ fontSize: 12, color: T.muted }}>Mumbai</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <PulseDot color={T.green} />
            <span style={{ fontSize: 11, color: T.muted }}>Live data</span>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

        {/* ── Main column ── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px 40px", minWidth: 0 }}>

          {/* Step progress */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 36, maxWidth: 560 }}>
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StepDot n={i + 1} active={step === i + 1} done={step > i + 1} />
                  <span style={{ fontSize: 12, whiteSpace: "nowrap", fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? T.white : step > i + 1 ? T.subtle : T.muted }}>
                    {label}
                  </span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, margin: "0 10px", background: step > i + 1 ? T.red : T.border, maxWidth: 60, transition: "background 0.35s" }} />}
              </React.Fragment>
            ))}
          </div>

          {/* ── STEP 1: Pick stops ── */}
          {step === 1 && (
            <div className="fade-up" style={{ maxWidth: 560 }}>
              <h1 style={{ fontFamily: T.display, fontWeight: 700, fontSize: "clamp(1.8rem,4vw,2.4rem)", color: T.white, marginBottom: 6, letterSpacing: "-0.025em", lineHeight: 1.15 }}>
                Where are you headed?
              </h1>
              <p style={{ fontSize: 14, color: T.muted2, marginBottom: 28, lineHeight: 1.6 }}>
                Pick your start and end — SAFAR searches live across local trains, metro, and MTC buses.
              </p>

              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 22 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <StopPicker label="From" value={origin} onChange={setOrigin} icon={MapPin} placeholder="Select origin" />
                  <button
                    onClick={swap}
                    style={{
                      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                      background: T.surface2, border: `1px solid ${T.border2}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", alignSelf: "center", marginTop: 20, transition: "border-color 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(220,38,38,0.4)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = T.border2}
                  >
                    <ArrowUpDown size={12} color={T.muted} />
                  </button>
                  <StopPicker label="To" value={dest} onChange={setDest} icon={Navigation} placeholder="Select destination" />
                </div>

                <button
                  onClick={() => setAccessibility(v => !v)}
                  style={{
                    marginTop: 14, display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                    background: accessibility ? "rgba(220,38,38,0.08)" : "transparent",
                    border: `1px solid ${accessibility ? "rgba(220,38,38,0.28)" : T.border2}`,
                    color: accessibility ? T.red : T.muted,
                    fontSize: 12, fontWeight: 500, fontFamily: T.body, transition: "all 0.15s",
                  }}
                >
                  <Accessibility size={12} />
                  Wheelchair-accessible routes only
                  {accessibility && <CheckCircle size={12} style={{ marginLeft: "auto" }} />}
                </button>

                <button
                  onClick={() => origin && dest && setStep(2)}
                  disabled={!origin || !dest}
                  style={{
                    marginTop: 18, width: "100%", padding: "13px", borderRadius: 11, border: "none",
                    cursor: (!origin || !dest) ? "not-allowed" : "pointer",
                    background: T.red, color: T.white, fontSize: 14, fontWeight: 600, fontFamily: T.display,
                    opacity: (!origin || !dest) ? 0.3 : 1,
                    boxShadow: (!origin || !dest) ? "none" : `0 0 28px ${T.redGlow}`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                  }}
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ marginTop: 28 }}>
                <SectionLabel>Popular stops — tap to fill</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {POPULAR_STOPS.slice(0, 8).map(s => (
                    <button
                      key={s.name}
                      onClick={() => !origin ? setOrigin(s) : !dest ? setDest(s) : null}
                      style={{
                        padding: "6px 13px", borderRadius: 8, fontSize: 12, fontFamily: T.body,
                        background: T.surface2, border: `1px solid ${T.border2}`,
                        color: T.subtle, cursor: "pointer", transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)"; e.currentTarget.style.color = T.white; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = T.subtle; }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Time budget ── */}
          {step === 2 && (
            <div className="fade-up" style={{ maxWidth: 560 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 28,
                padding: "11px 16px", borderRadius: 11, background: T.surface, border: `1px solid ${T.border}`,
              }}>
                <MapPin size={12} color={T.red} />
                <span style={{ fontSize: 13, fontWeight: 600, color: T.white, fontFamily: T.display }}>{origin?.name}</span>
                <ArrowRight size={12} color={T.muted} style={{ flexShrink: 0 }} />
                <Navigation size={12} color={T.red} />
                <span style={{ fontSize: 13, fontWeight: 600, color: T.white, fontFamily: T.display }}>{dest?.name}</span>
                <button onClick={() => setStep(1)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 11, fontFamily: T.body }}>
                  Edit
                </button>
              </div>

              <h1 style={{ fontFamily: T.display, fontWeight: 700, fontSize: "clamp(1.8rem,4vw,2.4rem)", color: T.white, marginBottom: 6, letterSpacing: "-0.025em" }}>
                How much time do you have?
              </h1>
              <p style={{ fontSize: 14, color: T.muted2, marginBottom: 28, lineHeight: 1.6 }}>
                We filter out routes that exceed your budget — including live delays.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
                {TIME_BUDGETS.map(t => {
                  const active = timeBudget?.value === t.value;
                  return (
                    <button
                      key={t.label}
                      onClick={() => setTimeBudget(t)}
                      style={{
                        padding: "20px 12px", borderRadius: 12, cursor: "pointer",
                        background: active ? "rgba(220,38,38,0.09)" : T.surface2,
                        border: `1px solid ${active ? "rgba(220,38,38,0.40)" : T.border2}`,
                        color: active ? T.red : T.subtle,
                        fontFamily: T.display, fontWeight: 700, fontSize: 19,
                        boxShadow: active ? "0 0 20px rgba(220,38,38,0.14)" : "none",
                        transition: "all 0.15s",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={timeBudget && !loading ? searchRoutes : undefined}
                disabled={!timeBudget || loading}
                style={{
                  width: "100%", padding: "14px", borderRadius: 11, border: "none",
                  cursor: (!timeBudget || loading) ? "not-allowed" : "pointer",
                  background: T.red, color: T.white, fontSize: 14, fontWeight: 600, fontFamily: T.display,
                  opacity: (!timeBudget || loading) ? 0.35 : 1,
                  boxShadow: (!timeBudget || loading) ? "none" : `0 0 28px ${T.redGlow}`,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s",
                }}
              >
                {loading
                  ? <><Loader size={14} className="spin" /> Finding best routes…</>
                  : <><span>Find routes</span> <ArrowRight size={14} /></>
                }
              </button>
            </div>
          )}

          {/* ── STEP 3: Results ── */}
          {step === 3 && (
            <div className="fade-up">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: "1.4rem", color: T.white }}>{origin?.name}</span>
                    <ArrowRight size={16} color={T.red} style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: "1.4rem", color: T.white }}>{dest?.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span>Within {timeBudget?.label}</span>
                    <span style={{ color: T.border }}>·</span>
                    <span>{routes.length} options</span>
                    <span style={{ color: T.border }}>·</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><PulseDot color={T.green} /> Live</span>
                    {MOCK_ALERTS.some(a => a.severity === "high") && (
                      <><span style={{ color: T.border }}>·</span><span style={{ color: T.amber }}>⚠ Active disruptions</span></>
                    )}
                  </div>
                </div>
                <button
                  onClick={reset}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                    background: T.surface2, border: `1px solid ${T.border2}`, color: T.muted,
                    fontSize: 12, cursor: "pointer", fontFamily: T.body,
                  }}
                >
                  <RefreshCw size={11} /> New search
                </button>
              </div>

              {routes.some(r => r.disrupted) && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 15px", borderRadius: 11, marginBottom: 10, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.18)" }}>
                  <RefreshCw size={13} color={T.amber} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.amber }}>Auto re-route active</div>
                    <div style={{ fontSize: 11, color: "rgba(245,158,11,0.55)" }}>Disrupted routes shown at bottom — best alternate at top</div>
                  </div>
                </div>
              )}

              {routes.some(r => r.delay_minutes > 0) && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 15px", borderRadius: 11, marginBottom: 14, background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.14)" }}>
                  <TrendingUp size={13} color={T.red} />
                  <div style={{ fontSize: 12, color: "rgba(220,38,38,0.65)" }}>
                    Cross-modal delay propagation detected — downstream connections updated live
                  </div>
                </div>
              )}

              {routes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: T.muted }}>
                  <Clock size={32} style={{ marginBottom: 12, opacity: 0.35 }} />
                  <div style={{ fontSize: 14, marginBottom: 12 }}>No routes fit within {timeBudget?.label}.</div>
                  <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 13, fontFamily: T.body }}>
                    Try a longer time budget →
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 660 }}>
                  {routes.map((r, i) => (
                    <RouteCard key={r.id} option={r} rank={i} onSelect={setSelectedRoute} selected={selectedRoute} />
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                    <CheckCircle size={11} color={T.green} />
                    <span style={{ fontSize: 11, color: T.muted }}>ML-powered ETAs · Confidence-scored predictions · Journey auto-logged</span>
                  </div>
                  {accessibility && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)" }}>
                      <Volume2 size={13} color={T.blue} />
                      <span style={{ fontSize: 12, color: "rgba(59,130,246,0.75)" }}>Accessible routes only · Lift and ramp guidance available at each stop</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ── Right sidebar ── */}
        <aside style={{ width: 300, borderLeft: `1px solid ${T.border}`, background: T.surface, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.surface, flexShrink: 0 }}>
            {SIDE_TABS.map(tab => {
              const active = sideTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSideTab(tab.id)}
                  title={tab.label}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    padding: "10px 4px", border: "none", cursor: "pointer", background: "transparent",
                    borderBottom: `2px solid ${active ? T.red : "transparent"}`, transition: "all 0.15s",
                  }}
                >
                  <Icon size={13} color={active ? T.red : T.muted} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: active ? T.red : T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
            {sideTab === "alerts"    && <AlertsPanel alerts={MOCK_ALERTS} />}
            {sideTab === "network"   && <NetworkStatus />}
            {sideTab === "transfers" && <SmartTransfers selected={selectedRoute} />}
            {sideTab === "crowd"     && <CrowdInsight selected={selectedRoute} />}
          </div>

          <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 16px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {[{ icon: Map, label: "Open live map" }, { icon: BarChart2, label: "Network analytics" }].map(({ icon: Icon, label }) => (
              <button
                key={label}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "9px", borderRadius: 9, background: T.surface2, border: `1px solid ${T.border2}`,
                  color: T.subtle, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.body, transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(220,38,38,0.28)"; e.currentTarget.style.color = T.white; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = T.subtle; }}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}