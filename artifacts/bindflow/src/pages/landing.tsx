import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Bell,
  Check,
  Crown,
  HeadphonesIcon,
  Loader2,
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const logoUrl =
  "https://fsmzsskfsonlrwfcvkji.supabase.co/storage/v1/object/sign/assets/Logo_BindFlow_redondo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNTRhMGNiOC0zZTljLTQzODktYWQ1OS05YjZjNWY2NGQ2MDEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvTG9nb19CaW5kRmxvd19yZWRvbmRvLnBuZyIsImlhdCI6MTc3NzgwMTg3NSwiZXhwIjozMzMxMzgwMTg3NX0.VC-tMEAn6bHmLlumrfwXz4tf6Y-6xZ0DX9sG06eyFlE";

const ISSUE_TYPES = [
  "Cannot log in",
  "Forgot password / no reset email",
  "Account locked or suspended",
  "Two-factor authentication issue",
  "Page not loading or blank screen",
  "Slow performance or timeouts",
  "Feature not working as expected",
  "Data not saving or disappearing",
  "Billing or subscription problem",
  "Referral link not working",
  "Email notifications not arriving",
  "Invitation or team access issue",
  "Export or import problem",
  "Integration or API issue",
  "Other",
];

const featureCards = [
  { icon: TrendingUp, title: "Pipeline visibility", desc: "Track every opportunity from first touch to close with a clear visual flow." },
  { icon: Bell, title: "Renewal intelligence", desc: "Stay ahead of churn with alerts, reminders, and renewal timelines." },
  { icon: Users, title: "Client 360", desc: "Unify contacts, notes, policies, and follow-ups in one profile." },
  { icon: ShieldCheck, title: "Secure by design", desc: "Built for agencies that need privacy, stability, and control." },
  { icon: Crown, title: "VIP client experience", desc: "Present a premium workspace that reflects your brand." },
  { icon: Sparkles, title: "Automation engine", desc: "Reduce manual tasks and keep your team moving faster." },
  { icon: Sparkles, title: "Referral growth", desc: "Capture referrals and turn happy clients into recurring revenue." },
  { icon: Bell, title: "Smart reminders", desc: "Never miss a quote, follow-up, or policy review again." },
  { icon: Users, title: "Team collaboration", desc: "Keep every producer, assistant, and owner aligned." },
];

const valuePillars = [
  { title: "More closes, less chaos", desc: "A polished pipeline built for fast follow-up and cleaner handoffs." },
  { title: "Retention that feels effortless", desc: "Renewal tracking, reminders, and context where your team actually works." },
  { title: "A brand clients trust", desc: "A premium interface that makes your agency look sharper and more modern." },
  { title: "Growth that compounds", desc: "Referrals, repeat business, and cross-sell opportunities in one place." },
];

const pricingFeatures = [
  "Unlimited contacts and policies",
  "Renewal alerts and smart reminders",
  "Pipeline + follow-up management",
  "Referral growth engine",
  "Premium client workspace",
];

const faqs = [
  ["What makes BindFlow different?", "It is a CRM built specifically for independent insurance agents, with renewals, referrals, and client management designed around your workflow."],
  ["Can I use it for more than one line of insurance?", "Yes. It supports mixed books, including P&C, life, health, commercial, and more."],
  ["Does it help with retention?", "Absolutely. Renewal visibility and follow-up reminders help you stay ahead of churn."],
  ["Is the experience mobile-friendly?", "Yes. It is designed to feel premium and usable across modern devices."],
  ["Can I grow referrals inside BindFlow?", "Yes. Referral tracking is part of the growth engine, so you can turn happy clients into repeat opportunities."],
  ["Do I need a credit card to start?", "No. You can start the trial without entering a card."],
];

function SupportModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    issue_type: "",
    subject: "",
    description: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.issue_type || !form.subject || !form.description) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to submit");
      toast({ title: "Support request sent", description: "We'll get back to you shortly." });
      onClose();
    } catch {
      toast({ title: "Failed to send request", description: "Please try again or email us directly.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-[#30363D] bg-[#161B22] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00E5A0]/10">
              <HeadphonesIcon className="h-4 w-4 text-[#00E5A0]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#E6EDF3]">Contact Support</h2>
              <p className="text-xs text-[#8B949E]">We'll get back to you as soon as possible</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#E6EDF3] text-sm mb-1.5 block">Full name <span className="text-[#F85149]">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Jane Smith"
                className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-10"
              />
            </div>
            <div>
              <Label className="text-[#E6EDF3] text-sm mb-1.5 block">Email <span className="text-[#F85149]">*</span></Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="jane@agency.com"
                className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-[#E6EDF3] text-sm mb-1.5 block">Phone <span className="text-[#484F58] text-xs">(optional)</span></Label>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-10"
            />
          </div>

          <div>
            <Label className="text-[#E6EDF3] text-sm mb-1.5 block">Issue type <span className="text-[#F85149]">*</span></Label>
            <Select value={form.issue_type} onValueChange={(v) => set("issue_type", v)}>
              <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10 focus:border-[#00E5A0]">
                <SelectValue placeholder="Select the type of problem…" />
              </SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#30363D] max-h-60">
                {ISSUE_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-[#E6EDF3] hover:bg-[#21262D] focus:bg-[#21262D]">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[#E6EDF3] text-sm mb-1.5 block">Subject <span className="text-[#F85149]">*</span></Label>
            <Input
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="Brief description of the issue"
              className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-10"
            />
          </div>

          <div>
            <Label className="text-[#E6EDF3] text-sm mb-1.5 block">
              Description <span className="text-[#F85149]">*</span>
            </Label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Please describe the issue in detail — steps to reproduce, what you expected, and what happened instead."
              rows={4}
              className="w-full rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-2 text-sm text-[#E6EDF3] placeholder:text-[#484F58] focus:outline-none focus:border-[#00E5A0] resize-none transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-11"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <HeadphonesIcon className="h-4 w-4 mr-2" />}
            Send Support Request
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [supportOpen, setSupportOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="dark min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      {supportOpen && <SupportModal onClose={() => setSupportOpen(false)} />}

      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0D1117]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoUrl} alt="BindFlow" className="h-14 w-40 object-contain md:h-16 md:w-44" />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <a href="#features">
              <Button variant="ghost" className="text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors px-3">Features</Button>
            </a>
            <a href="#pricing">
              <Button variant="ghost" className="text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors px-3">Pricing</Button>
            </a>
            <Button
              variant="ghost"
              className="text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors px-3"
              onClick={() => setSupportOpen(true)}
            >
              Support
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors px-3">Login</Button>
            </Link>
            <a href="https://www.youtube.com/@BindFlow" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors px-3">Tutorial</Button>
            </a>
            <Link href="/register">
              <Button className="ml-2 bg-gradient-to-r from-[#00E5A0] to-[#00C98A] text-[#0D1117] shadow-[0_0_20px_rgba(0,229,160,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(0,229,160,0.5)] text-sm">
                Start Free Trial
              </Button>
            </Link>
          </div>

          <button
            className="text-[#E6EDF3] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/5 bg-[#0D1117] px-6 py-4 flex flex-col gap-2 md:hidden">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-[#8B949E] hover:text-[#E6EDF3]">Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-[#8B949E] hover:text-[#E6EDF3]">Pricing</a>
            <button onClick={() => { setSupportOpen(true); setMobileMenuOpen(false); }} className="py-2 text-sm text-[#8B949E] hover:text-[#E6EDF3] text-left">Support</button>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-[#8B949E] hover:text-[#E6EDF3]">Login</Link>
            <a href="https://www.youtube.com/@BindFlow" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-[#8B949E] hover:text-[#E6EDF3]">Tutorial</a>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full mt-2 bg-gradient-to-r from-[#00E5A0] to-[#00C98A] text-[#0D1117]">Start Free Trial</Button>
            </Link>
          </div>
        )}
      </nav>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <Badge className="mb-6 border-[#00E5A030] bg-[#00E5A015] px-4 py-1 text-[#00E5A0]">VIP CRM for Independent Agents</Badge>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 md:text-6xl">
              Sell better.
              <br />
              Retain longer.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#8B949E]">
              BindFlow brings your pipeline, renewals, referrals, and client relationships into one elegant workspace built for high-performing insurance agencies.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button className="h-12 bg-gradient-to-r from-[#00E5A0] to-[#00C98A] px-6 text-[#0D1117] shadow-[0_0_20px_rgba(0,229,160,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,229,160,0.5)]">
                  Start 14-Day Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" className="h-12 border-[#30363D] px-6 text-[#E6EDF3] transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5A0]/50 hover:shadow-[0_8px_30px_rgb(0,229,160,0.12)]">
                  See Pricing
                </Button>
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-[#8B949E]">
              <span className="rounded-full border border-white/5 bg-white/5 px-3 py-1">No credit card</span>
              <span className="rounded-full border border-white/5 bg-white/5 px-3 py-1">Premium UI</span>
              <span className="rounded-full border border-white/5 bg-white/5 px-3 py-1">Built for retention</span>
              <span className="rounded-full border border-white/5 bg-white/5 px-3 py-1">Referral engine</span>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-[#00E5A0]/20 blur-[120px]" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#161B22]/80 p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5A0]/50 hover:shadow-[0_8px_30px_rgb(0,229,160,0.12)]">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["Pipeline", "Clear stages, clean handoffs."],
                  ["Renewals", "Surface priorities before they slip."],
                  ["Referrals", "Capture growth from every happy client."],
                ].map(([title, desc], index) => (
                  <div key={title} className={`rounded-2xl border border-white/5 bg-gradient-to-b from-[#161B22] to-[#0D1117] p-4 ${index === 1 ? "md:translate-y-8" : ""}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-tight text-[#00E5A0]">{title}</span>
                      <span className="h-2 w-2 rounded-full bg-[#00E5A0]" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-4/5 rounded-full bg-white/10" />
                      <div className="h-2 w-3/5 rounded-full bg-white/10" />
                      <div className="h-24 rounded-xl border border-white/5 bg-white/5" />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#8B949E]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tighter">What BindFlow helps you do</h2>
            <p className="mt-4 text-[#8B949E]">A premium operating system for agents who want a cleaner process, stronger follow-up, and a more impressive client experience.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {valuePillars.map((item, index) => {
              const Icon = [Sparkles, Bell, Crown, TrendingUp][index % 4];
              return (
                <div key={item.title} className="rounded-2xl border border-white/5 bg-[#161B22]/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5A0]/50 hover:shadow-[0_8px_30px_rgb(0,229,160,0.12)]">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[#00E5A0]/10 p-3 text-[#00E5A0]"><Icon className="h-8 w-8" /></div>
                  <h3 className="font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#8B949E]">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold tracking-tighter">Everything you need to feel premium</h2>
            <p className="mt-3 text-[#8B949E]">Every major capability of BindFlow, organized for clarity and trust.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-white/5 bg-[#161B22]/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5A0]/50 hover:shadow-[0_8px_30px_rgb(0,229,160,0.12)]">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[#00E5A0]/10 p-3 text-[#00E5A0]"><Icon className="h-8 w-8" /></div>
                  <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[#8B949E]">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold tracking-tighter">Simple, transparent pricing</h2>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-white/5 bg-[#161B22]/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5A0]/50 hover:shadow-[0_8px_30px_rgb(0,229,160,0.12)]">
              <div className="text-sm text-[#8B949E]">One plan. Everything included.</div>
              <div className="mt-2 text-5xl font-bold tracking-tight">$39 <span className="text-xl text-[#8B949E]">/ month</span></div>
              <div className="mt-6 space-y-3">
                {pricingFeatures.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00E5A015] text-[#00E5A0]"><Check className="h-3.5 w-3.5" /></div>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-sm text-[#8B949E]">No hidden fees. Built for serious agencies.</div>
              <div className="mt-5 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-[#8B949E]">
                <span className="font-semibold text-[#E6EDF3]">Annual billing</span> saves you <span className="font-semibold text-[#00E5A0]">15%</span> automatically.
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-[#00E5A0]/30 bg-[#161B22]/80 p-8 shadow-[0_0_60px_rgba(0,229,160,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,229,160,0.12)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(0,229,160,0.18),_transparent_70%)]" />
              <div className="relative text-sm text-[#8B949E]">Designed to close faster</div>
              <h3 className="relative mt-3 text-2xl font-bold tracking-tight">A premium workspace your team will actually enjoy using.</h3>
              <p className="relative mt-3 text-[#8B949E]">BindFlow keeps the experience clean, focused, and elegant while giving you the operational depth your book of business needs.</p>
              <Link href="/register" className="relative mt-8 block">
                <Button className="h-14 w-full bg-gradient-to-r from-[#00E5A0] to-[#00C98A] text-lg text-[#0D1117] shadow-[0_0_20px_rgba(0,229,160,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,229,160,0.5)]">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="mb-8 text-center"><h2 className="text-3xl font-bold tracking-tight">FAQ</h2></div>
          <Accordion type="single" collapsible className="overflow-hidden rounded-2xl border border-white/5 bg-[#161B22]/60 px-6 backdrop-blur-xl">
            {faqs.map(([question, answer], index) => (
              <AccordionItem key={question} value={`faq-${index}`} className="border-b border-white/10">
                <AccordionTrigger className="text-left text-[#E6EDF3] transition-colors hover:no-underline hover:text-white">{question}</AccordionTrigger>
                <AccordionContent className="text-[#8B949E]">{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20 text-center">
          <div className="rounded-3xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00E5A0]/15 via-[#0D1117] to-[#0D1117] p-10">
            <h2 className="text-3xl font-bold tracking-tight">Ready to elevate your agency?</h2>
            <p className="mt-3 text-[#8B949E]">Give your team a cleaner process and your clients a better experience.</p>
            <div className="mt-8">
              <Link href="/register">
                <Button className="h-12 bg-gradient-to-r from-[#00E5A0] to-[#00C98A] px-8 text-[#0D1117] shadow-[0_0_20px_rgba(0,229,160,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,229,160,0.5)]">Start Free Trial</Button>
              </Link>
            </div>
            <div className="mt-4 flex justify-center gap-3 text-xs text-[#8B949E]">
              <span>Fast setup</span>
              <span>•</span>
              <span>No card required</span>
              <span>•</span>
              <span>Cancel anytime</span>
              <span>•</span>
              <span>Referral tracking included</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#30363D] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="BindFlow" className="h-10 w-32 object-contain" />
          </div>
          <div className="flex gap-5 text-sm text-[#8B949E]">
            <a href="/privacy" className="hover:text-[#E6EDF3] transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-[#E6EDF3] transition-colors">Terms</a>
            <button onClick={() => setSupportOpen(true)} className="hover:text-[#E6EDF3] transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
