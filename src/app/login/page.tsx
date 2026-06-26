import { LoginForm } from "./LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Masuk ke MAMSAKA</h1>
        <p className="text-gray-500 mt-2">Lanjutkan perjalanan portofoliomu</p>
      </div>
      <LoginForm />
    </div>
  );
}
