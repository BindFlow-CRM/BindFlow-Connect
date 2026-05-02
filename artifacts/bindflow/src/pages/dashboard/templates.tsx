import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Mail, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const templateSchema = z.object({
  name: z.string().min(1, "Name required"),
  subject: z.string().min(1, "Subject required"),
  body: z.string().min(1, "Body required"),
  template_type: z.string().default("custom"),
});
type TemplateForm = z.infer<typeof templateSchema>;

const TEMPLATE_TYPES = ["renewal_90","renewal_60","renewal_30","follow_up","custom"];
const TYPE_LABELS: Record<string, string> = {
  renewal_90: "Renewal 90d", renewal_60: "Renewal 60d", renewal_30: "Renewal 30d", follow_up: "Follow-up", custom: "Custom"
};
const TYPE_COLORS: Record<string, string> = {
  renewal_90: "#00B4D8", renewal_60: "#F0B429", renewal_30: "#F85149", follow_up: "#00E5A0", custom: "#8B949E"
};

const DEFAULT_TEMPLATES = [
  { name: "90-Day Renewal Notice", subject: "Your policy renews in 90 days", body: "Hi {{client_name}},\n\nI wanted to give you a heads-up that your {{line_of_insurance}} policy with {{insurance_company}} is coming up for renewal in about 90 days.\n\nWould you like to schedule a quick call to review your coverage?\n\nBest,\n{{agent_name}}", template_type: "renewal_90" },
  { name: "30-Day Renewal Urgent", subject: "Action needed: Policy renews in 30 days", body: "Hi {{client_name}},\n\nYour {{line_of_insurance}} policy renews in just 30 days. Let's connect soon to make sure everything is in order.\n\nBest,\n{{agent_name}}", template_type: "renewal_30" },
  { name: "General Follow-up", subject: "Following up — {{client_name}}", body: "Hi {{client_name}},\n\nI wanted to follow up on our recent conversation about your insurance needs.\n\nLet me know if you have any questions!\n\nBest,\n{{agent_name}}", template_type: "follow_up" },
];

export default function TemplatesPage() {
  const { organization } = useAuth();
  const orgId = organization?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<{ id: string } & TemplateForm | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<{ name: string; body: string } | null>(null);

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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["email-templates", orgId] }); toast({ title: "Template deleted" }); },
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
          <Button onClick={() => { form.reset(); setEditTemplate(null); setAddOpen(true); }} className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold" size="sm" data-testid="button-add-template">
            <Plus className="h-4 w-4 mr-1" />
            New template
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 bg-[#161B22] rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates?.length === 0 && (
            <div className="md:col-span-2 bg-[#161B22] border border-[#30363D] rounded-xl p-10 text-center">
              <Mail className="h-8 w-8 text-[#484F58] mx-auto mb-2" />
              <p className="text-[#484F58] text-sm mb-3">No templates yet</p>
              <Button onClick={createDefaults} size="sm" className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold">Load default templates</Button>
            </div>
          )}
          {templates?.map((t) => (
            <div key={t.id} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 hover:border-[#30363D80] transition-all" data-testid={`template-${t.id}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Badge className="text-xs mb-2" style={{ background: `${TYPE_COLORS[t.template_type || "custom"]}15`, color: TYPE_COLORS[t.template_type || "custom"], border: "none" }}>
                    {TYPE_LABELS[t.template_type || "custom"]}
                  </Badge>
                  <div className="font-medium text-[#E6EDF3] text-sm">{t.name}</div>
                  <div className="text-xs text-[#8B949E] mt-0.5 truncate">{t.subject}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setPreviewTemplate({ name: t.name, body: t.body })} className="w-7 h-7 rounded flex items-center justify-center text-[#8B949E] hover:bg-[#21262D] hover:text-[#E6EDF3] transition-colors" data-testid={`preview-template-${t.id}`}>
                    <Mail className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => openEdit(t)} className="w-7 h-7 rounded flex items-center justify-center text-[#8B949E] hover:bg-[#21262D] hover:text-[#E6EDF3] transition-colors" data-testid={`edit-template-${t.id}`}>
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteTemplate.mutate(t.id)} className="w-7 h-7 rounded flex items-center justify-center text-[#8B949E] hover:bg-[#F8514915] hover:text-[#F85149] transition-colors" data-testid={`delete-template-${t.id}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-[#484F58] mt-2 line-clamp-2 font-mono">{t.body.slice(0, 100)}...</div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Template Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setEditTemplate(null); }}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-lg">
          <DialogHeader><DialogTitle className="text-[#E6EDF3]">{editTemplate ? "Edit Template" : "New Template"}</DialogTitle></DialogHeader>
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
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Body <span className="text-[#484F58]">(use &#123;&#123;client_name&#125;&#125;, &#123;&#123;agent_name&#125;&#125;, etc.)</span></Label>
              <Textarea {...form.register("body")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] font-mono text-xs min-h-[140px]" data-testid="textarea-template-body" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1 border-[#30363D] text-[#E6EDF3] h-10">Cancel</Button>
              <Button type="submit" disabled={saveTemplate.isPending} className="flex-1 bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-10" data-testid="button-save-template">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(o) => !o && setPreviewTemplate(null)}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-lg">
          <DialogHeader><DialogTitle className="text-[#E6EDF3]">{previewTemplate?.name}</DialogTitle></DialogHeader>
          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 mt-2">
            <pre className="text-sm text-[#E6EDF3] whitespace-pre-wrap font-sans">{previewTemplate?.body}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
