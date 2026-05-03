import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft, MessageCircle, Phone, Mail, MapPin, Tag,
  Plus, FileText, Phone as PhoneIcon, CalendarDays,
  Send, ChevronDown, Check, Edit3, Printer, Mic, MicOff, Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

const noteSchema = z.object({
  type: z.enum(["note", "call", "email", "meeting", "whatsapp"]),
  content: z.string().min(1, "Content required"),
});
type NoteForm = z.infer<typeof noteSchema>;

const policySchema = z.object({
  insurance_company: z.string().min(1, "Company required"),
  line_of_insurance: z.string().min(1, "Line required"),
  annual_premium: z.string().optional(),
  policy_number: z.string().optional(),
  renewal_date: z.string().optional(),
  policy_status: z.string().default("active"),
});
type PolicyForm = z.infer<typeof policySchema>;

const LINES = ["auto", "home", "life", "health", "commercial", "medicare", "other"];
const ACTIVITY_ICONS: Record<string, typeof FileText> = {
  note: FileText,
  call: PhoneIcon,
  email: Mail,
  meeting: CalendarDays,
  whatsapp: MessageCircle,
};

const POLICY_STATUS_COLOR: Record<string, string> = {
  active: "#00E5A0", lapsed: "#F85149", cancelled: "#F85149", pending: "#F0B429", quoted: "#00B4D8",
};

const TYPE_LABELS: Record<string, string> = {
  renewal_90: "Renewal 90d", renewal_60: "Renewal 60d", renewal_30: "Renewal 30d",
  follow_up: "Follow-up", custom: "Custom",
};
const TYPE_COLORS: Record<string, string> = {
  renewal_90: "#00B4D8", renewal_60: "#F0B429", renewal_30: "#F85149",
  follow_up: "#00E5A0", custom: "#8B949E",
};

function fillVariables(
  text: string,
  vars: Record<string, string>,
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("1") && digits.length === 11) return digits;
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

interface Policy {
  id: string;
  insurance_company: string;
  line_of_insurance: string | null;
  policy_number: string | null;
  annual_premium: number | null;
  renewal_date: string | null;
  policy_status: string | null;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  template_type: string | null;
}

interface WhatsAppComposerProps {
  open: boolean;
  onClose: () => void;
  contact: { full_name: string; phone: string | null };
  policy: Policy | null;
  templates: Template[];
  agentName: string;
  agentPhone: string;
  agencyName: string;
  onSent: (message: string) => void;
}

