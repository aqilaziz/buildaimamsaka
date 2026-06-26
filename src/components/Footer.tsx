import { APP_NAME } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
        <p className="font-medium text-gray-700 mb-1">{APP_NAME}</p>
        <p>Platform portofolio siswa — pamerkan karya, dapatkan apresiasi.</p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} {APP_NAME}. Dibangun dengan ❤️ untuk pendidikan.
        </p>
      </div>
    </footer>
  );
}
