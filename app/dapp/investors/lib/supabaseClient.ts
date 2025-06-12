import { createClient } from "@supabase/supabase-js";

const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

if (!supabaseServiceKey) {
	throw new Error("supabas Anon Key not found");
}

if (!supabaseUrl) {
	throw new Error("supabase url not found");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
