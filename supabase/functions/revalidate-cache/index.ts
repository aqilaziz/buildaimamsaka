// Supabase Edge Function: revalidate-cache
// Triggers ISR revalidation on Vercel when a project is published/updated
// Called via Supabase Database Webhook or project form submission

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { slug, tags } = await req.json();
    const revalidateSecret = Deno.env.get("REVALIDATE_SECRET");
    const siteUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://your-domain.vercel.app";

    if (!revalidateSecret) throw new Error("REVALIDATE_SECRET not configured");

    const pathsToRevalidate = [`/projects/${slug}`, "/explore"];
    if (tags && Array.isArray(tags)) {
      tags.forEach((tag: string) => pathsToRevalidate.push(`/explore?tag=${tag}`));
    }

    const results = await Promise.all(
      pathsToRevalidate.map(async (path) => {
        const url = `${siteUrl}/api/revalidate?secret=${revalidateSecret}&path=${encodeURIComponent(path)}`;
        const res = await fetch(url);
        return { path, status: res.status };
      })
    );

    return new Response(
      JSON.stringify({ success: true, revalidated: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
