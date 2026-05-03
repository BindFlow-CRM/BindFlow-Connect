import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  CircleDollarSign,
  CloudLightning,
  Grid3x3,
  Menu,
  MoveRight,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const logoUrl =
  "https://fsmzsskfsonlrwfcvkji.supabase.co/storage/v1/object/sign/assets/Logo_BindFlow_redondo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNTRhMGNiOC0zZTljLTQzODktYWQ1OS05YjZjNWY2NGQ2MDEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvTG9nb19CaW5kRmxvd19yZWRvbmRvLnBuZyIsImlhdCI6MTc3NzgwMTg3NSwiZXhwIjozMzMxMzgwMTg3NX0.VC-tMEAn6bHmLlumrfwXz4tf6Y-6xZ0DX9sG06eyFlE";

const features = [
  {
    icon: TrendingUp,
    title: "Visual Kanban Pipeline",
    desc: "Drag & drop tu ciclo de ventas",
  },
  {
    icon: Bell,
    title: "Automated Renewals",
    desc: "Alertas 90/60/30 días",
  },
  {
    icon: Users,
    title: "Smart Client Management",
    desc: "Ficha 360º de cada póliza",
  },
];

const faqs = [
  {
    q: "Do I need a credit card to start?",
    a: "No. You can start your 14-day free trial without entering a card.",
  },
  {
    q: "Can I manage multiple lines of insurance?",
    a: "Yes. BindFlow is built for P&C, life, health, commercial, and mixed books.",
  },
  {
    q: "How do the renewal alerts work?",
    a: "We surface policies renewing in 90, 60, and 30 days so your team can act before churn happens.",
  },
];

