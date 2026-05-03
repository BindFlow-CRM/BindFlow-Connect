import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
  differenceInCalendarDays, format, parseISO,
} from "date-fns";
import {
  Crosshair, MessageCircle, Mail, ChevronRight,
  AlertTriangle, Clock, Info, Send, Check, Edit3, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* ─── types ────────────────────────────────────────────────────── */
interface RadarPolicy {
  id: string;
  insurance_company: string;
  line_of_insurance: string | null;
  policy_number: string | null;
  annual_premium: number | null;
  renewal_date: string;
  policy_status: string | null;
  contact_id: string;
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  days_left: number;
}

interface Template {
  id: string;
  name: string;
  body: string;
  template_type: string | null;
}

/* ─── helpers ───────────────────────────────────────────────────── */
function fillVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

function formatWaPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("1") && d.length === 11) return d;
  if (d.length === 10) return `1${d}`;
  return d;
}

function bestTemplate(templates: Template[], days: number): Template | undefined {
  if (days <= 30) return templates.find((t) => t.template_type === "renewal_30") ?? templates.find((t) => t.template_type?.startsWith("renewal"));
  if (days <= 60) return templates.find((t) => t.template_type === "renewal_60") ?? templates.find((t) => t.template_type?.startsWith("renewal"));
  return templates.find((t) => t.template_type === "renewal_90") ?? templates.find((t) => t.template_type?.startsWith("renewal"));
}

const BUCKET_CONFIG = [
  { key: "30", label: "Renewing in 30 days", range: [0, 30], color: "#F85149", bg: "#F8514910", border: "#F8514930", Icon: AlertTriangle, urgency: "Urgent" },
  { key: "60", label: "31–60 days", range: [31, 60], color: "#F0B429", bg: "#F0B42910", border: "#F0B42930", Icon: Clock, urgency: "Soon" },
  { key: "90", label: "61–90 days", range: [61, 90], color: "#00B4D8", bg: "#00B4D810", border: "#00B4D830", Icon: Info, urgency: "Upcoming" },
] as const;

/* ─── WhatsApp mini-composer ────────────────────────────────────── */
interface WaComposerProps {
  policy: RadarPolicy;
  templates: Template[];
  agentName: string;
  agentPhone: string;
  agencyName: string;
  onClose: () => void;
  onSent: (contactId: string, message: string) => void;
}

