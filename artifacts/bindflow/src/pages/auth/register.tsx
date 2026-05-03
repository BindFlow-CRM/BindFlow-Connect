import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Gift } from "lucide-react";

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const step1Schema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
const step2Schema = z.object({
  agency_name: z.string().min(2, "Agency name is required"),
  state: z.string().min(1, "State is required"),
  license_number: z.string().optional(),
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const refOrgId = params.get("ref");
  const hasReferral = Boolean(refOrgId);

  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form1 = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: { full_name: "", email: "", password: "" },
  });

  const form2 = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: { agency_name: "", state: "", license_number: "" },
  });

  const onStep1 = (data: Step1Form) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2 = async (data: Step2Form) => {
    if (!step1Data) return;
    setLoading(true);
    try {
      // 1. Create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: { data: { full_name: step1Data.full_name } },
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Failed to create user");

      // 2. Create organization — store referred_by if a ref was present in the URL
      const slug = data.agency_name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") + "-" + Date.now();
      const orgInsert: Record<string, unknown> = {
        name: data.agency_name,
        slug,
        owner_id: userId,
        referred_by: refOrgId,
      };

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert(orgInsert)
        .select()
        .single();
      if (orgError) throw orgError;

      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + (hasReferral ? 28 : 14));
      await supabase
        .from("organizations")
        .update({ trial_ends_at: trialEndsAt.toISOString() })
        .eq("id", org.id);

      // 3. Create profile
      await supabase.from("profiles").insert({
        id: userId,
        full_name: step1Data.full_name,
        agency_name: data.agency_name,
        state: data.state,
        license_number: data.license_number || null,
        current_organization_id: org.id,
      });

      // 4. Add as owner member
      await supabase.from("organization_members").insert({
        organization_id: org.id,
        user_id: userId,
        role: "owner",
        status: "active",
      });

      // 5. Create default pipeline stages
      const stages = [
        { name: "Lead", color: "#8B949E", position: 1, is_default: true, organization_id: org.id },
        { name: "Quoted", color: "#00B4D8", position: 2, is_default: true, organization_id: org.id },
        { name: "Follow-up", color: "#F0B429", position: 3, is_default: true, organization_id: org.id },
        { name: "Closed Won", color: "#00E5A0", position: 4, is_default: true, organization_id: org.id },
        { name: "Active Policy", color: "#00C98A", position: 5, is_default: true, organization_id: org.id },
        { name: "Renewal Due", color: "#F85149", position: 6, is_default: true, organization_id: org.id },
      ];
      await supabase.from("pipeline_stages").insert(stages);

      setStep(3);
      setTimeout(() => setLocation("/dashboard"), 2000);
    } catch (err: unknown) {
      toast({
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="dark min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-[#00E5A0] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#E6EDF3] mb-2">Account created!</h2>
          <p className="text-[#8B949E]">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="https://mprcqzsffqdvowogaedf.supabase.co/storage/v1/object/sign/assets/logocuadrado-jpg512.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMjI2YmI4ZS0yNzJjLTRkNjktYmZkNy0zOTc3OTU5Yjk2NTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbG9nb2N1YWRyYWRvLWpwZzUxMi5qcGVnIiwiaWF0IjoxNzc3NzIyMjExLCJleHAiOjMzMTMxMzcyMjIxMX0.LS3aj-1COT7OQ0l7m4NEGc-PFwFQx8-2WyxYACa0Yk8"
            alt="BindFlow"
            className="w-14 h-14 rounded-xl mx-auto mb-4 object-cover"
          />
          <h1 className="text-2xl font-bold text-[#E6EDF3]">
            {step === 1 ? "Create your account" : "Set up your agency"}
          </h1>
          <p className="text-[#8B949E] text-sm mt-1">
            Step {step} of 2 — {step === 1 ? "Your credentials" : "Agency details"}
          </p>
        </div>

        {/* Referral notice */}
        {refOrgId && (
          <div className="flex items-center gap-2.5 bg-[#00E5A015] border border-[#00E5A030] rounded-xl px-4 py-3 mb-4">
            <Gift className="h-4 w-4 text-[#00E5A0] flex-shrink-0" />
            <p className="text-xs text-[#00E5A0]">
              You were referred by a BindFlow agent — your referrer will earn a free month when you subscribe!
            </p>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-[#00E5A0]" : "bg-[#30363D]"}`} />
          ))}
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8">
          {step === 1 && (
            <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4">
              <div>
                <Label className="text-[#E6EDF3] text-sm mb-1.5 block">Full name</Label>
                <Input {...form1.register("full_name")} placeholder="John Smith" className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-11" data-testid="input-full-name" />
                {form1.formState.errors.full_name && <p className="text-[#F85149] text-xs mt-1">{form1.formState.errors.full_name.message}</p>}
              </div>
              <div>
                <Label className="text-[#E6EDF3] text-sm mb-1.5 block">Email</Label>
                <Input {...form1.register("email")} type="email" placeholder="agent@agency.com" className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-11" data-testid="input-email" />
                {form1.formState.errors.email && <p className="text-[#F85149] text-xs mt-1">{form1.formState.errors.email.message}</p>}
              </div>
              <div>
                <Label className="text-[#E6EDF3] text-sm mb-1.5 block">Password</Label>
                <Input {...form1.register("password")} type="password" placeholder="Min. 8 characters" className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-11" data-testid="input-password" />
                {form1.formState.errors.password && <p className="text-[#F85149] text-xs mt-1">{form1.formState.errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-11 mt-2" data-testid="button-next">
                Continue
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-4">
              <div>
                <Label className="text-[#E6EDF3] text-sm mb-1.5 block">Agency name</Label>
                <Input {...form2.register("agency_name")} placeholder="Smith Insurance Agency" className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-11" data-testid="input-agency-name" />
                {form2.formState.errors.agency_name && <p className="text-[#F85149] text-xs mt-1">{form2.formState.errors.agency_name.message}</p>}
              </div>
              <div>
                <Label className="text-[#E6EDF3] text-sm mb-1.5 block">State</Label>
                <Select onValueChange={(v) => form2.setValue("state", v)}>
                  <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-11" data-testid="select-state">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C2128] border-[#30363D]">
                    {US_STATES.map((s) => <SelectItem key={s} value={s} className="text-[#E6EDF3] focus:bg-[#21262D]">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form2.formState.errors.state && <p className="text-[#F85149] text-xs mt-1">{form2.formState.errors.state.message}</p>}
              </div>
              <div>
                <Label className="text-[#E6EDF3] text-sm mb-1.5 block">License number <span className="text-[#484F58]">(optional)</span></Label>
                <Input {...form2.register("license_number")} placeholder="TX-1234567" className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-11" data-testid="input-license" />
              </div>
              <div className="flex gap-3 mt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 border-[#30363D] text-[#E6EDF3] h-11">
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-11" data-testid="button-create-account">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create account
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[#8B949E] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#00E5A0] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
