import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function isExpectedProtectedTableError(error) {
  const protectedErrorCodes = new Set([
    "42501",
    "PGRST301",
    "PGRST302"
  ]);
  const message = error.message.toLowerCase();

  return protectedErrorCodes.has(error.code)
    || message.includes("permission denied")
    || message.includes("not authenticated")
    || message.includes("row-level security")
    || message.includes("rls");
}

export async function testSupabaseConnection() {
  if (!supabase) {
    console.warn("Supabase connection test skipped. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
    return;
  }

  const { data, error } = await supabase
    .from("watch_items")
    .select("id")
    .limit(1);

  if (error) {
    if (isExpectedProtectedTableError(error)) {
      console.info("Supabase reached; watch_items is protected until login.");
      return;
    }

    console.error("Supabase connection test failed:", error.message);
    return;
  }

  console.log("Supabase connection test passed:", data);
}
