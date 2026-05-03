import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

// Auth pages
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import ForgotPasswordPage from "@/pages/auth/forgot-password";

// Dashboard pages
import DashboardLayout from "@/pages/dashboard/layout";
import DashboardHome from "@/pages/dashboard/index";
import PipelinePage from "@/pages/dashboard/pipeline";
import ContactsPage from "@/pages/dashboard/contacts/index";
import ContactDetailPage from "@/pages/dashboard/contacts/[id]";
import CalendarPage from "@/pages/dashboard/calendar";
import RemindersPage from "@/pages/dashboard/reminders";
import ReferralsPage from "@/pages/dashboard/referrals";
import TemplatesPage from "@/pages/dashboard/templates";
import RenewalRadarPage from "@/pages/dashboard/renewal-radar";
import SettingsPage from "@/pages/dashboard/settings/index";
import TeamSettingsPage from "@/pages/dashboard/settings/team";
import BillingPage from "@/pages/dashboard/settings/billing";
import AdminPanelPage from "@/pages/dashboard/admin-panel";

// Landing page
import LandingPage from "@/pages/landing";

function Router() {
  return (
    <Switch>
      {/* Landing */}
      <Route path="/" component={LandingPage} />

      {/* Auth */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />

      {/* Dashboard (protected) */}
      <Route path="/dashboard">
        {() => (
          <DashboardLayout>
            <DashboardHome />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/pipeline">
        {() => (
          <DashboardLayout>
            <PipelinePage />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/contacts">
        {() => (
          <DashboardLayout>
            <ContactsPage />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/contacts/:id">
        {(params) => (
          <DashboardLayout>
            <ContactDetailPage id={params.id ?? ""} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/calendar">
        {() => (
          <DashboardLayout>
            <CalendarPage />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/reminders">
        {() => (
          <DashboardLayout>
            <RemindersPage />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/referrals">
        {() => (
          <DashboardLayout>
            <ReferralsPage />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/templates">
        {() => (
          <DashboardLayout>
            <TemplatesPage />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/renewal-radar">
        {() => (
          <DashboardLayout>
            <RenewalRadarPage />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <DashboardLayout>
            <SettingsPage />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/settings/team">
        {() => (
          <DashboardLayout>
            <TeamSettingsPage />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/settings/billing">
        {() => (
          <DashboardLayout>
            <BillingPage />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin-panel">
        {() => (
          <DashboardLayout>
            <AdminPanelPage />
          </DashboardLayout>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
