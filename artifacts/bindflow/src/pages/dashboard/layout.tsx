import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, ChevronRight, Home, Kanban, Mail, Settings, Users, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Kanban, label: "Pipeline", href: "/pipeline" },
  { icon: Users, label: "Contacts", href: "/contacts" },
  { icon: Mail, label: "Templates", href: "/templates" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const logoUrl =
  "https://fsmzsskfsonlrwfcvkji.supabase.co/storage/v1/object/sign/assets/Logo_BindFlow_redondo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNTRhMGNiOC0zZTljLTQzODktYWQ1OS05YjZjNWY2NGQ2MDEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvTG9nb19CaW5kRmxvd19yZWRvbmRvLnBuZyIsImlhdCI6MTc3NzgwMTg3NSwiZXhwIjozMzMxMzgwMTg3NX0.VC-tMEAn6bHmLlumrfwXz4tf6Y-6xZ0DX9sG06eyFlE";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, profile, organization, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) setLocation("/login");
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="dark min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00E5A0] border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const isActive = (href: string) => (href === "/dashboard" ? location === "/dashboard" || location === "/" : location.startsWith(href));
  const initials = profile?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const trialDays = organization?.trial_ends_at ? Math.max(0, Math.ceil((new Date(organization.trial_ends_at).getTime() - Date.now()) / 86400000)) : null;

  return (
    <div className="dark flex min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <aside className="fixed left-0 top-0 flex h-screen w-[240px] flex-col border-r border-[#30363D] bg-[#161B22]">
        <div className="border-b border-[#30363D] px-4 py-5">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="BindFlow" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-sm font-semibold tracking-tight">BindFlow</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => (
            <Link key={href} href={href}>
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-[#21262D] hover:text-[#E6EDF3] ${isActive(href) ? "border-l-[3px] border-[#00E5A0] bg-[#00E5A0]/10 pl-[11px] text-[#00E5A0]" : "text-[#8B949E]"}`}
                data-testid={`nav-${label.toLowerCase()}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            </Link>
          ))}
        </nav>

        <div className="border-t border-[#30363D] p-4 space-y-3">
          <div className="rounded-xl border border-[#30363D] bg-[#0D1117] px-3 py-3">
            <div className="text-xs text-[#8B949E]">Trial Ends in</div>
            <div className="mt-1 text-sm font-semibold text-[#E6EDF3]">{trialDays === null ? "—" : `${trialDays} days`}</div>
          </div>
          <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#21262D] transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#00E5A030] bg-[#00E5A015]">
              <span className="text-xs font-semibold text-[#00E5A0]">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[#E6EDF3]">{profile?.full_name || "Agent"}</div>
              <div className="truncate text-xs text-[#8B949E]">{user.email}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { signOut(); setLocation("/login"); }} className="h-8 w-8 text-[#8B949E] hover:text-[#F85149]">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="ml-[240px] flex min-h-screen flex-1 flex-col bg-[#0D1117]">
        <header className="flex h-16 items-center justify-between border-b border-[#30363D] px-6">
          <h1 className="text-lg font-semibold text-[#E6EDF3]">
            {location === "/dashboard" || location === "/" ? "Dashboard" : location.split("/")[1]?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard"}
          </h1>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#30363D] text-[#8B949E] transition-colors hover:border-[#00E5A0] hover:text-[#00E5A0]">
            <Bell className="h-4 w-4" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
