"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  bucket?: string;
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  currentUrl?: string;
  label?: string;
}

export function ImageUpload({
  bucket = "project-assets",
  onUpload,
  onError,
  currentUrl,
  label = "Upload Gambar",
}: ImageUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        onError?.("Ukuran file maksimal 2MB");
        return;
      }

      // Validate type
      const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowed.includes(file.type)) {
        onError?.("Format file harus JPG, PNG, GIF, atau WebP");
        return;
      }

      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onError?.("Harus login untuk upload");
        setUploading(false);
        return;
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
        upsert: true,
      });

      if (error) {
        onError?.(error.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

      setPreview(urlData.publicUrl);
      onUpload(urlData.publicUrl);
      setUploading(false);
    },
    [bucket, onUpload, onError, supabase]
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {preview ? (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onUpload("");
              }}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors">
            {uploading ? (
              <Loader2 size={32} className="text-primary-500 animate-spin" />
            ) : (
              <Upload size={32} className="text-gray-400" />
            )}
            <span className="text-sm text-gray-500">
              {uploading ? "Mengupload..." : "Klik untuk upload (max 2MB, JPG/PNG/GIF/WebP)"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFile}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
