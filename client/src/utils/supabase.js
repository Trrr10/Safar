import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Subscribe to new alerts via Supabase Realtime.
 * Calls `callback` with the Postgres change payload whenever a new alert row is inserted.
 * Returns the subscription object — call sub.unsubscribe() to clean up.
 */
export function subscribeToAlerts(callback) {
  const sub = supabase
    .channel("alerts-insert")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "alerts" },
      (payload) => callback(payload)
    )
    .subscribe();

  return sub;
}

/**
 * Subscribe to live vehicle position updates.
 * Calls `callback` with the updated vehicle row on every UPDATE.
 */
export function subscribeToVehicles(callback) {
  const sub = supabase
    .channel("vehicles-update")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "vehicles" },
      (payload) => callback(payload)
    )
    .subscribe();

  return sub;
}