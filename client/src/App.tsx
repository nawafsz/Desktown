import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppSidebar } from "@/components/AppSidebar";
import { VisitorSidebar } from "@/components/VisitorSidebar";
import { TopHeader } from "@/components/TopHeader";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import Welcome from "@/pages/Welcome";
import Tasks from "@/pages/Tasks";
import Tickets from "@/pages/Tickets";
import SocialFeed from "@/pages/SocialFeed";
import Messages from "@/pages/Messages";
import Meetings from "@/pages/Meetings";
import Team from "@/pages/Team";
import Jobs from "@/pages/Jobs";
import Finances from "@/pages/Finances";
import AccessControl from "@/pages/AccessControl";
import Departments from "@/pages/Departments";
import Department from "@/pages/Department";
import EmployeeProfile from "@/pages/EmployeeProfile";
import MyEmployeeProfile from "@/pages/MyEmployeeProfile";
import Profile from "@/pages/Profile";
import Subscription from "@/pages/Subscription";
import Advertising from "@/pages/Advertising";
import N8nSettings from "@/pages/N8nSettings";
import Storefront from "@/pages/Storefront";
import OfficeDetail from "@/pages/OfficeDetail";
import OfficeManagement from "@/pages/OfficeManagement";
import OfficeServicesShowcase from "@/pages/OfficeServicesShowcase";
import MyPaidServices from "@/pages/MyPaidServices";
import PublicServicePage from "@/pages/PublicServicePage";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Careers from "@/pages/Careers";
import EmployeePortal from "@/pages/EmployeePortal";
import InternalMail from "@/pages/InternalMail";
import MyWorkspace from "@/pages/MyWorkspace";
import VisitorServices from "@/pages/VisitorServices";
import VisitorContact from "@/pages/VisitorContact";
import PlatformManagement from "@/pages/PlatformManagement";
import { Loader2, ShieldAlert, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { NotificationPermission } from "@/components/NotificationPermission";
import type { Subscription as SubscriptionType } from "@shared/schema";
import { useLanguage, translations } from "@/lib/i18n";

type UserRole = "visitor" | "member" | "manager" | "admin" | "office_renter";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  userRole: string | null | undefined;
  children: React.ReactNode;
}

