import { Suspense } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { SearchBar } from "@/components/SearchBar";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Pagination } from "@/components/Pagination";
import type { Metadata } from "next";
import type { ProjectWithOwner } from "@/lib/types";

export const metadata: Metadata = {
  title: "Explore",
  description: "Jelajahi karya terbaik dari siswa MAMSAKA",
};

export const revalidate = 300; // ISR 5 menit

const PAGE_SIZE = 12;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const page = Math.max(1, parseInt(params.page || "1"));
  const supabase = await createServerSupabase();

  let dbQuery = supabase
    .from("projects")
    .select("*, owner:profiles!projects_owner_id_fkey(username, full_name, avatar_url)", {
      count: "exact",
    })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  const { data, count } = await dbQuery;
  const projects = (data || []) as ProjectWithOwner[];
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explore Karya</h1>
          <p className="text-gray-500 mt-1">
            {query ? `Hasil pencarian: "${query}"` : "Jelajahi portofolio siswa"}
          </p>
        </div>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <ProjectGrid
        projects={projects}
        emptyMessage={query ? `Tidak ada karya yang cocok dengan "${query}"` : "Belum ada karya yang dipublikasikan."}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/explore"
        searchParams={query ? { q: query } : {}}
      />
    </div>
  );
}
