import { ForgotPasswordForm } from "./ForgotPasswordForm";
import Image from "next/image";
import { SCHOOL_SHORT } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lupa Password" };

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <Image src="/logo.png" alt={SCHOOL_SHORT} width={56} height={56} className="rounded-xl mx-auto mb-4 shadow-md" />
        <h1 className="text-2xl font-bold text-gray-900">Lupa Password</h1>
        <p className="text-gray-500 mt-1 text-sm">Masukkan email, kami kirim link reset</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
