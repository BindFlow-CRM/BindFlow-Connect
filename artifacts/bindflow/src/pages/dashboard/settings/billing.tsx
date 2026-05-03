import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, CreditCard, Calendar, Zap, Copy, Gift, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, differenceInDays } from "date-fns";

declare global {
  interface Window {
    Paddle?: {
      Setup: (opts: { token: string }) => void;
      Checkout: { open: (opts: Record<string, unknown>) => void };
    };
  }
}

export default function BillingPage() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const paddleToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
    if (!paddleToken) return;

    const existing = document.querySelector("script[src*='paddle.com']");
    if (existing) {
      if (window.Paddle) window.Paddle.Setup({ token: paddleToken });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    document.head.appendChild(script);
    script.onload = () => {
      if (window.Paddle) window.Paddle.Setup({ token: paddleToken });
    };
  }, []);

  const openCheckout = (plan: "monthly" | "annual") => {
    if (!window.Paddle) {
      toast({ title: "Payment loading…", description: "Paddle is initializing. Try again in a moment." });
      return;
    }
    window.Paddle.Checkout.open({
      items: [{ priceId: plan === "monthly" ? "pri_monthly_bindflow" : "pri_annual_bindflow", quantity: 1 }],
      customData: { organization_id: organization?.id },
    });
  };

  const isTrialing = organization?.subscription_status === "trialing";
  const isPremium = organization?.subscription_status === "active";
  const trialDaysLeft = organization?.trial_ends_at
    ? differenceInDays(parseISO(organization.trial_ends_at), new Date())
    : null;

  const pendingCredits = organization?.pending_credits ?? 0;
  const referralLink = organization
    ? `https://bindflowcrm.com/register?ref=${organization.id}`
    : null;

  const copyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast({ title: "Link copied!", description: "Share it with fellow agents." });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#E6EDF3] mb-2">Billing</h1>
      <p className="text-[#8B949E] text-sm mb-8">Manage your subscription and earn free months</p>

      {/* Pending credits banner */}
      {pendingCredits > 0 && (
        <div className="bg-[#00E5A015] border border-[#00E5A040] rounded-xl p-4 mb-6 flex items-center gap-3">
          <Gift className="h-5 w-5 text-[#00E5A0] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#00E5A0]">
              You have {pendingCredits} free month{pendingCredits !== 1 ? "s" : ""} pending!
            </div>
            <div className="text-xs text-[#8B949E] mt-0.5">
              Upgrade to claim your referral reward — free month{pendingCredits !== 1 ? "s" : ""} will be applied to your first bill.
            </div>
          </div>
          {!isPremium && (
            <Button
              size="sm"
              onClick={() => openCheckout("monthly")}
              className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold flex-shrink-0"
            >
              Upgrade to claim
            </Button>
          )}
        </div>
      )}

      {/* Current status */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[#8B949E] mb-1">Current plan</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#E6EDF3]">{isPremium ? "Premium" : "Free Trial"}</span>
              {isTrialing && (
                <Badge className={`text-xs ${(trialDaysLeft || 0) <= 3 ? "bg-[#F8514915] text-[#F85149] border-none" : "bg-[#F0B42915] text-[#F0B429] border-none"}`}>
                  {trialDaysLeft !== null ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} left` : "Active"}
                </Badge>
              )}
              {isPremium && <Badge className="bg-[#00E5A015] text-[#00E5A0] border-none text-xs">Active</Badge>}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#00E5A015] flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-[#00E5A0]" />
          </div>
        </div>
        {isTrialing && organization?.trial_ends_at && (
          <div className="mt-3 pt-3 border-t border-[#30363D] text-xs text-[#8B949E] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Trial ends {format(parseISO(organization.trial_ends_at), "MMMM d, yyyy")}
          </div>
        )}
      </div>

      {/* Plans */}
      {!isPremium && (
        <>
          <div className="text-sm font-semibold text-[#E6EDF3] mb-4">Upgrade to continue</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Monthly */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 hover:border-[#484F58] transition-all">
              <div className="text-xs text-[#8B949E] font-medium mb-1">Monthly</div>
              <div className="text-3xl font-bold text-[#E6EDF3] mb-0.5">
                $39<span className="text-base text-[#8B949E] font-normal">/mo</span>
              </div>
              <div className="text-xs text-[#8B949E] mb-5">billed monthly</div>
              <Button
                onClick={() => openCheckout("monthly")}
                className="w-full bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-10"
                data-testid="button-monthly-checkout"
              >
                Subscribe monthly
              </Button>
            </div>

            {/* Annual */}
            <div className="bg-[#161B22] border-2 border-[#00E5A0] rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <Badge className="bg-[#00E5A015] text-[#00E5A0] border-[#00E5A030] text-xs">Best value</Badge>
              </div>
              <div className="text-xs text-[#8B949E] font-medium mb-1">Annual</div>
              <div className="text-3xl font-bold text-[#E6EDF3] mb-0.5">
                $33<span className="text-base text-[#8B949E] font-normal">/mo</span>
              </div>
              <div className="text-xs text-[#8B949E] mb-1">billed $397/year</div>
              <div className="text-xs text-[#00E5A0] font-medium mb-5">Save $71/year vs monthly</div>
              <Button
                onClick={() => openCheckout("annual")}
                className="w-full bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-10"
                data-testid="button-annual-checkout"
              >
                Subscribe annually
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Referral section */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-[#F0B429]" />
          <span className="text-sm font-semibold text-[#E6EDF3]">Earn free months — refer agents</span>
        </div>
        <p className="text-xs text-[#8B949E] mb-4 leading-relaxed">
          Share your unique link with fellow insurance agents. Every time someone signs up and subscribes,
          you earn <strong className="text-[#00E5A0]">1 free month</strong> of BindFlow Premium.
        </p>
        {referralLink && (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2.5">
              <p className="text-xs text-[#484F58] mb-0.5 font-medium">Your referral link</p>
              <p className="text-sm text-[#00E5A0] font-mono truncate">{referralLink}</p>
            </div>
            <Button
              onClick={copyReferralLink}
              variant="outline"
              size="sm"
              className={`flex-shrink-0 h-10 border-[#30363D] transition-all ${copied ? "border-[#00E5A0] text-[#00E5A0]" : "text-[#8B949E] hover:border-[#00E5A0] hover:text-[#00E5A0]"}`}
              data-testid="button-copy-referral"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        )}
        {pendingCredits > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#00E5A0]">
            <Gift className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{pendingCredits} credit{pendingCredits !== 1 ? "s" : ""} earned and waiting to be applied</span>
          </div>
        )}
      </div>

      {/* Features included */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-[#00E5A0]" />
          <span className="text-sm font-semibold text-[#E6EDF3]">Everything included</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Visual Kanban pipeline",
            "Renewal alerts (90/60/30d)",
            "WhatsApp integration",
            "Up to 3 team members",
            "Contact & policy management",
            "Email templates",
            "Referral tracker",
            "Calendar & reminders",
            "Activity timeline",
            "CSV export",
            "Dashboard analytics",
            "Cross-sell tracking",
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-2 text-sm text-[#8B949E]">
              <CheckCircle className="h-3.5 w-3.5 text-[#00E5A0] flex-shrink-0" />
              {feat}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
