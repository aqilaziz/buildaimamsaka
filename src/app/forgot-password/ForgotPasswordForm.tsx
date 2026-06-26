"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Send, ArrowLeft, CheckCircle } from "lucide-react";

export function ForgotPasswordForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
    });

    if (resetError) {
      setError(
        resetError.message === "User not found"
          ? "Email tidak ditemukan. Periksa kembali."
          : resetError.message
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Link Terkirim! 📧</h2>
        <p className="text-gray-600 leading-relaxed">
          Kami telah mengirim link reset password ke{" "}
          <span className="font-semibold text-gray-900">{email}</span>.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 text-left space-y-2">
          <p className="font-semibold">📋 Langkah selanjutnya:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Buka inbox email kamu</li>
            <li>Cari email dari <strong>MAMSAKA</strong> (cek folder spam)</li>
            <li>Klik link <strong>&quot;Reset Password&quot;</strong> di dalam email</li>
            <li>Buat password baru di halaman yang muncul</li>
          </ol>
        </div>
        <div className="pt-4 space-y-3">
          <Link
            href="/login"
            className="block w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Kembali ke Login
          </Link>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Kirim ulang ke email lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-500 leading-relaxed">
        Jangan khawatir! Masukkan alamat email yang terdaftar dan kami akan mengirimkan
        link untuk mereset password kamu.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Terdaftar</label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@email.com"
            required
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Send size={18} />
        )}
        Kirim Link Reset
      </button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors pt-2"
      >
        <ArrowLeft size={14} /> Kembali ke Login
      </Link>
    </form>
  );
}