function RoleGuard({ allowedRoles, userRole, children }: RoleGuardProps) {
  const role = (userRole || "member") as UserRole;

  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view this page. This area is restricted to {allowedRoles.join(" or ")} users.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => window.location.href = "/"} data-testid="button-go-dashboard">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [, setLocation] = useLocation();

  const { data: subscription, isLoading } = useQuery<SubscriptionType | null>({
    queryKey: ['/api/subscriptions/active'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>
              {language === 'ar' ? "الاشتراك مطلوب" : "Subscription Required"}
            </CardTitle>
            <CardDescription>
              {language === 'ar'
                ? "يجب عليك الاشتراك أولاً للوصول إلى خدمات المكتب. اشترك الآن للاستمتاع بجميع المزايا."
                : "You must subscribe first to access office services. Subscribe now to enjoy all the features."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setLocation("/subscription")} data-testid="button-go-subscription">
              {language === 'ar' ? "اشترك الآن" : "Subscribe Now"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

function AuthenticatedRouter({ userRole }: { userRole: string | null | undefined }) {
  return (
    <Switch>
      <Route path="/" component={MyWorkspace} />
      <Route path="/workspace" component={MyWorkspace} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/profile" component={Profile} />
      <Route path="/my-profile" component={MyEmployeeProfile} />
      <Route path="/feed" component={SocialFeed} />
      <Route path="/messages" component={Messages} />
      <Route path="/mail" component={InternalMail} />
      <Route path="/meetings" component={Meetings} />
      <Route path="/team" component={Team} />
      <Route path="/departments" component={Departments} />
      <Route path="/departments/:id" component={Department} />
      <Route path="/employees/:username" component={EmployeeProfile} />
      <Route path="/subscription" component={Subscription} />

      {/* Manager & Admin only routes */}
      <Route path="/jobs">
        <RoleGuard allowedRoles={["manager", "admin"]} userRole={userRole}>
          <Jobs />
        </RoleGuard>
      </Route>
      <Route path="/n8n-settings">
        <RoleGuard allowedRoles={["manager", "admin"]} userRole={userRole}>
          <N8nSettings />
        </RoleGuard>
      </Route>
      <Route path="/office-management">
        <RoleGuard allowedRoles={["manager", "admin"]} userRole={userRole}>
          <OfficeManagement />
        </RoleGuard>
      </Route>
      <Route path="/services-showcase">
        <RoleGuard allowedRoles={["manager", "admin"]} userRole={userRole}>
          <OfficeServicesShowcase />
        </RoleGuard>
      </Route>

      {/* Admin only routes */}
      <Route path="/finances">
        <RoleGuard allowedRoles={["admin"]} userRole={userRole}>
          <Finances />
        </RoleGuard>
      </Route>
      <Route path="/advertising">
        <RoleGuard allowedRoles={["admin"]} userRole={userRole}>
          <Advertising />
        </RoleGuard>
      </Route>
      <Route path="/access">
        <RoleGuard allowedRoles={["admin"]} userRole={userRole}>
          <AccessControl />
        </RoleGuard>
      </Route>
      <Route path="/admin/platform">
        <RoleGuard allowedRoles={["admin"]} userRole={userRole}>
          <PlatformManagement />
        </RoleGuard>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function VisitorRouter() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/visitor/offices" component={Storefront} />
      <Route path="/visitor/services" component={VisitorServices} />
      <Route path="/visitor/contact" component={VisitorContact} />
      <Route path="/careers" component={Careers} />
      <Route path="/office/:slug" component={OfficeDetail} />
      <Route path="/profile" component={Profile} />
      <Route component={Welcome} />
    </Switch>
  );
}

function ProtectedDashboard() {
  return (
    <SubscriptionGuard>
      <Dashboard />
    </SubscriptionGuard>
  );
}

function ProtectedOfficeManagement() {
  return (
    <SubscriptionGuard>
      <OfficeManagement />
    </SubscriptionGuard>
  );
}

function ProtectedOfficeServicesShowcase() {
  return (
    <SubscriptionGuard>
      <OfficeServicesShowcase />
    </SubscriptionGuard>
  );
}

function ProtectedPaidServices() {
  return (
    <SubscriptionGuard>
      <MyPaidServices />
    </SubscriptionGuard>
  );
}

function OfficeRenterRouter() {
  return (
    <Switch>
      <Route path="/my-subscriptions" component={Subscription} />
      <Route path="/profile" component={Profile} />
      <Route path="/office/:slug" component={OfficeDetail} />

      {/* Protected routes - require subscription */}
      <Route path="/" component={ProtectedDashboard} />
      <Route path="/my-office" component={ProtectedOfficeManagement} />
      <Route path="/my-services" component={ProtectedOfficeServicesShowcase} />
      <Route path="/paid-services" component={ProtectedPaidServices} />
      <Route component={ProtectedDashboard} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const hasRedirected = useRef(false);

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const isVisitorRole = user?.role === "visitor";
  const isOfficeRenterRole = user?.role === "office_renter";

  useEffect(() => {
    if (hasRedirected.current) return;

    const redirectPath = localStorage.getItem("cloudoffice_redirect");
    if (redirectPath) {
      localStorage.removeItem("cloudoffice_redirect");
      hasRedirected.current = true;
      setLocation(redirectPath);
      return;
    }

    if (isVisitorRole && location === "/") {
      hasRedirected.current = true;
      setLocation("/welcome");
    }
  }, [isVisitorRole, location, setLocation]);

  // Heartbeat to update online status every 2 minutes
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await apiRequest("POST", "/api/auth/heartbeat");
      } catch (error) {
        console.error("Heartbeat failed:", error);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval for heartbeat every 2 minutes
    const interval = setInterval(sendHeartbeat, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (isVisitorRole) {
    return (
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <VisitorSidebar user={user} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopHeader />
            <main className="flex-1 overflow-auto bg-background">
              <VisitorRouter />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (isOfficeRenterRole) {
    return (
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar user={user} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopHeader />
            <main className="flex-1 overflow-auto bg-background">
              <OfficeRenterRouter />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar user={user} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-auto bg-background">
            <AuthenticatedRouter userRole={user?.role} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/storefront" component={Storefront} />
      <Route path="/office/:slug" component={OfficeDetail} />
      <Route path="/careers" component={Careers} />
      <Route path="/employee-portal" component={EmployeePortal} />
      <Route path="/s/:token" component={PublicServicePage} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route component={Landing} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  const publicRoutes = ["/", "/auth", "/storefront", "/careers", "/employee-portal", "/payment-success"];
  const isPublicRoute = publicRoutes.includes(location) || location.startsWith("/office/") || location.startsWith("/s/");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PublicRouter />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
          <NotificationPermission />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
