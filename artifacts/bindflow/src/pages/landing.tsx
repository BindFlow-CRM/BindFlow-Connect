import { Link } from "wouter";
import {
  ArrowRight,
  Bell,
  Check,
  Crown,
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroMockup from "@assets/capture_1777807709083.png";

const logoUrl =
  "https://fsmzsskfsonlrwfcvkji.supabase.co/storage/v1/object/sign/assets/Logo_BindFlow_redondo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNTRhMGNiOC0zZTljLTQzODktYWQ1OS05YjZjNWY2NGQ2MDEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvTG9nb19CaW5kRmxvd19yZWRvbmRvLnBuZyIsImlhdCI6MTc3NzgwMTg3NSwiZXhwIjozMzMxMzgwMTg3NX0.VC-tMEAn6bHmLlumrfwXz4tf6Y-6xZ0DX9sG06eyFlE";

const featureCards = [
  { icon: TrendingUp, title: "Visual sales flow", desc: "See every lead, policy, and renewal in one clean command center." },
  { icon: Bell, title: "Renewal intelligence", desc: "Get proactive alerts before retention becomes an issue." },
  { icon: Users, title: "Client 360", desc: "One record for contacts, policies, notes, and next steps." },
  { icon: ShieldCheck, title: "Secure by design", desc: "Built with a privacy-first, agency-ready workflow." },
  { icon: Crown, title: "VIP client experience", desc: "Deliver a premium journey that feels effortless to every customer." },
  { icon: Sparkles, title: "Premium automation", desc: "Reduce admin work and keep your book moving forward." },
];

const valuePillars = [
  {
    title: "More closes, less chaos",
    desc: "A polished pipeline built for fast follow-up and cleaner handoffs.",
  },
  {
    title: "Retention that feels effortless",
    desc: "Renewal tracking, reminders, and context where your team actually works.",
  },
  {
    title: "A brand clients trust",
    desc: "A premium interface that makes your agency look sharper and more modern.",
  },
  {
    title: "Growth that compounds",
    desc: "Referrals, repeat business, and cross-sell opportunities in one place.",
  },
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

export default function LandingPage() {
  return (
    <div className="dark min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0D1117]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoUrl} alt="BindFlow" className="h-14 w-40 object-contain md:h-16 md:w-44" />
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login">
              <Button variant="ghost" className="transition-all duration-300 hover:-translate-y-1 hover:text-[#E6EDF3]">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-[#00E5A0] to-[#00C98A] text-[#0D1117] shadow-[0_0_20px_rgba(0,229,160,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,229,160,0.5)]">
                Start Free Trial
              </Button>
            </Link>
          </div>
          <Button variant="ghost" className="text-[#E6EDF3] md:hidden"><Menu className="h-5 w-5" /></Button>
        </div>
      </nav>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <Badge className="mb-6 border-[#00E5A030] bg-[#00E5A015] px-4 py-1 text-[#00E5A0]">VIP CRM for Independent Agents</Badge>
            <h1 className="max-w-2xl text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 md:text-8xl">
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
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-[#00E5A0]/20 blur-[120px]" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#161B22]/80 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5A0]/50 hover:shadow-[0_8px_30px_rgb(0,229,160,0.12)]">
              <img src={heroMockup} alt="BindFlow dashboard mockup" className="w-full rounded-xl object-cover" />
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

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold tracking-tighter">Everything you need to feel premium</h2>
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
          </div>
        </section>
      </main>

      <footer className="border-t border-[#30363D] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3"><img src={logoUrl} alt="BindFlow" className="h-18 w-18 rounded-full object-cover" /></div>
          <div className="flex gap-5 text-sm text-[#8B949E]"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/contact">Contact</a></div>
        </div>
      </footer>
    </div>
  );
}
