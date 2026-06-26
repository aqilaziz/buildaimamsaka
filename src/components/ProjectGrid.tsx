import { ProjectCard } from "./ProjectCard";
import type { ProjectWithOwner } from "@/lib/types";

interface ProjectGridProps {
  projects: ProjectWithOwner[];
  emptyMessage?: string;
}

export function ProjectGrid({ projects, emptyMessage = "Belum ada karya." }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">🏗️</span>
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
