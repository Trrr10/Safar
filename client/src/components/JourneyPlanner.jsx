import React, { useState } from "react";
import { planJourney } from "../utils/api";
import {
  MapPin, Navigation, Clock, Users, AlertTriangle,
  RefreshCw, ChevronDown, Loader, Accessibility, CheckCircle, ArrowUpDown
} from "lucide-react";

const POPULAR = [
  { name: "Churchgate",     lat: 18.9322, lng: 72.8264 },
  { name: "Andheri",        lat: 19.1136, lng: 72.8697 },
  { name: "Dadar",          lat: 19.0178, lng: 72.8478 },
  { name: "Borivali",       lat: 19.2307, lng: 72.8567 },
  { name: "Ghatkopar",      lat: 19.0863, lng: 72.9082 },
  { name: "Mumbai Central", lat: 18.9694, lng: 72.8194 },
  { name: "CST",            lat: 18.9400, lng: 72.8354 },
  { name: "Bandra",         lat: 19.0596, lng: 72.8295 },
];

const MODE_COLORS = { bus: "#dc2626", metro: "#f97316", train: "#7c3aed" };
const MODE_ICONS  = { bus: "🚌", metro: "🚇", train: "🚆" };
const CROWD_COLOR = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };

function StopSelect({ label, value, onChange, icon: Icon }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className="block text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-1.5">{label}</label>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#262626] hover:border-[#dc2626]/40 transition-colors text-left"
      >
        <Icon size={14} className="text-[#dc2626] flex-shrink-0" />
        <span className={`flex-1 text-sm truncate ${value ? "text-white" : "text-[#3f3f46]"}`}>
          {value?.name || `Select ${label.toLowerCase()}`}
        </span>
        <ChevronDown size={12} className={`text-[#52525b] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#161616] border border-[#262626] rounded-xl overflow-hidden z-50 shadow-2xl">
          {POPULAR.map(s => (
            <button
              key={s.name}
              onClick={() => { onChange(s); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-[#1c1c1c] transition-colors text-sm text-left"
            >
              <MapPin size={12} className="text-[#dc2626] flex-shrink-0" />
              <span className="text-[#a1a1aa]">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RouteCard({ option, index, isAlternate }) {
  const [expanded, setExpanded] = useState(false);
  const color = MODE_COLORS[option.mode] || "#dc2626";
  const isBest = index === 0 && !isAlternate;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-200"
      style={{
        background: isBest ? "rgba(220,38,38,0.05)" : isAlternate ? "rgba(245,158,11,0.05)" : "#161616",
        borderColor: isBest ? "rgba(220,38,38,0.3)" : isAlternate ? "rgba(245,158,11,0.3)" : "#262626",
      }}
    >
      <div className="flex items-center gap-3 p-3.5 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        {/* Mode badge */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
          style={{ background: `${color}12`, border: `1px solid ${color}28` }}
        >
          {MODE_ICONS[option.mode] || "🚌"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="text-xs font-semibold text-white truncate">{option.route_name}</span>
            {isBest && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#dc2626]/15 text-[#dc2626] border border-[#dc2626]/25 font-semibold flex-shrink-0">Best</span>
            )}
            {isAlternate && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-semibold flex-shrink-0">Alt</span>
            )}
            {option.disrupted && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-900/25 text-red-400 border border-red-500/25 font-semibold flex-shrink-0">⚠</span>
            )}
          </div>
          <div className="text-[11px] text-[#52525b] truncate">{option.board_stop} → {option.alight_stop}</div>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className="text-base font-bold text-white font-['Space_Grotesk',sans-serif]">{option.total_minutes}<span className="text-xs font-normal text-[#52525b] ml-0.5">m</span></div>
          <div className="text-[11px] text-[#52525b]">{option.eta}</div>
        </div>
      </div>

      {expanded && (
        <div className="px-3.5 pb-3.5 border-t border-[#1f1f1f]">
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: "Delay", value: option.delay_minutes > 0 ? `+${option.delay_minutes} min` : "On time", color: option.delay_minutes > 0 ? "#ef4444" : "#22c55e" },
              { label: "Crowd", value: option.crowd_level, color: CROWD_COLOR[option.crowd_level], cap: true },
              { label: "Walk",  value: `${(option.walk_to_board_km * 1000).toFixed(0)}m`, color: "#a1a1aa" },
              { label: "Confidence", value: `${(option.delay_confidence * 100).toFixed(0)}%`, color: "#a1a1aa" },
            ].map(({ label, value, color: c, cap }) => (
              <div key={label} className="bg-[#111111] rounded-lg p-2.5 border border-[#1f1f1f]">
                <div className="text-[10px] text-[#52525b] mb-1">{label}</div>
                <div className="text-xs font-semibold" style={{ color: c, textTransform: cap ? "capitalize" : undefined }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JourneyPlanner() {
  const [origin,      setOrigin]      = useState(null);
  const [destination, setDestination] = useState(null);
  const [a11y,        setA11y]        = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);

  const swap = () => { setOrigin(destination); setDestination(origin); setResult(null); };

  const search = async () => {
    if (!origin || !destination) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await planJourney({
        origin_name: origin.name, origin_lat: origin.lat, origin_lng: origin.lng,
        dest_name: destination.name, dest_lat: destination.lat, dest_lng: destination.lng,
        accessibility: a11y,
      });
      setResult(data);
    } catch {
      setError("Could not fetch journey. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Navigation size={14} className="text-[#dc2626]" />
        <h3 className="font-['Space_Grotesk',sans-serif] font-semibold text-sm text-white">Plan journey</h3>
      </div>

      {/* Input panel */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 mb-3">
        <div className="flex flex-col gap-2.5">
          <StopSelect label="From" value={origin}      onChange={setOrigin}      icon={MapPin} />

          {/* Swap */}
          <div className="flex justify-center">
            <button
              onClick={swap}
              className="w-7 h-7 rounded-full bg-[#1c1c1c] border border-[#262626] flex items-center justify-center hover:border-[#dc2626]/40 hover:bg-[#dc2626]/8 transition-all"
            >
              <ArrowUpDown size={11} className="text-[#52525b]" />
            </button>
          </div>

          <StopSelect label="To"   value={destination} onChange={setDestination} icon={Navigation} />
        </div>

        {/* A11y toggle */}
        <button
          onClick={() => setA11y(v => !v)}
          className="mt-3 flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg border transition-all"
          style={a11y
            ? { background: "rgba(220,38,38,0.08)", borderColor: "rgba(220,38,38,0.3)", color: "#dc2626" }
            : { background: "transparent", borderColor: "#262626", color: "#52525b" }
          }
        >
          <Accessibility size={12} />
          Wheelchair-friendly only
        </button>

        {/* Search */}
        <button
          onClick={search}
          disabled={!origin || !destination || loading}
          className="w-full mt-3 py-2.5 rounded-xl font-semibold text-xs text-white flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "#dc2626", boxShadow: (!origin || !destination || loading) ? "none" : "0 0 20px rgba(220,38,38,0.3)" }}
        >
          {loading ? <><Loader size={13} className="animate-spin" /> Searching…</> : "Find best route"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-900/15 border border-red-500/25 text-red-400 text-xs mb-3">
          <AlertTriangle size={13} />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-2.5 animate-fade-up overflow-y-auto flex-1 min-h-0">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <div className="text-xs font-semibold text-white">{result.origin} → {result.destination}</div>
              <div className="text-[11px] text-[#52525b]">{result.distance_km} km · {result.options?.length} options</div>
            </div>
            {result.has_disruption && (
              <div className="flex items-center gap-1 text-[11px] text-amber-400">
                <AlertTriangle size={11} /> Disruption
              </div>
            )}
          </div>

          {result.has_disruption && result.alternate && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500/6 border border-amber-500/18">
              <RefreshCw size={12} className="text-amber-400 flex-shrink-0" />
              <div>
                <div className="text-[10px] font-semibold text-amber-400">Auto re-route available</div>
                <div className="text-[10px] text-amber-400/60">Alternate shown below</div>
              </div>
            </div>
          )}

          {result.options?.map((opt, i) => <RouteCard key={opt.id + i} option={opt} index={i} isAlternate={false} />)}
          {result.alternate && <RouteCard option={result.alternate} index={99} isAlternate />}

          <div className="flex items-center gap-1.5 text-[11px] text-[#22c55e] px-0.5 pb-1">
            <CheckCircle size={11} /> Journey saved · ML predictions applied
          </div>
        </div>
      )}
    </div>
  );
}