import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getLiveTransit, createLiveSocket } from "../utils/api";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const MODE_COLORS = { bus: "#dc2626", metro: "#f97316", train: "#7c3aed" };
const MODE_LABELS = { bus: "🚌", metro: "🚇", train: "🚆" };
const CROWD_COLORS = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };

const vehicleIcon = (mode, delay) => {
  const color = MODE_COLORS[mode] || "#dc2626";
  const emoji = MODE_LABELS[mode] || "🚌";
  const ring  = delay > 0 ? "#ef4444" : "#22c55e";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:38px;height:38px">
      <div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${ring};background:${color}18;animation:pulse-ring 1.8s ease-in-out infinite;"></div>
      <div style="position:absolute;inset:5px;border-radius:50%;background:#0f0f0f;border:1.5px solid ${color};display:flex;align-items:center;justify-content:center;font-size:13px;">${emoji}</div>
    </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

function MapController({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 14, { duration: 1.2 }); }, [center, map]);
  return null;
}

const MODE_TABS = [
  { id: "all",   label: "All",   color: "#a1a1aa" },
  { id: "bus",   label: "Bus",   color: "#dc2626" },
  { id: "metro", label: "Metro", color: "#f97316" },
  { id: "train", label: "Train", color: "#7c3aed" },
];

export default function LiveMap({ onVehicleSelect }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState("all");
  const wsRef = useRef(null);

  const MUMBAI = [19.076, 72.877];

  useEffect(() => {
    getLiveTransit()
      .then(d => { setVehicles(d.vehicles || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    wsRef.current = createLiveSocket((msg) => {
      if (msg.type === "vehicle_positions") setVehicles(msg.vehicles || []);
    });
    return () => wsRef.current?.close();
  }, []);

  const filtered = vehicles.filter(v => filter === "all" || v.mode === filter);

  const routeLines = {};
  filtered.forEach(v => {
    if (!v.routes?.stops || routeLines[v.route_id]) return;
    try {
      const stops = Array.isArray(v.routes.stops) ? v.routes.stops : JSON.parse(v.routes.stops);
      routeLines[v.route_id] = { positions: stops.map(s => [s.lat, s.lng]), color: v.routes.color || MODE_COLORS[v.mode] };
    } catch {}
  });

  return (
    <div className="relative flex flex-col h-full min-h-[420px]">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-3">
        {MODE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
            style={
              filter === tab.id
                ? { background: `${tab.color}18`, color: tab.color, border: `1px solid ${tab.color}40` }
                : { background: "#161616", color: "#52525b", border: "1px solid #262626" }
            }
          >
            {tab.label}
            {filter === tab.id && filtered.length > 0 && (
              <span className="ml-1.5 opacity-70">{filtered.length}</span>
            )}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse-ring inline-block" />
          <span className="text-xs text-[#52525b]">{filtered.length} live</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 rounded-xl overflow-hidden border border-[#1f1f1f] relative" style={{ minHeight: 380 }}>
        {loading ? (
          <div className="absolute inset-0 bg-[#111111] flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#52525b]">Loading live map…</p>
          </div>
        ) : (
          <MapContainer center={MUMBAI} zoom={12} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <MapController center={selected} />

            {Object.entries(routeLines).map(([id, { positions, color }]) => (
              <Polyline key={id} positions={positions} color={color} weight={2} opacity={0.45} dashArray="6 4" />
            ))}

            {filtered.map(v => (
              <Marker
                key={v.id}
                position={[v.lat, v.lng]}
                icon={vehicleIcon(v.mode, v.delay_minutes)}
                eventHandlers={{ click: () => { setSelected([v.lat, v.lng]); onVehicleSelect?.(v); } }}
              >
                <Popup>
                  <div style={{ background: "#161616", borderRadius: 10, padding: "12px 14px", minWidth: 180, color: "#f0f0f0", fontSize: 13, border: "1px solid #262626" }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, color: "#fff", fontSize: 14 }}>
                      {MODE_LABELS[v.mode]} {v.routes?.name || v.route_id}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <div style={{ color: "#71717a" }}>Next stop: <span style={{ color: "#fff" }}>{v.next_stop || "—"}</span></div>
                      <div style={{ color: "#71717a" }}>Delay:&nbsp;
                        <span style={{ color: v.delay_minutes > 0 ? "#ef4444" : "#22c55e", fontWeight: 600 }}>
                          {v.delay_minutes > 0 ? `+${v.delay_minutes} min` : "On time"}
                        </span>
                      </div>
                      <div style={{ color: "#71717a" }}>Crowd:&nbsp;
                        <span style={{ color: CROWD_COLORS[v.crowd_level], fontWeight: 600, textTransform: "capitalize" }}>
                          {v.crowd_level}
                        </span>
                      </div>
                      {v.eta_prediction && (
                        <div style={{ color: "#71717a" }}>ETA: <span style={{ color: "#fff" }}>{v.eta_prediction.eta} ({v.eta_prediction.minutes_away} min)</span></div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Legend overlay */}
        <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-3 px-3 py-2 rounded-lg bg-[#111111]/90 border border-[#1f1f1f] backdrop-blur-sm">
          {Object.entries(MODE_COLORS).map(([mode, color]) => (
            <div key={mode} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[11px] text-[#71717a] capitalize">{mode}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}