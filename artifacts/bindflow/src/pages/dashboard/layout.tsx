import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Kanban, Users, CalendarDays, Bell,
  GitBranch, Mail, Settings, LogOut, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Kanban, label: "Pipeline", href: "/pipeline" },
  { icon: Users, label: "Contacts", href: "/contacts" },
  { icon: CalendarDays, label: "Calendar", href: "/calendar" },
  { icon: Bell, label: "Reminders", href: "/reminders" },
  { icon: GitBranch, label: "Referrals", href: "/referrals" },
  { icon: Mail, label: "Templates", href: "/templates" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, profile, organization, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="dark min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00E5A0] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8B949E] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isActive = (href: string) => {
    if (href === "/dashboard") return location === "/dashboard" || location === "/";
    return location.startsWith(href);
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="dark flex h-screen bg-[#0D1117] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-[#161B22] border-r border-[#30363D] flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-[#30363D]">
          <div className="flex items-center gap-3">
            <img
              src="https://mprcqzsffqdvowogaedf.supabase.co/storage/v1/object/sign/assets/logocuadrado-jpg512.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMjI2YmI4ZS0yNzJjLTRkNjktYmZkNy0zOTc3OTU5Yjk2NTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbG9nb2N1YWRyYWRvLWpwZzUxMi5qcGVnIiwiaWF0IjoxNzc3NzIyMjExLCJleHAiOjMzMTMxMzcyMjIxMX0.LS3aj-1COT7OQ0l7m4NEGc-PFwFQx8-2WyxYACa0Yk8"
              alt="BindFlow"
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
            />
            <div className="overflow-hidden">
              <div className="font-bold text-[#E6EDF3] text-sm truncate">BindFlow</div>
              {organization && (
                <div className="text-[#8B949E] text-xs truncate">{organization.name}</div>
              )}
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => (
            <Link key={href} href={href}>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(href)
                    ? "bg-[#00E5A015] text-[#00E5A0] border-l-[3px] border-[#00E5A0] pl-[9px]"
                    : "text-[#8B949E] hover:bg-[#21262D] hover:text-[#E6EDF3]"
                }`}
                data-testid={`nav-${label.toLowerCase()}`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            </Link>
          ))}
        </nav>

        {/* User area */}
        <div className="border-t border-[#30363D] p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#21262D] cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-[#00E5A015] border border-[#00E5A030] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-[#00E5A0]">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#E6EDF3] truncate">{profile?.full_name || "Agent"}</div>
              <div className="text-xs text-[#8B949E] truncate">{user?.email}</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { signOut(); setLocation("/login"); }}
              className="h-7 w-7 text-[#484F58] hover:text-[#F85149] opacity-0 group-hover:opacity-100 transition-opacity"
              data-testid="button-signout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Trial banner */}
          {organization?.subscription_status === "trialing" && organization.trial_ends_at && (
            <Link href="/settings/billing">
              <div className="mt-2 bg-[#F0B42915] border border-[#F0B42930] rounded-lg px-3 py-2 cursor-pointer hover:border-[#F0B429] transition-colors">
                <div className="text-xs font-medium text-[#F0B429]">Trial active</div>
                <div className="text-xs text-[#8B949E] flex items-center gap-1 mt-0.5">
                  Upgrade to keep access
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#0D1117]">
        {children}
      </main>
    </div>
  );
}
