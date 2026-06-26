import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { StarButton } from "@/components/StarButton";
import { LikeButton } from "@/components/LikeButton";
import { CommentSection } from "@/components/CommentSection";
import { formatDate, getYouTubeEmbedUrl } from "@/lib/utils";
import { Github, Globe, Play, ArrowLeft, Calendar } from "lucide-react";
import type { Metadata } from "next";
import type { ProjectWithInteractions, CommentWithAuthor } from "@/lib/types";

export const revalidate = 3600; // ISR 1 jam

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("projects")
    .select("title, description")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Tidak Ditemukan" };
  return {
    title: data.title,
    description: data.description?.slice(0, 160) || "Lihat karya ini di MAMSAKA",
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  // Get current user for interaction state
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch project with owner and interactions
  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      *,
      owner:profiles!projects_owner_id_fkey(
        id, username, full_name, avatar_url, bio
      ),
      tags:project_tags(
        tag:tags(id, name, slug)
      ),
      media:project_media(id, media_url, media_type, sort_order)
    `)
    .eq("slug", slug)
    .single();

  if (error || !project) notFound();

  const p = project as unknown as ProjectWithInteractions;

  // Check user interactions
  let hasStarred = false;
  let hasLiked = false;
  if (user) {
    const [{ data: starData }, { data: likeData }] = await Promise.all([
      supabase.from("stars").select("id").eq("project_id", p.id).eq("user_id", user.id).maybeSingle(),
      supabase.from("likes").select("id").eq("project_id", p.id).eq("user_id", user.id).maybeSingle(),
    ]);
    hasStarred = !!starData;
    hasLiked = !!likeData;
  }

  // Fetch comments
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      author:profiles!comments_user_id_fkey(username, full_name, avatar_url)
    `)
    .eq("project_id", p.id)
    .is("parent_id", null)
    .order("created_at", { ascending: true });

  // YouTube embed
  const youtubeEmbed = p.demo_video_url ? getYouTubeEmbedUrl(p.demo_video_url) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-primary-600 mb-6 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Kembali ke Explore
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{p.title}</h1>

        {/* Owner info */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/p/${p.owner.username}`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
              {p.owner.full_name?.[0] || p.owner.username[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                {p.owner.full_name || p.owner.username}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar size={12} /> {formatDate(p.published_at)}
              </p>
            </div>
          </Link>

          {/* Action buttons */}
          <div className="ml-auto flex items-center gap-2">
            <StarButton projectId={p.id} initialStarred={hasStarred} initialCount={p.stars_count} />
            <LikeButton projectId={p.id} initialLiked={hasLiked} initialCount={p.likes_count} />
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      {p.thumbnail_url && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-gray-100">
          <Image
            src={p.thumbnail_url}
            alt={p.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Tags */}
      {p.tags && p.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {(p.tags as any[]).map((t: any) => (
            <span
              key={t.tag.id}
              className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
            >
              {t.tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {p.description && (
        <div className="prose max-w-none mb-8">
          <h2 className="text-xl font-semibold mb-3">Deskripsi</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{p.description}</p>
        </div>
      )}

      {/* YouTube Demo */}
      {youtubeEmbed && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Play size={20} /> Demo Video
          </h2>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              src={youtubeEmbed}
              title="Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-3 mb-8">
        {p.github_url && (
          <a
            href={p.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <Github size={18} /> Lihat Source Code
          </a>
        )}
        {p.live_url && (
          <a
            href={p.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Globe size={18} /> Live Demo
          </a>
        )}
      </div>

      {/* Gallery */}
      {p.media && p.media.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Galeri</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(p.media as any[]).map((m: any) => (
              <div key={m.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image src={m.media_url} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <hr className="my-8 border-gray-200" />

      {/* Comments */}
      <CommentSection projectId={p.id} initialComments={(comments || []) as CommentWithAuthor[]} />
    </div>
  );
}
