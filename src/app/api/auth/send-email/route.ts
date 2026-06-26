// POST /api/auth/send-email
// Kirim email via Resend API — tanpa SMTP, tanpa verifikasi domain
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const RESEND_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_KEY) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const { to, subject, html } = await request.json();
    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: "Build AI - MAMSAKA <onboarding@resend.dev>",
        to: [to],
        subject: `[MAMSAKA] ${subject}`,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
