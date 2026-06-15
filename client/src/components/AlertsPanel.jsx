import React, { useState } from "react";
import { Bell, Clock, XCircle, RefreshCw, AlertTriangle, Users, Info, ChevronDown } from "lucide-react";
import { T, Badge, PulseDot, SectionLabel } from "../utils/tokens.jsx";
import { MOCK_ALERTS } from "../utils/mockData.js";

const TYPE_CONFIG = {
  delay:           { icon: Clock,         color: "#f59e0b", label: "Delay"           },
  cancellation:    { icon: XCircle,       color: "#dc2626", label: "Cancelled"       },
  platform_change: { icon: RefreshCw,     color: "#3b82f6", label: "Platform"        },
  disruption:      { icon: AlertTriangle, color: "#dc2626", label: "Disruption"      },
  crowd:           { icon: Users,         color: "#f97316", label: "Crowd"           },
  info:            { icon: Info,          color: "#52525b", label: "Info"            },
};

const SEVERITY_RANK = { high: 0, medium: 1, low: 2 };

function AlertCard({ alert }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_CONFIG[alert.type] || TYPE_CONFIG.info;
  const Icon = meta.icon;
  const color = meta.color;

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        padding: "12px 14px", borderRadius: 12, cursor: "pointer",
        background: `${color}07`, border: `1px solid ${color}1e`,
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}0e`}
      onMouseLeave={e => e.currentTarget.style.background = `${color}07`}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: `${color}16`,
          display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
        }}>
          <Icon size={12} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.white, lineHeight: 1.3 }}>{alert.title}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Badge label={meta.label} color={color} />
            <span style={{ fontSize: 10, color: T.dim }}>{alert.time}</span>
          </div>
        </div>
        <ChevronDown
          size={12} color={T.dim}
          style={{ flexShrink: 0, marginTop: 4, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
        />
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${color}18` }}>
          <p style={{ fontSize: 12, color: T.subtle, lineHeight: 1.6 }}>{alert.message}</p>
          {alert.routes?.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
              {alert.routes.map(r => (
                <span key={r} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: T.s2, color: T.dim, border: `1px solid ${T.b2}` }}>{r}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AlertsPanel() {
  const sorted = [...MOCK_ALERTS].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
  const highCount = sorted.filter(a => a.severity === "high").length;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Bell size={14} color={T.red} />
        <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.white }}>Live alerts</span>
        <PulseDot color={T.red} />
        {highCount > 0 && (
          <span style={{
            marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 99,
            background: "rgba(220,38,38,0.15)", color: T.red,
            border: "1px solid rgba(220,38,38,0.28)", fontWeight: 700,
          }}>
            {highCount} critical
          </span>
        )}
      </div>

      {/* Alert cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map(a => <AlertCard key={a.id} alert={a} />)}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: 16, padding: "10px 12px", borderRadius: 10,
        background: T.s1, border: `1px solid ${T.b1}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.green, flexShrink: 0, animation: "pulseDot 2s ease-in-out infinite" }} />
        <span style={{ fontSize: 11, color: T.dim, lineHeight: 1.5 }}>
          Alerts auto-update · tap to expand
        </span>
      </div>
    </div>
  );
}