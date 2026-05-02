import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Save, Users, CreditCard, Download, Loader2, FileText } from "lucide-react";
import { toCsv, downloadCsv, CONTACT_EXPORT_COLUMNS, POLICY_EXPORT_COLUMNS } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const profileSchema = z.object({
  full_name: z.string().min(2, "Name required"),
  phone: z.string().optional(),
  agency_name: z.string().optional(),
  state: z.string().optional(),
  license_number: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { profile, user, organization, refreshProfile } = useAuth();
  const { toast } = useToast();
  const orgId = organization?.id;
  const [exportingContacts, setExportingContacts] = useState(false);
  const [exportingPolicies, setExportingPolicies] = useState(false);

  const handleExportContacts = async () => {
    if (!orgId) return;
    setExportingContacts(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("organization_id", orgId)
        .order("full_name");
      if (error) throw error;
      const csv = toCsv(data ?? [], CONTACT_EXPORT_COLUMNS);
      downloadCsv(csv, `bindflow-contacts-${new Date().toISOString().slice(0, 10)}.csv`);
      toast({ title: `Exported ${data?.length ?? 0} contacts` });
    } catch (err: unknown) {
      toast({ title: "Export failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setExportingContacts(false);
    }
  };

  const handleExportPolicies = async () => {
    if (!orgId) return;
    setExportingPolicies(true);
    try {
      const { data, error } = await supabase
        .from("policies")
        .select("*, contacts(full_name)")
        .eq("organization_id", orgId)
        .order("renewal_date", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []).map((p) => ({
        contact_name: (p.contacts as { full_name: string } | null)?.full_name ?? "",
        insurance_company: p.insurance_company ?? "",
        line_of_insurance: p.line_of_insurance ?? "",
        policy_number: p.policy_number ?? "",
        annual_premium: p.annual_premium ?? "",
        policy_status: p.policy_status ?? "",
        start_date: p.start_date ?? "",
        renewal_date: p.renewal_date ?? "",
        notes: p.notes ?? "",
        created_at: p.created_at ?? "",
      }));
      const csv = toCsv(rows, POLICY_EXPORT_COLUMNS);
      downloadCsv(csv, `bindflow-policies-${new Date().toISOString().slice(0, 10)}.csv`);
      toast({ title: `Exported ${rows.length} policies` });
    } catch (err: unknown) {
      toast({ title: "Export failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setExportingPolicies(false);
    }
  };

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      agency_name: profile?.agency_name || "",
      state: profile?.state || "",
      license_number: profile?.license_number || "",
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const { error } = await supabase.from("profiles").update({
        full_name: data.full_name,
        phone: data.phone || null,
        agency_name: data.agency_name || null,
        state: data.state || null,
        license_number: data.license_number || null,
        updated_at: new Date().toISOString(),
      }).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      refreshProfile();
      toast({ title: "Profile updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#E6EDF3] mb-2">Settings</h1>
      <p className="text-[#8B949E] text-sm mb-8">Manage your profile and account settings</p>

      {/* Quick links */}
      <div className="flex gap-3 mb-8">
        <Link href="/settings/team">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#30363D] text-sm text-[#8B949E] hover:border-[#00E5A0] hover:text-[#00E5A0] transition-colors">
            <Users className="h-4 w-4" />
            Team settings
          </button>
        </Link>
        <Link href="/settings/billing">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#30363D] text-sm text-[#8B949E] hover:border-[#00E5A0] hover:text-[#00E5A0] transition-colors">
            <CreditCard className="h-4 w-4" />
            Billing
          </button>
        </Link>
      </div>

      {/* Data Export */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-4 w-4 text-[#8B949E]" />
          <h2 className="text-base font-semibold text-[#E6EDF3]">Data Export</h2>
        </div>
        <p className="text-sm text-[#8B949E] mb-5">Download your data as CSV files — compatible with Excel, Google Sheets, and carrier management systems.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
            <div className="text-sm font-medium text-[#E6EDF3] mb-1">Contacts</div>
            <div className="text-xs text-[#8B949E] mb-4">Name, email, phone, city, state, lead source, status, notes</div>
            <Button
              onClick={handleExportContacts}
              disabled={exportingContacts}
              size="sm"
              variant="outline"
              className="w-full border-[#30363D] text-[#E6EDF3] hover:border-[#00E5A0] hover:text-[#00E5A0] h-9"
              data-testid="button-export-contacts"
            >
              {exportingContacts
                ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Exporting...</>
                : <><Download className="h-3.5 w-3.5 mr-2" />Export contacts.csv</>}
            </Button>
          </div>
          <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
            <div className="text-sm font-medium text-[#E6EDF3] mb-1">Policies</div>
            <div className="text-xs text-[#8B949E] mb-4">Client name, carrier, line, policy #, premium, status, renewal date</div>
            <Button
              onClick={handleExportPolicies}
              disabled={exportingPolicies}
              size="sm"
              variant="outline"
              className="w-full border-[#30363D] text-[#E6EDF3] hover:border-[#00E5A0] hover:text-[#00E5A0] h-9"
              data-testid="button-export-policies"
            >
              {exportingPolicies
                ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Exporting...</>
                : <><Download className="h-3.5 w-3.5 mr-2" />Export policies.csv</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
        <h2 className="text-base font-semibold text-[#E6EDF3] mb-5">Profile</h2>
        <form onSubmit={form.handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4">
          <div>
            <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Full name</Label>
            <Input {...form.register("full_name")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" data-testid="input-profile-name" />
            {form.formState.errors.full_name && <p className="text-[#F85149] text-xs mt-1">{form.formState.errors.full_name.message}</p>}
          </div>
          <div>
            <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Email</Label>
            <Input value={user?.email || ""} disabled className="bg-[#0D1117] border-[#30363D] text-[#484F58] h-10 cursor-not-allowed" />
            <p className="text-xs text-[#484F58] mt-1">Email cannot be changed here</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Phone</Label>
              <Input {...form.register("phone")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" />
            </div>
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">State</Label>
              <Select defaultValue={profile?.state || ""} onValueChange={(v) => form.setValue("state", v)}>
                <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10"><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent className="bg-[#1C2128] border-[#30363D]">
                  {US_STATES.map((s) => <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D]">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Agency name</Label>
              <Input {...form.register("agency_name")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" />
            </div>
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">License number</Label>
              <Input {...form.register("license_number")} className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" />
            </div>
          </div>
          <div className="pt-2">
            <Button type="submit" disabled={updateProfile.isPending} className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-10" data-testid="button-save-profile">
              <Save className="h-4 w-4 mr-2" />
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
