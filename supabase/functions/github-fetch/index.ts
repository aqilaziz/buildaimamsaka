// Supabase Edge Function: github-fetch
// Fetch repository metadata from GitHub API
// API key (GITHUB_TOKEN) stored as Supabase secret — never touches frontend

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface GitHubRepo {
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
  html_url: string;
  updated_at: string;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { repo } = await req.json();
    if (!repo) throw new Error("Missing 'repo' parameter");

    const token = Deno.env.get("GITHUB_TOKEN");
    if (!token) throw new Error("GITHUB_TOKEN not configured");

    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data: GitHubRepo = await response.json();

    return new Response(
      JSON.stringify({
        full_name: data.full_name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        topics: data.topics,
        url: data.html_url,
        updated_at: data.updated_at,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
