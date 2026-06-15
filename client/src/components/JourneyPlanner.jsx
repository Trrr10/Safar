import React, { useState, useRef, useEffect } from "react";
import {
  MapPin, Navigation, ArrowUpDown, ArrowRight, Accessibility,
  CheckCircle, ChevronDown, Loader, RefreshCw, AlertTriangle,
  Clock, Users, TrendingUp, X, Radio,
} from "lucide-react";
import { T, MODE_META, CROWD_COLOR, Badge, PulseDot, SectionLabel } from "../utils/tokens.jsx";
import { POPULAR_STOPS, MOCK_ROUTES, TIME_BUDGETS } from "../utils/mockData.js";

/* ── Stop picker dropdown ── */
function StopPicker({ label, value, onChange, icon: Icon, placeholder }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  const filtered = POPULAR_STOPS.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <SectionLabel mb={6}>{label}</SectionLabel>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "11px 14px", borderRadius: 12,
          background: T.s2, border: `1px solid ${open ? "rgba(220,38,38,0.45)" : T.b2}`,
          cursor: "pointer", textAlign: "left", transition: "border-color 0.15s",
          outline: "none",
        }}
      >
        <Icon size={13} color={T.red} style={{ flexShrink: 0 }} />
        <span style={{
          flex: 1, fontSize: 13, fontFamily: T.body, fontWeight: value ? 500 : 400,
          color: value ? T.white : T.dim,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {value?.name || placeholder}
        </span>
        <ChevronDown
          size={12} color={T.dim}
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
        />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 5px)", left: 0, right: 0, zIndex: 300,
          background: T.s2, border: `1px solid ${T.b2}`,
          borderRadius: 13, overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.75)",
        }}>
          <div style={{ padding: "8px 12px", borderBottom: `1px solid ${T.b1}` }}>
            <input
              autoFocus value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search stops…"
              style={{
                width: "100%", background: "transparent", border: "none",
                outline: "none", fontSize: 13, color: T.white, padding: "3px 0",
                fontFamily: T.body,
              }}
            />
          </div>
          <div style={{ maxHeight: 210, overflowY: "auto" }}>
            {filtered.length === 0
              ? <div style={{ padding: 14, fontSize: 12, color: T.dim, textAlign: "center" }}>No stops found</div>
              : filtered.map(s => (
                <button
                  key={s.name}
                  onClick={() => { onChange(s); setOpen(false); setQuery(""); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", background: "transparent",
                    border: "none", cursor: "pointer", textAlign: "left",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = T.s3}
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

/* ── Stepper dot ── */
function StepDot({ n, active, done }) {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: done ? T.red : active ? "rgba(220,38,38,0.12)" : T.s2,
      border: `1.5px solid ${done || active ? T.red : T.b2}`,
      fontSize: 12, fontWeight: 700, fontFamily: T.display,
      color: done ? T.white : active ? T.red : T.dim,
      transition: "all 0.25s",
    }}>
      {done ? <CheckCircle size={13} /> : n}
    </div>
  );
}

/* ── Route card ── */
function RouteCard({ option, rank, selected, onSelect, onTrack }) {
  const [expanded, setExpanded] = useState(rank === 0);
  const m = MODE_META[option.mode] || MODE_META.bus;
  const isBest = rank === 0 && !option.disrupted;
  const isSel  = selected?.id === option.id;
  const borderColor = isSel ? T.red : option.disrupted ? "rgba(239,68,68,0.25)" : isBest ? "rgba(220,38,38,0.2)" : T.b2;
  const bgColor = isSel ? "rgba(220,38,38,0.06)" : option.disrupted ? "rgba(239,68,68,0.03)" : T.s1;

  return (
    <div
      onClick={() => { onSelect(option); setExpanded(e => !e); }}
      className="anim-fade-up"
      style={{
        borderRadius: 16, overflow: "hidden",
        border: `1px solid ${borderColor}`,
        background: bgColor,
        transition: "all 0.2s ease", cursor: "pointer",
        animationDelay: `${rank * 0.06}s`,
      }}
    >
      {/* Best banner */}
      {isBest && (
        <div style={{
          padding: "5px 16px", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          background: "rgba(220,38,38,0.08)", color: T.red,
          borderBottom: "1px solid rgba(220,38,38,0.14)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <PulseDot color={T.red} size={5} />
          Recommended · fastest option
        </div>
      )}

      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px" }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: `${m.color}14`, border: `1px solid ${m.color}28`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>{m.emoji}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.white, fontFamily: T.display }}>{option.route_name}</span>
            {option.disrupted && <Badge label="Disrupted" color={T.red} />}
            {option.delay_minutes > 0 && !option.disrupted && <Badge label={`+${option.delay_minutes}m delay`} color={T.amber} />}
          </div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.4 }}>
            {option.board_stop} → {option.alight_stop}
            <span style={{ color: T.b3, margin: "0 6px" }}>·</span>
            {option.fare}
            <span style={{ color: T.b3, margin: "0 6px" }}>·</span>
            {option.platform}
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontFamily: T.display, fontWeight: 700, fontSize: 28,
            color: option.disrupted ? T.red : T.white, lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}>
            {option.total_minutes}
            <span style={{ fontSize: 13, fontWeight: 400, color: T.dim, marginLeft: 3 }}>m</span>
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>arr {option.eta}</div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.b1}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
            {[
              { label: "Crowd",      value: option.crowd_level,           color: CROWD_COLOR[option.crowd_level], cap: true },
              { label: "Walk",       value: `${Math.round(option.walk_to_board_km * 1000)}m to stop`, color: T.subtle },
              { label: "Delay conf", value: `${Math.round(option.delay_confidence * 100)}%`,
                color: option.delay_confidence > 0.85 ? T.green : T.amber },
              { label: "Transfer",   value: option.transfer_window,
                color: option.transfer_window?.startsWith("Safe") || option.transfer_window === "Comfortable" ? T.green
                  : option.transfer_window?.startsWith("Tight") ? T.amber : T.red },
              { label: "Delay",      value: option.delay_minutes > 0 ? `+${option.delay_minutes} min` : "On time",
                color: option.delay_minutes > 0 ? T.red : T.green },
              { label: "Platform",   value: option.platform, color: T.subtle },
            ].map(({ label, value, color, cap }) => (
              <div key={label} style={{
                background: T.s2, borderRadius: 10, padding: "10px 12px", border: `1px solid ${T.b1}`,
              }}>
                <div style={{ fontSize: 10, color: T.dim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color, textTransform: cap ? "capitalize" : "none" }}>{value}</div>
              </div>
            ))}
          </div>

          {option.features?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {option.features.map(f => (
                <span key={f} style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 7,
                  background: T.s2, border: `1px solid ${T.b2}`, color: T.muted,
                }}>{f}</span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {!option.disrupted && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onTrack?.(option);
                }}
                style={{
                  flex: 1, padding: "11px",
                  borderRadius: 11, border: "none", cursor: "pointer",
                  background: T.red,
                  color: T.white,
                  fontSize: 13, fontWeight: 600, fontFamily: T.display,
                  boxShadow: "0 0 24px rgba(220,38,38,0.28)",
                  letterSpacing: "0.01em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 32px rgba(220,38,38,0.45)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 24px rgba(220,38,38,0.28)"}
              >
                <Radio size={13} />
                Select &amp; track
              </button>
            )}

            {option.disrupted && (
              <button
                onClick={e => e.stopPropagation()}
                style={{
                  flex: 1, padding: "11px",
                  borderRadius: 11, cursor: "pointer",
                  background: "rgba(245,158,11,0.15)",
                  border: "1px solid rgba(245,158,11,0.35)",
                  color: T.amber,
                  fontSize: 13, fontWeight: 600, fontFamily: T.display,
                  letterSpacing: "0.01em",
                }}
              >
                ⚠ Use alternate route above
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   JOURNEY PLANNER (exported)
══════════════════════════════════════ */
export default function JourneyPlanner({ onRouteSelect, onTrackRoute }) {
  const [step,          setStep]          = useState(1);
  const [origin,        setOrigin]        = useState(null);
  const [dest,          setDest]          = useState(null);
  const [timeBudget,    setTimeBudget]    = useState(null);
  const [accessibility, setAccessibility] = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [routes,        setRoutes]        = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const swap  = () => { setOrigin(dest); setDest(origin); };
  const reset = () => { setStep(1); setOrigin(null); setDest(null); setTimeBudget(null); setRoutes([]); setSelectedRoute(null); };

  const searchRoutes = () => {
    setLoading(true);
    setTimeout(() => {
      const filtered = MOCK_ROUTES.filter(r => r.total_minutes <= (timeBudget?.value || 999));
      setRoutes(filtered);
      setLoading(false);
      setStep(3);
    }, 1400);
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    onRouteSelect?.(route);
  };

  const handleTrack = (route) => {
    setSelectedRoute(route);
    onRouteSelect?.(route);
    onTrackRoute?.(route);
  };

  const STEPS = ["Choose stops", "Time budget", "Pick your ride"];

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "32px 36px", maxWidth: 700, margin: "0 auto" }}>

      {/* ── Step progress ── */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <StepDot n={i + 1} active={step === i + 1} done={step > i + 1} />
              <span style={{
                fontSize: 12, whiteSpace: "nowrap",
                fontWeight: step === i + 1 ? 600 : 400,
                color: step === i + 1 ? T.white : step > i + 1 ? T.subtle : T.dim,
              }}>{label}</span>
            </div>
            {i < 2 && (
              <div style={{
                flex: 1, height: 1, margin: "0 12px",
                background: step > i + 1 ? T.red : T.b1,
                maxWidth: 64, transition: "background 0.4s",
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ─────────────────── STEP 1 ─────────────────── */}
      {step === 1 && (
        <div className="anim-fade-up">
          <h1 style={{
            fontFamily: T.display, fontWeight: 700,
            fontSize: "clamp(1.75rem,3.5vw,2.5rem)",
            color: T.white, marginBottom: 6, letterSpacing: "-0.025em", lineHeight: 1.1,
          }}>
            Where are you headed?
          </h1>
          <p style={{ fontSize: 14, color: T.muted, marginBottom: 28, lineHeight: 1.65 }}>
            SAFAR searches live across local trains, metro, and MTC buses simultaneously.
          </p>

          <div style={{
            background: T.s1, border: `1px solid ${T.b1}`,
            borderRadius: 20, padding: 22, marginBottom: 28,
          }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <StopPicker label="From" value={origin} onChange={setOrigin} icon={MapPin} placeholder="Select origin stop" />
              <button
                onClick={swap}
                style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: T.s2, border: `1px solid ${T.b2}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", alignSelf: "center", marginTop: 22,
                  transition: "all 0.15s", outline: "none",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(220,38,38,0.45)"; e.currentTarget.style.background = "rgba(220,38,38,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.b2; e.currentTarget.style.background = T.s2; }}
              >
                <ArrowUpDown size={13} color={T.dim} />
              </button>
              <StopPicker label="To" value={dest} onChange={setDest} icon={Navigation} placeholder="Select destination" />
            </div>

            <button
              onClick={() => setAccessibility(v => !v)}
              style={{
                marginTop: 14, display: "flex", alignItems: "center", gap: 8,
                padding: "8px 14px", borderRadius: 9, cursor: "pointer",
                background: accessibility ? "rgba(220,38,38,0.08)" : "transparent",
                border: `1px solid ${accessibility ? "rgba(220,38,38,0.3)" : T.b2}`,
                color: accessibility ? T.red : T.dim,
                fontSize: 12, fontWeight: 500, fontFamily: T.body,
                transition: "all 0.15s", outline: "none",
              }}
            >
              <Accessibility size={12} />
              Wheelchair-accessible routes only
              {accessibility && <CheckCircle size={12} color={T.red} style={{ marginLeft: "auto" }} />}
            </button>

            <button
              onClick={() => origin && dest && setStep(2)}
              disabled={!origin || !dest}
              style={{
                marginTop: 16, width: "100%", padding: "13px",
                borderRadius: 12, border: "none",
                cursor: !origin || !dest ? "not-allowed" : "pointer",
                background: T.red, color: T.white,
                fontSize: 14, fontWeight: 600, fontFamily: T.display,
                opacity: !origin || !dest ? 0.3 : 1,
                boxShadow: !origin || !dest ? "none" : "0 0 28px rgba(220,38,38,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s", letterSpacing: "0.01em",
              }}
            >
              Continue <ArrowRight size={14} />
            </button>
          </div>

          <div>
            <SectionLabel>Quick select</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {POPULAR_STOPS.slice(0, 9).map(s => (
                <button
                  key={s.name}
                  onClick={() => !origin ? setOrigin(s) : !dest ? setDest(s) : null}
                  style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontFamily: T.body,
                    background: T.s2, border: `1px solid ${T.b2}`,
                    color: T.subtle, cursor: "pointer", transition: "all 0.15s", outline: "none",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(220,38,38,0.35)"; e.currentTarget.style.color = T.white; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.b2; e.currentTarget.style.color = T.subtle; }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────── STEP 2 ─────────────────── */}
      {step === 2 && (
        <div className="anim-fade-up">
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 28,
            padding: "10px 16px", borderRadius: 12,
            background: T.s1, border: `1px solid ${T.b1}`,
          }}>
            <MapPin size={12} color={T.red} />
            <span style={{ fontSize: 13, fontWeight: 600, color: T.white, fontFamily: T.display }}>{origin?.name}</span>
            <ArrowRight size={12} color={T.dim} style={{ flexShrink: 0 }} />
            <Navigation size={12} color={T.red} />
            <span style={{ fontSize: 13, fontWeight: 600, color: T.white, fontFamily: T.display }}>{dest?.name}</span>
            <button
              onClick={() => setStep(1)}
              style={{
                marginLeft: "auto", background: "none", border: "none",
                cursor: "pointer", color: T.muted, fontSize: 11,
                fontFamily: T.body, display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <X size={11} /> Edit
            </button>
          </div>

          <h1 style={{
            fontFamily: T.display, fontWeight: 700,
            fontSize: "clamp(1.75rem,3.5vw,2.5rem)",
            color: T.white, marginBottom: 6, letterSpacing: "-0.025em",
          }}>
            How much time do you have?
          </h1>
          <p style={{ fontSize: 14, color: T.muted, marginBottom: 28, lineHeight: 1.65 }}>
            Live delays are factored in. Only routes that fit get shown.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
            {TIME_BUDGETS.map(t => {
              const active = timeBudget?.value === t.value;
              return (
                <button
                  key={t.label}
                  onClick={() => setTimeBudget(t)}
                  style={{
                    padding: "22px 12px", borderRadius: 14, cursor: "pointer",
                    background: active ? "rgba(220,38,38,0.09)" : T.s2,
                    border: `1.5px solid ${active ? "rgba(220,38,38,0.45)" : T.b2}`,
                    color: active ? T.red : T.subtle,
                    fontFamily: T.display, fontWeight: 700, fontSize: 20,
                    boxShadow: active ? "0 0 20px rgba(220,38,38,0.14)" : "none",
                    transition: "all 0.15s", outline: "none",
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = "rgba(220,38,38,0.25)"; e.currentTarget.style.color = T.white; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = T.b2; e.currentTarget.style.color = T.subtle; } }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => timeBudget && !loading ? searchRoutes() : null}
            disabled={!timeBudget || loading}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              cursor: !timeBudget || loading ? "not-allowed" : "pointer",
              background: T.red, color: T.white,
              fontSize: 14, fontWeight: 600, fontFamily: T.display,
              opacity: !timeBudget || loading ? 0.35 : 1,
              boxShadow: !timeBudget || loading ? "none" : "0 0 28px rgba(220,38,38,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s", letterSpacing: "0.01em",
            }}
          >
            {loading
              ? <><Loader size={14} className="anim-spin" /> Finding best routes…</>
              : <><span>Find routes</span> <ArrowRight size={14} /></>
            }
          </button>
        </div>
      )}

      {/* ─────────────────── STEP 3 ─────────────────── */}
      {step === 3 && (
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: "1.5rem", color: T.white, letterSpacing: "-0.02em" }}>
                  {origin?.name}
                </span>
                <ArrowRight size={16} color={T.red} style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: "1.5rem", color: T.white, letterSpacing: "-0.02em" }}>
                  {dest?.name}
                </span>
              </div>
              <div style={{ fontSize: 12, color: T.dim, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span>Within {timeBudget?.label}</span>
                <span style={{ color: T.b3 }}>·</span>
                <span>{routes.length} options found</span>
                <span style={{ color: T.b3 }}>·</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <PulseDot color={T.green} size={5} /> Live ETAs
                </span>
              </div>
            </div>
            <button
              onClick={reset}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                borderRadius: 9, background: T.s2, border: `1px solid ${T.b2}`,
                color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: T.body, outline: "none",
              }}
            >
              <RefreshCw size={11} /> New search
            </button>
          </div>

          {routes.some(r => r.disrupted) && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 15px",
              borderRadius: 12, marginBottom: 10,
              background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)",
            }}>
              <RefreshCw size={13} color={T.amber} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.amber }}>Auto re-route active</div>
                <div style={{ fontSize: 11, color: "rgba(245,158,11,0.6)" }}>Disrupted services shown at bottom · best alternate at top</div>
              </div>
            </div>
          )}

          {routes.some(r => r.delay_minutes > 0) && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
              borderRadius: 12, marginBottom: 16,
              background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.14)",
            }}>
              <TrendingUp size={13} color="rgba(220,38,38,0.7)" />
              <span style={{ fontSize: 12, color: "rgba(220,38,38,0.65)" }}>
                Cross-modal delay propagation detected — downstream connections updated live
              </span>
            </div>
          )}

          {routes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Clock size={32} color={T.b3} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: T.dim, marginBottom: 12 }}>No routes fit within {timeBudget?.label}.</div>
              <button
                onClick={() => setStep(2)}
                style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 13, fontFamily: T.body }}
              >
                Try a longer time budget →
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {routes.map((r, i) => (
                <RouteCard
                  key={r.id} option={r} rank={i}
                  selected={selectedRoute}
                  onSelect={handleRouteSelect}
                  onTrack={handleTrack}
                />
              ))}
              <div style={{
                display: "flex", alignItems: "center", gap: 6, marginTop: 8,
                paddingTop: 14, borderTop: `1px solid ${T.b1}`,
              }}>
                <CheckCircle size={11} color={T.green} />
                <span style={{ fontSize: 11, color: T.dim }}>ML-powered ETAs · confidence-scored · journey auto-logged</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}