import React, { useEffect, useState, useRef } from "react";
import { Map } from "lucide-react";
import { T, PulseDot } from "../utils/tokens.jsx";
import { MOCK_VEHICLES } from "../utils/mockData.js";

/* Note: This component conditionally imports Leaflet.
   If react-leaflet is available, it renders a real map.
   Otherwise it falls back to a styled placeholder. */

const MODE_COLORS = { bus: "#dc2626", metro: "#f97316", train: "#7c3aed" };
const MODE_LABELS = { bus: "🚌", metro: "🚇", train: "🚆" };
const CROWD_COLORS = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };
const MUMBAI = [19.076, 72.877];

const MODE_TABS = [
  { id: "all",   label: "All"   },
  { id: "bus",   label: "Bus"   },
  { id: "metro", label: "Metro" },
  { id: "train", label: "Train" },
];

function MapFallback({ vehicles, filter }) {
  const filtered = vehicles.filter(v => filter === "all" || v.mode === filter);
  return (
    <div style={{
      flex: 1, borderRadius: 12, overflow: "hidden",
      border: `1px solid ${T.b1}`, position: "relative",
      background: "#0d0d0d", minHeight: 300,
    }}>
      {/* Dark grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
      }} />

      {/* Simulated vehicles */}
      {filtered.map((v, i) => {
        const color = MODE_COLORS[v.mode] || T.red;
        const xPct = 15 + (i * 13) % 70;
        const yPct = 15 + (i * 17) % 65;
        return (
          <div key={v.id} style={{
            position: "absolute", left: `${xPct}%`, top: `${yPct}%`,
            transform: "translate(-50%, -50%)",
            width: 32, height: 32, borderRadius: "50%",
            background: `${color}16`, border: `1.5px solid ${color}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, cursor: "pointer",
          }}
            title={`${v.routes?.name} — ${v.crowd_level} crowd`}
          >
            {MODE_LABELS[v.mode]}
          </div>
        );
      })}

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 10, left: 10,
        display: "flex", gap: 10, padding: "6px 10px",
        background: "rgba(13,13,13,0.9)", border: `1px solid ${T.b1}`,
        borderRadius: 8,
      }}>
        {Object.entries(MODE_COLORS).map(([mode, color]) => (
          <div key={mode} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: 10, color: T.muted, textTransform: "capitalize" }}>{mode}</span>
          </div>
        ))}
      </div>

      {/* Live badge */}
      <div style={{
        position: "absolute", top: 10, right: 10,
        display: "flex", alignItems: "center", gap: 6,
        padding: "4px 10px", background: "rgba(13,13,13,0.9)",
        border: `1px solid ${T.b1}`, borderRadius: 20,
      }}>
        <PulseDot color={T.green} size={5} />
        <span style={{ fontSize: 10, color: T.muted }}>{filtered.length} live</span>
      </div>

      {/* Map placeholder label */}
      <div style={{
        position: "absolute", bottom: "50%", left: "50%",
        transform: "translate(-50%, 50%)",
        fontSize: 11, color: T.dim, pointerEvents: "none",
        textAlign: "center",
      }}>
        <div style={{ marginBottom: 4 }}>Connect Leaflet for interactive map</div>
      </div>
    </div>
  );
}

export default function LiveMap() {
  const [filter, setFilter] = useState("all");
  const vehicles = MOCK_VEHICLES;
  const filtered = vehicles.filter(v => filter === "all" || v.mode === filter);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "20px 16px", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Map size={14} color={T.red} />
        <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.white }}>Live map</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
          <PulseDot color={T.green} size={5} />
          <span style={{ fontSize: 11, color: T.dim }}>Live</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 5 }}>
        {MODE_TABS.map(tab => {
          const active = filter === tab.id;
          const color = tab.id === "bus" ? T.red : tab.id === "metro" ? T.orange : tab.id === "train" ? T.purple : T.muted;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                flex: 1, padding: "5px 0", borderRadius: 8, fontSize: 10, fontWeight: 600,
                cursor: "pointer", outline: "none", transition: "all 0.15s",
                background: active ? `${color}18` : T.s1,
                border: `1px solid ${active ? color + "35" : T.b1}`,
                color: active ? color : T.dim,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Map */}
      <MapFallback vehicles={vehicles} filter={filter} />

      {/* Vehicle list */}
      <div style={{ flex: "none" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          Nearby vehicles
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto" }}>
          {filtered.slice(0, 5).map(v => {
            const color = MODE_COLORS[v.mode] || T.red;
            return (
              <div key={v.id} style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "8px 11px", borderRadius: 9,
                background: T.s1, border: `1px solid ${T.b1}`,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  background: `${color}14`, border: `1px solid ${color}28`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                }}>{MODE_LABELS[v.mode]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.white, truncate: true }}>{v.routes?.name}</div>
                  <div style={{ fontSize: 10, color: T.dim }}>→ {v.next_stop}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: v.delay_minutes > 0 ? T.amber : T.green }}>
                    {v.delay_minutes > 0 ? `+${v.delay_minutes}m` : "On time"}
                  </div>
                  <div style={{
                    fontSize: 9, fontWeight: 600, textTransform: "capitalize",
                    color: CROWD_COLORS[v.crowd_level],
                  }}>{v.crowd_level}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}