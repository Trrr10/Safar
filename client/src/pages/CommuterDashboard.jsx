import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Train, MapPin, ChevronLeft, Bell, Radio, Zap, Users, Map,
  ChevronRight, X,
} from "lucide-react";
import { T, PulseDot } from "../utils/tokens.jsx";
import JourneyPlanner  from "../components/JourneyPlanner.jsx";
import AlertsPanel     from "../components/AlertsPanel.jsx";
import NetworkStatus   from "../components/NetworkStatus.jsx";
import SmartTransfers  from "../components/SmartTransfers.jsx";
import CrowdInsight    from "../components/CrowdInsight.jsx";
import LiveMap         from "../components/LiveMap.jsx";

const NAV_ITEMS = [
  { id: "map",       icon: Map,    label: "Live Map",       badge: null },
  { id: "alerts",    icon: Bell,   label: "Alerts",         badge: "2"  },
  { id: "network",   icon: Radio,  label: "Network Status", badge: null },
  { id: "transfers", icon: Zap,    label: "Smart Transfers",badge: null },
  { id: "crowd",     icon: Users,  label: "Crowd Insights", badge: null },
];

function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: T.display, fontSize: 12, color: T.dim, fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>
      {t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

/* ══════════════════════════════════════
   CENTRED FULLSCREEN MODAL — every panel opens here
══════════════════════════════════════ */
function FullscreenModal({ activePanel, selectedRoute, onClose }) {
  if (!activePanel) return null;

  const meta = NAV_ITEMS.find(n => n.id === activePanel);
  const isMap = activePanel === "map";

  const renderContent = () => {
    switch (activePanel) {
      case "map":       return <LiveMap />;
      case "alerts":    return <AlertsPanel />;
      case "network":   return <NetworkStatus />;
      case "transfers": return <SmartTransfers selectedRoute={selectedRoute} />;
      case "crowd":     return <CrowdInsight selectedRoute={selectedRoute} />;
      default:          return null;
    }
  };

  return (
    <>
      {/* Full-screen dark backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(6px)",
          animation: "backdropIn 0.18s ease",
        }}
      />

      {/*
        THE MODAL BOX — centred on screen.
        Map gets nearly full viewport. Other panels get a tall centred card.
      */}
      <div style={{
        position: "fixed",
        zIndex: 201,
        /* Centre it */
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        /* Size */
        width:  isMap ? "calc(100vw - 80px)" : "min(860px, calc(100vw - 80px))",
        height: isMap ? "calc(100vh - 80px)" : "min(800px, calc(100vh - 80px))",
        maxWidth:  "1400px",
        /* Style */
        background: T.sidebar,
        border: `1px solid ${T.b1}`,
        borderRadius: 20,
        boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "modalIn 0.22s cubic-bezier(0.34,1.3,0.64,1)",
      }}>

        {/* Modal header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: `1px solid ${T.b1}`,
          flexShrink: 0,
          background: "rgba(255,255,255,0.02)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {meta && React.createElement(meta.icon, { size: 17, color: T.red })}
            <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.white }}>
              {meta?.label}
            </span>
            {(activePanel === "map" || activePanel === "network") && <PulseDot color={T.green} />}
            {activePanel === "alerts" && <PulseDot color={T.red} />}
            {activePanel === "map" && (
              <span style={{ fontSize: 11, color: T.dim, marginLeft: 4 }}>
                · Simulated live · Mumbai
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(255,255,255,0.06)", border: `1px solid ${T.b1}`,
              cursor: "pointer", color: T.muted,
              transition: "all 0.15s", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.15)"; e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.b1; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal content — fills the rest */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {renderContent()}
        </div>
      </div>

      <style>{`
        @keyframes backdropIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.94); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}

/* ══════════════════════════════════════
   COMMUTER DASHBOARD
══════════════════════════════════════ */
export default function CommuterDashboard() {
  const navigate = useNavigate();
  const [activePanel,   setActivePanel]   = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [trackedRoute,  setTrackedRoute]  = useState(null);

  const sidebarW = sidebarOpen ? 220 : 56;
  const activeIndex = NAV_ITEMS.findIndex(n => n.id === activePanel);

  const handleNavClick   = (id)    => setActivePanel(prev => prev === id ? null : id);
  const handleRouteSelect = (route) => setSelectedRoute(route);
  const handleTrackRoute  = (route) => {
    setTrackedRoute(route);
    setSelectedRoute(route);
    setActivePanel("transfers");
  };

  /* Close modal on Escape */
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") setActivePanel(null); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: T.body, overflow: "hidden" }}>

      {/* ── LEFT SIDEBAR ── */}
      <aside style={{
        width: sidebarW, flexShrink: 0,
        background: T.sidebar, borderRight: `1px solid ${T.b1}`,
        display: "flex", flexDirection: "column",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden", position: "relative", zIndex: 20,
      }}>

        {/* Logo */}
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

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 0", position: "relative" }}>
          {activePanel && activeIndex >= 0 && (
            <div style={{
              position: "absolute", left: 0,
              top: `calc(10px + ${activeIndex * 48}px + 14px)`,
              width: 3, height: 20, borderRadius: "0 3px 3px 0",
              background: T.red, boxShadow: "2px 0 12px rgba(220,38,38,0.5)",
              transition: "top 0.25s cubic-bezier(0.4,0,0.2,1)",
            }} />
          )}

          {NAV_ITEMS.map(item => {
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
                  border: "none", cursor: "pointer", outline: "none",
                  transition: "background 0.15s",
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
                    <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? T.white : T.muted, whiteSpace: "nowrap", flex: 1 }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 99, background: "rgba(220,38,38,0.18)", color: T.red, border: "1px solid rgba(220,38,38,0.3)" }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: `1px solid ${T.b1}`, flexShrink: 0 }}>
          {sidebarOpen && (
            <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 7, borderBottom: `1px solid ${T.b1}` }}>
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
          >
            {sidebarOpen && <span style={{ fontSize: 11, color: T.dim }}>Collapse</span>}
            <ChevronRight size={14} color={T.dim} style={{ transform: sidebarOpen ? "rotate(180deg)" : "none", transition: "transform 0.22s" }} />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Top bar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", height: 52, flexShrink: 0,
          background: T.s1, borderBottom: `1px solid ${T.b1}`, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => navigate("/")}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: T.dim, fontSize: 12, padding: "4px 8px", borderRadius: 6, transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = T.white}
              onMouseLeave={e => e.currentTarget.style.color = T.dim}
            >
              <ChevronLeft size={13} /> Home
            </button>
            <span style={{ color: T.b2, fontSize: 12 }}>/</span>
            <span style={{ fontSize: 12, color: T.muted }}>Journey Planner</span>
          </div>

          {trackedRoute && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 20, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)" }}>
              <PulseDot color={T.red} size={5} />
              <span style={{ fontSize: 11, color: T.red, fontWeight: 600 }}>Tracking: {trackedRoute.route_name}</span>
              <button onClick={() => setTrackedRoute(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(220,38,38,0.6)", padding: 0 }}>
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

        <main style={{ flex: 1, minWidth: 0, overflowY: "auto", background: T.bg }}>
          <JourneyPlanner onRouteSelect={handleRouteSelect} onTrackRoute={handleTrackRoute} />
        </main>
      </div>

      {/* ════════════════════════════════════════
          CENTRED FULLSCREEN MODAL
          All panels open here — nothing in a sidebar
      ════════════════════════════════════════ */}
      <FullscreenModal
        activePanel={activePanel}
        selectedRoute={selectedRoute}
        onClose={() => setActivePanel(null)}
      />
    </div>
  );
}