import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";

const schema = z.object({ email: z.string().email("Invalid email") });
type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="https://mprcqzsffqdvowogaedf.supabase.co/storage/v1/object/sign/assets/logocuadrado-jpg512.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMjI2YmI4ZS0yNzJjLTRkNjktYmZkNy0zOTc3OTU5Yjk2NTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbG9nb2N1YWRyYWRvLWpwZzUxMi5qcGVnIiwiaWF0IjoxNzc3NzIyMjExLCJleHAiOjMzMTMxMzcyMjIxMX0.LS3aj-1COT7OQ0l7m4NEGc-PFwFQx8-2WyxYACa0Yk8"
            alt="BindFlow"
            className="w-14 h-14 rounded-xl mx-auto mb-4 object-cover"
          />
          <h1 className="text-2xl font-bold text-[#E6EDF3]">Reset your password</h1>
          <p className="text-[#8B949E] text-sm mt-1">We'll send you a reset link by email</p>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-[#00E5A0] mx-auto mb-4" />
              <h3 className="font-semibold text-[#E6EDF3] mb-2">Check your inbox</h3>
              <p className="text-[#8B949E] text-sm">We sent a password reset link to your email address.</p>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label className="text-[#E6EDF3] text-sm mb-1.5 block">Email address</Label>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="agent@agency.com"
                  className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-11"
                  data-testid="input-email"
                />
                {form.formState.errors.email && <p className="text-[#F85149] text-xs mt-1">{form.formState.errors.email.message}</p>}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-11"
                data-testid="button-reset"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send reset link
              </Button>
            </form>
          )}
        </div>

        <Link href="/app/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
