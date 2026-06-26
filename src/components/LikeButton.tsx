"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  projectId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ projectId, initialLiked, initialCount }: LikeButtonProps) {
  const supabase = createClient();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    if (liked) {
      setLiked(false);
      setCount((c) => c - 1);
      await supabase.from("likes").delete().eq("project_id", projectId).eq("user_id", user.id);
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      const { error } = await supabase.from("likes").insert({ project_id: projectId, user_id: user.id });
      if (error) {
        setLiked(false);
        setCount((c) => c - 1);
      }
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-lg border font-medium text-sm transition-all",
        liked
          ? "bg-red-50 border-red-300 text-red-600"
          : "bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500"
      )}
    >
      <Heart
        size={18}
        className={cn("transition-colors", liked && "fill-red-500 text-red-500")}
      />
      <span>{count}</span>
    </button>
  );
}
