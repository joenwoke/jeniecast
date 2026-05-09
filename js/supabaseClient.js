import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function requireSupabaseClient() {
  if (!supabase) {
    console.warn("Supabase is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
    return false;
  }

  return true;
}

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

export async function signInWithGoogle() {
  if (!requireSupabaseClient()) {
    return;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin
    }
  });

  if (error) {
    console.error("Google sign-in failed:", error.message);
  }
}

export async function signOut() {
  if (!requireSupabaseClient()) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out failed:", error.message);
  }
}

export async function getCurrentUser() {
  if (!requireSupabaseClient()) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Could not get current user:", error.message);
    return null;
  }

  return data.user;
}

export function listenToAuthChanges(callback) {
  if (!requireSupabaseClient()) {
    return null;
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  return data.subscription;
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