export default function LandingPage() {
  const [annualBilling, setAnnualBilling] = useState(false);
  const price = annualBilling ? "$33" : "$39";
  const billingLabel = annualBilling ? "/ month, billed annually" : "/ month";
  const totalLabel = annualBilling ? "15% off annual billing" : "Cancel anytime";

  const checklist = useMemo(
    () => ["Pipeline", "Unlimited contacts", "Auto-alerts", "Cross-sell engine"],
    [],
  );

  return (
    <div className="dark min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <nav className="sticky top-0 z-50 border-b border-[#30363D] bg-[#0D1117]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoUrl} alt="BindFlow" className="h-20 w-20 rounded-full object-cover" />
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login">
              <Button variant="ghost" className="text-[#8B949E] hover:text-[#E6EDF3]">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#00E5A0] text-[#0D1117] hover:bg-[#00C98A]">Start Free Trial</Button>
            </Link>
          </div>
          <Button variant="ghost" className="md:hidden text-[#E6EDF3]">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <Badge className="mb-6 border-[#00E5A030] bg-[#00E5A015] px-4 py-1 text-[#00E5A0]">
              The CRM for Independent Agents
            </Badge>
            <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] md:text-6xl">
              Pipeline That Flows. Policies That Grow.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#8B949E]">
              The premium, data-driven CRM built specifically for independent insurance agents.
              Manage renewals, quote faster, and scale your book of business.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button className="h-12 bg-[#00E5A0] px-6 text-[#0D1117] hover:bg-[#00C98A]">
                  Start 14-Day Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" className="h-12 border-[#30363D] px-6 text-[#E6EDF3] hover:border-[#00B4D8]">
                  See Pricing
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-[#8B949E]">No credit card required. Setup in minutes.</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-[#00E5A01A] blur-3xl" />
            <div className="shadow-[0_0_60px_rgba(0,229,160,0.15)] rounded-3xl border border-[#30363D] bg-[#161B22] p-5">
              <div className="mb-4 flex items-center justify-between border-b border-[#30363D] pb-4">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#F85149]" />
                  <div className="h-3 w-3 rounded-full bg-[#F0B429]" />
                  <div className="h-3 w-3 rounded-full bg-[#00E5A0]" />
                </div>
                <div className="text-xs text-[#8B949E]">BindFlow Pipeline</div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { title: "Lead", color: "#8B949E" },
                  { title: "Quoted", color: "#00B4D8" },
                  { title: "Renewal Due", color: "#F85149" },
                ].map((col) => (
                  <div key={col.title} className="rounded-2xl border border-[#30363D] bg-[#0D1117] p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: col.color }}>
                        {col.title}
                      </span>
                      <span className="text-[10px] text-[#8B949E]">3 cards</span>
                    </div>
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="rounded-xl border border-[#30363D] bg-[#161B22] p-3">
                          <div className="mb-2 h-2 w-2/3 rounded-full bg-[#30363D]" />
                          <div className="mb-3 h-2 w-1/2 rounded-full bg-[#30363D]" />
                          <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
                            <span>Client {i}</span>
                            <span>$4,2{i}0</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold">What is BindFlow?</h2>
            <p className="mt-4 max-w-xl text-[#8B949E]">
              A modern operating system for independent agents to manage pipelines, renewals, cross-sells,
              and client relationships from one premium workspace.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Visual Pipeline", "Track every opportunity end-to-end."],
              ["Cross-Sell Engine", "Spot coverage gaps automatically."],
              ["Auto Alerts", "Stay ahead of every renewal."],
              ["Agent-friendly", "Built for insurance workflows."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-[#30363D] bg-[#161B22] p-5">
                <div className="mb-3 h-10 w-10 rounded-xl bg-[#00E5A015] text-[#00E5A0] flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-[#8B949E]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10">
            <h2 className="text-3xl font-bold">Everything you need</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-[#30363D] bg-[#161B22] p-6">
                  <div className="mb-4 h-12 w-12 rounded-2xl bg-[#00E5A015] text-[#00E5A0] flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-[#8B949E]">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">One plan. Everything included.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-[#30363D] bg-[#161B22] p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-[#8B949E]">Billing</div>
                  <div className="mt-2 text-5xl font-bold">
                    {price} <span className="text-xl text-[#8B949E]">{billingLabel}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAnnualBilling((v) => !v)}
                  className={`flex h-11 items-center rounded-full border px-1 transition ${annualBilling ? "border-[#00E5A0] bg-[#00E5A015]" : "border-[#30363D] bg-[#0D1117]"}`}
                >
                  <span className={`rounded-full px-4 py-2 text-sm ${!annualBilling ? "bg-[#00E5A0] text-[#0D1117]" : "text-[#8B949E]"}`}>Monthly</span>
                  <span className={`rounded-full px-4 py-2 text-sm ${annualBilling ? "bg-[#00E5A0] text-[#0D1117]" : "text-[#8B949E]"}`}>Annual</span>
                </button>
              </div>
              <div className="mt-6 space-y-3">
                {checklist.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00E5A015] text-[#00E5A0]">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-sm text-[#8B949E]">{totalLabel}</div>
            </div>
            <div className="rounded-3xl border border-[#00E5A0] bg-[#161B22] p-8 shadow-[0_0_60px_rgba(0,229,160,0.12)]">
              <div className="text-sm text-[#8B949E]">Start selling smarter today</div>
              <h3 className="mt-3 text-2xl font-bold">Everything in one place.</h3>
              <p className="mt-3 text-[#8B949E]">
                Launch your agency workspace with pipelines, renewals, contacts, and cross-sell intelligence.
              </p>
              <Link href="/register" className="mt-8 block">
                <Button className="h-12 w-full bg-[#00E5A0] text-[#0D1117] hover:bg-[#00C98A]">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">FAQ</h2>
          </div>
          <Accordion type="single" collapsible className="rounded-2xl border border-[#30363D] bg-[#161B22] px-6">
            {faqs.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-[#30363D]">
                <AccordionTrigger className="text-left text-[#E6EDF3] hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#8B949E]">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold">Ready to scale your insurance business?</h2>
          <div className="mt-8">
            <Link href="/register">
              <Button className="h-12 bg-[#00E5A0] px-8 text-[#0D1117] hover:bg-[#00C98A]">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#30363D] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="BindFlow" className="h-18 w-18 rounded-full object-cover" />
          </div>
          <div className="flex gap-5 text-sm text-[#8B949E]">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
