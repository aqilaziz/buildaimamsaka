import { createClient } from "@supabase/supabase-js";

// Service-role client: ONLY use in server-side code (API routes, server components)
// Never expose to client
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
