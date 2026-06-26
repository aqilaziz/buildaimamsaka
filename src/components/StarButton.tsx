"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface StarButtonProps {
  projectId: string;
  initialStarred: boolean;
  initialCount: number;
}

export function StarButton({ projectId, initialStarred, initialCount }: StarButtonProps) {
  const supabase = createClient();
  const router = useRouter();
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    // Optimistic update
    if (starred) {
      setStarred(false);
      setCount((c) => c - 1);
      await supabase.from("stars").delete().eq("project_id", projectId).eq("user_id", user.id);
    } else {
      setStarred(true);
      setCount((c) => c + 1);
      const { error } = await supabase.from("stars").insert({ project_id: projectId, user_id: user.id });
      if (error) {
        setStarred(false);
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
        starred
          ? "bg-amber-50 border-amber-300 text-amber-700"
          : "bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600"
      )}
    >
      <Star
        size={18}
        className={cn("transition-colors", starred && "fill-amber-500 text-amber-500")}
      />
      <span>{count}</span>
    </button>
  );
}
