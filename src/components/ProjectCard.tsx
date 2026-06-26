import Link from "next/link";
import Image from "next/image";
import { Star, Heart, Eye } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import type { ProjectWithOwner } from "@/lib/types";

interface ProjectCardProps {
  project: ProjectWithOwner;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {project.thumbnail_url ? (
          <Image
            src={project.thumbnail_url}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary-100 to-primary-50">
            🏗️
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1 mb-3">
          {project.description || "Tidak ada deskripsi"}
        </p>

        {/* Owner + Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">
              {project.owner?.full_name?.[0] || project.owner?.username?.[0]?.toUpperCase() || "?"}
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[100px]">
              {project.owner?.full_name || project.owner?.username}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              {project.stars_count}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={14} />
              {project.likes_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
