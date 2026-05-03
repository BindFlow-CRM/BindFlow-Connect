import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  TrendingUp, Bell, DollarSign, Percent, MessageCircle,
  RefreshCw, FileText, User, Users, Cake,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  format, parseISO, isWithinInterval, addDays,
  startOfMonth, endOfMonth, subMonths, getMonth, getDate,
} from "date-fns";

export default function DashboardHome() {
  const { organization } = useAuth();
  const orgId = organization?.id;

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ["policies", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("*, contacts(full_name, phone)")
        .eq("organization_id", orgId!)
        .order("renewal_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ["contacts-summary", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("id, full_name, date_of_birth, phone")
        .eq("organization_id", orgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const { data: deals } = useQuery({
    queryKey: ["deals-summary", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*, pipeline_stages(name, color)")
        .eq("organization_id", orgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const { data: activities } = useQuery({
    queryKey: ["activities-recent", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*, contacts(full_name)")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const now = new Date();
  const in30 = addDays(now, 30);
  const in7 = addDays(now, 7);

  const renewalsNext30 = policies?.filter((p) => {
    if (!p.renewal_date) return false;
    const d = parseISO(p.renewal_date);
    return isWithinInterval(d, { start: now, end: in30 });
  }) ?? [];

  const renewalsThisMonth = policies?.filter((p) => {
    if (!p.renewal_date) return false;
    const d = parseISO(p.renewal_date);
    return isWithinInterval(d, { start: startOfMonth(now), end: endOfMonth(now) });
  }) ?? [];

  const totalPremium = policies?.reduce((sum, p) => sum + (p.annual_premium || 0), 0) ?? 0;

  const wonDeals = deals?.filter((d) => d.pipeline_stages?.name === "Closed Won") ?? [];
  const conversionRate = deals?.length ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  // Birthday logic — match by month+day within next 7 days (year-agnostic)
  const upcomingBirthdays = (contacts ?? []).filter((c) => {
    if (!c.date_of_birth) return false;
    const dob = parseISO(c.date_of_birth);
    const thisYear = new Date(now.getFullYear(), getMonth(dob), getDate(dob));
    const nextYear = new Date(now.getFullYear() + 1, getMonth(dob), getDate(dob));
    const candidate = thisYear >= now ? thisYear : nextYear;
    return isWithinInterval(candidate, { start: now, end: in7 });
  });

  // Bar chart: renewals by month (last 6)
  const renewalsByMonth = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(now, 5 - i);
    const count = policies?.filter((p) => {
      if (!p.renewal_date) return false;
      const d = parseISO(p.renewal_date);
      return isWithinInterval(d, { start: startOfMonth(month), end: endOfMonth(month) });
    }).length ?? 0;
    return { month: format(month, "MMM"), count };
  });

  // Pipeline donut
  const pipelineByStage: Record<string, { count: number; color: string }> = {};
  deals?.forEach((d) => {
    const name = d.pipeline_stages?.name || "Unknown";
    const color = d.pipeline_stages?.color || "#8B949E";
    if (!pipelineByStage[name]) pipelineByStage[name] = { count: 0, color };
    pipelineByStage[name].count++;
  });
  const pipelineData = Object.entries(pipelineByStage).map(([name, { count, color }]) => ({ name, count, color }));

  const activityIcon = (type: string) => {
    switch (type) {
      case "call": return <MessageCircle className="h-3.5 w-3.5 text-[#00B4D8]" />;
      case "note": return <FileText className="h-3.5 w-3.5 text-[#8B949E]" />;
      case "stage_change": return <RefreshCw className="h-3.5 w-3.5 text-[#F0B429]" />;
      default: return <User className="h-3.5 w-3.5 text-[#00E5A0]" />;
    }
  };

  const kpis = [
    {
      label: "Total Book Value",
      value: policiesLoading ? "—" : `$${totalPremium.toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4" />,
      color: "#00E5A0",
      sub: `${policies?.length ?? 0} active policies`,
      loading: policiesLoading,
    },
    {
      label: "Total Contacts",
      value: contactsLoading ? "—" : (contacts?.length ?? 0),
      icon: <Users className="h-4 w-4" />,
      color: "#00B4D8",
      sub: `${renewalsThisMonth.length} renewing this month`,
      loading: contactsLoading,
    },
    {
      label: "Renewals Next 30 Days",
      value: policiesLoading ? "—" : renewalsNext30.length,
      icon: <TrendingUp className="h-4 w-4" />,
      color: "#F0B429",
      sub: `$${renewalsNext30.reduce((a, p) => a + (p.annual_premium || 0), 0).toLocaleString()} in premiums`,
      loading: policiesLoading,
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: <Percent className="h-4 w-4" />,
      color: "#F85149",
      sub: `${wonDeals.length} of ${deals?.length ?? 0} deals won`,
      loading: false,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#E6EDF3]">Dashboard</h1>
        <p className="text-[#8B949E] text-sm mt-1">{format(now, "MMMM d, yyyy")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#8B949E] font-medium">{kpi.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                {kpi.icon}
              </div>
            </div>
            {kpi.loading ? (
              <Skeleton className="h-8 w-16 bg-[#21262D] mb-1" />
            ) : (
              <div className="text-2xl font-bold text-[#E6EDF3] mb-1">{kpi.value}</div>
            )}
            <div className="text-xs text-[#484F58]">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Alert Row: Renewals + Birthdays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Renewal Alerts */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl">
          <div className="px-5 py-4 border-b border-[#30363D] flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#F85149]" />
            <span className="font-semibold text-[#E6EDF3] text-sm">Renewals in Next 30 Days</span>
            <Badge className="bg-[#F8514915] text-[#F85149] border-[#F8514930] text-xs ml-auto">
              {renewalsNext30.length}
            </Badge>
          </div>
          <div className="divide-y divide-[#30363D]">
            {renewalsNext30.length === 0 && (
              <div className="px-5 py-8 text-center text-[#484F58] text-sm">No renewals in the next 30 days</div>
            )}
            {renewalsNext30.slice(0, 5).map((p) => {
              const daysLeft = Math.ceil((parseISO(p.renewal_date!).getTime() - now.getTime()) / 864e5);
              const urgency = daysLeft <= 7 ? "#F85149" : daysLeft <= 14 ? "#F0B429" : "#00B4D8";
              return (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#21262D] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: urgency }} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#E6EDF3] truncate">{(p.contacts as { full_name: string })?.full_name}</div>
                      <div className="text-xs text-[#8B949E]">{p.line_of_insurance} · {p.insurance_company}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-semibold" style={{ color: urgency }}>{daysLeft}d</div>
                      <div className="text-xs text-[#484F58]">{format(parseISO(p.renewal_date!), "MMM d")}</div>
                    </div>
                    {(p.contacts as { phone?: string })?.phone && (
                      <a
                        href={`https://wa.me/1${(p.contacts as { phone: string }).phone.replace(/\D/g, "")}?text=Hi! I wanted to reach out about your upcoming policy renewal.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg bg-[#25D36615] flex items-center justify-center text-[#25D366] hover:bg-[#25D36625] transition-colors"
                        data-testid={`whatsapp-renewal-${p.id}`}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Birthday Alerts */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl">
          <div className="px-5 py-4 border-b border-[#30363D] flex items-center gap-2">
            <Cake className="h-4 w-4 text-[#F0B429]" />
            <span className="font-semibold text-[#E6EDF3] text-sm">Upcoming Birthdays</span>
            <Badge className="bg-[#F0B42915] text-[#F0B429] border-[#F0B42930] text-xs ml-auto">
              {upcomingBirthdays.length}
            </Badge>
          </div>
          <div className="divide-y divide-[#30363D]">
            {upcomingBirthdays.length === 0 && (
              <div className="px-5 py-8 text-center text-[#484F58] text-sm">
                No birthdays in the next 7 days
                <p className="text-xs mt-1">Add a date of birth on contact profiles to track birthdays</p>
              </div>
            )}
            {upcomingBirthdays.map((c) => {
              const dob = parseISO(c.date_of_birth!);
              const thisYearBday = new Date(now.getFullYear(), getMonth(dob), getDate(dob));
              const bday = thisYearBday >= now ? thisYearBday : new Date(now.getFullYear() + 1, getMonth(dob), getDate(dob));
              const daysUntil = Math.ceil((bday.getTime() - now.getTime()) / 864e5);
              const initials = c.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#21262D] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#F0B42915] border border-[#F0B42930] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#F0B429]">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#E6EDF3] truncate">{c.full_name}</div>
                      <div className="text-xs text-[#8B949E]">{format(dob, "MMMM d")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-[#F0B429]">
                        {daysUntil === 0 ? "🎂 Today!" : `${daysUntil}d`}
                      </div>
                    </div>
                    {c.phone && (
                      <a
                        href={`https://wa.me/1${c.phone.replace(/\D/g, "")}?text=Happy Birthday ${c.full_name}! 🎉 Wishing you a wonderful day!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg bg-[#25D36615] flex items-center justify-center text-[#25D366] hover:bg-[#25D36625] transition-colors"
                        data-testid={`whatsapp-birthday-${c.id}`}
                        title="Send birthday WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Renewals by Month */}
        <div className="lg:col-span-2 bg-[#161B22] border border-[#30363D] rounded-xl p-5">
          <div className="text-sm font-semibold text-[#E6EDF3] mb-4">Renewals by Month</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={renewalsByMonth} barSize={28}>
              <XAxis dataKey="month" tick={{ fill: "#8B949E", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8B949E", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1C2128", border: "1px solid #30363D", borderRadius: "8px", color: "#E6EDF3" }} />
              <Bar dataKey="count" fill="#00E5A0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Donut */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
          <div className="text-sm font-semibold text-[#E6EDF3] mb-4">Pipeline by Stage</div>
          {pipelineData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pipelineData} dataKey="count" cx="50%" cy="50%" innerRadius={40} outerRadius={65}>
                    {pipelineData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1C2128", border: "1px solid #30363D", borderRadius: "8px", color: "#E6EDF3" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pipelineData.slice(0, 4).map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-[#8B949E]">{d.name}</span>
                    </div>
                    <span className="text-[#E6EDF3] font-medium">{d.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-[#484F58] text-sm">No pipeline data yet</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl">
        <div className="px-5 py-4 border-b border-[#30363D]">
          <span className="font-semibold text-[#E6EDF3] text-sm">Recent Activity</span>
        </div>
        <div className="divide-y divide-[#30363D]">
          {activities?.length === 0 && (
            <div className="px-5 py-8 text-center text-[#484F58] text-sm">No activity yet. Start by adding a contact.</div>
          )}
          {activities?.map((a) => (
            <div key={a.id} className="px-5 py-3 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#21262D] flex items-center justify-center flex-shrink-0 mt-0.5">
                {activityIcon(a.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#E6EDF3]">
                  <span className="font-medium">{(a.contacts as { full_name: string })?.full_name || "Unknown"}</span>
                  {" — "}{a.title || a.type}
                </div>
                {a.content && <div className="text-xs text-[#8B949E] mt-0.5 truncate">{a.content}</div>}
              </div>
              <div className="text-xs text-[#484F58] flex-shrink-0">
                {a.created_at ? format(parseISO(a.created_at), "MMM d, h:mm a") : ""}
              </div>
            </div>
          ))}
        </div>
        {(activities?.length || 0) === 0 && (
          <div className="px-5 pb-5 flex justify-center">
            <Link href="/contacts">
              <Button size="sm" className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold">
                Add your first contact
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
