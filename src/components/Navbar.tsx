"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Menu, X, Search, Plus, User, LogOut, LogIn } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <span className="text-2xl">🏗️</span>
            <span>MAMSAKA</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
              Explore
            </Link>
            {!loading && user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/projects/new"
                  className="flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  Unggah Karya
                </Link>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/p/${user.user_metadata?.username || user.id}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                      {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Keluar"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                <LogIn size={16} />
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/explore" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>
            Explore
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <Link href="/dashboard/projects/new" className="block py-2 text-primary-600 font-medium" onClick={() => setMobileOpen(false)}>
                + Unggah Karya
              </Link>
              <Link href={`/p/${user.user_metadata?.username || user.id}`} className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>
                Profil
              </Link>
              <button onClick={handleSignOut} className="block py-2 text-red-500 font-medium w-full text-left">
                Keluar
              </button>
            </>
          ) : (
            <Link href="/login" className="block py-2 text-primary-600 font-medium" onClick={() => setMobileOpen(false)}>
              Masuk / Daftar
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
