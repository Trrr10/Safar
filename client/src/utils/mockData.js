/* ─────────────────────────────────────────────────────────────
   SAFAR · Mumbai Transit Simulated Data
   
   NOTE: Mumbai local trains (CR/WR), Mumbai Metro (MMRC), and
   BEST/MTC buses do NOT have public real-time APIs as of 2025.
   This data uses real Mumbai stops, routes, fares and coordinates
   seeded with realistic simulated live state. When official GTFS-RT
   or open APIs become available, replace the simulation layer here.
───────────────────────────────────────────────────────────────── */

/* ── Real Mumbai stops with coordinates ── */
export const POPULAR_STOPS = [
  { name: "CST (CSMT)",            lat: 18.9398, lng: 72.8355, zone: "CR"     },
  { name: "Dadar",                  lat: 19.0178, lng: 72.8478, zone: "CR/WR"  },
  { name: "Bandra",                 lat: 19.0596, lng: 72.8295, zone: "WR"     },
  { name: "Andheri",               lat: 19.1197, lng: 72.8468, zone: "WR"     },
  { name: "Borivali",              lat: 19.2307, lng: 72.8567, zone: "WR"     },
  { name: "Thane",                  lat: 19.1838, lng: 72.9742, zone: "CR"     },
  { name: "Kurla",                  lat: 19.0726, lng: 72.8799, zone: "CR"     },
  { name: "Ghatkopar",             lat: 19.0863, lng: 72.9081, zone: "CR"     },
  { name: "Mulund",                 lat: 19.1726, lng: 72.9567, zone: "CR"     },
  { name: "Vashi",                  lat: 19.0771, lng: 73.0002, zone: "Trans-Harbour" },
  { name: "BKC",                   lat: 19.0653, lng: 72.8678, zone: "Metro L3" },
  { name: "Chembur",               lat: 19.0621, lng: 72.9011, zone: "CR"     },
  { name: "Santacruz",             lat: 19.0808, lng: 72.8453, zone: "WR"     },
  { name: "Churchgate",            lat: 18.9355, lng: 72.8259, zone: "WR"     },
  { name: "Virar",                  lat: 19.4584, lng: 72.8045, zone: "WR"     },
  { name: "Kalyan",                 lat: 19.2403, lng: 73.1305, zone: "CR"     },
  { name: "Panvel",                 lat: 18.9894, lng: 73.1175, zone: "Harbour" },
  { name: "Colaba",                 lat: 18.9067, lng: 72.8147, zone: "Bus"    },
  { name: "Worli",                  lat: 19.0176, lng: 72.8155, zone: "Bus/Metro" },
  { name: "Lower Parel",           lat: 18.9930, lng: 72.8321, zone: "WR"     },
];

/* ── Modes with status ── */
export const MODES_STATUS = [
  { id: "wr",     label: "Western Railway",   color: "#ef4444", status: "delayed",   vehicles: 312, delay: 4  },
  { id: "cr",     label: "Central Railway",   color: "#f97316", status: "normal",    vehicles: 298, delay: 0  },
  { id: "harbour",label: "Harbour Line",      color: "#a855f7", status: "normal",    vehicles: 88,  delay: 0  },
  { id: "metro1", label: "Metro Line 1",      color: "#3b82f6", status: "normal",    vehicles: 24,  delay: 0  },
  { id: "metro2a",label: "Metro Line 2A",     color: "#eab308", status: "normal",    vehicles: 18,  delay: 0  },
  { id: "metro3", label: "Metro Aqua Line 3", color: "#06b6d4", status: "disrupted", vehicles: 14,  delay: 11 },
  { id: "best",   label: "BEST Bus",          color: "#22c55e", status: "normal",    vehicles: 2847,delay: 2  },
];

