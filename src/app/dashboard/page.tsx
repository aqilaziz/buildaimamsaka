import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Plus, Star, Heart, Eye, Settings } from "lucide-react";
import type { Metadata } from "next";
import type { ProjectWithOwner } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isWelcome = (await searchParams).welcome === "1";

  // Fetch user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*, owner:profiles!projects_owner_id_fkey(username, full_name, avatar_url)")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  const userProjects = (projects || []) as ProjectWithOwner[];

  // Stats
  const totalStars = userProjects.reduce((sum, p) => sum + p.stars_count, 0);
  const totalLikes = userProjects.reduce((sum, p) => sum + p.likes_count, 0);
  const totalViews = userProjects.reduce((sum, p) => sum + p.views_count, 0);
  const publishedCount = userProjects.filter((p) => p.status === "published").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {isWelcome && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl">
          <p className="font-semibold">🎉 Selamat datang di MAMSAKA!</p>
          <p className="text-sm mt-1">Profil kamu sudah siap. Sekarang saatnya unggah karya pertamamu!</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Halo, {profile?.full_name || user.email?.split("@")[0]}!
          </h1>
          <p className="text-gray-500 mt-1">Kelola portofoliomu di sini</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/p/${profile?.username || user.id}`}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Lihat Profil Publik
          </Link>
          <Link
            href="/dashboard/projects/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} /> Karya Baru
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">{userProjects.length}</p>
          <p className="text-sm text-gray-500">Total Karya</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            <span className="text-2xl font-bold text-gray-900">{totalStars}</span>
          </div>
          <p className="text-sm text-gray-500">Total Bintang</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Heart size={16} className="text-red-500" />
            <span className="text-2xl font-bold text-gray-900">{totalLikes}</span>
          </div>
          <p className="text-sm text-gray-500">Total Like</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
          <p className="text-sm text-gray-500">Dipublikasi</p>
        </div>
      </div>

      {/* Projects list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Karyamu</h2>
      </div>

      {userProjects.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <span className="text-5xl mb-4 block">🚀</span>
          <p className="text-gray-500 text-lg mb-4">Belum ada karya. Saatnya berkreasi!</p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} /> Unggah Karya Pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {userProjects.map((project) => (
            <div
              key={project.id}
              className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-primary-200 transition-colors"
            >
              <div className="w-16 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-lg">
                {project.thumbnail_url ? (
                  <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  "🏗️"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/projects/${project.slug}`}
                  className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
                >
                  {project.title}
                </Link>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    project.status === "published"
                      ? "bg-green-50 text-green-700"
                      : project.status === "draft"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {project.status === "published" ? "Published" : project.status === "draft" ? "Draft" : "Archived"}
                  </span>
                  <span className="flex items-center gap-1"><Star size={12} />{project.stars_count}</span>
                  <span className="flex items-center gap-1"><Heart size={12} />{project.likes_count}</span>
                </div>
              </div>
              <Link
                href={`/dashboard/projects/${project.id}/edit`}
                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Settings size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