function WaMiniComposer({ policy, templates, agentName, agentPhone, agencyName, onClose, onSent }: WaComposerProps) {
  const vars: Record<string, string> = {
    client_name: policy.contact_name,
    insurance_company: policy.insurance_company,
    line_of_insurance: policy.line_of_insurance ?? "",
    policy_number: policy.policy_number ?? "",
    renewal_date: format(parseISO(policy.renewal_date), "MMMM d, yyyy"),
    agent_name: agentName || "Your Name",
    agent_phone: agentPhone || "",
    agency_name: agencyName || "",
  };

  const tpl = bestTemplate(templates, policy.days_left);
  const [message, setMessage] = useState(() => tpl ? fillVars(tpl.body, vars) : `Hi ${policy.contact_name}! Your ${policy.line_of_insurance ?? ""} policy with ${policy.insurance_company} renews on ${vars.renewal_date}. Let's connect soon!\n\n— ${agentName || "Your Name"}`);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!policy.contact_phone || !message.trim()) return;
    window.open(`https://wa.me/${formatWaPhone(policy.contact_phone)}?text=${encodeURIComponent(message)}`, "_blank");
    setSent(true);
    onSent(policy.contact_id, message);
    setTimeout(onClose, 900);
  };

  const unfilled = Array.from(message.matchAll(/\{\{(\w+)\}\}/g)).map((m) => m[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#30363D]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#25D36615] flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#E6EDF3]">WhatsApp — {policy.contact_name}</div>
              <div className="text-xs text-[#484F58]">{policy.insurance_company} · renews {format(parseISO(policy.renewal_date), "MMM d, yyyy")}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#484F58] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* message editor */}
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-[#484F58]">
              <Edit3 className="h-3 w-3" />
              Edit message before sending
            </div>
            <span className="text-xs text-[#484F58]">{message.length} chars</span>
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] text-sm leading-relaxed min-h-[140px] resize-none focus:border-[#25D366]"
          />
          {unfilled.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-[#F0B429]">Unfilled:</span>
              {unfilled.map((v) => <code key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0B42915] text-[#F0B429]">{`{{${v}}}`}</code>)}
            </div>
          )}

          {/* bubble preview */}
          <div className="bg-[#1A1A2E] rounded-xl p-3">
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-[#25D366] rounded-2xl rounded-tr-sm px-3.5 py-2.5">
                <p className="text-[12px] text-white whitespace-pre-wrap leading-relaxed">{message}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-white/60">{format(new Date(), "h:mm a")}</span>
                  <Check className="h-3 w-3 text-white/60" /><Check className="h-3 w-3 text-white/60 -ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="px-5 pb-4 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-[#30363D] text-[#E6EDF3] h-10">Cancel</Button>
          {!policy.contact_phone ? (
            <Button disabled className="flex-1 h-10 bg-[#21262D] text-[#484F58]">No phone on file</Button>
          ) : (
            <Button onClick={handleSend} disabled={!message.trim() || sent} className="flex-1 h-10 font-semibold text-white" style={{ background: sent ? "#00C98A" : "#25D366" }}>
              {sent ? <><Check className="h-4 w-4 mr-2" />Opening…</> : <><Send className="h-4 w-4 mr-2" />Open in WhatsApp</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── main page ─────────────────────────────────────────────────── */
export default function RenewalRadarPage() {
  const { organization, profile } = useAuth();
  const orgId = organization?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [waPolicy, setWaPolicy] = useState<RadarPolicy | null>(null);

  const { data: policies, isLoading } = useQuery({
    queryKey: ["renewal-radar", orgId],
    queryFn: async () => {
      const today = new Date();
      const in90 = new Date(today);
      in90.setDate(today.getDate() + 90);

      const { data, error } = await supabase
        .from("policies")
        .select("*, contacts(id, full_name, phone, email)")
        .eq("organization_id", orgId!)
        .gte("renewal_date", today.toISOString().slice(0, 10))
        .lte("renewal_date", in90.toISOString().slice(0, 10))
        .not("policy_status", "eq", "cancelled")
        .order("renewal_date", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((p) => ({
        id: p.id,
        insurance_company: p.insurance_company,
        line_of_insurance: p.line_of_insurance,
        policy_number: p.policy_number,
        annual_premium: p.annual_premium,
        renewal_date: p.renewal_date!,
        policy_status: p.policy_status,
        contact_id: (p.contacts as { id: string })?.id ?? "",
        contact_name: (p.contacts as { full_name: string })?.full_name ?? "Unknown",
        contact_phone: (p.contacts as { phone: string | null })?.phone ?? null,
        contact_email: (p.contacts as { email: string | null })?.email ?? null,
        days_left: differenceInCalendarDays(parseISO(p.renewal_date!), today),
      })) as RadarPolicy[];
    },
    enabled: !!orgId,
  });

  const { data: templates } = useQuery({
    queryKey: ["email-templates", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_templates").select("*").eq("organization_id", orgId!).order("created_at");
      if (error) throw error;
      return data as Template[];
    },
    enabled: !!orgId,
  });

  const logWhatsApp = useMutation({
    mutationFn: async ({ contactId, message }: { contactId: string; message: string }) => {
      const { error } = await supabase.from("activities").insert({
        contact_id: contactId,
        organization_id: orgId,
        type: "whatsapp",
        title: "WhatsApp renewal message sent",
        content: message.slice(0, 300) + (message.length > 300 ? "…" : ""),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-activities"] });
      toast({ title: "WhatsApp opened", description: "Activity logged to timeline." });
    },
  });

  const buckets = BUCKET_CONFIG.map((b) => ({
    ...b,
    items: (policies ?? []).filter((p) => p.days_left >= b.range[0] && p.days_left <= b.range[1]),
  }));

  const total = policies?.length ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00B4D815] border border-[#00B4D830] flex items-center justify-center">
            <Crosshair className="h-5 w-5 text-[#00B4D8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#E6EDF3]">Renewal Radar</h1>
            <p className="text-[#8B949E] text-sm mt-0.5">
              {isLoading ? "Loading…" : `${total} polic${total === 1 ? "y" : "ies"} renewing in the next 90 days`}
            </p>
          </div>
        </div>
      </div>

      {/* Stat bar */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {BUCKET_CONFIG.map((b) => {
          const count = (policies ?? []).filter((p) => p.days_left >= b.range[0] && p.days_left <= b.range[1]).length;
          return (
            <div key={b.key} className="bg-[#161B22] border rounded-xl p-4 flex items-center gap-3" style={{ borderColor: b.border }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: b.bg }}>
                <b.Icon className="h-4 w-4" style={{ color: b.color }} />
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: b.color }}>{count}</div>
                <div className="text-xs text-[#8B949E]">{b.urgency}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Buckets */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 bg-[#161B22] rounded-xl" />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-14 text-center">
          <Crosshair className="h-10 w-10 text-[#484F58] mx-auto mb-3" />
          <p className="text-[#484F58] text-sm">No policies renewing in the next 90 days.</p>
          <p className="text-[#484F58] text-xs mt-1">Add renewal dates to your policies to see them here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {buckets.map((bucket) => bucket.items.length > 0 && (
            <div key={bucket.key}>
              {/* Bucket header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: bucket.bg }}>
                  <bucket.Icon className="h-3.5 w-3.5" style={{ color: bucket.color }} />
                </div>
                <h2 className="text-sm font-semibold" style={{ color: bucket.color }}>{bucket.label}</h2>
                <Badge className="text-xs ml-1" style={{ background: bucket.bg, color: bucket.color, border: "none" }}>
                  {bucket.items.length}
                </Badge>
                <div className="flex-1 h-px" style={{ background: bucket.border }} />
              </div>

              {/* Policy rows */}
              <div className="space-y-2">
                {bucket.items.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#161B22] border border-[#30363D] rounded-xl px-4 py-3 flex items-center gap-4 hover:border-[#484F58] transition-colors group"
                  >
                    {/* Days pill */}
                    <div
                      className="w-14 flex-shrink-0 text-center rounded-lg py-1.5"
                      style={{ background: bucket.bg, borderColor: bucket.border }}
                    >
                      <div className="text-lg font-bold leading-none" style={{ color: bucket.color }}>{p.days_left}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: bucket.color, opacity: 0.7 }}>days</div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <Link href={`/contacts/${p.contact_id}`}>
                          <span className="text-sm font-semibold text-[#E6EDF3] hover:text-[#00E5A0] transition-colors cursor-pointer">
                            {p.contact_name}
                          </span>
                        </Link>
                        <span className="text-xs text-[#484F58]">·</span>
                        <span className="text-xs text-[#8B949E]">{p.insurance_company}</span>
                        {p.line_of_insurance && (
                          <>
                            <span className="text-xs text-[#484F58]">·</span>
                            <span className="text-xs text-[#8B949E] capitalize">{p.line_of_insurance}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-[#484F58]">
                          Renews {format(parseISO(p.renewal_date), "MMM d, yyyy")}
                        </span>
                        {p.policy_number && (
                          <span className="text-xs text-[#484F58]">#{p.policy_number}</span>
                        )}
                        {p.annual_premium && (
                          <span className="text-xs text-[#484F58]">${p.annual_premium.toLocaleString()}/yr</span>
                        )}
                        {p.contact_phone && (
                          <span className="text-xs text-[#484F58]">{p.contact_phone}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* WhatsApp */}
                      <button
                        onClick={() => setWaPolicy(p)}
                        disabled={!p.contact_phone}
                        title={p.contact_phone ? "Send WhatsApp renewal message" : "No phone number on file"}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          p.contact_phone
                            ? "bg-[#25D36610] text-[#25D366] border-[#25D36620] hover:bg-[#25D36620]"
                            : "bg-[#21262D] text-[#484F58] border-[#30363D] cursor-not-allowed"
                        }`}
                        data-testid={`button-wa-${p.id}`}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </button>

                      {/* Email */}
                      {p.contact_email ? (
                        <a
                          href={`mailto:${p.contact_email}?subject=${encodeURIComponent(
                            `Your ${p.line_of_insurance ?? "insurance"} policy renews in ${p.days_left} days`
                          )}&body=${encodeURIComponent(
                            `Hi ${p.contact_name},\n\nI wanted to remind you that your ${p.line_of_insurance ?? "insurance"} policy with ${p.insurance_company} is renewing on ${format(parseISO(p.renewal_date), "MMMM d, yyyy")} — just ${p.days_left} days away.\n\nLet's connect soon to make sure everything is in order.\n\nBest,\n${profile?.full_name || "Your Agent"}\n${profile?.agency_name || ""}`
                          )}`}
                          title="Send email"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#30363D] text-[#8B949E] hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors"
                          data-testid={`button-email-${p.id}`}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Email
                        </a>
                      ) : (
                        <button
                          disabled
                          title="No email on file"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#30363D] text-[#484F58] cursor-not-allowed"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Email
                        </button>
                      )}

                      {/* View contact */}
                      <Link href={`/contacts/${p.contact_id}`}>
                        <button
                          title="View contact"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#30363D] text-[#484F58] hover:border-[#00E5A0] hover:text-[#00E5A0] transition-colors"
                          data-testid={`button-view-${p.id}`}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp Composer overlay */}
      {waPolicy && (
        <WaMiniComposer
          policy={waPolicy}
          templates={templates ?? []}
          agentName={profile?.full_name ?? ""}
          agentPhone={profile?.phone ?? ""}
          agencyName={profile?.agency_name ?? ""}
          onClose={() => setWaPolicy(null)}
          onSent={(contactId, message) => {
            logWhatsApp.mutate({ contactId, message });
            setWaPolicy(null);
          }}
        />
      )}
    </div>
  );
}