/* ── Live vehicle positions (real Mumbai routes) ── */
export const MOCK_VEHICLES = [
  // Western Railway locals
  { id: "WR-101", mode: "train", line: "Western Railway", route_name: "Churchgate → Virar Fast", 
    lat: 19.0808, lng: 72.8453, next_stop: "Santacruz", delay_minutes: 4, crowd_level: "high",
    color: "#ef4444", heading: 350 },
  { id: "WR-202", mode: "train", line: "Western Railway", route_name: "Virar → Churchgate Slow",
    lat: 19.1197, lng: 72.8468, next_stop: "Jogeshwari", delay_minutes: 0, crowd_level: "medium",
    color: "#ef4444", heading: 170 },
  { id: "WR-303", mode: "train", line: "Western Railway", route_name: "Churchgate → Borivali Semi-Fast",
    lat: 19.0596, lng: 72.8295, next_stop: "Bandra", delay_minutes: 6, crowd_level: "high",
    color: "#ef4444", heading: 350 },

  // Central Railway locals
  { id: "CR-101", mode: "train", line: "Central Railway", route_name: "CST → Kalyan Fast",
    lat: 19.0726, lng: 72.8799, next_stop: "Ghatkopar", delay_minutes: 0, crowd_level: "medium",
    color: "#f97316", heading: 65 },
  { id: "CR-202", mode: "train", line: "Central Railway", route_name: "Kalyan → CST Slow",
    lat: 19.1726, lng: 72.9567, next_stop: "Bhandup", delay_minutes: 0, crowd_level: "low",
    color: "#f97316", heading: 220 },
  { id: "CR-303", mode: "train", line: "Central Railway", route_name: "CST → Thane",
    lat: 19.0178, lng: 72.8478, next_stop: "Currey Road", delay_minutes: 2, crowd_level: "high",
    color: "#f97316", heading: 55 },

  // Harbour Line
  { id: "HL-101", mode: "train", line: "Harbour Line", route_name: "CST → Panvel",
    lat: 19.0621, lng: 72.9011, next_stop: "Chembur", delay_minutes: 0, crowd_level: "low",
    color: "#a855f7", heading: 120 },

  // Metro Line 1 (Versova–Andheri–Ghatkopar)
  { id: "M1-101", mode: "metro", line: "Metro Line 1", route_name: "Versova → Ghatkopar",
    lat: 19.1100, lng: 72.8600, next_stop: "D.N.Nagar", delay_minutes: 0, crowd_level: "medium",
    color: "#3b82f6", heading: 90 },
  { id: "M1-202", mode: "metro", line: "Metro Line 1", route_name: "Ghatkopar → Versova",
    lat: 19.0990, lng: 72.8850, next_stop: "Asalpha", delay_minutes: 0, crowd_level: "low",
    color: "#3b82f6", heading: 270 },

  // Metro Aqua Line 3 (BKC–Aarey)
  { id: "M3-101", mode: "metro", line: "Metro Aqua Line 3", route_name: "CSMT → Aarey JVLR",
    lat: 19.0653, lng: 72.8678, next_stop: "BKC", delay_minutes: 11, crowd_level: "high",
    color: "#06b6d4", heading: 20 },

  // Metro Line 2A (Dahisar–DN Nagar)
  { id: "M2-101", mode: "metro", line: "Metro Line 2A", route_name: "Dahisar E → D.N.Nagar",
    lat: 19.1600, lng: 72.8500, next_stop: "Borivali", delay_minutes: 0, crowd_level: "low",
    color: "#eab308", heading: 180 },

  // BEST Buses
  { id: "BEST-701", mode: "bus", line: "BEST", route_name: "Bus 701 — Bandra → Colaba",
    lat: 19.0350, lng: 72.8280, next_stop: "Mahim Causeway", delay_minutes: 5, crowd_level: "high",
    color: "#22c55e", heading: 185 },
  { id: "BEST-332", mode: "bus", line: "BEST", route_name: "Bus 332 — Andheri → Kurla",
    lat: 19.0950, lng: 72.8620, next_stop: "Airport Road", delay_minutes: 0, crowd_level: "medium",
    color: "#22c55e", heading: 135 },
  { id: "BEST-124", mode: "bus", line: "BEST", route_name: "Bus 124 — Borivali → Churchgate",
    lat: 19.1500, lng: 72.8540, next_stop: "Kandivali", delay_minutes: 3, crowd_level: "medium",
    color: "#22c55e", heading: 180 },
  { id: "BEST-C60", mode: "bus", line: "BEST", route_name: "Bus C60 — CST → Worli",
    lat: 18.9700, lng: 72.8210, next_stop: "Haji Ali", delay_minutes: 0, crowd_level: "low",
    color: "#22c55e", heading: 175 },
];

