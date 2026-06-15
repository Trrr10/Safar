import React, { useEffect, useRef, useState } from "react";
import { T, PulseDot } from "../utils/tokens.jsx";
import { MOCK_VEHICLES, WR_STATIONS, CR_STATIONS, METRO_L3_STATIONS } from "../utils/mockData.js";

/*
  NOTE: No public real-time APIs exist for Mumbai local trains, Metro, or BEST buses as of 2025.
  Vehicles below use real Mumbai coordinates + simulated live state.
  Install deps: npm install leaflet react-leaflet
*/

const MODE_COLOR  = { train: "#ef4444", metro: "#3b82f6", bus: "#22c55e" };
const MODE_EMOJI  = { train: "🚆", metro: "🚇", bus: "🚌" };
const LINE_COLORS = {
  "Western Railway":    "#ef4444",
  "Central Railway":   "#f97316",
  "Harbour Line":      "#a855f7",
  "Metro Line 1":      "#3b82f6",
  "Metro Aqua Line 3": "#06b6d4",
  "Metro Line 2A":     "#eab308",
  "BEST":              "#22c55e",
};

const CROWD_COLOR = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };

const MODE_TABS = [
  { id: "all",   label: "All"   },
  { id: "train", label: "Local Train" },
  { id: "metro", label: "Metro" },
  { id: "bus",   label: "Bus"   },
];

