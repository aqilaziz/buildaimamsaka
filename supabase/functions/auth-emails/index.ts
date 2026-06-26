// Supabase Edge Function: auth-emails
// Handles auth email sending via Resend API
// Called by Supabase Auth Hook (send email)

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, to, subject, type, redirect_url, html: bodyHtml } = body;

    const recipient = to || email;
    if (!recipient) throw new Error("Missing recipient");

    if (!RESEND_KEY) throw new Error("RESEND_API_KEY not configured");

    const html = bodyHtml || `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f9fafb">
        <div style="text-align:center;padding:32px 24px;background:#1e40af;border-radius:12px 12px 0 0">
          <h1 style="color:#f59e0b;margin:0;font-size:24px">Build AI - MAMSAKA</h1>
          <p style="color:#93c5fd;margin:8px 0 0">MA Muhammadiyah 1 Paciran</p>
        </div>
        <div style="background:white;padding:32px 24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
          <h2 style="color:#1f2937;margin:0 0 16px">${subject || "Notifikasi MAMSAKA"}</h2>
          <p style="color:#6b7280;line-height:1.6">
            ${type === "recovery"
              ? "Kamu meminta reset password. Klik tombol di bawah untuk membuat password baru:"
              : "Klik tombol di bawah untuk melanjutkan:"}
          </p>
          ${redirect_url ? `<div style="text-align:center;margin:24px 0"><a href="${redirect_url}" style="display:inline-block;padding:12px 32px;background:#1d4ed8;color:white;text-decoration:none;border-radius:8px;font-weight:bold">${type === "recovery" ? "Reset Password" : "Konfirmasi"}</a></div>` : ""}
          <p style="color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} Build AI - MAMSAKA. MA Muhammadiyah 1 Paciran.</p>
        </div>
      </div>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: "Build AI - MAMSAKA <onboarding@resend.dev>",
        to: [recipient],
        subject: `[MAMSAKA] ${subject || "Notifikasi"}`,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Resend: ${JSON.stringify(data)}`);

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
