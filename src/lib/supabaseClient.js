import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase =
  url && key ? createClient(url, key) : null;

export const isSupabaseReady = () => Boolean(supabase);
