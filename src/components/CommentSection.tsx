"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils";
import { Send, Trash2, Edit3 } from "lucide-react";
import type { CommentWithAuthor } from "@/lib/types";

interface CommentSectionProps {
  projectId: string;
  initialComments: CommentWithAuthor[];
}

export function CommentSection({ projectId, initialComments }: CommentSectionProps) {
  const supabase = createClient();
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ project_id: projectId, user_id: user.id, content: content.trim() })
      .select("*, author:profiles!comments_user_id_fkey(username, full_name, avatar_url)")
      .single();

    if (!error && data) {
      setComments((prev) => [
        ...prev,
        { ...data, replies: [] } as CommentWithAuthor,
      ]);
      setContent("");
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    await supabase.from("comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">
        Komentar ({comments.length})
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={userId ? "Tulis komentar..." : "Masuk untuk berkomentar"}
          disabled={!userId}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting || !userId}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
        </button>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-gray-400 text-center py-8">Belum ada komentar. Jadilah yang pertama!</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Link href={`/p/${comment.author?.username}`}>
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
                {comment.author?.full_name?.[0] || comment.author?.username?.[0]?.toUpperCase() || "?"}
              </div>
            </Link>
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg px-4 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/p/${comment.author?.username}`}
                    className="font-semibold text-sm text-gray-900 hover:text-primary-600"
                  >
                    {comment.author?.full_name || comment.author?.username}
                  </Link>
                  <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
              {userId === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-gray-400 hover:text-red-500 mt-1 ml-1 transition-colors"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
