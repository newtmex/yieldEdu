import { createClient } from "@supabase/supabase-js";

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

if (!supabaseAnonKey) {
	throw new Error("supabas Anon Key not found");
}

if (!supabaseUrl) {
	throw new Error("supabase url not found");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
