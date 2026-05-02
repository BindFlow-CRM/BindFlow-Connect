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
      setLocation("/dashboard");
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

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <div className="dark min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://mprcqzsffqdvowogaedf.supabase.co/storage/v1/object/sign/assets/logocuadrado-jpg512.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMjI2YmI4ZS0yNzJjLTRkNjktYmZkNy0zOTc3OTU5Yjk2NTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbG9nb2N1YWRyYWRvLWpwZzUxMi5qcGVnIiwiaWF0IjoxNzc3NzIyMjExLCJleHAiOjMzMTMxMzcyMjIxMX0.LS3aj-1COT7OQ0l7m4NEGc-PFwFQx8-2WyxYACa0Yk8"
            alt="BindFlow"
            className="w-14 h-14 rounded-xl mx-auto mb-4 object-cover"
          />
          <h1 className="text-2xl font-bold text-[#E6EDF3]">Welcome back</h1>
          <p className="text-[#8B949E] text-sm mt-1">Sign in to your BindFlow account</p>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8">
          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-[#30363D] text-[#E6EDF3] hover:border-[#00E5A0] mb-6 h-11"
            onClick={signInWithGoogle}
            data-testid="button-google-signin"
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#30363D]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#161B22] px-3 text-[#8B949E]">or continue with email</span>
            </div>
          </div>

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
                <Link href="/forgot-password" className="text-xs text-[#00B4D8] hover:text-[#00E5A0] transition-colors">
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
          <Link href="/register" className="text-[#00E5A0] hover:underline font-medium">
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