/* ── Mock routes (real Mumbai journeys) ── */
export const MOCK_ROUTES = [
  {
    id: "r1",
    mode: "train",
    route_name: "WR Fast Local",
    board_stop: "Andheri",
    alight_stop: "Churchgate",
    total_minutes: 32,
    eta: (() => { const d = new Date(); d.setMinutes(d.getMinutes() + 35); return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); })(),
    delay_minutes: 3,
    delay_confidence: 0.92,
    crowd_level: "high",
    platform: "Platform 4",
    fare: "₹15",
    walk_to_board_km: 0.15,
    transfer_window: "Comfortable",
    features: ["Ladies Coach", "AC available"],
    disrupted: false,
  },
  {
    id: "r2",
    mode: "metro",
    route_name: "Metro L1 + WR",
    board_stop: "Ghatkopar Metro",
    alight_stop: "Andheri → Churchgate",
    total_minutes: 48,
    eta: (() => { const d = new Date(); d.setMinutes(d.getMinutes() + 50); return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); })(),
    delay_minutes: 0,
    delay_confidence: 0.97,
    crowd_level: "medium",
    platform: "Metro Platform 2",
    fare: "₹40",
    walk_to_board_km: 0.08,
    transfer_window: "Safe (14 min)",
    features: ["AC", "Step-free access", "No transfer rush"],
    disrupted: false,
  },
  {
    id: "r3",
    mode: "bus",
    route_name: "BEST 701 Express",
    board_stop: "Bandra Bus Stop",
    alight_stop: "Colaba Bus Depot",
    total_minutes: 55,
    eta: (() => { const d = new Date(); d.setMinutes(d.getMinutes() + 58); return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); })(),
    delay_minutes: 5,
    delay_confidence: 0.74,
    crowd_level: "high",
    platform: "Bay 7",
    fare: "₹12",
    walk_to_board_km: 0.35,
    transfer_window: "Tight (4 min)",
    features: ["Air-conditioned", "USB charging"],
    disrupted: false,
  },
  {
    id: "r4",
    mode: "train",
    route_name: "Aqua Line 3 + Bus",
    board_stop: "BKC Metro",
    alight_stop: "Worli via Aqua Line",
    total_minutes: 28,
    eta: (() => { const d = new Date(); d.setMinutes(d.getMinutes() + 35); return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); })(),
    delay_minutes: 11,
    delay_confidence: 0.68,
    crowd_level: "medium",
    platform: "BKC Platform 1",
    fare: "₹60",
    walk_to_board_km: 0.22,
    transfer_window: "At risk",
    features: ["Underground AC", "Aqua Line disruption active"],
    disrupted: true,
  },
  {
    id: "r5",
    mode: "train",
    route_name: "CR Slow Local",
    board_stop: "Dadar CR",
    alight_stop: "Thane",
    total_minutes: 42,
    eta: (() => { const d = new Date(); d.setMinutes(d.getMinutes() + 44); return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); })(),
    delay_minutes: 0,
    delay_confidence: 0.88,
    crowd_level: "low",
    platform: "Platform 3",
    fare: "₹20",
    walk_to_board_km: 0.10,
    transfer_window: "Comfortable",
    features: ["Less crowded", "Stops at all stations"],
    disrupted: false,
  },
];

/* ── Time budgets ── */
export const TIME_BUDGETS = [
  { label: "20 min", value: 20  },
  { label: "45 min", value: 45  },
  { label: "1 hour", value: 60  },
  { label: "90 min", value: 90  },
  { label: "2 hours",value: 120 },
  { label: "Any",    value: 999 },
];