/* ── Leaflet map (lazy-loaded to avoid SSR issues) ── */
function LeafletMap({ vehicles, filter }) {
  const mapRef    = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);
  const linesRef   = useRef([]);

  const filtered = vehicles.filter(v => filter === "all" || v.mode === filter);

  useEffect(() => {
    /* Dynamically import Leaflet so it only runs client-side */
    import("leaflet").then(L => {
      if (leafletRef.current) return; /* already init */

      /* Inject Leaflet CSS */
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id   = "leaflet-css";
        link.rel  = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }

      /* Fix default marker icon paths */
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [19.076, 72.877],
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
      });

      /* Dark tile layer */
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>', subdomains: "abcd", maxZoom: 19 }
      ).addTo(map);

      leafletRef.current = { L, map };

      /* Draw rail lines */
      const wrCoords = WR_STATIONS.map(s => [s.lat, s.lng]);
      const crCoords = CR_STATIONS.map(s => [s.lat, s.lng]);
      const m3Coords = METRO_L3_STATIONS.map(s => [s.lat, s.lng]);

      const drawLine = (coords, color, weight = 2.5) =>
        L.polyline(coords, { color, weight, opacity: 0.55, dashArray: null }).addTo(map);

      linesRef.current = [
        drawLine(wrCoords, "#ef4444"),
        drawLine(crCoords, "#f97316"),
        drawLine(m3Coords, "#06b6d4"),
      ];

      /* Draw WR station dots */
      WR_STATIONS.forEach(s => {
        L.circleMarker([s.lat, s.lng], { radius: 3, color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.7, weight: 1 })
          .bindTooltip(s.name, { permanent: false, direction: "top", className: "safar-tooltip" })
          .addTo(map);
      });

      CR_STATIONS.forEach(s => {
        L.circleMarker([s.lat, s.lng], { radius: 3, color: "#f97316", fillColor: "#f97316", fillOpacity: 0.7, weight: 1 })
          .bindTooltip(s.name, { permanent: false, direction: "top", className: "safar-tooltip" })
          .addTo(map);
      });

      METRO_L3_STATIONS.forEach(s => {
        L.circleMarker([s.lat, s.lng], { radius: 3.5, color: "#06b6d4", fillColor: "#06b6d4", fillOpacity: 0.8, weight: 1 })
          .bindTooltip(s.name, { permanent: false, direction: "top", className: "safar-tooltip" })
          .addTo(map);
      });

      /* Inject tooltip styles */
      const style = document.createElement("style");
      style.textContent = `
        .safar-tooltip {
          background: #1a1a1a !important;
          border: 1px solid #333 !important;
          color: #e5e5e5 !important;
          font-size: 11px !important;
          font-family: Inter, sans-serif !important;
          padding: 3px 8px !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
          white-space: nowrap !important;
        }
        .safar-tooltip::before { display: none !important; }
        .leaflet-popup-content-wrapper {
          background: #161616 !important;
          border: 1px solid #2a2a2a !important;
          border-radius: 12px !important;
          color: #e5e5e5 !important;
          box-shadow: 0 16px 48px rgba(0,0,0,0.7) !important;
        }
        .leaflet-popup-tip { background: #161616 !important; }
        .leaflet-popup-content { margin: 12px 16px !important; font-family: Inter, sans-serif !important; }
        .leaflet-control-zoom a { background: #1a1a1a !important; color: #aaa !important; border-color: #333 !important; }
        .leaflet-control-zoom a:hover { background: #222 !important; color: #fff !important; }
        .leaflet-control-attribution { background: rgba(0,0,0,0.6) !important; color: #555 !important; font-size: 9px !important; }
        .leaflet-control-attribution a { color: #666 !important; }
      `;
      document.head.appendChild(style);

      /* Add vehicle markers */
      addVehicleMarkers(L, map, vehicles, filter);
    });

    return () => {
      if (leafletRef.current) {
        leafletRef.current.map.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  /* Update markers when filter changes */
  useEffect(() => {
    if (!leafletRef.current) return;
    const { L, map } = leafletRef.current;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    addVehicleMarkers(L, map, vehicles, filter);
  }, [filter]);

  function addVehicleMarkers(L, map, vehicles, filter) {
    const toShow = vehicles.filter(v => filter === "all" || v.mode === filter);

    toShow.forEach(v => {
      const color  = MODE_COLOR[v.mode]  || "#dc2626";
      const emoji  = MODE_EMOJI[v.mode]  || "🚌";
      const crowd  = CROWD_COLOR[v.crowd_level] || "#22c55e";
      const delay  = v.delay_minutes > 0 ? `<span style="color:#f59e0b">+${v.delay_minutes}m delay</span>` : `<span style="color:#22c55e">On time</span>`;

      /* Custom emoji marker */
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            width:36px; height:36px; border-radius:50%;
            background:${color}20; border:2px solid ${color};
            display:flex; align-items:center; justify-content:center;
            font-size:16px; cursor:pointer;
            box-shadow: 0 0 12px ${color}55;
            transition: transform 0.15s;
          " title="${v.route_name}">${emoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const popup = `
        <div style="min-width:200px">
          <div style="font-weight:700; font-size:13px; color:#fff; margin-bottom:6px; font-family:'Space Grotesk',sans-serif">${v.route_name}</div>
          <div style="font-size:11px; color:#888; margin-bottom:8px">${v.line}</div>
          <div style="display:flex; flex-direction:column; gap:5px">
            <div style="display:flex; justify-content:space-between; font-size:11px">
              <span style="color:#666">Next stop</span>
              <span style="color:#e5e5e5; font-weight:600">${v.next_stop}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px">
              <span style="color:#666">Status</span>
              <span>${delay}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px">
              <span style="color:#666">Crowd</span>
              <span style="color:${crowd}; text-transform:capitalize; font-weight:600">${v.crowd_level}</span>
            </div>
          </div>
        </div>`;

      const marker = L.marker([v.lat, v.lng], { icon }).bindPopup(popup, { maxWidth: 260 }).addTo(map);
      markersRef.current.push(marker);
    });
  }

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", background: "#0d0d0d" }}
    />
  );
}

/* ══════════════════════════════════════
   LIVE MAP — exported component
══════════════════════════════════════ */
export default function LiveMap() {
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const vehicles = MOCK_VEHICLES;

  const counts = {
    all:   vehicles.length,
    train: vehicles.filter(v => v.mode === "train").length,
    metro: vehicles.filter(v => v.mode === "metro").length,
    bus:   vehicles.filter(v => v.mode === "bus").length,
  };

  const delayed   = vehicles.filter(v => v.delay_minutes > 0).length;
  const disrupted = vehicles.filter(v => v.crowd_level === "high").length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 20px", flexShrink: 0,
        borderBottom: `1px solid ${T.b1}`,
        background: T.s1,
        flexWrap: "wrap",
      }}>
        {/* Mode filter tabs */}
        <div style={{ display: "flex", gap: 6, flex: 1 }}>
          {MODE_TABS.map(tab => {
            const active = filter === tab.id;
            const color  = tab.id === "train" ? "#ef4444" : tab.id === "metro" ? "#3b82f6" : tab.id === "bus" ? "#22c55e" : T.muted;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", outline: "none", transition: "all 0.15s",
                  background: active ? `${color}18` : T.s2,
                  border: `1px solid ${active ? color + "40" : T.b1}`,
                  color: active ? color : T.dim,
                  fontFamily: T.body,
                }}
              >
                {tab.label}
                <span style={{
                  marginLeft: 6, fontSize: 10, fontWeight: 700,
                  padding: "1px 5px", borderRadius: 99,
                  background: active ? `${color}25` : T.b1,
                  color: active ? color : T.dim,
                }}>
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
            <span style={{ fontSize: 11, color: T.dim }}>{delayed} delayed</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
            <span style={{ fontSize: 11, color: T.dim }}>{disrupted} high crowd</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <PulseDot color="#22c55e" size={5} />
            <span style={{ fontSize: 11, color: T.dim }}>Simulated live · 12s interval</span>
          </div>
        </div>
      </div>

      {/* ── Map fills the rest ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <LeafletMap vehicles={vehicles} filter={filter} />

        {/* Legend overlay */}
        <div style={{
          position: "absolute", bottom: 24, left: 20, zIndex: 1000,
          display: "flex", flexDirection: "column", gap: 6,
          padding: "10px 14px",
          background: "rgba(10,10,10,0.88)", border: `1px solid ${T.b1}`,
          borderRadius: 12, backdropFilter: "blur(8px)",
        }}>
          <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Lines</div>
          {[
            { label: "Western Railway",    color: "#ef4444" },
            { label: "Central Railway",    color: "#f97316" },
            { label: "Aqua Line Metro 3",  color: "#06b6d4" },
            { label: "BEST Bus",           color: "#22c55e" },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 3, borderRadius: 99, background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: T.subtle }}>{label}</span>
            </div>
          ))}
        </div>

        {/* No-API notice */}
        <div style={{
          position: "absolute", top: 14, right: 14, zIndex: 1000,
          padding: "7px 12px",
          background: "rgba(10,10,10,0.88)", border: `1px solid rgba(245,158,11,0.25)`,
          borderRadius: 9, backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", gap: 7,
        }}>
          <span style={{ fontSize: 10, color: "#f59e0b" }}>⚠</span>
          <span style={{ fontSize: 10, color: T.dim }}>No public API · Mumbai transit data simulated</span>
        </div>
      </div>
    </div>
  );
}