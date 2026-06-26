import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/cron/keepalive
// Dipanggil oleh Vercel Cron Jobs / GitHub Actions
// untuk mencegah Supabase Free Tier auto-pause
export async function GET(request: Request) {
  // Validasi cron secret
  const authHeader = request.headers.get("authorization");
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Ping database dengan query ringan
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Supabase keepalive ping successful",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
