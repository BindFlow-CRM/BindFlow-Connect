import { Link } from "wouter";
import { Shield, TrendingUp, MessageCircle, Bell, Users, BarChart3, CheckCircle, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="dark min-h-screen bg-[#0D1117] text-[#E6EDF3] font-['Inter',sans-serif]">
      {/* NAV */}
      <nav className="border-b border-[#30363D] px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-[#0D1117]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img
            src="https://mprcqzsffqdvowogaedf.supabase.co/storage/v1/object/sign/assets/logocuadrado-jpg512.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMjI2YmI4ZS0yNzJjLTRkNjktYmZkNy0zOTc3OTU5Yjk2NTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbG9nb2N1YWRyYWRvLWpwZzUxMi5qcGVnIiwiaWF0IjoxNzc3NzIyMjExLCJleHAiOjMzMTMxMzcyMjIxMX0.LS3aj-1COT7OQ0l7m4NEGc-PFwFQx8-2WyxYACa0Yk8"
            alt="BindFlow"
            className="w-9 h-9 rounded-lg object-cover"
          />
          <span className="text-xl font-bold text-[#E6EDF3]">BindFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-[#8B949E] hover:text-[#E6EDF3]">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 py-24 max-w-6xl mx-auto text-center">
        <Badge className="mb-6 bg-[#00E5A015] text-[#00E5A0] border-[#00E5A030] px-4 py-1">
          Built for independent insurance agents
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-[#E6EDF3]">
          The CRM built for the way
          <br />
          <span className="text-[#00E5A0]">you sell insurance</span>
        </h1>
        <p className="text-xl text-[#8B949E] max-w-2xl mx-auto mb-10">
          Track renewals, manage your pipeline, and follow up with clients — all from one place built specifically for insurance agents.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold px-8 h-12 text-base">
              Start 14-day free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-[#30363D] text-[#E6EDF3] hover:border-[#00E5A0] h-12 px-8 text-base">
            See how it works
          </Button>
        </div>
        <p className="mt-4 text-sm text-[#484F58]">No credit card required. 14-day free trial.</p>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-4">Everything you need to close more policies</h2>
          <p className="text-[#8B949E] text-lg">Built around the insurance sales workflow, not a generic CRM template.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <TrendingUp className="h-6 w-6" />,
              color: "#00E5A0",
              title: "Visual Pipeline",
              desc: "Drag-and-drop kanban board with 6 insurance-specific stages: Lead, Quoted, Follow-up, Closed Won, Active Policy, and Renewal Due.",
            },
            {
              icon: <Bell className="h-6 w-6" />,
              color: "#F0B429",
              title: "Renewal Alerts",
              desc: "Automatic renewal reminders at 90, 60, and 30 days. Never miss a renewal window and lose a client to a competitor.",
            },
            {
              icon: <MessageCircle className="h-6 w-6" />,
              color: "#00B4D8",
              title: "WhatsApp Integration",
              desc: "One-click WhatsApp outreach directly from every contact card and pipeline deal. Reach clients where they actually respond.",
            },
            {
              icon: <Users className="h-6 w-6" />,
              color: "#00E5A0",
              title: "Client Management",
              desc: "Full client profiles with policies, activity timeline, notes, and cross-sell opportunity tracking.",
            },
            {
              icon: <BarChart3 className="h-6 w-6" />,
              color: "#00B4D8",
              title: "Dashboard & Analytics",
              desc: "KPI cards, pipeline value by stage, lead source breakdown, and renewal forecast charts.",
            },
            {
              icon: <Shield className="h-6 w-6" />,
              color: "#F0B429",
              title: "Referral Tracker",
              desc: "Track who referred whom and visualize your referral network. Reward your best referrers.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 hover:border-[#30363D80] transition-all"
              data-testid={`feature-card-${i}`}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${f.color}15`, color: f.color }}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-[#8B949E] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PIPELINE PREVIEW */}
      <section className="px-6 py-20 bg-[#161B22] border-y border-[#30363D]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your pipeline, the way insurance works</h2>
            <p className="text-[#8B949E]">6 pre-built stages designed for the insurance sales cycle</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {[
              { name: "Lead", color: "#8B949E", count: 12, value: "$48,000" },
              { name: "Quoted", color: "#00B4D8", count: 8, value: "$32,000" },
              { name: "Follow-up", color: "#F0B429", count: 5, value: "$21,500" },
              { name: "Closed Won", color: "#00E5A0", count: 3, value: "$14,200" },
              { name: "Active Policy", color: "#00C98A", count: 47, value: "$198,000" },
              { name: "Renewal Due", color: "#F85149", count: 9, value: "$38,400" },
            ].map((stage) => (
              <div
                key={stage.name}
                className="flex-shrink-0 w-44 bg-[#0D1117] border border-[#30363D] rounded-lg overflow-hidden"
              >
                <div className="px-3 py-2 border-b-2" style={{ borderBottomColor: stage.color }}>
                  <span className="text-xs font-semibold" style={{ color: stage.color }}>{stage.name}</span>
                  <div className="text-xs text-[#8B949E] mt-1">{stage.count} deals</div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-[#E6EDF3]">{stage.value}</div>
                  <div className="mt-2 space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-[#1C2128] border border-[#30363D] rounded p-2 border-l-2" style={{ borderLeftColor: stage.color }}>
                        <div className="h-2 bg-[#30363D] rounded w-3/4 mb-1"></div>
                        <div className="h-2 bg-[#30363D] rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-[#8B949E]">One plan, everything included. Up to 3 agents per workspace.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8">
            <div className="text-[#8B949E] text-sm font-medium mb-2">Monthly</div>
            <div className="text-4xl font-bold mb-1">$39<span className="text-lg text-[#8B949E] font-normal">/mo</span></div>
            <div className="text-[#8B949E] text-sm mb-6">per workspace</div>
            <Link href="/register">
              <Button className="w-full bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold">
                Start free trial
              </Button>
            </Link>
          </div>
          {/* Annual */}
          <div className="bg-[#161B22] border border-[#00E5A0] rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-[#00E5A015] text-[#00E5A0] border-[#00E5A030]">Save 15%</Badge>
            </div>
            <div className="text-[#8B949E] text-sm font-medium mb-2">Annual</div>
            <div className="text-4xl font-bold mb-1">$33<span className="text-lg text-[#8B949E] font-normal">/mo</span></div>
            <div className="text-[#8B949E] text-sm mb-1">billed $397/year</div>
            <div className="text-[#00E5A0] text-sm mb-6 font-medium">Save $71 per year</div>
            <Link href="/register">
              <Button className="w-full bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold">
                Start free trial
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {["14-day free trial", "No credit card needed", "Up to 3 agents", "Cancel anytime"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-[#8B949E]">
              <CheckCircle className="h-4 w-4 text-[#00E5A0] flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center bg-gradient-to-b from-[#0D1117] to-[#161B22] border-t border-[#30363D]">
        <Zap className="h-12 w-12 text-[#00E5A0] mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Ready to grow your book of business?</h2>
        <p className="text-[#8B949E] text-lg mb-8 max-w-xl mx-auto">
          Join insurance agents who use BindFlow to stay on top of renewals and close more deals.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold px-10 h-12 text-base">
            Start your 14-day free trial
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#30363D] px-6 py-8 text-center text-sm text-[#484F58]">
        <p>© 2026 BindFlow. The CRM built for the way you sell insurance.</p>
      </footer>
    </div>
  );
}
