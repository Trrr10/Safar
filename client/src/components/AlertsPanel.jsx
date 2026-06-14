import React, { useEffect, useState } from "react";
import { getAlerts } from "../utils/api";
import { subscribeToAlerts } from "../utils/supabase";
import { Bell, AlertTriangle, Info, XCircle, RefreshCw, Clock } from "lucide-react";

const TYPE_CONFIG = {
  delay:           { icon: Clock,          color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)",  label: "Delay"      },
  cancellation:    { icon: XCircle,        color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",   label: "Cancelled"  },
  platform_change: { icon: RefreshCw,      color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.2)",  label: "Platform"   },
  disruption:      { icon: AlertTriangle,  color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",   label: "Disruption" },
  info:            { icon: Info,           color: "#71717a", bg: "rgba(113,113,122,0.06)", border: "rgba(113,113,122,0.15)", label: "Info"       },
};

const SEVERITY_COLOR = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };

function AlertCard({ alert, fresh }) {
  const { icon: Icon, color, bg, border, label } = TYPE_CONFIG[alert.type] || TYPE_CONFIG.info;

  return (
    <div
      className={`rounded-xl p-3.5 transition-all duration-300 ${fresh ? "animate-fade-up" : ""}`}
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={13} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-white truncate">{alert.title}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: `${color}18`, color, border: `1px solid ${color}28` }}
            >
              {label}
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: SEVERITY_COLOR[alert.severity] || "#52525b" }}
            />
          </div>
          <p className="text-xs text-[#71717a] leading-relaxed">{alert.message}</p>
          {alert.route_ids?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {alert.route_ids.map(r => (
                <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-[#1c1c1c] text-[#52525b] border border-[#262626]">{r}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AlertsPanel() {
  const [alerts,    setAlerts]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [freshId,   setFreshId]   = useState(null);
  const [toastAlert, setToast]    = useState(null);

  useEffect(() => {
    getAlerts()
      .then(d => { setAlerts(d.alerts || []); setLoading(false); })
      .catch(() => setLoading(false));

    const sub = subscribeToAlerts((payload) => {
      const a = payload.new;
      setAlerts(prev => [a, ...prev]);
      setFreshId(a.id);
      setToast(a);
      setTimeout(() => setFreshId(null), 600);
      setTimeout(() => setToast(null), 4500);
    });
    return () => sub?.unsubscribe?.();
  }, []);

  const activeCount = alerts.filter(a => a.severity === "high").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-[#dc2626]" />
          <h3 className="font-['Space_Grotesk',sans-serif] font-semibold text-sm text-white">Live alerts</h3>
          {activeCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#dc2626]/15 text-[#dc2626] border border-[#dc2626]/30 font-semibold">
              {activeCount} high
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse-ring inline-block" />
          <span className="text-[11px] text-[#52525b]">Live</span>
        </div>
      </div>

      {/* New alert toast */}
      {toastAlert && (
        <div className="mb-3 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#dc2626]/8 border border-[#dc2626]/25 animate-fade-up">
          <Bell size={13} className="text-[#dc2626] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-[#dc2626] uppercase tracking-wide">New alert</div>
            <div className="text-xs text-[#a1a1aa] truncate">{toastAlert.title}</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            <div className="w-5 h-5 border border-[#dc2626] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#52525b]">Loading alerts…</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="w-10 h-10 rounded-full bg-[#22c55e]/8 border border-[#22c55e]/20 flex items-center justify-center">
              <Info size={17} className="text-[#22c55e]" />
            </div>
            <p className="text-xs text-[#52525b]">All clear — no active alerts</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} fresh={alert.id === freshId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}