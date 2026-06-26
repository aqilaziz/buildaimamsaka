"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Send, ArrowLeft, CheckCircle } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const origin = window.location.origin;

      // 1. Minta Supabase generate reset token
      const supabaseRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/recover`,
        {
          method: "POST",
          headers: {
            "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!supabaseRes.ok) {
        const err = await supabaseRes.json();
        throw new Error(err.msg || "Gagal memproses reset");
      }

      // Supabase akan mengirim email secara otomatis (tapi mungkin gagal tanpa SMTP)
      // Kita kirim juga email via Resend sebagai backup/primary
      const resetLink = `${origin}/auth/callback?type=recovery`;
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f9fafb">
          <div style="text-align:center;padding:32px 24px;background:#1e40af;border-radius:12px 12px 0 0">
            <h1 style="color:#f59e0b;margin:0;font-size:24px">Build AI - MAMSAKA</h1>
            <p style="color:#93c5fd;margin:8px 0 0">MA Muhammadiyah 1 Paciran</p>
          </div>
          <div style="background:white;padding:32px 24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <h2 style="color:#1f2937;margin:0 0 16px">Reset Password</h2>
            <p style="color:#6b7280;line-height:1.6;margin-bottom:16px">
              Kami menerima permintaan reset password untuk akun <strong>${email}</strong>.
            </p>
            <p style="color:#6b7280;line-height:1.6;margin-bottom:24px">
              Cek email dari <strong>Supabase</strong> di inbox kamu untuk link reset password.
              Jika tidak ada, coba lagi atau hubungi admin.
            </p>
            <div style="text-align:center;padding:16px;background:#fef3c7;border-radius:8px;border:1px solid #fcd34d">
              <p style="color:#92400e;font-size:13px;margin:0">
                📧 <strong>Penting:</strong> Periksa folder <u>Spam</u> atau <u>Promotions</u> jika email tidak muncul di inbox utama.
              </p>
            </div>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">
              Tidak meminta reset? Abaikan email ini.
            </p>
          </div>
        </div>`;

      // Kirim notifikasi via Resend (Next.js API)
      await fetch("/api/auth/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Reset Password — Periksa Inbox Kamu",
          html: emailHtml,
        }),
      });

      setSent(true);
    } catch (err: any) {
      setError(err.message || "Gagal mengirim email reset");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Cek Email Kamu! 📧</h2>
        <p className="text-gray-600 leading-relaxed">
          Kami telah mengirim link reset password ke{" "}
          <span className="font-semibold text-gray-900">{email}</span>.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 text-left space-y-2">
          <p className="font-semibold">📋 Langkah selanjutnya:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Buka inbox email kamu</li>
            <li>Cari email dari <strong>MAMSAKA</strong> atau <strong>Supabase</strong> (cek folder spam)</li>
            <li>Klik link <strong>Reset Password</strong> di dalam email</li>
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
        Masukkan alamat email yang terdaftar. Kami akan mengirimkan link untuk mereset password kamu.
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
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
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
