import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return res.status(500).json({
      ok: false,
      error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variable."
    });
  }

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { error } = await supabase
      .schema("public")
      .from("app_health")
      .select("id")
      .limit(1)
      .abortSignal(AbortSignal.timeout(10000));

    if (error) {
      return res.status(500).json({
        ok: false,
        error: error.message,
        code: error.code || undefined
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Supabase health check failed."
    });
  }
}
