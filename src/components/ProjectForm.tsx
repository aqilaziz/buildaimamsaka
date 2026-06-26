"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ImageUpload } from "./ImageUpload";
import { Loader2, X } from "lucide-react";
import type { ProjectFormData, ProjectStatus } from "@/lib/types";

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  projectId?: string; // untuk edit mode
  isEditing?: boolean;
}

export function ProjectForm({ initialData, projectId, isEditing = false }: ProjectFormProps) {
  const supabase = createClient();
  const router = useRouter();

  const [form, setForm] = useState<ProjectFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    thumbnail_url: initialData?.thumbnail_url || "",
    demo_video_url: initialData?.demo_video_url || "",
    github_url: initialData?.github_url || "",
    live_url: initialData?.live_url || "",
    tags: initialData?.tags || [],
    status: initialData?.status || "draft",
  });

  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Judul wajib diisi");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Harus login");
      setLoading(false);
      return;
    }

    if (isEditing && projectId) {
      // Update
      const { error: updateErr } = await supabase
        .from("projects")
        .update({
          title: form.title,
          description: form.description,
          thumbnail_url: form.thumbnail_url,
          demo_video_url: form.demo_video_url,
          github_url: form.github_url,
          live_url: form.live_url,
          status: form.status,
        })
        .eq("id", projectId);

      if (updateErr) {
        setError(updateErr.message);
        setLoading(false);
        return;
      }

      // Update tags
      await supabase.from("project_tags").delete().eq("project_id", projectId);
      await syncTags(form.tags, projectId);
    } else {
      // Insert
      const { data: project, error: insertErr } = await supabase
        .from("projects")
        .insert({
          owner_id: user.id,
          title: form.title,
          description: form.description,
          thumbnail_url: form.thumbnail_url,
          demo_video_url: form.demo_video_url,
          github_url: form.github_url,
          live_url: form.live_url,
          status: form.status,
        })
        .select("id")
        .single();

      if (insertErr || !project) {
        setError(insertErr?.message || "Gagal membuat proyek");
        setLoading(false);
        return;
      }

      await syncTags(form.tags, project.id);
      router.push(`/projects/${project.id}`);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  const syncTags = async (tags: string[], projId: string) => {
    for (const tagName of tags) {
      // Upsert tag
      const { data: tag } = await supabase
        .from("tags")
        .upsert({ name: tagName, slug: tagName }, { onConflict: "name" })
        .select("id")
        .single();

      if (tag) {
        await supabase.from("project_tags").insert({
          project_id: projId,
          tag_id: tag.id,
        });
      }
    }
  };

  const handleStatusChange = (status: ProjectStatus) => {
    setForm((f) => ({ ...f, status }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Judul Karya *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Nama aplikasi/proyek kamu..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          maxLength={200}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Ceritakan tentang proyek ini: teknologi yang dipakai, fitur, tantangan yang dihadapi..."
          rows={5}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
        />
      </div>

      {/* Thumbnail */}
      <ImageUpload
        onUpload={(url) => setForm((f) => ({ ...f, thumbnail_url: url }))}
        onError={setError}
        currentUrl={form.thumbnail_url}
        label="Thumbnail / Gambar Cover"
      />

      {/* Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link Demo (YouTube)</label>
          <input
            type="url"
            value={form.demo_video_url}
            onChange={(e) => setForm((f) => ({ ...f, demo_video_url: e.target.value }))}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link GitHub</label>
          <input
            type="url"
            value={form.github_url}
            onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
            placeholder="https://github.com/username/repo"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Link Live Demo</label>
        <input
          type="url"
          value={form.live_url}
          onChange={(e) => setForm((f) => ({ ...f, live_url: e.target.value }))}
          placeholder="https://myapp.vercel.app"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tag / Teknologi</label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Contoh: react, nextjs, tailwind..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Tambah
          </button>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <div className="flex gap-3">
          {(["draft", "published", "archived"] as ProjectStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStatusChange(s)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                form.status === s
                  ? s === "published"
                    ? "bg-green-50 border-green-300 text-green-700"
                    : s === "archived"
                    ? "bg-gray-100 border-gray-300 text-gray-600"
                    : "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {s === "draft" ? "Draft" : s === "published" ? "Publish" : "Arsip"}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {isEditing ? "Simpan Perubahan" : form.status === "published" ? "Publikasikan Karya 🚀" : "Simpan sebagai Draft"}
      </button>
    </form>
  );
}
