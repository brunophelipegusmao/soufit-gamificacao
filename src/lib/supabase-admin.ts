import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

// Instanciado sob demanda (não no import do módulo) para que páginas que só
// importam a DAL (src/lib/admin.ts) sem de fato precisar da service role key
// — como /admin/login — não quebrem se a env var ainda não estiver configurada.
export function getSupabaseAdmin() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }
  return client;
}
