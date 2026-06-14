import { supabase } from "./supabase";

// ─────────────────────────────────────────
// ALERTS
// ─────────────────────────────────────────

/**
 * Fetch all active alerts, newest first.
 * Returns { alerts: Alert[] }
 */
export async function getAlerts() {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return { alerts: data ?? [] };
}

// ─────────────────────────────────────────
// LIVE TRANSIT (map)
// ─────────────────────────────────────────

/**
 * Fetch all live vehicles joined with their route data (stops, name, color).
 * Returns { vehicles: Vehicle[] }
 */
export async function getLiveTransit() {
  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      *,
      routes (
        id,
        name,
        color,
        stops
      )
    `);

  if (error) throw new Error(error.message);

  // Normalise stops: supabase returns jsonb as a parsed object already
  const vehicles = (data ?? []).map((v) => ({
    ...v,
    routes: v.routes
      ? {
          ...v.routes,
          stops:
            typeof v.routes.stops === "string"
              ? JSON.parse(v.routes.stops)
              : v.routes.stops,
        }
      : null,
  }));

  return { vehicles };
}

/**
 * Open a WebSocket-style polling loop that mimics a live socket.
 * Supabase Realtime handles vehicles via postgres_changes, but the LiveMap
 * component expects a createLiveSocket(onMessage) interface that returns { close }.
 *
 * We poll vehicles every 10 s and emit { type: "vehicle_positions", vehicles }.
 */
export function createLiveSocket(onMessage) {
  let active = true;

  async function poll() {
    if (!active) return;
    try {
      const { vehicles } = await getLiveTransit();
      onMessage({ type: "vehicle_positions", vehicles });
    } catch {
      // swallow — LiveMap handles stale data gracefully
    }
    if (active) setTimeout(poll, 10_000);
  }

  poll();

  return { close: () => { active = false; } };
}

// ─────────────────────────────────────────
// JOURNEY PLANNER
// ─────────────────────────────────────────

/**
 * Haversine distance in km between two lat/lng points.
 */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Given all routes (with stops), find ones that serve both the origin area and
 * the destination area (within `thresholdKm`).
 */
function matchRoutes(routes, originLat, originLng, destLat, destLng, thresholdKm = 3) {
  const matches = [];

  for (const route of routes) {
    const stops = Array.isArray(route.stops)
      ? route.stops
      : JSON.parse(route.stops ?? "[]");

    let boardStop = null;
    let boardDist = Infinity;
    let alightStop = null;
    let alightDist = Infinity;

    for (const stop of stops) {
      const dOrigin = haversine(originLat, originLng, stop.lat, stop.lng);
      const dDest   = haversine(destLat,   destLng,   stop.lat, stop.lng);

      if (dOrigin < boardDist) { boardDist = dOrigin; boardStop = stop; }
      if (dDest   < alightDist) { alightDist = dDest; alightStop = stop; }
    }

    // Must board before alighting (sequence check)
    if (
      boardStop &&
      alightStop &&
      boardStop.id !== alightStop.id &&
      boardStop.sequence < alightStop.sequence &&
      boardDist < thresholdKm &&
      alightDist < thresholdKm
    ) {
      matches.push({ route, boardStop, alightStop, boardDist, alightDist });
    }
  }

  return matches;
}

/**
 * Plan a journey between two named lat/lng points.
 *
 * Fetches live routes + vehicles from Supabase, scores options by travel time,
 * blends in live delay data, and returns the same shape the JourneyPlanner
 * component expects.
 *
 * @param {{ origin_name, origin_lat, origin_lng, dest_name, dest_lat, dest_lng, accessibility }} params
 */
export async function planJourney({
  origin_name,
  origin_lat,
  origin_lng,
  dest_name,
  dest_lat,
  dest_lng,
  accessibility = false,
}) {
  // 1. Load routes
  const { data: routeRows, error: routeErr } = await supabase
    .from("routes")
    .select("*")
    .eq("active", true);
  if (routeErr) throw new Error(routeErr.message);

  // 2. Load live vehicles (for delay / crowd data)
  const { data: vehicleRows, error: vehErr } = await supabase
    .from("vehicles")
    .select("*");
  if (vehErr) throw new Error(vehErr.message);

  // 3. Load active alerts to detect disruptions
  const { data: alertRows, error: alertErr } = await supabase
    .from("alerts")
    .select("*")
    .eq("active", true);
  if (alertErr) throw new Error(alertErr.message);

  // Index vehicles by route_id for quick lookup
  const vehiclesByRoute = {};
  for (const v of vehicleRows ?? []) {
    if (!vehiclesByRoute[v.route_id]) vehiclesByRoute[v.route_id] = [];
    vehiclesByRoute[v.route_id].push(v);
  }

  const disruptedRouteIds = new Set(
    (alertRows ?? [])
      .filter((a) => ["disruption", "cancellation"].includes(a.type))
      .flatMap((a) => a.route_ids ?? [])
  );

  // 4. Match routes to origin/dest
  const totalDistKm = haversine(origin_lat, origin_lng, dest_lat, dest_lng);
  const matches = matchRoutes(
    routeRows ?? [],
    origin_lat, origin_lng,
    dest_lat,   dest_lng,
    Math.max(3, totalDistKm * 0.6) // adaptive threshold
  );

  // 5. Build options
  const SPEED_KMH = { bus: 18, metro: 35, train: 45 };
  const now = new Date();

  const options = matches.map((m, idx) => {
    const vehicles = vehiclesByRoute[m.route.id] ?? [];
    // Pick the vehicle closest to the board stop
    const liveVehicle = vehicles.reduce((best, v) => {
      const d = haversine(v.lat, v.lng, m.boardStop.lat, m.boardStop.lng);
      return !best || d < best.dist ? { ...v, dist: d } : best;
    }, null);

    const delayMin    = liveVehicle?.delay_minutes ?? 0;
    const crowdLevel  = liveVehicle?.crowd_level ?? "low";
    const confidence  = Math.max(0.6, 1 - delayMin * 0.04);
    const disrupted   = disruptedRouteIds.has(m.route.id);

    const routeDistKm = haversine(
      m.boardStop.lat, m.boardStop.lng,
      m.alightStop.lat, m.alightStop.lng
    );
    const travelMin   = Math.round((routeDistKm / SPEED_KMH[m.route.mode]) * 60) + delayMin;

    const eta = new Date(now.getTime() + travelMin * 60_000);
    const etaStr = eta.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    return {
      id:               m.route.id,
      route_name:       m.route.name,
      mode:             m.route.mode,
      board_stop:       m.boardStop.name,
      alight_stop:      m.alightStop.name,
      walk_to_board_km: m.boardDist,
      total_minutes:    travelMin,
      eta:              etaStr,
      delay_minutes:    delayMin,
      crowd_level:      crowdLevel,
      delay_confidence: confidence,
      disrupted,
    };
  });

  // 6. Sort: non-disrupted first, then by total_minutes
  options.sort((a, b) => {
    if (a.disrupted !== b.disrupted) return a.disrupted ? 1 : -1;
    return a.total_minutes - b.total_minutes;
  });

  // 7. Separate best alternate when disruption present
  const hasDisruption = options.some((o) => o.disrupted);
  const mainOptions   = options.filter((o) => !o.disrupted);
  const alternate     = hasDisruption ? options.find((o) => o.disrupted) ?? null : null;

  // 8. Persist the journey (fire-and-forget)
  supabase
    .from("journeys")
    .insert({
      origin_name,
      origin_lat,
      origin_lng,
      dest_name,
      dest_lat,
      dest_lng,
      route_plan: { options: mainOptions, alternate },
    })
    .then(() => {})
    .catch(() => {});

  return {
    origin:          origin_name,
    destination:     dest_name,
    distance_km:     totalDistKm.toFixed(1),
    options:         mainOptions,
    alternate,
    has_disruption:  hasDisruption,
  };
}