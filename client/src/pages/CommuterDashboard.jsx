import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Train, MapPin, ChevronLeft, Bell, Radio, Zap, Users, Map,
  ChevronRight, Settings, X,
} from "lucide-react";
import { T, PulseDot } from "../utils/tokens.jsx";
import JourneyPlanner  from "../components/JourneyPlanner.jsx";
import AlertsPanel     from "../components/AlertsPanel.jsx";
import NetworkStatus   from "../components/NetworkStatus.jsx";
import SmartTransfers  from "../components/SmartTransfers.jsx";
import CrowdInsight    from "../components/CrowdInsight.jsx";
import LiveMap         from "../components/LiveMap.jsx";

/* ── Nav items ── */
const NAV_ITEMS = [
  { id: "map",       icon: Map,    label: "Live Map",        badge: null },
  { id: "alerts",    icon: Bell,   label: "Alerts",          badge: "2"  },
  { id: "network",   icon: Radio,  label: "Network Status",  badge: null },
  { id: "transfers", icon: Zap,    label: "Smart Transfers", badge: null },
  { id: "crowd",     icon: Users,  label: "Crowd Insights",  badge: null },
];

/* ── Live clock ── */
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span style={{
      fontFamily: T.display, fontSize: 12, color: T.dim,
      fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em",
    }}>
      {t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

/* ── Full-page panel overlay ── */
function PanelOverlay({ activePanel, selectedRoute, onClose }) {
  if (!activePanel) return null;

  const meta = NAV_ITEMS.find(n => n.id === activePanel);

  const renderPanel = () => {
    switch (activePanel) {
      case "alerts":    return <AlertsPanel />;
      case "network":   return <NetworkStatus />;
      case "transfers": return <SmartTransfers selectedRoute={selectedRoute} />;
      case "crowd":     return <CrowdInsight selectedRoute={selectedRoute} />;
      case "map":       return <LiveMap />;
      default:          return <AlertsPanel />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          animation: "fadeIn 0.18s ease",
        }}
      />

      {/* Panel drawer — slides in from right, takes ~60% width on wide screens */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 101,
        width: "min(600px, 92vw)",
        background: T.sidebar,
        borderLeft: `1px solid ${T.b1}`,
        display: "flex", flexDirection: "column",
        animation: "slideIn 0.22s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "-24px 0 64px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}>
        {/* Panel header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px", borderBottom: `1px solid ${T.b1}`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {meta && <meta.icon size={16} color={T.red} />}
            <span style={{
              fontFamily: T.display, fontWeight: 700, fontSize: 15,
              color: T.white,
            }}>
              {meta?.label || "Panel"}
            </span>
            {activePanel === "alerts" && <PulseDot color={T.red} />}
            {(activePanel === "map" || activePanel === "network") && <PulseDot color={T.green} />}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: T.dim, padding: 6, borderRadius: 7,
                transition: "color 0.15s",
              }}
              title="Settings"
              onMouseEnter={e => e.currentTarget.style.color = T.white}
              onMouseLeave={e => e.currentTarget.style.color = T.dim}
            >
              <Settings size={14} />
            </button>
            <button
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 30, height: 30, borderRadius: 8,
                background: "rgba(255,255,255,0.06)", border: `1px solid ${T.b1}`,
                cursor: "pointer", color: T.muted,
                transition: "all 0.15s",
              }}
              title="Close"
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.12)"; e.currentTarget.style.color = T.red; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = T.muted; }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Panel content — scrollable */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {renderPanel()}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  );
}

/* ══════════════════════════════════════
   COMMUTER DASHBOARD
══════════════════════════════════════ */
export default function CommuterDashboard() {
  const navigate = useNavigate();
  const [activePanel,   setActivePanel]   = useState(null);   // null = closed
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [trackedRoute,  setTrackedRoute]  = useState(null);   // actively tracked route

  const SIDEBAR_W_OPEN   = 220;
  const SIDEBAR_W_CLOSED = 56;
  const sidebarW = sidebarOpen ? SIDEBAR_W_OPEN : SIDEBAR_W_CLOSED;

  const activeIndex = NAV_ITEMS.findIndex(n => n.id === activePanel);

  const handleNavClick = (id) => {
    // Toggle: clicking the same panel again closes it
    setActivePanel(prev => prev === id ? null : id);
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
  };

  const handleTrackRoute = (route) => {
    setTrackedRoute(route);
    setSelectedRoute(route);
    // Optionally open Smart Transfers automatically after tracking
    setActivePanel("transfers");
  };

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: T.bg, fontFamily: T.body, overflow: "hidden",
    }}>

      {/* ════════════════════════════
          LEFT SIDEBAR
      ════════════════════════════ */}
      <aside style={{
        width: sidebarW, flexShrink: 0,
        background: T.sidebar, borderRight: `1px solid ${T.b1}`,
        display: "flex", flexDirection: "column",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden", position: "relative", zIndex: 20,
      }}>

        {/* Logo area */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: sidebarOpen ? "18px 16px" : "18px 0",
          justifyContent: sidebarOpen ? "flex-start" : "center",
          borderBottom: `1px solid ${T.b1}`, flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, background: T.red, borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 0 18px rgba(220,38,38,0.4)",
          }}>
            <Train size={15} color="#fff" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.white, letterSpacing: "-0.02em", lineHeight: 1 }}>SAFAR</div>
              <div style={{ fontSize: 9, color: T.dim, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>Commuter</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "10px 0", position: "relative" }}>
          {/* Travelling red ink line — only visible when a panel is open */}
          {activePanel && activeIndex >= 0 && (
            <div style={{
              position: "absolute",
              left: 0,
              top: `calc(10px + ${activeIndex * 48}px + 14px)`,
              width: 3, height: 20, borderRadius: "0 3px 3px 0",
              background: T.red,
              boxShadow: "2px 0 12px rgba(220,38,38,0.5)",
              transition: "top 0.25s cubic-bezier(0.4,0,0.2,1)",
            }} />
          )}

          {NAV_ITEMS.map((item) => {
            const Icon   = item.icon;
            const active = activePanel === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={!sidebarOpen ? item.label : undefined}
                style={{
                  width: "100%", height: 48,
                  display: "flex", alignItems: "center",
                  gap: 12, padding: sidebarOpen ? "0 16px" : "0",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  background: active ? "rgba(220,38,38,0.07)" : "transparent",
                  border: "none", cursor: "pointer",
                  transition: "background 0.15s",
                  outline: "none", position: "relative",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: active ? "rgba(220,38,38,0.15)" : "transparent",
                  border: active ? "1px solid rgba(220,38,38,0.3)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}>
                  <Icon size={15} color={active ? T.red : T.dim} />
                </div>

                {sidebarOpen && (
                  <>
                    <span style={{
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      color: active ? T.white : T.muted,
                      whiteSpace: "nowrap", flex: 1,
                    }}>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        fontSize: 9, fontWeight: 700,
                        padding: "1px 5px", borderRadius: 99,
                        background: "rgba(220,38,38,0.18)", color: T.red,
                        border: "1px solid rgba(220,38,38,0.3)",
                      }}>{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar bottom */}
        <div style={{ borderTop: `1px solid ${T.b1}`, flexShrink: 0 }}>
          {sidebarOpen && (
            <div style={{
              padding: "10px 14px", display: "flex", alignItems: "center", gap: 7,
              borderBottom: `1px solid ${T.b1}`,
            }}>
              <PulseDot color={T.green} size={5} />
              <span style={{ fontSize: 11, color: T.dim }}>Live data · Mumbai</span>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              width: "100%", height: 42,
              display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "space-between" : "center",
              padding: sidebarOpen ? "0 16px" : "0",
              background: "transparent", border: "none", cursor: "pointer", outline: "none",
            }}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen && <span style={{ fontSize: 11, color: T.dim }}>Collapse</span>}
            <ChevronRight
              size={14} color={T.dim}
              style={{ transform: sidebarOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s" }}
            />
          </button>
        </div>
      </aside>

      {/* ════════════════════════════
          MAIN BODY — full width now
      ════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* ── Top bar ── */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", height: 52, flexShrink: 0,
          background: T.s1, borderBottom: `1px solid ${T.b1}`, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => navigate("/")}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "none", border: "none", cursor: "pointer",
                color: T.dim, fontSize: 12, padding: "4px 8px", borderRadius: 6,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = T.white}
              onMouseLeave={e => e.currentTarget.style.color = T.dim}
            >
              <ChevronLeft size={13} /> Home
            </button>
            <span style={{ color: T.b2, fontSize: 12 }}>/</span>
            <span style={{ fontSize: 12, color: T.muted }}>Journey Planner</span>
          </div>

          {/* Active tracking pill */}
          {trackedRoute && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "5px 12px", borderRadius: 20,
              background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)",
            }}>
              <PulseDot color={T.red} size={5} />
              <span style={{ fontSize: 11, color: T.red, fontWeight: 600 }}>
                Tracking: {trackedRoute.route_name}
              </span>
              <button
                onClick={() => setTrackedRoute(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(220,38,38,0.6)", padding: 0, lineHeight: 1 }}
              >
                <X size={11} />
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <LiveClock />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={11} color={T.dim} />
              <span style={{ fontSize: 12, color: T.dim }}>Mumbai</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <PulseDot color={T.green} size={5} />
              <span style={{ fontSize: 11, color: T.dim }}>Live</span>
            </div>
          </div>
        </header>

        {/* ── Journey planner takes the full content area ── */}
        <main style={{
          flex: 1, minWidth: 0, overflowY: "auto",
          background: T.bg,
        }}>
          <JourneyPlanner
            onRouteSelect={handleRouteSelect}
            onTrackRoute={handleTrackRoute}
          />
        </main>
      </div>

      {/* ════════════════════════════
          FULL-PAGE PANEL OVERLAY
      ════════════════════════════ */}
      <PanelOverlay
        activePanel={activePanel}
        selectedRoute={selectedRoute}
        onClose={() => setActivePanel(null)}
      />
    </div>
  );
}