/* ── Alerts ── */
export const MOCK_ALERTS = [
  {
    id: "a1", severity: "high", type: "disruption",
    title: "Metro Aqua Line 3 — Signal Fault",
    message: "Signal failure between BKC and Dharavi. Trains running at 50% frequency. Estimated restoration: 45 minutes. Use BEST Bus 332 or WR locals via Bandra as alternate.",
    time: "2 min ago", routes: ["Aqua Line 3"],
  },
  {
    id: "a2", severity: "high", type: "delay",
    title: "WR Fast Locals — avg +4 min delay",
    message: "Western Railway fast locals delayed due to track maintenance between Bandra and Mahim. Slow locals unaffected. Crowds heavy at Andheri.",
    time: "8 min ago", routes: ["WR Fast", "WR Semi-Fast"],
  },
  {
    id: "a3", severity: "medium", type: "crowd",
    title: "Dadar — extreme crowding at Platform 5 & 6",
    message: "Platforms 5 and 6 at Dadar CR critically overcrowded. RPF deployed. Consider alighting at Kurla or Matunga and switching.",
    time: "12 min ago", routes: ["CR All Locals"],
  },
  {
    id: "a4", severity: "medium", type: "platform_change",
    title: "CSMT — Platform 14 now Platform 12",
    message: "The 08:42 Kalyan local departs from Platform 12 instead of Platform 14 today. Confirmation pending from CR operations.",
    time: "18 min ago", routes: ["CR 08:42 Kalyan"],
  },
  {
    id: "a5", severity: "low", type: "info",
    title: "Metro Line 2A — Free rides before 8 AM",
    message: "MMRDA running off-peak incentive. All Metro 2A rides before 8:00 AM are free of charge until end of this month.",
    time: "1 hr ago", routes: ["Metro 2A"],
  },
  {
    id: "a6", severity: "low", type: "info",
    title: "BEST Bus — Monsoon schedule in effect",
    message: "BEST has activated monsoon contingency schedules. Some routes running fewer trips. Check the BEST app for latest timings.",
    time: "2 hrs ago", routes: ["All BEST Routes"],
  },
];

/* ── Metro station coordinates (Aqua Line 3) ── */
export const METRO_L3_STATIONS = [
  { name: "Aarey JVLR",     lat: 19.1520, lng: 72.8727 },
  { name: "SEEPZ",           lat: 19.1170, lng: 72.8697 },
  { name: "Marol Naka",     lat: 19.1120, lng: 72.8758 },
  { name: "Airport Road",   lat: 19.0978, lng: 72.8678 },
  { name: "CSMIA T2",       lat: 19.0965, lng: 72.8730 },
  { name: "Sahar Road",     lat: 19.0890, lng: 72.8710 },
  { name: "Domestic Airport",lat:19.0877, lng: 72.8688 },
  { name: "Santacruz",      lat: 19.0808, lng: 72.8453 },
  { name: "MMRDA BKC",      lat: 19.0653, lng: 72.8678 },
  { name: "Dharavi",         lat: 19.0460, lng: 72.8563 },
  { name: "Sion",            lat: 19.0390, lng: 72.8619 },
  { name: "Chembur",         lat: 19.0621, lng: 72.9011 },
  { name: "Acharya Atre Chowk", lat: 18.9860, lng: 72.8190 },
  { name: "Worli",           lat: 19.0176, lng: 72.8155 },
  { name: "Siddhivinayak",  lat: 18.9995, lng: 72.8260 },
  { name: "Dadar",           lat: 19.0178, lng: 72.8478 },
  { name: "Shitladevi",     lat: 18.9775, lng: 72.8245 },
  { name: "Dharavi",         lat: 19.0460, lng: 72.8563 },
  { name: "CST",             lat: 18.9398, lng: 72.8355 },
  { name: "Cuffe Parade",   lat: 18.9053, lng: 72.8163 },
];

