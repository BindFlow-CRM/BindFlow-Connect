import { Router } from "express";
import { Resend } from "resend";
import { getSupabase } from "../lib/supabase.js";

const router = Router();

router.post("/reminders/send", async (req, res) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "RESEND_API_KEY not configured" });
    return;
  }

  const sb = getSupabase();
  const resend = new Resend(apiKey);
  const now = new Date();
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);

  // Fetch policies renewing within 30 days
  const { data: policies, error } = await sb
    .from("policies")
    .select("id, policy_number, insurance_company, line_of_insurance, annual_premium, renewal_date, organization_id, contacts ( full_name, email, phone )")
    .gte("renewal_date", now.toISOString().slice(0, 10))
    .lte("renewal_date", in30.toISOString().slice(0, 10))
    .eq("policy_status", "active");

  if (error) {
    req.log.error({ error }, "Failed to fetch renewal policies");
    res.status(500).json({ error: "Failed to fetch policies" });
    return;
  }

  if (!policies || policies.length === 0) {
    res.json({ sent: 0, message: "No renewals in the next 30 days" });
    return;
  }

  // Gather org owner emails via Supabase Auth Admin
  const orgIds = [...new Set(policies.map((p) => p.organization_id).filter(Boolean))] as string[];

  const { data: members } = await sb
    .from("organization_members")
    .select("organization_id, user_id")
    .in("organization_id", orgIds)
    .eq("role", "owner");

  // Build orgId → { userId, agentEmail } map
  const ownerMap: Record<string, { userId: string; agentEmail: string; agentName: string }> = {};

  for (const member of members ?? []) {
    if (!member.organization_id || !member.user_id) continue;
    const { data: authData } = await sb.auth.admin.getUserById(member.user_id);
    const agentEmail = authData?.user?.email;
    if (!agentEmail) continue;

    const { data: profile } = await sb
      .from("profiles")
      .select("full_name")
      .eq("id", member.user_id)
      .single();

    ownerMap[member.organization_id] = {
      userId: member.user_id,
      agentEmail,
      agentName: (profile?.full_name as string | null) ?? "Agent",
    };
  }

  let sent = 0;
  const errors: string[] = [];

  for (const policy of policies) {
    const contact = policy.contacts as { full_name?: string; email?: string; phone?: string } | null;
    const orgId = policy.organization_id;
    if (!orgId) continue;

    const owner = ownerMap[orgId];
    if (!owner?.agentEmail) continue;

    const daysLeft = policy.renewal_date
      ? Math.ceil((new Date(policy.renewal_date).getTime() - now.getTime()) / 864e5)
      : 0;

    const renewalDateStr = policy.renewal_date
      ? new Date(policy.renewal_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "soon";

    try {
      await resend.emails.send({
        from: "BindFlow <alerts@bindflowcrm.com>",
        to: owner.agentEmail,
        subject: `⚠️ Urgent: ${contact?.full_name ?? "A client"}'s policy renews in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
            <div style="background:#0D1117;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#00E5A0;">BindFlow</span>
              <span style="font-size:13px;color:#8B949E;margin-left:8px;">Renewal Alert</span>
            </div>
            <div style="border:1px solid #d0d7de;border-top:none;padding:28px;border-radius:0 0 12px 12px;">
              <div style="background:#fff5f5;border:1px solid #f85149;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
                <strong style="color:#f85149;">⚠️ ${daysLeft} day${daysLeft !== 1 ? "s" : ""} until renewal</strong>
              </div>
              <h2 style="margin:0 0 4px;font-size:18px;">Hi ${owner.agentName},</h2>
              <p style="color:#57606a;margin:8px 0 20px;">
                One of your client's policies is renewing soon. Reach out now to retain the business.
              </p>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr style="border-bottom:1px solid #d0d7de;">
                  <td style="padding:10px 0;color:#57606a;width:140px;">Client</td>
                  <td style="padding:10px 0;font-weight:600;">${contact?.full_name ?? "—"}</td>
                </tr>
                <tr style="border-bottom:1px solid #d0d7de;">
                  <td style="padding:10px 0;color:#57606a;">Carrier</td>
                  <td style="padding:10px 0;">${policy.insurance_company ?? "—"}</td>
                </tr>
                <tr style="border-bottom:1px solid #d0d7de;">
                  <td style="padding:10px 0;color:#57606a;">Line</td>
                  <td style="padding:10px 0;text-transform:capitalize;">${policy.line_of_insurance ?? "—"}</td>
                </tr>
                <tr style="border-bottom:1px solid #d0d7de;">
                  <td style="padding:10px 0;color:#57606a;">Policy #</td>
                  <td style="padding:10px 0;">${policy.policy_number ?? "—"}</td>
                </tr>
                <tr style="border-bottom:1px solid #d0d7de;">
                  <td style="padding:10px 0;color:#57606a;">Premium</td>
                  <td style="padding:10px 0;">$${policy.annual_premium?.toLocaleString() ?? "—"}/yr</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#57606a;">Renewal Date</td>
                  <td style="padding:10px 0;font-weight:600;color:#f85149;">${renewalDateStr}</td>
                </tr>
              </table>
              <div style="margin-top:24px;text-align:center;">
                <a href="https://bindflowcrm.com/contacts"
                   style="display:inline-block;background:#00E5A0;color:#0D1117;font-weight:700;
                          padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
                  Open BindFlow →
                </a>
              </div>
              <p style="font-size:11px;color:#8B949E;margin-top:24px;text-align:center;">
                Sent by BindFlow ·
                <a href="https://bindflowcrm.com" style="color:#8B949E;">bindflowcrm.com</a>
              </p>
            </div>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      req.log.error({ err, policyId: policy.id }, "Failed to send renewal email");
      errors.push(String(policy.id));
    }
  }

  res.json({ sent, total: policies.length, errors });
});

export default router;
