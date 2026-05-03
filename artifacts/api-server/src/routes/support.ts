import { Router } from "express";
import { Resend } from "resend";
import { getSupabase } from "../lib/supabase.js";
import { logger } from "../lib/logger.js";

const router = Router();

void logger;

router.post("/api/support", async (req, res) => {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@bindflowcrm.com";

  const { name, email, phone, issue_type, subject, description } = req.body as {
    name: string;
    email: string;
    phone?: string;
    issue_type: string;
    subject: string;
    description: string;
  };

  if (!name || !email || !issue_type || !subject || !description) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const sb = getSupabase();

  const { data: ticket, error: dbError } = await sb
    .from("support_tickets")
    .insert({
      name,
      email,
      phone: phone ?? null,
      issue_type,
      subject,
      description,
      status: "open",
    })
    .select()
    .single();

  if (dbError) {
    req.log.error({ dbError }, "Failed to insert support ticket");
    // If table doesn't exist yet, still try to send the email
    if (dbError.code === "42P01") {
      req.log.warn("support_tickets table not found — email only mode");
    } else {
      res.status(500).json({ error: "Failed to save support ticket" });
      return;
    }
  }

  if (apiKey) {
    const resend = new Resend(apiKey);
    try {
      await resend.emails.send({
        from: "BindFlow Support <support@bindflowcrm.com>",
        to: adminEmail,
        subject: `[Support] ${issue_type} — ${subject}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
            <div style="background:#0D1117;padding:24px;border-radius:12px 12px 0 0;">
              <span style="font-size:20px;font-weight:700;color:#00E5A0;">BindFlow</span>
              <span style="font-size:13px;color:#8B949E;margin-left:8px;">Support Ticket</span>
            </div>
            <div style="border:1px solid #d0d7de;border-top:none;padding:28px;border-radius:0 0 12px 12px;">
              <h2 style="margin:0 0 16px;font-size:17px;">New support request received</h2>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr style="border-bottom:1px solid #d0d7de;">
                  <td style="padding:10px 0;color:#57606a;width:130px;">Name</td>
                  <td style="padding:10px 0;font-weight:600;">${name}</td>
                </tr>
                <tr style="border-bottom:1px solid #d0d7de;">
                  <td style="padding:10px 0;color:#57606a;">Email</td>
                  <td style="padding:10px 0;"><a href="mailto:${email}" style="color:#00E5A0;">${email}</a></td>
                </tr>
                <tr style="border-bottom:1px solid #d0d7de;">
                  <td style="padding:10px 0;color:#57606a;">Phone</td>
                  <td style="padding:10px 0;">${phone ?? "—"}</td>
                </tr>
                <tr style="border-bottom:1px solid #d0d7de;">
                  <td style="padding:10px 0;color:#57606a;">Issue type</td>
                  <td style="padding:10px 0;">${issue_type}</td>
                </tr>
                <tr style="border-bottom:1px solid #d0d7de;">
                  <td style="padding:10px 0;color:#57606a;">Subject</td>
                  <td style="padding:10px 0;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#57606a;vertical-align:top;">Description</td>
                  <td style="padding:10px 0;white-space:pre-wrap;">${description}</td>
                </tr>
              </table>
              <p style="font-size:11px;color:#8B949E;margin-top:24px;">
                Ticket ID: ${ticket?.id ?? "—"} · Sent by BindFlow Support System
              </p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      req.log.error({ err }, "Failed to send support email");
    }
  }

  res.json({ ok: true, id: ticket?.id });
});

router.get("/api/support", async (req, res) => {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    req.log.error({ error }, "Failed to fetch support tickets");
    // Return empty array if table doesn't exist yet
    if (error.code === "42P01") {
      res.json([]);
      return;
    }
    res.status(500).json({ error: "Failed to fetch tickets" });
    return;
  }

  res.json(data ?? []);
});

router.patch("/api/support/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: string };

  const sb = getSupabase();
  const { error } = await sb
    .from("support_tickets")
    .update({ status })
    .eq("id", id);

  if (error) {
    req.log.error({ error }, "Failed to update support ticket");
    res.status(500).json({ error: "Failed to update ticket" });
    return;
  }

  res.json({ ok: true });
});

export default router;
