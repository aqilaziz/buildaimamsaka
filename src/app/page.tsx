import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Star, Heart, Users, ArrowRight } from "lucide-react";
import type { ProjectWithOwner } from "@/lib/types";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function HomePage() {
  const supabase = await createServerSupabase();

  const { data: projects } = await supabase
    .from("projects")
    .select("*, owner:profiles!projects_owner_id_fkey(username, full_name, avatar_url)")
    .eq("status", "published")
    .order("stars_count", { ascending: false })
    .limit(6);

  const featuredProjects = (projects || []) as ProjectWithOwner[];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Pamerkan Karyamu, <br />
            <span className="text-amber-400">Dapatkan Apresiasi</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-10">
            Platform portofolio untuk siswa. Upload karya, dapatkan bintang & like,
            bangun reputasi sejak dini.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/explore"
              className="px-8 py-3.5 bg-white text-primary-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Jelajahi Karya
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 bg-primary-500/20 border border-primary-300/40 text-white rounded-xl font-semibold hover:bg-primary-500/30 transition-colors"
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star size={28} className="text-primary-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Dapatkan Bintang</h3>
            <p className="text-gray-500 text-sm">
              Karyamu bisa diberi bintang oleh sesama siswa. Semakin banyak bintang, semakin tinggi exposure-mu.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Like & Komentar</h3>
            <p className="text-gray-500 text-sm">
              Dapatkan feedback dari komunitas. Like dan komentar membangun engagement.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Profil Publik</h3>
            <p className="text-gray-500 text-sm">
              Setiap siswa punya halaman profil publik. Portfolio online yang siap dibagikan ke siapa saja.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Karya Terbaik</h2>
                <p className="text-gray-500 mt-1">Paling banyak dapat bintang</p>
              </div>
              <Link
                href="/explore"
                className="flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                Lihat semua <ArrowRight size={16} />
              </Link>
            </div>
            <ProjectGrid projects={featuredProjects} emptyMessage="Belum ada karya yang dipublikasikan." />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Siap Pamerkan Karyamu?</h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          Gabung sekarang, upload portofolio, dan mulai bangun reputasi di dunia tech.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg"
        >
          Mulai Gratis <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
