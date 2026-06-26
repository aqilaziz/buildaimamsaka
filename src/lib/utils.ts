import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function timeAgo(date: string) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) return formatDate(date);
  if (diffDay > 0) return `${diffDay} hari lalu`;
  if (diffHour > 0) return `${diffHour} jam lalu`;
  if (diffMin > 0) return `${diffMin} menit lalu`;
  return "baru saja";
}

export function getYouTubeEmbedUrl(url: string) {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

export function extractGithubRepo(url: string) {
  const match = url.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/);
  return match ? match[1] : null;
}

// ============================================
// MAM 1 Paciran — School Identity
// ============================================
export const APP_NAME = "Build AI - MAMSAKA";
export const APP_FULL_NAME = "Build AI - MAMSAKA — Madrasah Aliyah Muhammadiyah 1 Paciran";
export const SCHOOL_NAME = "MA Muhammadiyah 1 Paciran";
export const SCHOOL_SHORT = "MAM 1 Paciran";
export const APP_DESCRIPTION =
  "Platform portofolio digital siswa MAM 1 Paciran. Madrasah unggulan mewujudkan generasi Qur'ani dan berdaya saing global melalui program tahfidz, karya digital, dan ekstrakurikuler terbaik.";
export const SCHOOL_TAGLINE =
  "Madrasah unggulan mewujudkan generasi Qur'ani dan berdaya saing global";
export const SCHOOL_WEBSITE = "https://www.mam1paciran.sch.id";
export const SCHOOL_WHATSAPP = "6285646233673";
export const SCHOOL_PROGRAMS = [
  { name: "Tahfidz Qur'an", icon: "📖", desc: "Program hafalan Al-Qur'an terstruktur" },
  { name: "Karya Digital", icon: "💻", desc: "Portofolio dan project based learning" },
  { name: "Ekstrakurikuler", icon: "🎯", desc: "Pengembangan minat dan bakat siswa" },
  { name: "Dakwah Islam", icon: "🕌", desc: "Pembinaan akhlak dan karakter Islami" },
];
export const SCHOOL_STATS = [
  { label: "Siswa Aktif", value: "500+" },
  { label: "Guru Profesional", value: "40+" },
  { label: "Program Unggulan", value: "8+" },
  { label: "Tahun Berdiri", value: "1987" },
];
