import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase konfiguratsiyasi topilmadi. .env faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY borligiga ishonch hosil qiling."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
