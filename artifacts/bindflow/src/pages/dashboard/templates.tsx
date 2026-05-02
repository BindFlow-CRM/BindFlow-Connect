import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Mail, Edit, Trash2, Eye, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const templateSchema = z.object({
  name: z.string().min(1, "Name required"),
  subject: z.string().min(1, "Subject required"),
  body: z.string().min(1, "Body required"),
  template_type: z.string().default("custom"),
});
type TemplateForm = z.infer<typeof templateSchema>;

const TEMPLATE_TYPES = ["renewal_90", "renewal_60", "renewal_30", "follow_up", "custom"];
const TYPE_LABELS: Record<string, string> = {
  renewal_90: "Renewal 90d", renewal_60: "Renewal 60d", renewal_30: "Renewal 30d", follow_up: "Follow-up", custom: "Custom",
};
const TYPE_COLORS: Record<string, string> = {
  renewal_90: "#00B4D8", renewal_60: "#F0B429", renewal_30: "#F85149", follow_up: "#00E5A0", custom: "#8B949E",
};

const DEFAULT_TEMPLATES = [
  {
    name: "90-Day Renewal Notice",
    subject: "Your {{line_of_insurance}} policy renews in 90 days",
    body: "Hi {{client_name}},\n\nI wanted to give you an early heads-up that your {{line_of_insurance}} policy with {{insurance_company}} (Policy #{{policy_number}}) is coming up for renewal on {{renewal_date}} — about 90 days from now.\n\nNow is a great time to review your coverage and make sure it still fits your needs. A quick 15-minute call is usually all it takes.\n\nFeel free to reply to this email or give me a call at {{agent_phone}}.\n\nBest regards,\n{{agent_name}}\n{{agency_name}}",
    template_type: "renewal_90",
  },
  {
    name: "60-Day Renewal Reminder",
    subject: "Heads up: {{line_of_insurance}} renewal in 60 days",
    body: "Hi {{client_name}},\n\nJust a friendly reminder that your {{line_of_insurance}} policy with {{insurance_company}} renews on {{renewal_date}} — about 60 days away.\n\nIf you'd like to explore any changes or compare options before renewal, I'm happy to help. No pressure — I just want to make sure you're getting the best value.\n\nGive me a call at {{agent_phone}} or reply here anytime.\n\nBest,\n{{agent_name}}\n{{agency_name}}",
    template_type: "renewal_60",
  },
  {
    name: "30-Day Urgent Renewal",
    subject: "Action needed: Policy renews in 30 days — {{client_name}}",
    body: "Hi {{client_name}},\n\nYour {{line_of_insurance}} policy with {{insurance_company}} (Policy #{{policy_number}}) is renewing on {{renewal_date}}, just 30 days away.\n\nTo avoid any lapse in coverage, please reach out so we can confirm your renewal details or explore any adjustments.\n\nCall or text me at {{agent_phone}} — I'm available this week.\n\nBest,\n{{agent_name}}\n{{agency_name}}",
    template_type: "renewal_30",
  },
  {
    name: "General Follow-up",
    subject: "Following up — {{client_name}}",
    body: "Hi {{client_name}},\n\nI wanted to follow up on our recent conversation about your insurance needs.\n\nLet me know if you have any questions or if there's anything I can help with. I'm always happy to review your current coverage or run new quotes.\n\nBest regards,\n{{agent_name}}\n{{agency_name}}\n{{agent_phone}}",
    template_type: "follow_up",
  },
];

interface SampleData {
  client_name: string;
  insurance_company: string;
  line_of_insurance: string;
  policy_number: string;
  renewal_date: string;
  agent_name: string;
  agent_phone: string;
  agency_name: string;
}

const DEFAULT_SAMPLE: SampleData = {
  client_name: "Maria Rodriguez",
  insurance_company: "Allstate",
  line_of_insurance: "Auto",
  policy_number: "POL-2024-4821",
  renewal_date: "July 15, 2026",
  agent_name: "",
  agent_phone: "",
  agency_name: "",
};

