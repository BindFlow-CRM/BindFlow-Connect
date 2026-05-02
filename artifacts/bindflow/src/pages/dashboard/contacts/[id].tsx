import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, MessageCircle, Phone, Mail, MapPin, Tag, Plus, FileText, Phone as PhoneIcon, CalendarDays } from "lucide-react";
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

const LINES = ["auto","home","life","health","commercial","medicare","other"];
const ACTIVITY_ICONS: Record<string, typeof FileText> = {
  note: FileText,
  call: PhoneIcon,
  email: Mail,
  meeting: CalendarDays,
};

interface ContactDetailProps { id: string; }

export default function ContactDetailPage({ id }: ContactDetailProps) {
  const [, setLocation] = useLocation();
  const { organization, user } = useAuth();
  const orgId = organization?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [addPolicyOpen, setAddPolicyOpen] = useState(false);

  const noteForm = useForm<NoteForm>({ resolver: zodResolver(noteSchema), defaultValues: { type: "note", content: "" } });
  const policyForm = useForm<PolicyForm>({ resolver: zodResolver(policySchema), defaultValues: { insurance_company: "", line_of_insurance: "", policy_status: "active" } });

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
      return data;
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

  const addNote = useMutation({
    mutationFn: async (data: NoteForm) => {
      const { error } = await supabase.from("activities").insert({
        contact_id: id, organization_id: orgId, created_by: user?.id,
        type: data.type, content: data.content, title: data.type.charAt(0).toUpperCase() + data.type.slice(1),
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

  const POLICY_STATUS_COLOR: Record<string, string> = {
    active: "#00E5A0", lapsed: "#F85149", cancelled: "#F85149", pending: "#F0B429", quoted: "#00B4D8"
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
              <div className="flex items-center gap-3 mt-1 text-sm text-[#8B949E]">
                {contact.email && <div className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{contact.email}</div>}
                {contact.phone && <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{contact.phone}</div>}
                {(contact.city || contact.state) && <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[contact.city, contact.state].filter(Boolean).join(", ")}</div>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {contact.lead_source && (
              <Badge className="bg-[#21262D] text-[#8B949E] border-[#30363D] text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {contact.lead_source}
              </Badge>
            )}
            {contact.phone && (
              <a
                href={`https://wa.me/1${contact.phone.replace(/\D/g, "")}?text=Hi ${contact.full_name}!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#25D36615] text-[#25D366] hover:bg-[#25D36625] transition-colors text-sm font-medium"
                data-testid="button-whatsapp"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
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
              <div key={p.id} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex items-center justify-between" data-testid={`policy-${p.id}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
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
              return (
                <div key={a.id} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex items-start gap-3" data-testid={`activity-${a.id}`}>
                  <div className="w-7 h-7 rounded-full bg-[#21262D] flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-[#8B949E]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#8B949E] capitalize">{a.type}</span>
                      <span className="text-xs text-[#484F58]">{a.created_at ? format(parseISO(a.created_at), "MMM d, h:mm a") : ""}</span>
                    </div>
                    <div className="text-sm text-[#E6EDF3] mt-0.5">{a.content}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Note Dialog */}
      <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3]">
          <DialogHeader><DialogTitle className="text-[#E6EDF3]">Log Activity</DialogTitle></DialogHeader>
          <form onSubmit={noteForm.handleSubmit((d) => addNote.mutate(d))} className="space-y-3 mt-2">
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Type</Label>
              <Select defaultValue="note" onValueChange={(v) => noteForm.setValue("type", v as NoteForm["type"])}>
                <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1C2128] border-[#30363D]">
                  {["note","call","email","meeting","whatsapp"].map((t) => <SelectItem key={t} value={t} className="text-[#E6EDF3] focus:bg-[#21262D] capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Notes</Label>
              <Textarea {...noteForm.register("content")} placeholder="What happened?" className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] min-h-[80px]" data-testid="textarea-activity-content" />
              {noteForm.formState.errors.content && <p className="text-[#F85149] text-xs mt-1">{noteForm.formState.errors.content.message}</p>}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setAddNoteOpen(false)} className="flex-1 border-[#30363D] text-[#E6EDF3] h-10">Cancel</Button>
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
                    {["active","quoted","pending","lapsed","cancelled"].map((s) => <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D] capitalize">{s}</SelectItem>)}
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
    </div>
  );
}
