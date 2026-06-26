"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Link
        href={buildUrl(currentPage - 1)}
        className={`p-2 rounded-lg border ${
          currentPage <= 1
            ? "border-gray-100 text-gray-300 pointer-events-none"
            : "border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <ChevronLeft size={18} />
      </Link>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={buildUrl(page)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            page === currentPage
              ? "bg-primary-600 text-white"
              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={buildUrl(currentPage + 1)}
        className={`p-2 rounded-lg border ${
          currentPage >= totalPages
            ? "border-gray-100 text-gray-300 pointer-events-none"
            : "border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}