function WhatsAppComposer({
  open, onClose, contact, policy, templates, agentName, agentPhone, agencyName, onSent,
}: WhatsAppComposerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [message, setMessage] = useState("");
  const [edited, setEdited] = useState(false);
  const [sent, setSent] = useState(false);

  const vars: Record<string, string> = {
    client_name: contact.full_name,
    insurance_company: policy?.insurance_company ?? "",
    line_of_insurance: policy?.line_of_insurance ?? "",
    policy_number: policy?.policy_number ?? "",
    renewal_date: policy?.renewal_date
      ? format(parseISO(policy.renewal_date), "MMMM d, yyyy")
      : "",
    agent_name: agentName || "Your Name",
    agent_phone: agentPhone || "",
    agency_name: agencyName || "",
  };

  const applyTemplate = (t: Template) => {
    setSelectedTemplate(t);
    setMessage(fillVariables(t.body, vars));
    setEdited(false);
  };

  const handleOpen = () => {
    if (!open) return;
    setSent(false);
    setEdited(false);
    setSelectedTemplate(null);
    setMessage("");
    if (policy) {
      const suggested = templates.find((t) =>
        t.template_type?.startsWith("renewal") || t.template_type === "follow_up"
      );
      if (suggested) applyTemplate(suggested);
    }
  };

  // Apply default on open
  useState(() => { handleOpen(); });

  const handleSend = () => {
    if (!contact.phone || !message.trim()) return;
    const wa = `https://wa.me/${formatPhone(contact.phone)}?text=${encodeURIComponent(message)}`;
    window.open(wa, "_blank");
    setSent(true);
    onSent(message);
    setTimeout(() => {
      onClose();
      setSent(false);
    }, 1200);
  };

  const remainingVars = Array.from(message.matchAll(/\{\{(\w+)\}\}/g)).map((m) => m[1]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#30363D] flex-shrink-0">
          <DialogTitle className="text-[#E6EDF3] text-base font-semibold flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#25D36615] flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
            </div>
            WhatsApp Message
          </DialogTitle>
          <p className="text-sm text-[#8B949E] mt-1">
            To: <span className="text-[#E6EDF3] font-medium">{contact.full_name}</span>
            {contact.phone && <span className="text-[#484F58]"> · {contact.phone}</span>}
          </p>
          {policy && (
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-[#484F58]">Policy:</span>
              <Badge className="text-xs" style={{ background: `${POLICY_STATUS_COLOR[policy.policy_status || "active"]}15`, color: POLICY_STATUS_COLOR[policy.policy_status || "active"], border: "none" }}>
                {policy.insurance_company}
              </Badge>
              {policy.line_of_insurance && (
                <span className="text-xs text-[#8B949E] capitalize">{policy.line_of_insurance}</span>
              )}
              {policy.renewal_date && (
                <span className="text-xs text-[#484F58]">· renews {format(parseISO(policy.renewal_date), "MMM d, yyyy")}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Template picker */}
          {templates.length > 0 && (
            <div>
              <Label className="text-xs text-[#484F58] uppercase tracking-wide mb-2 block">
                Start from a template
              </Label>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                      selectedTemplate?.id === t.id
                        ? "border-[#25D366] text-[#25D366] bg-[#25D36610]"
                        : "border-[#30363D] text-[#8B949E] hover:border-[#484F58] hover:text-[#E6EDF3]"
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: TYPE_COLORS[t.template_type || "custom"] }}
                    />
                    {t.name}
                    {selectedTemplate?.id === t.id && <Check className="h-3 w-3" />}
                  </button>
                ))}
                <button
                  onClick={() => { setSelectedTemplate(null); setMessage(""); setEdited(false); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border border-[#30363D] text-[#484F58] hover:text-[#8B949E] transition-colors"
                >
                  Blank
                </button>
              </div>
            </div>
          )}

          {/* Variable auto-fill summary */}
          {selectedTemplate && (
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
              <p className="text-xs text-[#484F58] font-medium mb-2 flex items-center gap-1">
                <Check className="h-3 w-3 text-[#00E5A0]" />
                Variables filled from contact &amp; policy data
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(vars).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-1 min-w-0">
                    <span className="text-[10px] text-[#00B4D8] font-mono flex-shrink-0">{`{{${k}}}`}</span>
                    <span className="text-[10px] text-[#8B949E] truncate">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs text-[#484F58] uppercase tracking-wide flex items-center gap-1">
                <Edit3 className="h-3 w-3" />
                Message {edited && <span className="text-[#F0B429]">(edited)</span>}
              </Label>
              <span className="text-xs text-[#484F58]">{message.length} chars</span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => { setMessage(e.target.value); setEdited(true); }}
              placeholder={`Hi ${contact.full_name}! I wanted to reach out about…`}
              className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#25D366] min-h-[160px] text-sm leading-relaxed resize-none"
              data-testid="textarea-whatsapp-message"
            />
            {remainingVars.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-[#F0B429]">Unfilled variables:</span>
                {remainingVars.map((v) => (
                  <code key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0B42915] text-[#F0B429] border border-[#F0B42930]">{`{{${v}}}`}</code>
                ))}
              </div>
            )}
          </div>

          {/* WhatsApp preview bubble */}
          {message && (
            <div>
              <Label className="text-xs text-[#484F58] uppercase tracking-wide mb-2 block">Preview</Label>
              <div className="bg-[#1A1A2E] rounded-xl p-3">
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-[#25D366] rounded-2xl rounded-tr-sm px-3.5 py-2.5">
                    <p className="text-[13px] text-white whitespace-pre-wrap leading-relaxed">{message}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-white/60">{format(new Date(), "h:mm a")}</span>
                      <Check className="h-3 w-3 text-white/60" />
                      <Check className="h-3 w-3 text-white/60 -ml-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#30363D] flex-shrink-0">
          {!contact.phone ? (
            <div className="text-center text-sm text-[#F85149] bg-[#F8514910] border border-[#F8514930] rounded-lg px-4 py-3">
              No phone number on this contact. Add one in their profile first.
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-[#30363D] text-[#E6EDF3] hover:bg-[#21262D] h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={!message.trim() || sent}
                className="flex-1 h-10 font-semibold text-white"
                style={{ background: sent ? "#00C98A" : "#25D366" }}
                data-testid="button-send-whatsapp"
              >
                {sent ? (
                  <><Check className="h-4 w-4 mr-2" />Opening WhatsApp…</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" />Open in WhatsApp</>
                )}
              </Button>
            </div>
          )}
          <p className="text-[10px] text-[#484F58] text-center mt-2">
            Opens WhatsApp Web or app with the message pre-filled — you'll still tap Send.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Cross-Sell Engine ─────────────────────────────────────────────────────────
const CROSS_SELL_RULES: Array<{
  id: string;
  has: string[];
  missing: string;
  label: string;
  pitch: string;
  color: string;
}> = [
  {
    id: "home",
    has: ["auto"],
    missing: "home",
    label: "Home Insurance",
    pitch: "Client has Auto but no Home policy. Bundle discount opportunity.",
    color: "#00E5A0",
  },
  {
    id: "auto",
    has: ["home"],
    missing: "auto",
    label: "Auto Insurance",
    pitch: "Client has Home but no Auto policy. Pitch a bundle for savings.",
    color: "#00E5A0",
  },
  {
    id: "life",
    has: ["auto", "home"],
    missing: "life",
    label: "Life Insurance",
    pitch: "Client has Property coverage but no Life policy. High-value opportunity.",
    color: "#00B4D8",
  },
  {
    id: "umbrella",
    has: ["auto", "home"],
    missing: "umbrella",
    label: "Umbrella Policy",
    pitch: "Multiple property policies — ideal candidate for Umbrella coverage.",
    color: "#F0B429",
  },
  {
    id: "health",
    has: ["life"],
    missing: "health",
    label: "Health Insurance",
    pitch: "Has Life coverage but no Health policy on file.",
    color: "#00B4D8",
  },
];

function CrossSellEngine({ policies }: { policies: Policy[] }) {
  const lines = new Set(
    policies
      .map((p) => p.line_of_insurance?.toLowerCase().trim())
      .filter(Boolean) as string[]
  );

  const opportunities = CROSS_SELL_RULES.filter(
    (rule) =>
      rule.has.some((h) => lines.has(h)) && !lines.has(rule.missing)
  );

  if (opportunities.length === 0 || policies.length === 0) return null;

  return (
    <div className="mb-4 space-y-2" data-testid="cross-sell-engine">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px flex-1 bg-[#30363D]" />
        <span className="text-[10px] uppercase tracking-widest text-[#484F58] font-semibold px-1">
          Cross-Sell Opportunities
        </span>
        <div className="h-px flex-1 bg-[#30363D]" />
      </div>
      {opportunities.map((opp) => (
        <div
          key={opp.id}
          className="flex items-start gap-3 px-4 py-3 rounded-xl border"
          style={{
            background: `${opp.color}08`,
            borderColor: `${opp.color}30`,
          }}
          data-testid={`cross-sell-${opp.id}`}
        >
          <span className="text-base flex-shrink-0">🔥</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold" style={{ color: opp.color }}>
              Opportunity: Pitch {opp.label}
            </div>
            <div className="text-xs text-[#8B949E] mt-0.5">{opp.pitch}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Contact Detail Page ───────────────────────────────────────────────────────
interface ContactDetailProps { id: string; }

export default function ContactDetailPage({ id }: ContactDetailProps) {
  const [, setLocation] = useLocation();
  const { organization, user, profile } = useAuth();
  const orgId = organization?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [addPolicyOpen, setAddPolicyOpen] = useState(false);
  const [waPolicy, setWaPolicy] = useState<Policy | null | "header">(null);
  const [isDictating, setIsDictating] = useState(false);
  const recognitionRef = useState<SpeechRecognition | null>(null);

  const SpeechRecognitionAPI =
    typeof window !== "undefined"
      ? (window.SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition ?? null)
      : null;
  const dictationSupported = !!SpeechRecognitionAPI;

  const startDictation = () => {
    if (!SpeechRecognitionAPI || isDictating) return;
    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    let finalTranscript = noteForm.getValues("content");
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) { finalTranscript += (finalTranscript ? " " : "") + t; }
        else { interim = t; }
      }
      noteForm.setValue("content", finalTranscript + (interim ? ` ${interim}` : ""), { shouldDirty: true });
    };
    rec.onend = () => { setIsDictating(false); recognitionRef[0] = null; };
    rec.onerror = () => { setIsDictating(false); recognitionRef[0] = null; };
    rec.start();
    recognitionRef[0] = rec;
    setIsDictating(true);
  };

  const stopDictation = () => {
    recognitionRef[0]?.stop();
    setIsDictating(false);
  };

  const noteForm = useForm<NoteForm>({
    resolver: zodResolver(noteSchema),
    defaultValues: { type: "note", content: "" },
  });
  const policyForm = useForm<PolicyForm>({
    resolver: zodResolver(policySchema),
    defaultValues: { insurance_company: "", line_of_insurance: "", policy_status: "active" },
  });

  const { data: contact, isLoading } = useQuery({
    queryKey: ["contact", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: policies } = useQuery({
    queryKey: ["contact-policies", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("policies").select("*").eq("contact_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Policy[];
    },
    enabled: !!id,
  });

  const { data: activities } = useQuery({
    queryKey: ["contact-activities", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("activities").select("*").eq("contact_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
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

  const addNote = useMutation({
    mutationFn: async (data: NoteForm) => {
      const { error } = await supabase.from("activities").insert({
        contact_id: id, organization_id: orgId, created_by: user?.id,
        type: data.type, content: data.content,
        title: data.type.charAt(0).toUpperCase() + data.type.slice(1),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-activities", id] });
      toast({ title: "Activity logged" });
      setAddNoteOpen(false);
      noteForm.reset();
    },
  });

  const addPolicy = useMutation({
    mutationFn: async (data: PolicyForm) => {
      const { error } = await supabase.from("policies").insert({
        contact_id: id, organization_id: orgId, created_by: user?.id,
        insurance_company: data.insurance_company,
        line_of_insurance: data.line_of_insurance,
        annual_premium: data.annual_premium ? parseFloat(data.annual_premium) : null,
        policy_number: data.policy_number || null,
        renewal_date: data.renewal_date || null,
        policy_status: data.policy_status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-policies", id] });
      toast({ title: "Policy added" });
      setAddPolicyOpen(false);
      policyForm.reset();
    },
  });

  const logWhatsApp = useMutation({
    mutationFn: async (message: string) => {
      const { error } = await supabase.from("activities").insert({
        contact_id: id, organization_id: orgId, created_by: user?.id,
        type: "whatsapp", title: "WhatsApp message sent",
        content: message.slice(0, 300) + (message.length > 300 ? "…" : ""),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-activities", id] });
    },
  });

  const handleWaSent = (message: string) => {
    logWhatsApp.mutate(message);
    toast({ title: "WhatsApp opened", description: "Activity logged to timeline." });
    setWaPolicy(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-24 bg-[#161B22] mb-6" />
        <Skeleton className="h-32 w-full bg-[#161B22] rounded-xl" />
      </div>
    );
  }

  if (!contact) return (
    <div className="p-6 text-center text-[#484F58]">Contact not found.</div>
  );

  const waOpen = waPolicy !== null;
  const waSelectedPolicy = waPolicy === "header" ? (policies?.[0] ?? null) : (waPolicy as Policy | null);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back */}
      <button onClick={() => setLocation("/contacts")} className="flex items-center gap-2 text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors mb-6" data-testid="button-back">
        <ArrowLeft className="h-4 w-4" />
        Back to contacts
      </button>

      {/* Header */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#00E5A015] border border-[#00E5A030] flex items-center justify-center">
              <span className="text-xl font-bold text-[#00E5A0]">
                {contact.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#E6EDF3]">{contact.full_name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-[#8B949E] flex-wrap">
                {contact.email && <div className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{contact.email}</div>}
                {contact.phone && <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{contact.phone}</div>}
                {(contact.city || contact.state) && (
                  <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[contact.city, contact.state].filter(Boolean).join(", ")}</div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {contact.lead_source && (
              <Badge className="bg-[#21262D] text-[#8B949E] border-[#30363D] text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {contact.lead_source}
              </Badge>
            )}
            <button
              onClick={() => window.print()}
              className="no-print flex items-center gap-2 px-3 py-2 rounded-lg border border-[#30363D] text-[#8B949E] hover:border-[#00E5A0] hover:text-[#00E5A0] transition-colors text-sm font-medium"
              data-testid="button-print-summary"
              title="Print client summary"
            >
              <Printer className="h-4 w-4" />
              Print Summary
            </button>
            {contact.phone && (
              <button
                onClick={() => setWaPolicy("header")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#25D36615] text-[#25D366] hover:bg-[#25D36625] transition-colors text-sm font-medium"
                data-testid="button-whatsapp-header"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
            )}
          </div>
        </div>
        {contact.notes && (
          <div className="mt-4 pt-4 border-t border-[#30363D] text-sm text-[#8B949E]">{contact.notes}</div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="policies">
        <TabsList className="bg-[#161B22] border border-[#30363D] mb-4">
          <TabsTrigger value="policies" className="data-[state=active]:bg-[#21262D] data-[state=active]:text-[#E6EDF3] text-[#8B949E]">
            Policies ({policies?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-[#21262D] data-[state=active]:text-[#E6EDF3] text-[#8B949E]">
            Activity ({activities?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          {/* ── Cross-Sell Engine ── */}
          <CrossSellEngine policies={policies ?? []} />

          <div className="flex justify-end mb-3">
            <Button onClick={() => setAddPolicyOpen(true)} size="sm" className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold" data-testid="button-add-policy">
              <Plus className="h-4 w-4 mr-1" />
              Add policy
            </Button>
          </div>
          <div className="space-y-3">
            {policies?.length === 0 && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8 text-center text-[#484F58]">No policies yet</div>
            )}
            {policies?.map((p) => (
              <div
                key={p.id}
                className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex items-center justify-between gap-4"
                data-testid={`policy-${p.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-[#E6EDF3] text-sm">{p.insurance_company}</span>
                    <Badge className="text-xs" style={{ background: `${POLICY_STATUS_COLOR[p.policy_status || "active"]}15`, color: POLICY_STATUS_COLOR[p.policy_status || "active"], border: "none" }}>
                      {p.policy_status}
                    </Badge>
                  </div>
                  <div className="text-xs text-[#8B949E]">
                    {p.line_of_insurance && <span className="capitalize">{p.line_of_insurance}</span>}
                    {p.policy_number && <span> · #{p.policy_number}</span>}
                    {p.annual_premium && <span> · ${p.annual_premium.toLocaleString()}/yr</span>}
                    {p.renewal_date && <span> · Renews {format(parseISO(p.renewal_date), "MMM d, yyyy")}</span>}
                  </div>
                </div>
                {contact.phone && (
                  <button
                    onClick={() => setWaPolicy(p)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#25D36610] text-[#25D366] hover:bg-[#25D36620] transition-colors text-xs font-medium border border-[#25D36620]"
                    data-testid={`button-whatsapp-policy-${p.id}`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Send via WhatsApp
                  </button>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="flex justify-end mb-3">
            <Button onClick={() => setAddNoteOpen(true)} size="sm" className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold" data-testid="button-add-activity">
              <Plus className="h-4 w-4 mr-1" />
              Log activity
            </Button>
          </div>
          <div className="space-y-3">
            {activities?.length === 0 && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8 text-center text-[#484F58]">No activities yet</div>
            )}
            {activities?.map((a) => {
              const Icon = ACTIVITY_ICONS[a.type] || FileText;
              const isWa = a.type === "whatsapp";
              return (
                <div key={a.id} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex items-start gap-3" data-testid={`activity-${a.id}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isWa ? "bg-[#25D36615]" : "bg-[#21262D]"}`}>
                    <Icon className={`h-3.5 w-3.5 ${isWa ? "text-[#25D366]" : "text-[#8B949E]"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#8B949E] capitalize">{a.type}</span>
                      <span className="text-xs text-[#484F58]">{a.created_at ? format(parseISO(a.created_at), "MMM d, h:mm a") : ""}</span>
                    </div>
                    <div className={`text-sm mt-0.5 ${isWa ? "text-[#E6EDF3] bg-[#25D36608] border border-[#25D36620] rounded-lg px-3 py-2 font-sans leading-relaxed whitespace-pre-wrap" : "text-[#E6EDF3]"}`}>
                      {a.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Log Activity Dialog */}
      <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3]">
          <DialogHeader><DialogTitle className="text-[#E6EDF3]">Log Activity</DialogTitle></DialogHeader>
          <form onSubmit={noteForm.handleSubmit((d) => addNote.mutate(d))} className="space-y-3 mt-2">
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Type</Label>
              <Select defaultValue="note" onValueChange={(v) => noteForm.setValue("type", v as NoteForm["type"])}>
                <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1C2128] border-[#30363D]">
                  {["note", "call", "email", "meeting", "whatsapp"].map((t) => (
                    <SelectItem key={t} value={t} className="text-[#E6EDF3] focus:bg-[#21262D] capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm text-[#E6EDF3]">Notes</Label>
                {dictationSupported && (
                  <button
                    type="button"
                    onClick={isDictating ? stopDictation : startDictation}
                    title={isDictating ? "Stop dictation" : "Dictate note (voice)"}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isDictating
                        ? "bg-[#F8514915] border-[#F85149] text-[#F85149] animate-pulse"
                        : "border-[#30363D] text-[#8B949E] hover:border-[#00B4D8] hover:text-[#00B4D8]"
                    }`}
                    data-testid="button-dictate"
                  >
                    {isDictating
                      ? <><Square className="h-3 w-3" />Stop</>
                      : <><Mic className="h-3 w-3" />Dictate</>}
                  </button>
                )}
              </div>
              {isDictating && (
                <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-[#F8514910] border border-[#F8514930]">
                  <MicOff className="h-3 w-3 text-[#F85149] animate-pulse flex-shrink-0" />
                  <span className="text-xs text-[#F85149]">Listening… speak now. Tap Stop when done.</span>
                </div>
              )}
              <Textarea
                {...noteForm.register("content")}
                placeholder={isDictating ? "Transcribing your voice…" : "What happened?"}
                className={`bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] min-h-[80px] transition-colors ${
                  isDictating ? "border-[#F85149] focus:border-[#F85149]" : "focus:border-[#00E5A0]"
                }`}
                data-testid="textarea-activity-content"
              />
              {noteForm.formState.errors.content && <p className="text-[#F85149] text-xs mt-1">{noteForm.formState.errors.content.message}</p>}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => { setAddNoteOpen(false); stopDictation(); }} className="flex-1 border-[#30363D] text-[#E6EDF3] h-10">Cancel</Button>
              <Button type="submit" disabled={addNote.isPending} className="flex-1 bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-10">Log</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Policy Dialog */}
      <Dialog open={addPolicyOpen} onOpenChange={setAddPolicyOpen}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3]">
          <DialogHeader><DialogTitle className="text-[#E6EDF3]">Add Policy</DialogTitle></DialogHeader>
          <form onSubmit={policyForm.handleSubmit((d) => addPolicy.mutate(d))} className="space-y-3 mt-2">
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Insurance company *</Label>
              <Input {...policyForm.register("insurance_company")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" data-testid="input-policy-company" />
              {policyForm.formState.errors.insurance_company && <p className="text-[#F85149] text-xs mt-1">{policyForm.formState.errors.insurance_company.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Line *</Label>
                <Select onValueChange={(v) => policyForm.setValue("line_of_insurance", v)}>
                  <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#1C2128] border-[#30363D]">
                    {LINES.map((l) => <SelectItem key={l} value={l} className="text-[#E6EDF3] focus:bg-[#21262D] capitalize">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Status</Label>
                <Select defaultValue="active" onValueChange={(v) => policyForm.setValue("policy_status", v)}>
                  <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1C2128] border-[#30363D]">
                    {["active", "quoted", "pending", "lapsed", "cancelled"].map((s) => (
                      <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D] capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Annual premium</Label>
                <Input {...policyForm.register("annual_premium")} type="number" placeholder="0.00" className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" />
              </div>
              <div>
                <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Policy #</Label>
                <Input {...policyForm.register("policy_number")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" />
              </div>
            </div>
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Renewal date</Label>
              <Input {...policyForm.register("renewal_date")} type="date" className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setAddPolicyOpen(false)} className="flex-1 border-[#30363D] text-[#E6EDF3] h-10">Cancel</Button>
              <Button type="submit" disabled={addPolicy.isPending} className="flex-1 bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-10" data-testid="button-save-policy">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Print-only summary (hidden on screen, shown on print) ── */}
      <div className="print-only hidden print-summary" aria-hidden="true">
        <div className="print-header">
          <div className="print-avatar">
            {contact.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h1>{contact.full_name}</h1>
            {contact.email && <p>✉ {contact.email}</p>}
            {contact.phone && <p>📞 {contact.phone}</p>}
            {(contact.city || contact.state) && <p>📍 {[contact.city, contact.state].filter(Boolean).join(", ")}</p>}
            {contact.lead_source && <p>Source: {contact.lead_source}</p>}
          </div>
        </div>

        {policies && policies.length > 0 && (
          <>
            <h2>Policies ({policies.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Carrier</th>
                  <th>Line</th>
                  <th>Policy #</th>
                  <th>Premium / yr</th>
                  <th>Status</th>
                  <th>Renewal Date</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.id}>
                    <td>{p.insurance_company}</td>
                    <td style={{ textTransform: "capitalize" }}>{p.line_of_insurance ?? "—"}</td>
                    <td>{p.policy_number ?? "—"}</td>
                    <td>{p.annual_premium ? `$${p.annual_premium.toLocaleString()}` : "—"}</td>
                    <td style={{ textTransform: "capitalize" }}>{p.policy_status ?? "—"}</td>
                    <td>{p.renewal_date ? format(parseISO(p.renewal_date), "MMM d, yyyy") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activities && activities.length > 0 && (
          <>
            <h2>Activity Log ({activities.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{a.created_at ? format(parseISO(a.created_at), "MMM d, yyyy h:mm a") : "—"}</td>
                    <td style={{ textTransform: "capitalize" }}>{a.type}</td>
                    <td>{a.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="print-meta">
          Printed from BindFlow · {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
          {profile?.full_name && ` · Agent: ${profile.full_name}`}
          {profile?.agency_name && ` · ${profile.agency_name}`}
        </div>
      </div>

      {/* WhatsApp Composer */}
      {contact && (
        <WhatsAppComposer
          open={waOpen}
          onClose={() => setWaPolicy(null)}
          contact={{ full_name: contact.full_name, phone: contact.phone }}
          policy={waSelectedPolicy}
          templates={templates ?? []}
          agentName={profile?.full_name ?? ""}
          agentPhone={profile?.phone ?? ""}
          agencyName={profile?.agency_name ?? ""}
          onSent={handleWaSent}
        />
      )}
    </div>
  );
}
