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
  { icon: TrendingUp, title: "Visual Kanban Pipeline", desc: "Drag & drop tu ciclo de ventas" },
  { icon: Bell, title: "Automated Renewals", desc: "Alertas 90/60/30 días" },
  { icon: Users, title: "Smart Client Management", desc: "Ficha 360º de cada póliza" },
  { icon: ShieldCheck, title: "Premium Security", desc: "Acceso y datos protegidos" },
  { icon: Crown, title: "VIP Growth Engine", desc: "Referidos y expansión orgánica" },
  { icon: Sparkles, title: "Ultra Premium UX", desc: "Experiencia limpia, rápida y elegante" },
];

const whatIsCards = [
  ["Visual Pipeline", "Track every opportunity end-to-end."],
  ["Cross-Sell Engine", "Spot coverage gaps automatically."],
  ["Auto Alerts", "Stay ahead of every renewal."],
  ["Agent-friendly", "Built for insurance workflows."],
];

const faqs = [
  ["Do I need a credit card to start?", "No. You can start your 14-day free trial without entering a card."],
  ["Can I manage multiple lines of insurance?", "Yes. BindFlow is built for P&C, life, health, commercial, and mixed books."],
  ["How do the renewal alerts work?", "We surface policies renewing in 90, 60, and 30 days so your team can act before churn happens."],
  ["Is the pipeline actually drag and drop?", "Yes. The pipeline supports drag-and-drop stage movement and reordering inside each stage."],
  ["Does the cross-sell engine auto-detect opportunities?", "It helps surface likely opportunities from existing policies and contact data, but you still review and confirm before outreach."],
  ["Can I import my current book of business?", "Yes, CSV import/export is supported. Very large or messy datasets may need cleanup before import for the best result."],
  ["Is WhatsApp fully automated?", "Not fully. BindFlow helps you launch WhatsApp conversations fast, but actual sending depends on your device and account setup."],
  ["How many team members can use it?", "The plan includes up to 3 team members. If you need more, that would require a plan change later."],
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
            <Badge className="mb-6 border-[#00E5A030] bg-[#00E5A015] px-4 py-1 text-[#00E5A0]">The CRM for Independent Agents</Badge>
            <h1 className="max-w-2xl text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 md:text-8xl">
              Pipeline That Flows. Policies That Grow.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#8B949E]">
              The premium, data-driven CRM built specifically for independent insurance agents. Manage renewals, quote faster, and scale your book of business.
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
            <p className="mt-4 text-sm text-[#8B949E]">No credit card required. Setup in minutes.</p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-[#00E5A0]/20 blur-[120px]" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#161B22]/80 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5A0]/50 hover:shadow-[0_8px_30px_rgb(0,229,160,0.12)]">
              <img src={heroMockup} alt="BindFlow dashboard mockup" className="w-full rounded-xl object-cover" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tighter">What is BindFlow?</h2>
            <p className="mt-4 text-[#8B949E]">A modern operating system for independent agents to manage pipelines, renewals, cross-sells, and client relationships from one premium workspace.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {whatIsCards.map(([title, desc], index) => {
              const Icon = [Sparkles, Bell, Users, TrendingUp][index % 4];
              return (
                <div key={title} className="rounded-2xl border border-white/5 bg-[#161B22]/60 p-5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5A0]/50 hover:shadow-[0_8px_30px_rgb(0,229,160,0.12)]">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[#00E5A0]/10 p-3 text-[#00E5A0]"><Icon className="h-8 w-8" /></div>
                  <h3 className="font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm text-[#8B949E]">{desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold tracking-tighter">Everything you need</h2>
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
          <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-white/5 bg-[#161B22]/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5A0]/50 hover:shadow-[0_8px_30px_rgb(0,229,160,0.12)]">
              <div className="text-sm text-[#8B949E]">Billing</div>
              <div className="mt-2 text-5xl font-bold">$39 <span className="text-xl text-[#8B949E]">/ month</span></div>
              <div className="mt-6 space-y-3">{['Pipeline', 'Unlimited contacts', 'Auto-alerts', 'Cross-sell engine'].map((item) => (<div key={item} className="flex items-center gap-3 text-sm"><div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00E5A015] text-[#00E5A0]"><Check className="h-3.5 w-3.5" /></div>{item}</div>))}</div>
              <div className="mt-6 text-sm text-[#8B949E]">15% off annual billing available</div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-[#00E5A0]/30 bg-[#161B22]/80 p-8 shadow-[0_0_60px_rgba(0,229,160,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,229,160,0.12)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(0,229,160,0.18),_transparent_70%)]" />
              <div className="relative text-sm text-[#8B949E]">Start selling smarter today</div>
              <h3 className="relative mt-3 text-2xl font-bold tracking-tight">Everything in one place.</h3>
              <p className="relative mt-3 text-[#8B949E]">Launch your agency workspace with pipelines, renewals, contacts, and cross-sell intelligence.</p>
              <Link href="/register" className="relative mt-8 block">
                <Button className="h-14 w-full bg-gradient-to-r from-[#00E5A0] to-[#00C98A] text-lg text-[#0D1117] shadow-[0_0_20px_rgba(0,229,160,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,229,160,0.5)]">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="mb-8 text-center"><h2 className="text-3xl font-bold">FAQ</h2></div>
          <Accordion type="single" collapsible className="overflow-hidden rounded-2xl border border-white/5 bg-[#161B22]/60 px-6 backdrop-blur-xl">
            {faqs.map(([question, answer], index) => (
              <AccordionItem key={question} value={`faq-${index}`} className="border-b border-white/10">
                <AccordionTrigger className="text-left text-[#E6EDF3] transition-colors hover:no-underline hover:text-white">{question}</AccordionTrigger>
                <AccordionContent className="text-[#8B949E]">{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="rounded-3xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00E5A0]/15 via-[#0D1117] to-[#0D1117] p-10">
            <h2 className="text-3xl font-bold">Ready to scale your insurance business?</h2>
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
