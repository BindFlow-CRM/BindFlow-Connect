import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const logoUrl =
  "https://fsmzsskfsonlrwfcvkji.supabase.co/storage/v1/object/sign/assets/Logo_BindFlow_redondo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNTRhMGNiOC0zZTljLTQzODktYWQ1OS05YjZjNWY2NGQ2MDEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvTG9nb19CaW5kRmxvd19yZWRvbmRvLnBuZyIsImlhdCI6MTc3NzgwMTg3NSwiZXhwIjozMzMxMzgwMTg3NX0.VC-tMEAn6bHmLlumrfwXz4tf6Y-6xZ0DX9sG06eyFlE";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      setLocation("/app/dashboard");
    } catch (err: unknown) {
      toast({
        title: "Sign in failed",
        description: err instanceof Error ? err.message : "Invalid email or password",
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
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-[#30363D] px-4 py-2 text-sm font-medium text-[#E6EDF3] hover:border-[#00E5A0] hover:text-[#00E5A0] transition-colors"
              data-testid="button-back-home"
            >
              Back Home
            </Link>
          </div>
          <img src={logoUrl} alt="BindFlow" className="h-24 w-64 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#E6EDF3]">Welcome back</h1>
          <p className="text-[#8B949E] text-sm mt-1">Sign in to your BindFlow account</p>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-[#E6EDF3] text-sm mb-1.5 block">Email</Label>
              <Input
                {...form.register("email")}
                type="email"
                placeholder="agent@agency.com"
                className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-11"
                data-testid="input-email"
              />
              {form.formState.errors.email && (
                <p className="text-[#F85149] text-xs mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label className="text-[#E6EDF3] text-sm">Password</Label>
                <Link href="/app/forgot-password" className="text-xs text-[#00B4D8] hover:text-[#00E5A0] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  {...form.register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-11 pr-10"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#E6EDF3]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-[#F85149] text-xs mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-11 mt-2"
              data-testid="button-submit"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8B949E] mt-6">
          Don't have an account?{" "}
          <Link href="/app/register" className="text-[#00E5A0] hover:underline font-medium">
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
