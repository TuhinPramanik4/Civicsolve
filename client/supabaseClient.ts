import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Issue = {
  id: string;
  description: string;
  img: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
};
