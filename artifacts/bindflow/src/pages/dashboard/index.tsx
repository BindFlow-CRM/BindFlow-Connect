import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  AlertTriangle,
  Bell,
  Check,
  Copy,
  DollarSign,
  Mail,
  MessageCircle,
  Plus,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

type RenewalRow = {
  id: string;
  renewal_date: string | null;
  insurance_company: string | null;
  line_of_insurance: string | null;
  contacts: { full_name: string | null; phone: string | null } | null;
};

export default function DashboardHome() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const orgId = organization?.id;

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ["dashboard-policies", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("id, annual_premium, renewal_date, insurance_company, line_of_insurance, contacts(full_name, phone)")
        .eq("organization_id", orgId!)
        .order("renewal_date", { ascending: true });
      if (error) throw error;
      return data as RenewalRow[];
    },
    enabled: !!orgId,
  });

  const { data: contacts } = useQuery({
    queryKey: ["dashboard-contacts", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("id")
        .eq("organization_id", orgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const { data: deals } = useQuery<Array<{ id: string; value: number | null }>>({
    queryKey: ["dashboard-deals", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("id, value")
        .eq("organization_id", orgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const now = new Date();
  const upcomingRenewals = useMemo(() => {
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);
    return (policies ?? []).filter((p) => {
      if (!p.renewal_date) return false;
      const d = parseISO(p.renewal_date);
      return d >= now && d <= in30;
    });
  }, [policies, now]);

  const activePolicies = policies?.length ?? 0;
  const pipelineValue = (deals ?? []).reduce((sum, deal) => sum + (deal.value ?? 0), 0);
  const pendingFreeMonths = organization?.pending_credits ?? 0;
  const referralCode = organization?.referral_code ?? organization?.id ?? "";
  const inviteLink = `https://bindflowcrm.com/register?ref=${referralCode}`;

  const copyInviteLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    toast({ title: "Invite link copied" });
  };

  const kpis: { label: string; value: string | number; icon: typeof ShieldCheck; color: string }[] = [
    { label: "Active Policies", value: activePolicies, icon: ShieldCheck, color: "#00E5A0" },
    { label: "Renewals Next 30 Days", value: upcomingRenewals.length, icon: AlertTriangle, color: "#F85149" },
    { label: "Pipeline Value", value: `$${pipelineValue.toLocaleString()}`, icon: Wallet, color: "#00B4D8" },
    { label: "Pending Free Months", value: pendingFreeMonths, icon: DollarSign, color: "#F0B429" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#E6EDF3]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#8B949E]">Complete control of your agency business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-[#30363D] bg-[#161B22]/80 backdrop-blur-xl text-[#E6EDF3] shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#8B949E]">{kpi.label}</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {policiesLoading ? (
                  <Skeleton className="h-8 w-24 bg-[#21262D]" />
                ) : (
                  <div className="text-3xl font-bold">{kpi.value}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-[#30363D] bg-[#161B22]/80 backdrop-blur-xl text-[#E6EDF3] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Renewals</CardTitle>
              <p className="mt-1 text-sm text-[#8B949E]">Renewals that need your attention in the next 30 days.</p>
            </div>
            <Badge className="bg-[#00E5A015] text-[#00E5A0] border-[#00E5A030]">{upcomingRenewals.length} due</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {policiesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full bg-[#21262D]" />
                <Skeleton className="h-14 w-full bg-[#21262D]" />
                <Skeleton className="h-14 w-full bg-[#21262D]" />
              </div>
            ) : upcomingRenewals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#30363D] p-10 text-center text-sm text-[#8B949E]">
                No renewals due in the next 30 days.
              </div>
            ) : (
              upcomingRenewals.slice(0, 8).map((renewal) => {
                const daysLeft = renewal.renewal_date ? Math.ceil((parseISO(renewal.renewal_date).getTime() - now.getTime()) / 86400000) : 0;
                return (
                  <div key={renewal.id} className="flex items-center justify-between rounded-xl border border-[#30363D] bg-[#0D1117] px-4 py-3">
                    <div className="min-w-0">
                      <div className="font-medium text-[#E6EDF3] truncate">{renewal.contacts?.full_name ?? "Unknown client"}</div>
                      <div className="text-xs text-[#8B949E]">{renewal.line_of_insurance ?? "Policy"} · {renewal.insurance_company ?? "Carrier"}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-[#E6EDF3]">{renewal.renewal_date ? format(parseISO(renewal.renewal_date), "MMM d") : "—"}</div>
                        <div className="text-xs text-[#8B949E]">{daysLeft} days</div>
                      </div>
                      <a
                        href={`https://wa.me/${(renewal.contacts?.phone ?? "").replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#25D36630] bg-[#25D36615] text-[#25D366] transition-colors hover:bg-[#25D36625]"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-[#30363D] bg-[#161B22]/80 backdrop-blur-xl text-[#E6EDF3] shadow-none">
          <CardHeader>
            <CardTitle>Quick Actions & Referrals</CardTitle>
            <p className="text-sm text-[#8B949E]">Move fast and keep growth flowing.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/app/contacts">
              <Button className="w-full justify-start gap-2 bg-[#00E5A0] text-[#0D1117] hover:bg-[#00C98A]">
                <Plus className="h-4 w-4" /> New Quote
              </Button>
            </Link>
            <Link href="/app/contacts">
              <Button variant="outline" className="w-full justify-start gap-2 border-[#30363D] text-[#E6EDF3] hover:border-[#00E5A0] hover:text-[#00E5A0]">
                <Users className="h-4 w-4" /> Add Contact
              </Button>
            </Link>

            <div className="rounded-2xl border border-[#30363D] bg-[#0D1117] p-4">
              <div className="mb-2 text-sm font-semibold text-[#E6EDF3]">Share & Earn</div>
              <p className="text-xs leading-5 text-[#8B949E]">Copy your invite link and earn free months when other agents join and subscribe.</p>
              <Button
                onClick={copyInviteLink}
                variant="outline"
                className="mt-4 w-full border-[#30363D] text-[#E6EDF3] hover:border-[#00E5A0] hover:text-[#00E5A0]"
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Invite Link
              </Button>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#8B949E]">
                <Check className="h-3.5 w-3.5 text-[#00E5A0]" />
                {pendingFreeMonths} pending free months
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
