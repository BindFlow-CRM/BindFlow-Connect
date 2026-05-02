import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, MessageCircle, ChevronRight, User, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const contactSchema = z.object({
  full_name: z.string().min(2, "Name required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  lead_source: z.string().optional(),
  notes: z.string().optional(),
});
type ContactForm = z.infer<typeof contactSchema>;

const LEAD_SOURCES = ["referral","web","cold_call","social","angi","google","other"];
const LEAD_SOURCE_LABELS: Record<string, string> = {
  referral: "Referral", web: "Web", cold_call: "Cold Call", social: "Social", angi: "Angi", google: "Google", other: "Other"
};

export default function ContactsPage() {
  const { organization, user } = useAuth();
  const orgId = organization?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { full_name: "", email: "", phone: "", state: "", city: "", lead_source: "", notes: "" },
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*, policies(count)")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const createContact = useMutation({
    mutationFn: async (data: ContactForm) => {
      const { error } = await supabase.from("contacts").insert({
        ...data,
        organization_id: orgId,
        created_by: user?.id,
        email: data.email || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", orgId] });
      toast({ title: "Contact added successfully" });
      setAddOpen(false);
      form.reset();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = contacts?.filter((c) => {
    const matchSearch = c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search);
    const matchSource = sourceFilter === "all" || c.lead_source === sourceFilter;
    return matchSearch && matchSource;
  }) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E6EDF3]">Contacts</h1>
          <p className="text-[#8B949E] text-sm mt-1">{contacts?.length || 0} total clients</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold" data-testid="button-add-contact">
          <Plus className="h-4 w-4 mr-1" />
          Add contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#484F58]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="pl-9 bg-[#161B22] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-9"
            data-testid="input-search-contacts"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-40 bg-[#161B22] border-[#30363D] text-[#E6EDF3] h-9" data-testid="select-source-filter">
            <Filter className="h-3.5 w-3.5 mr-2 text-[#8B949E]" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1C2128] border-[#30363D]">
            <SelectItem value="all" className="text-[#E6EDF3] focus:bg-[#21262D]">All sources</SelectItem>
            {LEAD_SOURCES.map((s) => <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D]">{LEAD_SOURCE_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363D] text-xs text-[#8B949E] font-medium">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Phone</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">State</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Source</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Added</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363D]">
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3"><Skeleton className="h-4 w-32 bg-[#21262D]" /></td>
                <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-24 bg-[#21262D]" /></td>
                <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-8 bg-[#21262D]" /></td>
                <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-16 bg-[#21262D]" /></td>
                <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-20 bg-[#21262D]" /></td>
                <td className="px-4 py-3"></td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#484F58]">
                  {search || sourceFilter !== "all" ? "No contacts match your filters" : "No contacts yet. Add your first client."}
                </td>
              </tr>
            )}
            {filtered.map((contact) => (
              <tr key={contact.id} className="hover:bg-[#21262D] transition-colors" data-testid={`row-contact-${contact.id}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00E5A015] flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-[#00E5A0]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#E6EDF3]">{contact.full_name}</div>
                      {contact.email && <div className="text-xs text-[#8B949E]">{contact.email}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-[#8B949E]">{contact.phone || "—"}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-[#8B949E]">{contact.state || "—"}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {contact.lead_source ? (
                    <Badge className="text-xs bg-[#21262D] text-[#8B949E] border-[#30363D]">{LEAD_SOURCE_LABELS[contact.lead_source] || contact.lead_source}</Badge>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-[#484F58]">
                  {contact.created_at ? format(parseISO(contact.created_at), "MMM d, yyyy") : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {contact.phone && (
                      <a
                        href={`https://wa.me/1${contact.phone.replace(/\D/g, "")}?text=Hi ${contact.full_name}!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#25D366] hover:bg-[#25D36615] transition-colors"
                        data-testid={`whatsapp-contact-${contact.id}`}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <Link href={`/contacts/${contact.id}`}>
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8B949E] hover:bg-[#21262D] hover:text-[#E6EDF3] transition-colors" data-testid={`link-contact-${contact.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#E6EDF3]">Add Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit((d) => createContact.mutate(d))} className="space-y-3 mt-2">
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Full name *</Label>
              <Input {...form.register("full_name")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-10" data-testid="input-contact-name" />
              {form.formState.errors.full_name && <p className="text-[#F85149] text-xs mt-1">{form.formState.errors.full_name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Email</Label>
                <Input {...form.register("email")} type="email" className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-10" data-testid="input-contact-email" />
              </div>
              <div>
                <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Phone</Label>
                <Input {...form.register("phone")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-10" data-testid="input-contact-phone" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-[#E6EDF3] mb-1.5 block">City</Label>
                <Input {...form.register("city")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-10" />
              </div>
              <div>
                <Label className="text-sm text-[#E6EDF3] mb-1.5 block">State</Label>
                <Select onValueChange={(v) => form.setValue("state", v)}>
                  <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C2128] border-[#30363D]">
                    {US_STATES.map((s) => <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D]">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Lead source</Label>
              <Select onValueChange={(v) => form.setValue("lead_source", v)}>
                <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" data-testid="select-lead-source">
                  <SelectValue placeholder="How did they find you?" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C2128] border-[#30363D]">
                  {LEAD_SOURCES.map((s) => <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D]">{LEAD_SOURCE_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Notes</Label>
              <Input {...form.register("notes")} placeholder="Any initial notes..." className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-10" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1 border-[#30363D] text-[#E6EDF3] h-10">Cancel</Button>
              <Button type="submit" disabled={createContact.isPending} className="flex-1 bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-10" data-testid="button-save-contact">
                Add Contact
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
