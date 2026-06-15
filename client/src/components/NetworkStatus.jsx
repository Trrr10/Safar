import React from "react";
import { Radio, Wifi } from "lucide-react";
import { T, PulseDot, SectionLabel, CROWD_COLOR } from "../utils/tokens.jsx";
import { MODES_STATUS } from "../utils/mockData.js";

const STATUS_COLOR = { normal: "#22c55e", delayed: "#f59e0b", disrupted: "#ef4444" };
const STATUS_LABEL = { normal: "On time", delayed: "Delayed", disrupted: "Disrupted" };

const INTERCHANGES = [
  { name: "Dadar (WR ↔ CR)",       level: "high"   },
  { name: "Andheri (Metro ↔ WR)",  level: "medium" },
  { name: "Ghatkopar (Metro ↔ CR)",level: "low"    },
  { name: "CST (Local ↔ Bus)",     level: "low"    },
];

const COVERAGE = [
  { label: "Zones tracked",   value: "9 / 9"   },
  { label: "GPS accuracy",    value: "< 15 m"  },
  { label: "Update interval", value: "12 sec"  },
  { label: "Data freshness",  value: "Live"    },
];

export default function NetworkStatus() {
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Radio size={14} color={T.red} />
        <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.white }}>Network status</span>
        <PulseDot color={T.green} />
      </div>

      {/* Mode status strips */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 20 }}>
        {MODES_STATUS.map(m => {
          const sc = STATUS_COLOR[m.status];
          return (
            <div key={m.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "13px 14px", borderRadius: 12,
              background: T.s1, border: `1px solid ${T.b1}`,
            }}>
              {/* Color rail */}
              <div style={{ width: 3, height: 36, borderRadius: 99, background: m.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{m.label}</span>
                  <span style={{
                    fontSize: 10, padding: "1px 7px", borderRadius: 99, fontWeight: 600,
                    background: `${sc}18`, color: sc, border: `1px solid ${sc}28`,
                  }}>{STATUS_LABEL[m.status]}</span>
                </div>
                <div style={{ fontSize: 11, color: T.dim }}>
                  <span style={{ color: T.muted }}>{m.vehicles}</span> active vehicles
                  {m.delay > 0 && <span style={{ color: T.amber, marginLeft: 8 }}>avg +{m.delay} min</span>}
                </div>
              </div>
              <PulseDot color={sc} />
            </div>
          );
        })}
      </div>

      {/* Interchange congestion */}
      <SectionLabel mb={10}>Interchange congestion</SectionLabel>
      <div style={{ background: T.s1, border: `1px solid ${T.b1}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        {INTERCHANGES.map((ic, i) => (
          <div key={ic.name} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px",
            borderBottom: i < INTERCHANGES.length - 1 ? `1px solid ${T.b1}` : "none",
          }}>
            <span style={{ fontSize: 12, color: T.subtle }}>{ic.name}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, textTransform: "capitalize",
              color: CROWD_COLOR[ic.level],
            }}>{ic.level}</span>
          </div>
        ))}
      </div>

      {/* Data coverage */}
      <SectionLabel mb={10}>Data coverage</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {COVERAGE.map(({ label, value }) => (
          <div key={label} style={{
            padding: "11px 13px", borderRadius: 11,
            background: T.s1, border: `1px solid ${T.b1}`,
          }}>
            <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.white, fontFamily: T.display }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}