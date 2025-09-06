import { createClient } from "@supabase/supabase-js";

const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

if (!supabaseAnon) {
	throw new Error("supabase Anon Key not found");
}

if (!supabaseUrl) {
	throw new Error("supabase url not found");
}

export const supabase = createClient(supabaseUrl, supabaseAnon);
