import { Router } from "express";
import crypto from "crypto";
import { getSupabase } from "../lib/supabase.js";
import { logger } from "../lib/logger.js";

const router = Router();

function verifyPaddleSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  try {
    const parts = Object.fromEntries(
      signatureHeader.split(";").map((p) => p.split("=", 2) as [string, string]),
    );
    const ts = parts["ts"];
    const h1 = parts["h1"];
    if (!ts || !h1) return false;
    const signed = `${ts}:${rawBody}`;
    const expected = crypto.createHmac("sha256", secret).update(signed).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(h1));
  } catch {
    return false;
  }
}

router.post("/webhooks/paddle", async (req, res) => {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    req.log.error("PADDLE_WEBHOOK_SECRET not configured");
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  const signatureHeader = req.headers["paddle-signature"] as string | undefined;
  if (!signatureHeader) {
    res.status(400).json({ error: "Missing paddle-signature header" });
    return;
  }

  const rawBody = JSON.stringify(req.body);
  if (!verifyPaddleSignature(rawBody, signatureHeader, secret)) {
    req.log.warn("Paddle webhook signature verification failed");
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const event = req.body as {
    event_type: string;
    data?: { custom_data?: { organization_id?: string }; customer?: { id?: string } };
  };

  req.log.info({ event_type: event.event_type }, "Paddle webhook received");

  if (event.event_type === "transaction.completed") {
    const orgId = event.data?.custom_data?.organization_id;
    if (!orgId) {
      req.log.warn("transaction.completed missing organization_id in custom_data");
      res.json({ received: true });
      return;
    }

    const sb = getSupabase();

    // Fetch the org that just subscribed
    const { data: org, error: orgErr } = await sb
      .from("organizations")
      .select("id, referred_by, plan, paddle_customer_id")
      .eq("id", orgId)
      .single();

    if (orgErr || !org) {
      req.log.error({ orgErr }, "Could not find organization for Paddle event");
      res.json({ received: true });
      return;
    }

    // Mark organization as active
    await sb.from("organizations")
      .update({ plan: "active", subscription_status: "active" })
      .eq("id", orgId);

    // Credit the referrer if this org was referred
    const referrerId = (org as { referred_by?: string }).referred_by;
    if (referrerId) {
      const { data: referrer } = await sb
        .from("organizations")
        .select("id, plan, pending_credits, paddle_customer_id")
        .eq("id", referrerId)
        .single();

      if (referrer) {
        const currentCredits = (referrer as { pending_credits?: number }).pending_credits ?? 0;

        if ((referrer as { plan?: string }).plan === "active") {
          // Referrer already on paid plan — issue a Paddle Customer Balance credit ($39)
          const paddleCustomerId = (referrer as { paddle_customer_id?: string }).paddle_customer_id;
          const paddleApiKey = process.env.PADDLE_API_KEY;

          if (paddleCustomerId && paddleApiKey) {
            try {
              const adjustmentRes = await fetch("https://api.paddle.com/adjustments", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${paddleApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  action: "credit",
                  reason: "Referral reward — new subscriber joined via your link",
                  customer_id: paddleCustomerId,
                  items: [{ amount: "3900", type: "partial" }],
                }),
              });
              if (!adjustmentRes.ok) {
                const errBody = await adjustmentRes.text();
                req.log.error({ errBody }, "Paddle adjustment API failed");
              } else {
                req.log.info({ referrerId, paddleCustomerId }, "Paddle credit issued to referrer");
              }
            } catch (err) {
              req.log.error({ err }, "Failed to create Paddle credit adjustment");
            }
          }
        } else {
          // Referrer not yet active — bank a free month credit
          await sb.from("organizations")
            .update({ pending_credits: currentCredits + 1 })
            .eq("id", referrerId);
          req.log.info({ referrerId, newCredits: currentCredits + 1 }, "Pending credit added to referrer");
        }
      }
    }
  }

  res.json({ received: true });
});

// Suppress unused import warning — logger is available for future use
void logger;

export default router;
