import React from "react";
import { Zap, CheckCircle, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { T, SectionLabel } from "../utils/tokens.jsx";

const WINDOW_STATUS = (tw) => {
  if (!tw) return null;
  if (tw.startsWith("Safe") || tw === "Comfortable") return { key: "safe",  color: "#22c55e", icon: CheckCircle,   label: "Safe transfer"  };
  if (tw.startsWith("Tight"))                         return { key: "tight", color: "#f59e0b", icon: AlertTriangle, label: "Tight window"   };
  return                                                      { key: "risk",  color: "#dc2626", icon: XCircle,       label: "At risk"        };
};

const TRANSFER_TIPS = {
  safe:  "You have a comfortable buffer. Board at your normal pace — no rush.",
  tight: "Move quickly once you alight. Pre-position near the exit doors.",
  risk:  "Connection is at serious risk. Consider switching to an alternate route above.",
};

export default function SmartTransfers({ selectedRoute }) {
  if (!selectedRoute) {
    return (
      <div style={{ height: "100%", overflowY: "auto", padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Zap size={14} color={T.red} />
          <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.white }}>Smart transfers</span>
        </div>
        <div style={{
          textAlign: "center", padding: "36px 16px",
          background: T.s1, borderRadius: 14, border: `1px solid ${T.b1}`,
        }}>
          <Zap size={26} color={T.b3} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 13, color: T.dim, lineHeight: 1.6 }}>
            Select a route in the planner to see transfer window analysis
          </div>
        </div>
      </div>
    );
  }

  const ws = WINDOW_STATUS(selectedRoute.transfer_window);
  const WIcon = ws?.icon || CheckCircle;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Zap size={14} color={T.red} />
        <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.white }}>Smart transfers</span>
      </div>

      {/* Selected route context */}
      <div style={{
        padding: "11px 14px", borderRadius: 12, marginBottom: 14,
        background: T.s1, border: `1px solid ${T.b1}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 12, color: T.subtle, flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 600, color: T.white }}>{selectedRoute.route_name}</span>
          <br />
          <span style={{ fontSize: 11, color: T.dim }}>{selectedRoute.board_stop} → {selectedRoute.alight_stop}</span>
        </span>
      </div>

      {/* Window status */}
      {ws && (
        <div style={{
          padding: "14px 15px", borderRadius: 13, marginBottom: 14,
          background: `${ws.color}08`, border: `1px solid ${ws.color}22`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <WIcon size={15} color={ws.color} />
            <span style={{ fontSize: 14, fontWeight: 700, color: ws.color, fontFamily: T.display }}>{ws.label}</span>
          </div>
          <p style={{ fontSize: 12, color: T.subtle, lineHeight: 1.65 }}>{TRANSFER_TIPS[ws.key]}</p>
        </div>
      )}

      {/* Stats */}
      <SectionLabel mb={8}>Transfer details</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
        {[
          { label: "Walk between stops", value: `${Math.round(selectedRoute.walk_to_board_km * 1000)}m` },
          { label: "Current delay",      value: selectedRoute.delay_minutes > 0 ? `+${selectedRoute.delay_minutes} min` : "On time",
            color: selectedRoute.delay_minutes > 0 ? T.red : T.green },
          { label: "Delay confidence",   value: `${Math.round(selectedRoute.delay_confidence * 100)}%`,
            color: selectedRoute.delay_confidence > 0.85 ? T.green : T.amber },
          { label: "Platform",           value: selectedRoute.platform },
          { label: "Fare",               value: selectedRoute.fare },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "9px 13px", borderRadius: 9,
            background: T.s1, border: `1px solid ${T.b1}`,
          }}>
            <span style={{ fontSize: 11, color: T.dim }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: color || T.subtle }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Features */}
      {selectedRoute.features?.length > 0 && (
        <>
          <SectionLabel mb={8}>Route features</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {selectedRoute.features.map(f => (
              <span key={f} style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 7,
                background: T.s1, border: `1px solid ${T.b1}`, color: T.muted,
              }}>{f}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}