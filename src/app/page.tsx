import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { ProjectGrid } from "@/components/ProjectGrid";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Star, Heart, ArrowRight, GraduationCap, Monitor } from "lucide-react";
import { SCHOOL_NAME, SCHOOL_SHORT, SCHOOL_TAGLINE, SCHOOL_PROGRAMS, SCHOOL_STATS, SCHOOL_WEBSITE, SCHOOL_WHATSAPP } from "@/lib/utils";
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
      {/* ========== HERO ========== */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-900 to-indigo-950 text-white overflow-hidden">
        {/* Animated background dots */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute inset-0 animate-pulse" style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, #f59e0b 1.5px, transparent 1.5px), radial-gradient(circle at 80% 70%, #10b981 1.5px, transparent 1.5px)",
            backgroundSize: "80px 80px",
            animationDuration: "4s"
          }} />
        </div>
        {/* Floating gradient orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />

        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28 text-center relative z-10">
          <ScrollReveal animation="zoom-in" duration={800}>
            <div className="flex flex-col items-center gap-4 mb-8">
              <Image
                src="/logo.png"
                alt={SCHOOL_SHORT}
                width={100}
                height={100}
                className="rounded-2xl shadow-2xl bg-white p-2 hover:scale-105 transition-transform duration-500"
              />
              <p className="text-amber-400 font-semibold tracking-wide uppercase text-sm animate-pulse">
                {SCHOOL_NAME}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="text-amber-400 relative inline-block">
                Build AI
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-amber-400/30 rounded-full" />
              </span>{" - "}
              MAMSAKA
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={350}>
            <p className="text-lg sm:text-xl text-primary-100 max-w-3xl mx-auto mb-4">
              {SCHOOL_TAGLINE}
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={450}>
            <p className="text-base text-white/60 max-w-2xl mx-auto mb-10">
              Pamerkan karya digital terbaikmu — aplikasi, website, desain, atau proyek coding.
              Dapatkan apresiasi dari teman, guru, dan dunia.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={600}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/explore"
                className="group px-8 py-3.5 bg-white text-primary-800 rounded-xl font-bold hover:bg-amber-50 transition-all shadow-lg flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5"
              >
                Jelajahi Karya{" "}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/register"
                className="px-8 py-3.5 bg-primary-600/30 border border-primary-400/40 text-white rounded-xl font-semibold hover:bg-primary-600/50 transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5"
              >
                Daftar Sekarang <GraduationCap size={18} />
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#f9fafb" d="M0 80L60 66.7C120 53 240 27 360 26.7C480 27 600 53 720 53.3C840 53 960 27 1080 20C1200 13 1320 27 1380 33.3L1440 40V80H0Z" />
          </svg>
        </div>
      </section>

      {/* ========== SCHOOL STATS ========== */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SCHOOL_STATS.map((stat, i) => (
            <ScrollReveal
              key={stat.label}
              animation="zoom-in"
              delay={i * 100}
              duration={600}
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 text-center hover:shadow-xl hover:-translate-y-1 hover:border-primary-200 transition-all duration-300">
                <p className="text-3xl font-extrabold text-primary-800">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ========== PROGRAMS ========== */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Program Unggulan</h2>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
              {SCHOOL_SHORT} memadukan nilai Islam dan teknologi untuk mencetak generasi unggul
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SCHOOL_PROGRAMS.map((program, i) => (
            <ScrollReveal
              key={program.name}
              animation={i % 2 === 0 ? "fade-right" : "fade-left"}
              delay={i * 120}
              duration={600}
            >
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-primary-300 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform duration-300">{program.icon}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{program.name}</h3>
                <p className="text-sm text-gray-500">{program.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ========== FEATURED PROJECTS ========== */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">🌟 Karya Terbaik Siswa</h2>
                <p className="text-gray-500 mt-1">Portofolio digital Build AI - MAMSAKA paling banyak diapresiasi</p>
              </div>
              <Link
                href="/explore"
                className="flex items-center gap-1 text-primary-700 font-semibold hover:text-primary-800 transition-colors group"
              >
                Lihat semua <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          {featuredProjects.length > 0 ? (
            <ProjectGrid projects={featuredProjects} emptyMessage="Belum ada karya yang dipublikasikan." />
          ) : (
            <ScrollReveal animation="zoom-in" duration={800}>
              <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
                <span className="text-5xl mb-4 block animate-bounce">🚀</span>
                <p className="text-gray-500 text-lg mb-4">Belum ada karya. Jadi yang pertama!</p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-700 text-white rounded-xl font-semibold hover:bg-primary-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <GraduationCap size={18} /> Daftar & Unggah Karya
                </Link>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ========== WHY MAMSAKA ========== */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Kenapa MAMSAKA?</h2>
            <p className="text-gray-500 mt-2">Platform yang dibangun untuk siswa, oleh semangat madrasah</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Star size={32} className="text-amber-600 fill-amber-600" />,
              bg: "bg-amber-100",
              title: "Dapatkan Bintang",
              desc: "Karyamu bisa diberi bintang oleh sesama siswa dan guru. Semakin banyak bintang, semakin tinggi exposure.",
            },
            {
              icon: <Heart size={32} className="text-rose-500 fill-rose-500" />,
              bg: "bg-rose-100",
              title: "Like & Komentar",
              desc: "Dapatkan feedback dari komunitas madrasah. Like dan komentar membangun engagement positif.",
            },
            {
              icon: <Monitor size={32} className="text-emerald-600" />,
              bg: "bg-emerald-100",
              title: "Portofolio Digital",
              desc: "Setiap siswa punya halaman profil dan portofolio online yang siap dibagikan ke siapa saja, kapan saja.",
            },
          ].map((feature, i) => (
            <ScrollReveal
              key={feature.title}
              animation="fade-up"
              delay={i * 150}
              duration={600}
            >
              <div className="text-center p-6 group hover:bg-white hover:shadow-lg hover:border-gray-200 border border-transparent rounded-2xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="relative bg-gradient-to-r from-primary-800 to-primary-900 text-white overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 30% 50%, #f59e0b 1px, transparent 1px), radial-gradient(circle at 70% 50%, #10b981 1px, transparent 1px)",
            backgroundSize: "50px 50px"
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 text-center relative z-10">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Siap Pamerkan Karyamu?</h2>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={150}>
            <p className="text-primary-200 mb-8 max-w-lg mx-auto text-lg">
              Gabung sekarang, upload portofolio digitalmu, dan mulai bangun reputasi sebagai siswa {SCHOOL_SHORT} yang berprestasi.
            </p>
          </ScrollReveal>
          <ScrollReveal animation="zoom-in" delay={300} duration={600}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group px-8 py-3.5 bg-amber-500 text-primary-900 rounded-xl font-bold hover:bg-amber-400 transition-all shadow-lg flex items-center justify-center gap-2 hover:shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5"
              >
                <GraduationCap size={18} /> Daftar Gratis
              </Link>
              <a
                href={`https://wa.me/${SCHOOL_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 hover:shadow-lg"
              >
                💬 Tanya Admin
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
