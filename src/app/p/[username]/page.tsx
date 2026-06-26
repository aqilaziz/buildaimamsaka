import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { ProjectGrid } from "@/components/ProjectGrid";
import { formatDate } from "@/lib/utils";
import { Star, Heart, Github, Globe, Calendar, MapPin } from "lucide-react";
import type { Metadata } from "next";
import type { ProjectWithOwner, Profile } from "@/lib/types";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("profiles").select("full_name, username").eq("username", username).single();
  if (!data) return { title: "Profil Tidak Ditemukan" };
  return { title: `${data.full_name || data.username} — Profil` };
}

export const revalidate = 3600;

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createServerSupabase();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) notFound();

  const p = profile as Profile;

  // Fetch published projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*, owner:profiles!projects_owner_id_fkey(username, full_name, avatar_url)")
    .eq("owner_id", p.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const userProjects = (projects || []) as ProjectWithOwner[];
  const totalStars = userProjects.reduce((sum, pr) => sum + pr.stars_count, 0);
  const totalLikes = userProjects.reduce((sum, pr) => sum + pr.likes_count, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold flex-shrink-0">
            {p.full_name?.[0] || p.username[0]?.toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {p.full_name || `@${p.username}`}
            </h1>
            {p.full_name && (
              <p className="text-gray-500 text-lg mt-0.5">@{p.username}</p>
            )}

            {p.bio && <p className="text-gray-700 mt-3">{p.bio}</p>}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> Bergabung {formatDate(p.created_at)}
              </span>
              {p.role && (
                <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium capitalize">
                  {p.role}
                </span>
              )}
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3 mt-4">
              {p.github_username && (
                <a
                  href={`https://github.com/${p.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  <Github size={14} /> {p.github_username}
                </a>
              )}
              {p.website && (
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  <Globe size={14} /> Website
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 sm:gap-8 flex-shrink-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{userProjects.length}</p>
              <p className="text-xs text-gray-500">Karya</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <span className="text-2xl font-bold text-gray-900">{totalStars}</span>
              </div>
              <p className="text-xs text-gray-500">Bintang</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Heart size={16} className="text-red-500" />
                <span className="text-2xl font-bold text-gray-900">{totalLikes}</span>
              </div>
              <p className="text-xs text-gray-500">Like</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Karya ({userProjects.length})
      </h2>
      <ProjectGrid
        projects={userProjects}
        emptyMessage={`@${p.username} belum mempublikasikan karya.`}
      />
    </div>
  );
}
