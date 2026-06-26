import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-primary-900 text-white/90 border-t border-primary-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image src="/logo.png" alt="MAM 1 Paciran" width={40} height={40} className="rounded-md bg-white p-0.5" />
              <div>
                <h3 className="font-bold text-white">Build AI - MAMSAKA</h3>
                <p className="text-xs text-amber-400">MA Muhammadiyah 1 Paciran</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Platform portofolio digital siswa. Madrasah unggulan mewujudkan generasi Qur&apos;ani dan berdaya saing global.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-3">Navigasi</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/explore" className="hover:text-amber-400 transition-colors">Explore Karya</Link></li>
              <li><Link href="/login" className="hover:text-amber-400 transition-colors">Masuk</Link></li>
              <li><Link href="/register" className="hover:text-amber-400 transition-colors">Daftar</Link></li>
              <li><a href="https://www.mam1paciran.sch.id" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">Website Sekolah</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-3">Kontak</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>🏫 MA Muhammadiyah 1 Paciran</li>
              <li>📍 Paciran, Lamongan, Jawa Timur</li>
              <li>
                <a href="https://wa.me/6285646233673" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
                  📱 WhatsApp Admin
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-6 text-center text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} MAMSAKA — MA Muhammadiyah 1 Paciran. Platform Portofolio Siswa.</p>
        </div>
      </div>
    </footer>
  );
}