/* ── Western Railway station coordinates ── */
export const WR_STATIONS = [
  { name: "Churchgate",   lat: 18.9355, lng: 72.8259 },
  { name: "Marine Lines", lat: 18.9452, lng: 72.8254 },
  { name: "Charni Road",  lat: 18.9515, lng: 72.8230 },
  { name: "Grant Road",   lat: 18.9610, lng: 72.8219 },
  { name: "Mumbai Central", lat: 18.9696, lng: 72.8196 },
  { name: "Mahalaxmi",   lat: 18.9782, lng: 72.8196 },
  { name: "Lower Parel",  lat: 18.9930, lng: 72.8321 },
  { name: "Prabhadevi",  lat: 19.0038, lng: 72.8266 },
  { name: "Dadar WR",    lat: 19.0178, lng: 72.8359 },
  { name: "Matunga Road", lat: 19.0280, lng: 72.8396 },
  { name: "Mahim",        lat: 19.0394, lng: 72.8389 },
  { name: "Bandra",       lat: 19.0596, lng: 72.8295 },
  { name: "Khar Road",   lat: 19.0710, lng: 72.8355 },
  { name: "Santacruz",   lat: 19.0808, lng: 72.8453 },
  { name: "Vile Parle",  lat: 19.0988, lng: 72.8493 },
  { name: "Andheri",     lat: 19.1197, lng: 72.8468 },
  { name: "Jogeshwari",  lat: 19.1345, lng: 72.8498 },
  { name: "Ram Mandir",  lat: 19.1451, lng: 72.8490 },
  { name: "Goregaon",    lat: 19.1565, lng: 72.8497 },
  { name: "Malad",        lat: 19.1864, lng: 72.8480 },
  { name: "Kandivali",   lat: 19.2048, lng: 72.8521 },
  { name: "Borivali",    lat: 19.2307, lng: 72.8567 },
  { name: "Dahisar",     lat: 19.2517, lng: 72.8563 },
  { name: "Mira Road",   lat: 19.2841, lng: 72.8688 },
  { name: "Bhayandar",   lat: 19.3003, lng: 72.8491 },
  { name: "Naigaon",     lat: 19.3697, lng: 72.8596 },
  { name: "Vasai Road",  lat: 19.3912, lng: 72.8265 },
  { name: "Nalla Sopara",lat: 19.4192, lng: 72.8158 },
  { name: "Virar",       lat: 19.4584, lng: 72.8045 },
];

/* ── Central Railway station coordinates ── */
export const CR_STATIONS = [
  { name: "CST (CSMT)",   lat: 18.9398, lng: 72.8355 },
  { name: "Masjid",       lat: 18.9454, lng: 72.8380 },
  { name: "Sandhurst Road",lat:18.9512, lng: 72.8419 },
  { name: "Byculla",      lat: 18.9617, lng: 72.8340 },
  { name: "Chinchpokli",  lat: 18.9704, lng: 72.8360 },
  { name: "Currey Road",  lat: 18.9812, lng: 72.8391 },
  { name: "Parel",        lat: 18.9925, lng: 72.8435 },
  { name: "Dadar CR",     lat: 19.0178, lng: 72.8478 },
  { name: "Matunga CR",   lat: 19.0275, lng: 72.8519 },
  { name: "Sion",         lat: 19.0390, lng: 72.8619 },
  { name: "Kurla",        lat: 19.0726, lng: 72.8799 },
  { name: "Vidyavihar",   lat: 19.0820, lng: 72.8884 },
  { name: "Ghatkopar",    lat: 19.0863, lng: 72.9081 },
  { name: "Vikhroli",     lat: 19.1056, lng: 72.9261 },
  { name: "Kanjurmarg",   lat: 19.1167, lng: 72.9413 },
  { name: "Bhandup",      lat: 19.1343, lng: 72.9497 },
  { name: "Nahur",        lat: 19.1487, lng: 72.9534 },
  { name: "Mulund",       lat: 19.1726, lng: 72.9567 },
  { name: "Thane",        lat: 19.1838, lng: 72.9742 },
];