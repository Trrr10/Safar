import React from "react";
import { Users, Shield, Clock } from "lucide-react";
import { T, SectionLabel, CROWD_COLOR } from "../utils/tokens.jsx";

const TIPS = {
  low: {
    coach:    "Even distribution — board any coach.",
    boarding: "Any door. No rush at all.",
    outlook:  "Expect comfortable seating throughout the journey.",
  },
  medium: {
    coach:    "Coaches 5–7 slightly crowded. Coaches 1–4 or 8–9 offer more room.",
    boarding: "Board from the first or last carriage for quicker entry.",
    outlook:  "Standing room available. May find a seat after a few stops.",
  },
  high: {
    coach:    "Coaches 1–4 overcrowded. Coaches 6–9 have noticeably more space.",
    boarding: "Board from the rear entry for fastest access.",
    outlook:  "Expect standing-only. Consider waiting for the next service.",
  },
};

const PEAK_HOURS = [
  { hour: "7–9 AM",   level: "high"   },
  { hour: "9–12 PM",  level: "medium" },
  { hour: "12–5 PM",  level: "low"    },
  { hour: "5–8 PM",   level: "high"   },
  { hour: "8–10 PM",  level: "medium" },
];

function CrowdBar({ level }) {
  const pct = level === "high" ? 92 : level === "medium" ? 58 : 24;
  const color = CROWD_COLOR[level];
  return (
    <div style={{ height: 4, borderRadius: 99, background: T.b2, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s ease" }} />
    </div>
  );
}

export default function CrowdInsight({ selectedRoute }) {
  if (!selectedRoute) {
    return (
      <div style={{ height: "100%", overflowY: "auto", padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Users size={14} color={T.red} />
          <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.white }}>Crowd insights</span>
        </div>
        <div style={{
          textAlign: "center", padding: "36px 16px",
          background: T.s1, borderRadius: 14, border: `1px solid ${T.b1}`,
        }}>
          <Users size={26} color={T.b3} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 13, color: T.dim, lineHeight: 1.6 }}>
            Select a route to see crowd and coach guidance
          </div>
        </div>
      </div>
    );
  }

  const level = selectedRoute.crowd_level || "low";
  const tip   = TIPS[level];
  const color = CROWD_COLOR[level];

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Users size={14} color={T.red} />
        <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.white }}>Crowd insights</span>
      </div>

      {/* Level indicator */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["low", "medium", "high"].map(l => {
          const active = level === l;
          return (
            <div key={l} style={{
              flex: 1, padding: "11px 6px", borderRadius: 10, textAlign: "center",
              background: active ? `${CROWD_COLOR[l]}14` : T.s1,
              border: `1px solid ${active ? CROWD_COLOR[l] + "35" : T.b1}`,
              transition: "all 0.2s",
            }}>
              <div style={{
                fontSize: 11, textTransform: "capitalize", fontWeight: 700,
                color: active ? CROWD_COLOR[l] : T.dim,
              }}>{l}</div>
            </div>
          );
        })}
      </div>

      {/* Coach tip */}
      <div style={{
        padding: "13px 14px", borderRadius: 12, marginBottom: 10,
        background: `${color}08`, border: `1px solid ${color}20`,
      }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: color, fontWeight: 600, marginBottom: 5 }}>Coach guidance</div>
        <p style={{ fontSize: 12, color: T.subtle, lineHeight: 1.65 }}>{tip.coach}</p>
      </div>

      {/* Boarding tip */}
      <div style={{ padding: "12px 13px", borderRadius: 11, marginBottom: 10, background: T.s1, border: `1px solid ${T.b1}` }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.dim, fontWeight: 600, marginBottom: 4 }}>Boarding tip</div>
        <p style={{ fontSize: 12, color: T.subtle, lineHeight: 1.6 }}>{tip.boarding}</p>
      </div>

      {/* Outlook */}
      <div style={{ padding: "12px 13px", borderRadius: 11, marginBottom: 18, background: T.s1, border: `1px solid ${T.b1}` }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.dim, fontWeight: 600, marginBottom: 4 }}>Journey outlook</div>
        <p style={{ fontSize: 12, color: T.subtle, lineHeight: 1.6 }}>{tip.outlook}</p>
      </div>

      {/* Peak hours */}
      <SectionLabel mb={10}>Typical occupancy today</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PEAK_HOURS.map(({ hour, level: l }) => (
          <div key={hour}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: T.subtle, display: "flex", alignItems: "center", gap: 5 }}>
                <Clock size={10} color={T.dim} /> {hour}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: CROWD_COLOR[l], textTransform: "capitalize" }}>{l}</span>
            </div>
            <CrowdBar level={l} />
          </div>
        ))}
      </div>

      {/* Ladies coach note */}
      <div style={{
        marginTop: 16, display: "flex", alignItems: "center", gap: 8,
        padding: "10px 13px", borderRadius: 10, background: T.s1, border: `1px solid ${T.b1}`,
      }}>
        <Shield size={12} color={T.dim} />
        <span style={{ fontSize: 11, color: T.dim }}>Ladies coach available on all local train services</span>
      </div>
    </div>
  );
}