function fillVariables(text: string, data: SampleData): string {
  return text
    .replace(/\{\{client_name\}\}/g, data.client_name)
    .replace(/\{\{insurance_company\}\}/g, data.insurance_company)
    .replace(/\{\{line_of_insurance\}\}/g, data.line_of_insurance)
    .replace(/\{\{policy_number\}\}/g, data.policy_number)
    .replace(/\{\{renewal_date\}\}/g, data.renewal_date)
    .replace(/\{\{agent_name\}\}/g, data.agent_name || "Your Name")
    .replace(/\{\{agent_phone\}\}/g, data.agent_phone || "(555) 000-0000")
    .replace(/\{\{agency_name\}\}/g, data.agency_name || "Your Agency");
}

interface PreviewDialogProps {
  template: { name: string; subject: string; body: string; template_type: string } | null;
  onClose: () => void;
  agentName: string;
  agentPhone: string;
  agencyName: string;
  agentEmail: string;
}

function EmailPreviewDialog({ template, onClose, agentName, agentPhone, agencyName, agentEmail }: PreviewDialogProps) {
  const [sample, setSample] = useState<SampleData>({
    ...DEFAULT_SAMPLE,
    agent_name: agentName,
    agent_phone: agentPhone,
    agency_name: agencyName,
  });
  const [showEdit, setShowEdit] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  if (!template) return null;

  const renderedSubject = fillVariables(template.subject, sample);
  const renderedBody = fillVariables(template.body, sample);
  const sentDate = format(new Date(), "MMM d, yyyy 'at' h:mm a");

  const copy = async (text: string, type: "subject" | "body") => {
    await navigator.clipboard.writeText(text);
    if (type === "subject") {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  const resetSample = () => {
    setSample({ ...DEFAULT_SAMPLE, agent_name: agentName, agent_phone: agentPhone, agency_name: agencyName });
  };

  return (
    <Dialog open={!!template} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#30363D] flex-shrink-0">
          <div>
            <DialogTitle className="text-[#E6EDF3] text-base font-semibold">{template.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs" style={{ background: `${TYPE_COLORS[template.template_type || "custom"]}15`, color: TYPE_COLORS[template.template_type || "custom"], border: "none" }}>
                {TYPE_LABELS[template.template_type || "custom"]}
              </Badge>
              <span className="text-xs text-[#484F58]">Email preview with sample data</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEdit(!showEdit)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${showEdit ? "border-[#00E5A0] text-[#00E5A0] bg-[#00E5A010]" : "border-[#30363D] text-[#8B949E] hover:border-[#00E5A0] hover:text-[#00E5A0]"}`}
            >
              <RefreshCw className="h-3 w-3" />
              Sample data
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Sample data editor */}
          {showEdit && (
            <div className="px-5 py-4 border-b border-[#30363D] bg-[#0D1117]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[#8B949E] font-medium">Customize sample values to preview different scenarios</p>
                <button onClick={resetSample} className="text-xs text-[#484F58] hover:text-[#8B949E] transition-colors">Reset</button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(DEFAULT_SAMPLE) as (keyof SampleData)[]).map((key) => (
                  <div key={key}>
                    <label className="text-[10px] text-[#484F58] uppercase tracking-wide mb-1 block">{key.replace(/_/g, " ")}</label>
                    <input
                      value={sample[key]}
                      onChange={(e) => setSample((s) => ({ ...s, [key]: e.target.value }))}
                      className="w-full h-7 px-2 rounded text-xs bg-[#161B22] border border-[#30363D] text-[#E6EDF3] focus:border-[#00E5A050] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rendered email preview */}
          <div className="p-5">
            {/* Subject row */}
            <div className="flex items-start gap-2 mb-4">
              <div className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-lg px-3.5 py-2.5">
                <div className="text-[10px] text-[#484F58] uppercase tracking-wide mb-0.5">Subject</div>
                <div className="text-sm font-medium text-[#E6EDF3]">{renderedSubject}</div>
              </div>
              <button
                onClick={() => copy(renderedSubject, "subject")}
                title="Copy subject"
                className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-lg border border-[#30363D] text-[#8B949E] hover:border-[#00E5A0] hover:text-[#00E5A0] transition-colors mt-0"
              >
                {copiedSubject ? <Check className="h-3.5 w-3.5 text-[#00E5A0]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Email card */}
            <div className="rounded-xl overflow-hidden border border-[#30363D]">
              {/* Email client toolbar strip */}
              <div className="bg-[#21262D] px-4 py-2.5 flex items-center gap-3 border-b border-[#30363D]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F85149]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F0B429]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00E5A0]" />
                </div>
                <div className="text-xs text-[#484F58] flex-1 text-center">Email Preview</div>
              </div>

              {/* Email header */}
              <div className="bg-[#F6F8FA] px-6 py-4 border-b border-[#D0D7DE]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00E5A0] flex items-center justify-center flex-shrink-0 text-[#0D1117] font-bold text-sm">
                    {(sample.agent_name || agentName || "A").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-semibold text-[#1F2328] text-sm">{sample.agent_name || "Your Name"}</span>
                      <span className="text-xs text-[#636C76]">&lt;{agentEmail || "agent@bindflow.com"}&gt;</span>
                      <span className="text-xs text-[#636C76] ml-auto flex-shrink-0">{sentDate}</span>
                    </div>
                    <div className="text-xs text-[#636C76] mt-0.5">
                      to <span className="font-medium text-[#1F2328]">{sample.client_name}</span>
                    </div>
                    <div className="mt-1.5 font-semibold text-[#1F2328] text-sm leading-tight">{renderedSubject}</div>
                  </div>
                </div>
              </div>

              {/* Email body */}
              <div className="bg-white px-6 py-5">
                <div className="text-[14px] text-[#1F2328] leading-relaxed whitespace-pre-wrap font-sans">
                  {renderedBody}
                </div>
              </div>

              {/* Email footer */}
              <div className="bg-[#F6F8FA] px-6 py-3 border-t border-[#D0D7DE]">
                <div className="text-[11px] text-[#636C76]">
                  {sample.agency_name && <span className="font-medium">{sample.agency_name}</span>}
                  {sample.agent_phone && <span> · {sample.agent_phone}</span>}
                  {agentEmail && <span> · {agentEmail}</span>}
                </div>
              </div>
            </div>

            {/* Copy body button */}
            <div className="flex justify-end mt-3">
              <button
                onClick={() => copy(renderedBody, "body")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[#30363D] text-[#8B949E] hover:border-[#00E5A0] hover:text-[#00E5A0] transition-colors"
              >
                {copiedBody ? <><Check className="h-3 w-3 text-[#00E5A0]" />Copied!</> : <><Copy className="h-3 w-3" />Copy email body</>}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TemplatesPage() {
  const { organization, profile, user } = useAuth();
  const orgId = organization?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<{ id: string } & TemplateForm | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<{ name: string; subject: string; body: string; template_type: string } | null>(null);

  const form = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: { name: "", subject: "", body: "", template_type: "custom" },
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_templates").select("*").eq("organization_id", orgId!).order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const saveTemplate = useMutation({
    mutationFn: async (data: TemplateForm) => {
      if (editTemplate) {
        const { error } = await supabase.from("email_templates").update(data).eq("id", editTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("email_templates").insert({ ...data, organization_id: orgId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates", orgId] });
      toast({ title: editTemplate ? "Template updated" : "Template created" });
      setAddOpen(false);
      setEditTemplate(null);
      form.reset();
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("email_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates", orgId] });
      toast({ title: "Template deleted" });
    },
  });

  const createDefaults = async () => {
    await supabase.from("email_templates").insert(DEFAULT_TEMPLATES.map((t) => ({ ...t, organization_id: orgId })));
    queryClient.invalidateQueries({ queryKey: ["email-templates", orgId] });
    toast({ title: "Default templates created" });
  };

  const openEdit = (t: typeof templates extends Array<infer U> ? U : never) => {
    form.reset({ name: t.name, subject: t.subject, body: t.body, template_type: t.template_type || "custom" });
    setEditTemplate({ id: t.id, name: t.name, subject: t.subject, body: t.body, template_type: t.template_type || "custom" });
    setAddOpen(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E6EDF3]">Email Templates</h1>
          <p className="text-[#8B949E] text-sm mt-1">{templates?.length || 0} templates</p>
        </div>
        <div className="flex gap-2">
          {templates?.length === 0 && (
            <Button onClick={createDefaults} variant="outline" size="sm" className="border-[#30363D] text-[#8B949E] hover:border-[#00E5A0] hover:text-[#00E5A0]">
              Load defaults
            </Button>
          )}
          <Button
            onClick={() => { form.reset(); setEditTemplate(null); setAddOpen(true); }}
            className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold"
            size="sm"
            data-testid="button-add-template"
          >
            <Plus className="h-4 w-4 mr-1" />
            New template
          </Button>
        </div>
      </div>

      {/* Variable reference */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 mb-5">
        <p className="text-xs font-medium text-[#8B949E] mb-2">Available variables</p>
        <div className="flex flex-wrap gap-2">
          {["{{client_name}}", "{{insurance_company}}", "{{line_of_insurance}}", "{{policy_number}}", "{{renewal_date}}", "{{agent_name}}", "{{agent_phone}}", "{{agency_name}}"].map((v) => (
            <code key={v} className="text-xs px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[#00B4D8] font-mono">{v}</code>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 bg-[#161B22] rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates?.length === 0 && (
            <div className="md:col-span-2 bg-[#161B22] border border-[#30363D] rounded-xl p-10 text-center">
              <Mail className="h-8 w-8 text-[#484F58] mx-auto mb-2" />
              <p className="text-[#484F58] text-sm mb-3">No templates yet</p>
              <Button onClick={createDefaults} size="sm" className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold">
                Load default templates
              </Button>
            </div>
          )}
          {templates?.map((t) => (
            <div key={t.id} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 hover:border-[#484F58] transition-all group" data-testid={`template-${t.id}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <Badge className="text-xs mb-2" style={{ background: `${TYPE_COLORS[t.template_type || "custom"]}15`, color: TYPE_COLORS[t.template_type || "custom"], border: "none" }}>
                    {TYPE_LABELS[t.template_type || "custom"]}
                  </Badge>
                  <div className="font-medium text-[#E6EDF3] text-sm truncate">{t.name}</div>
                  <div className="text-xs text-[#8B949E] mt-0.5 truncate">{t.subject}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setPreviewTemplate({ name: t.name, subject: t.subject, body: t.body, template_type: t.template_type || "custom" })}
                    title="Preview email"
                    className="w-7 h-7 rounded flex items-center justify-center text-[#8B949E] hover:bg-[#21262D] hover:text-[#00B4D8] transition-colors"
                    data-testid={`preview-template-${t.id}`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    title="Edit template"
                    className="w-7 h-7 rounded flex items-center justify-center text-[#8B949E] hover:bg-[#21262D] hover:text-[#E6EDF3] transition-colors"
                    data-testid={`edit-template-${t.id}`}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTemplate.mutate(t.id)}
                    title="Delete template"
                    className="w-7 h-7 rounded flex items-center justify-center text-[#8B949E] hover:bg-[#F8514915] hover:text-[#F85149] transition-colors"
                    data-testid={`delete-template-${t.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-[#484F58] mt-2 line-clamp-2 font-mono leading-relaxed">
                {t.body.slice(0, 120)}…
              </div>
              <div className="mt-3 pt-3 border-t border-[#21262D]">
                <button
                  onClick={() => setPreviewTemplate({ name: t.name, subject: t.subject, body: t.body, template_type: t.template_type || "custom" })}
                  className="text-xs text-[#484F58] hover:text-[#00B4D8] transition-colors flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Preview rendered email
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Template Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setEditTemplate(null); }}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#E6EDF3]">{editTemplate ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit((d) => saveTemplate.mutate(d))} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Template name</Label>
                <Input {...form.register("name")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" data-testid="input-template-name" />
              </div>
              <div>
                <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Type</Label>
                <Select defaultValue={editTemplate?.template_type || "custom"} onValueChange={(v) => form.setValue("template_type", v)}>
                  <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1C2128] border-[#30363D]">
                    {TEMPLATE_TYPES.map((t) => <SelectItem key={t} value={t} className="text-[#E6EDF3] focus:bg-[#21262D]">{TYPE_LABELS[t]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Subject line</Label>
              <Input {...form.register("subject")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" data-testid="input-template-subject" />
            </div>
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">
                Body <span className="text-[#484F58]">(use variables above)</span>
              </Label>
              <Textarea {...form.register("body")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] font-mono text-xs min-h-[160px]" data-testid="textarea-template-body" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1 border-[#30363D] text-[#E6EDF3] h-10">Cancel</Button>
              <Button type="submit" disabled={saveTemplate.isPending} className="flex-1 bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-10" data-testid="button-save-template">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rich Email Preview Dialog */}
      <EmailPreviewDialog
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        agentName={profile?.full_name || ""}
        agentPhone={profile?.phone || ""}
        agencyName={profile?.agency_name || ""}
        agentEmail={user?.email || ""}
      />
    </div>
  );
}
