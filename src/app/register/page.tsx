import { RegisterForm } from "./RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Daftar" };

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Daftar MAMSAKA</h1>
        <p className="text-gray-500 mt-2">Mulai bangun portofoliomu hari ini</p>
      </div>
      <RegisterForm />
    </div>
  );
}
