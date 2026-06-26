import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/ProjectForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Unggah Karya Baru" };
export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Unggah Karya Baru</h1>
      <p className="text-gray-500 mb-8">Bagikan hasil kerja terbaikmu dengan dunia</p>
      <ProjectForm />
    </div>
  );
}
