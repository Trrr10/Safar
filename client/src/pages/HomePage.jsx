import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Train, Shield, ChevronRight, MapPin, Zap,
  Bell, RefreshCw, ArrowRight
} from "lucide-react";

/* ─── Design tokens ─── */
const T = {
  red:       "#dc2626",
  redGlow:   "rgba(220,38,38,0.35)",
  redDim:    "rgba(220,38,38,0.10)",
  redDimmer: "rgba(220,38,38,0.05)",
  bg:        "#0a0a0a",
  surface:   "#111111",
  surface2:  "#161616",
  border:    "#1f1f1f",
  border2:   "#262626",
  muted:     "#52525b",
  muted2:    "#71717a",
  subtle:    "#a1a1aa",
  white:     "#ffffff",
  display:   "'Space Grotesk', sans-serif",
  body:      "'Inter', sans-serif",
};

/* ─── Particle dot ─── */
function Particle({ x, y, size, delay }) {
  return (
    <div
      className="animate-pulse-ring"
      style={{
        position: "absolute",
        left: `${x}%`, top: `${y}%`,
        width: size, height: size,
        borderRadius: "50%",
        background: T.red,
        opacity: 0.15,
        animationDelay: `${delay}s`,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─── Feature card ─── */
const FEATURES = [
  { icon: MapPin,    label: "Live map",      sub: "All 3 modes, one view" },
  { icon: Zap,       label: "Smart routing", sub: "Cross-modal in seconds" },
  { icon: Bell,      label: "Live alerts",   sub: "Delays before they hit" },
  { icon: RefreshCw, label: "Auto re-route", sub: "When plans break down" },
];

function FeatureCard({ icon: Icon, label, sub }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(220,38,38,0.06)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${hov ? "rgba(220,38,38,0.28)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "all 0.2s ease",
        cursor: "default",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: T.redDim,
        border: `1px solid rgba(220,38,38,0.22)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={16} color={T.red} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.white, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 12, color: T.muted2, lineHeight: 1.5 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ─── Role card ─── */
function RoleCard({ icon: Icon, title, desc, tags, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(220,38,38,0.05)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${hov ? "rgba(220,38,38,0.35)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 20,
        padding: "32px",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.25s ease",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: hov ? `0 0 40px rgba(220,38,38,0.08)` : "none",
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: hov ? "rgba(220,38,38,0.18)" : T.redDim,
        border: `1px solid rgba(220,38,38,0.22)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24,
        transition: "all 0.25s ease",
      }}>
        <Icon size={22} color={T.red} />
      </div>

      <div style={{
        fontFamily: T.display, fontWeight: 700, fontSize: 20,
        color: T.white, marginBottom: 8,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {title}
        <ChevronRight
          size={18} color={T.red}
          style={{ transition: "transform 0.2s", transform: hov ? "translateX(5px)" : "none" }}
        />
      </div>

      <p style={{ fontSize: 13, color: T.muted2, lineHeight: 1.7, marginBottom: 20 }}>{desc}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {tags.map(t => (
          <span key={t} style={{
            fontSize: 11, padding: "4px 10px", borderRadius: 99,
            background: "#1c1c1c", color: T.muted2, border: `1px solid ${T.border2}`,
          }}>{t}</span>
        ))}
      </div>
    </button>
  );
}

/* ─── Main page ─── */
export default function HomePage() {
  const navigate   = useNavigate();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      delay: Math.random() * 5,
    })));
  }, []);

  /* shared section wrapper */
  const Section = ({ children, id, style = {} }) => (
    <section id={id} style={{ position: "relative", zIndex: 10, padding: "0 24px 80px", ...style }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {children}
      </div>
    </section>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, overflowX: "hidden", position: "relative", fontFamily: T.body }}>

      {/* ── Grid bg ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
        backgroundImage: `
          linear-gradient(rgba(220,38,38,0.55) 1px, transparent 1px),
          linear-gradient(90deg, rgba(220,38,38,0.55) 1px, transparent 1px)
        `,
        backgroundSize: "64px 64px",
        opacity: 0.03,
      }} />

      {/* ── Particles ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {particles.map(p => <Particle key={p.id} {...p} />)}
      </div>

      {/* ── Top glow ── */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 800, height: 380, pointerEvents: "none",
        background: "radial-gradient(ellipse at top, rgba(220,38,38,0.2) 0%, transparent 65%)",
      }} />

      {/* ── NAV ── */}
      <nav style={{
        position: "relative", zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 32px",
        borderBottom: `1px solid ${T.border}`,
        background: "rgba(10,10,10,0.7)",
        backdropFilter: "blur(12px)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: T.red, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: `0 0 22px ${T.redGlow}`,
          }}>
            <Train size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 20, color: T.white, letterSpacing: "-0.02em" }}>
            SAFAR
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Features", "About", "Get started"].map((l, i) => (
            <a
              key={l}
              href={["#features", "#about", "#roles"][i]}
              style={{ fontSize: 13, color: T.muted2, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = T.white}
              onMouseLeave={e => e.target.style.color = T.muted2}
            >
              {l}
            </a>
          ))}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", padding: "100px 24px 64px",
      }}>
        {/* Eyebrow pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32,
          padding: "8px 16px", borderRadius: 99,
          border: "1px solid rgba(220,38,38,0.3)",
          background: "rgba(220,38,38,0.06)",
        }}>
          <span className="animate-pulse-ring" style={{
            width: 6, height: 6, borderRadius: "50%",
            background: T.red, display: "inline-block",
          }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: T.red, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Live city transit — Mumbai
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: T.display, fontWeight: 700,
          fontSize: "clamp(3.2rem, 9vw, 6.5rem)",
          lineHeight: 1.02, letterSpacing: "-0.03em",
          color: T.white, marginBottom: 24,
        }}>
          One city.<br />
          <span style={{ color: T.red }}>Every ride.</span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 17, color: T.subtle,
          maxWidth: 520, lineHeight: 1.7, marginBottom: 40,
        }}>
          Bus, Metro, Local — unified in real time. SAFAR tells you where every vehicle is,
          the fastest path across all modes, and re-routes you before delays hit.
        </p>

        {/* CTA */}
        <a
          href="#roles"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 32px", borderRadius: 14,
            background: T.red, color: T.white,
            fontWeight: 600, fontSize: 14, textDecoration: "none",
            boxShadow: `0 0 36px ${T.redGlow}`,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#b91c1c"; e.currentTarget.style.boxShadow = `0 0 48px ${T.redGlow}`; }}
          onMouseLeave={e => { e.currentTarget.style.background = T.red; e.currentTarget.style.boxShadow = `0 0 36px ${T.redGlow}`; }}
        >
          Choose your role <ArrowRight size={15} />
        </a>
      </section>

      {/* ── STATS ── */}
      <section style={{ position: "relative", zIndex: 10, padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            border: `1px solid ${T.border}`,
            borderRadius: 20, overflow: "hidden",
            background: T.surface,
          }}>
            {[
              { n: "3",  label: "Transit modes unified" },
              { n: "∞",  label: "Real-time updates" },
              { n: "1",  label: "App for all of Mumbai" },
            ].map(({ n, label }, i) => (
              <div key={label} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "28px 16px",
                borderRight: i < 2 ? `1px solid ${T.border}` : "none",
              }}>
                <span style={{
                  fontFamily: T.display, fontWeight: 700, fontSize: "2.4rem",
                  color: T.red, lineHeight: 1, marginBottom: 8,
                }}>{n}</span>
                <span style={{ fontSize: 12, color: T.muted2, textAlign: "center", lineHeight: 1.4 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <Section id="features">
        <p style={{
          fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: "0.12em",
          textTransform: "uppercase", textAlign: "center", marginBottom: 36,
        }}>
          What SAFAR does
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {FEATURES.map(f => <FeatureCard key={f.label} {...f} />)}
        </div>
      </Section>

      {/* ── ABOUT ── */}
      <Section id="about">
        <div className="glass" style={{ borderRadius: 20, padding: "48px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: T.redDim, border: "1px solid rgba(220,38,38,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Train size={18} color={T.red} />
            </div>
            <h2 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 24, color: T.white }}>
              About SAFAR
            </h2>
          </div>
          <p style={{ fontSize: 14, color: T.subtle, lineHeight: 1.8, marginBottom: 16 }}>
            Mumbai runs on three rails — and none of them talk to each other. SAFAR fixes that.
            Live GPS from buses, metro, and suburban trains feeds a single platform that runs ML
            predictions on delays and crowd levels, then surfaces the smartest route for every
            commuter in real time.
          </p>
          <p style={{ fontSize: 14, color: T.subtle, lineHeight: 1.8 }}>
            For operators, SAFAR is a live nerve center — incident management, demand forecasting,
            and city-wide alert broadcasting from one dashboard. The city moves better when
            everyone has the same picture.
          </p>
        </div>
      </Section>

      {/* ── ROLES ── */}
      <Section id="roles" style={{ paddingBottom: 120 }}>
        <h2 style={{
          fontFamily: T.display, fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3rem)",
          color: T.white, textAlign: "center", marginBottom: 8, letterSpacing: "-0.02em",
        }}>
          Who are you?
        </h2>
        <p style={{ fontSize: 13, color: T.muted, textAlign: "center", marginBottom: 40 }}>
          Select your role to enter SAFAR
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <RoleCard
            icon={Train}
            title="Commuter"
            desc="Live map, journey planner, real-time alerts, and automatic re-routing — everything you need to get anywhere in the city, faster."
            tags={["Live map", "Route planner", "Alerts", "Crowd level"]}
            onClick={() => navigate("/commuter")}
          />
          <RoleCard
            icon={Shield}
            title="Operator"
            desc="Network health dashboard, incident management, demand forecasting, and city-wide alert broadcasting for transit operators."
            tags={["Network status", "Incidents", "Forecasting", "Analytics"]}
            onClick={() => navigate("/admin")}
          />
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 32px",
        borderTop: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 26, height: 26, background: T.red, borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Train size={13} color="#fff" />
          </div>
          <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 13, color: T.muted, letterSpacing: "-0.01em" }}>
            SAFAR
          </span>
        </div>
        <span style={{ fontSize: 12, color: "#3f3f46" }}>Unified transit for Mumbai</span>
      </footer>
    </div>
  );
}