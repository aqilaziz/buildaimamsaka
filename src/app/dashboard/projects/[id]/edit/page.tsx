import { redirect, notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/ProjectForm";
import type { Metadata } from "next";
import type { ProjectFormData } from "@/lib/types";

export const metadata: Metadata = { title: "Edit Karya" };
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*, tags:project_tags(tag:tags(name))")
    .eq("id", id)
    .single();

  if (!project) notFound();
  if (project.owner_id !== user.id) redirect("/dashboard");

  const tags = (project.tags as any[] | null)?.map((t: any) => t.tag.name) || [];

  const initialData: Partial<ProjectFormData> = {
    title: project.title,
    description: project.description,
    thumbnail_url: project.thumbnail_url,
    demo_video_url: project.demo_video_url,
    github_url: project.github_url,
    live_url: project.live_url,
    tags,
    status: project.status,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Karya</h1>
      <p className="text-gray-500 mb-8">{project.title}</p>
      <ProjectForm initialData={initialData} projectId={id} isEditing />
    </div>
  );
}
