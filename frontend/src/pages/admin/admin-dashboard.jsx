import { Route, Switch, useLocation, Link, Redirect } from "wouter";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, UtensilsCrossed, CalendarDays, ChefHat, Users, LogOut, UserCog, Home, History, Star, Printer, BarChart3, Settings, CreditCard, Building2, ReceiptText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalSearch } from "@/components/features/global-search";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import DashboardOverview from "./admin-dashboard-overview";
import FoodItemsManager from "./admin-food-items";
import AdminAccount from "./admin-account";
import AdminHistory from "./admin-history";
import CompanySettingsManager from "./admin-company-settings";
import ReviewsManager from "./admin-reviews";
import BookingsManager from "./admin-bookings";
import StaffManager from "./admin-staff";
import AdminPaymentConfirmation from "./admin-payment";
import AdminPayments from "./admin-payments";
import AdminExpenses from "./admin-expenses";
import ChefPrintout from "./admin-chef-printout";
import AnalyticsReports from "./admin-analytics";
import branding from "@/lib/branding.json";
import { useEffect, useState } from "react";
import { clearAdminSession, isAdminAuthenticated, onAdminAuthStateChange, getAdminSession } from "@/lib/auth";
import { useQuery, useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { STATIC_COMPANY_INFO } from "@/lib/static-data";
import { useToast } from "@/hooks/use-toast";

const menuSections = [
  {
    label: "Operations",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true, roles: ["superadmin", "accountant", "chef"] },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3, roles: ["superadmin", "accountant"] },
      { title: "Bookings", url: "/admin/bookings", icon: CalendarDays, roles: ["superadmin", "accountant"] },
      { title: "Payments", url: "/admin/payments", icon: CreditCard, roles: ["superadmin", "accountant"] },
      { title: "Expenses", url: "/admin/expenses", icon: ReceiptText, roles: ["superadmin", "accountant"] },
      { title: "Staff", url: "/admin/staff", icon: Users, roles: ["superadmin"] },
    ],
  },
  {
    label: "Kitchen",
    items: [
      { title: "Chef Printout", url: "/admin/chef-printout", icon: Printer, roles: ["superadmin", "chef"] },
      { title: "Food Items", url: "/admin/food-items", icon: UtensilsCrossed, roles: ["superadmin", "chef"] },
    ],
  },
  {
    label: "Records",
    items: [
      { title: "Company Info", url: "/admin/company-info", icon: Building2, roles: ["superadmin"] },
      { title: "Reviews", url: "/admin/reviews", icon: Star, roles: ["superadmin", "accountant"] },
      { title: "History", url: "/admin/history", icon: History, roles: ["superadmin", "accountant"] },
    ],
  },
];

const menuItems = menuSections.flatMap((section) => section.items);

function AppSidebar({ onLogout, role }) {
  const [location] = useLocation();
  const { data: companyInfo, isLoading } = useQuery({
    queryKey: ["/api/company-info"],
    placeholderData: STATIC_COMPANY_INFO,
  });

  return (
    <Sidebar className="border-r border-border/60 bg-sidebar">
      <SidebarContent className="bg-sidebar px-3 py-4">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-5 flex h-auto items-center gap-3 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/40 px-3 py-3">
            <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              {isLoading ? (
                <Skeleton className="h-5 w-24 mb-1" />
              ) : (
                <span className="font-serif font-bold text-lg block truncate text-sidebar-foreground" data-testid="text-sidebar-company-name">
                  {companyInfo?.companyName || branding.companyName}
                </span>
              )}
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Admin Portal</Badge>
            </div>
          </SidebarGroupLabel>
          {menuSections.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.roles || item.roles.includes(role)
            );
            if (visibleItems.length === 0) return null;
            return (
              <SidebarGroupContent key={section.label} className="pb-4">
                <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wide text-sidebar-foreground/45">
                  {section.label}
                </p>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const isActive = item.exact ? location === item.url : location === item.url || location.startsWith(`${item.url}/`);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className="relative h-10 rounded-xl px-3 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm"
                        >
                          <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replaceAll(' ', '-')}`} className="flex items-center gap-3 font-medium">
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            );
          })}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-3 space-y-2 bg-sidebar">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          asChild
        >
          <Link href="/admin/account">
            <Settings className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">Settings</span>
          </Link>
        </Button>
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            data-testid="button-back-to-home"
          >
            <Home className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">Back to Home</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2 shrink-0" />
          <span className="truncate">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [role, setRole] = useState("superadmin");

  const queryClient = useQueryClient();
  const isFetching = useIsFetching();
  const { toast } = useToast();

  const handleGlobalRefresh = () => {
    queryClient.invalidateQueries();
    toast({
      title: "Data Refreshed",
      description: "All active dashboard panels have been successfully updated.",
    });
  };

  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
    placeholderData: STATIC_COMPANY_INFO,
  });

  useEffect(() => {
    let isMounted = true;

    isAdminAuthenticated()
      .then((authenticated) => {
        if (!isMounted) return;
        setIsAuthenticated(authenticated);
        if (authenticated) {
          const session = getAdminSession();
          setRole(session.role || "superadmin");
        }
      })
      .finally(() => {
        if (isMounted) setIsChecking(false);
      });

    const unsubscribe = onAdminAuthStateChange((authenticated) => {
      if (isMounted) {
        setIsAuthenticated(authenticated);
        if (authenticated) {
          const session = getAdminSession();
          setRole(session.role || "superadmin");
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await clearAdminSession();
    setLocation("/admin/login");
  };

  useEffect(() => {
    if (companyInfo?.primaryColor) {
      document.documentElement.style.setProperty('--primary', companyInfo.primaryColor);
    }
  }, [companyInfo?.primaryColor]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-900/10 via-background to-orange-900/10">
        <div 
          className="text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  const style = {
    "--sidebar-width": "15.5rem",
    "--sidebar-width-icon": "2.5rem",
  };

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full bg-background text-foreground">
        <AppSidebar onLogout={handleLogout} role={role} />
        <div className="flex flex-col flex-1 overflow-hidden w-full">
          <header className="sticky top-3 mx-3 z-10 flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" className="w-9 h-9 text-foreground" />
              <h1 className="text-sm font-semibold truncate max-w-[140px]">
                {menuItems.find(item => item.url === location)?.title || "Admin"}
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <GlobalSearch className="text-foreground" />
              <ThemeToggle className="text-foreground" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/admin/account")}>
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-rose-600 focus:text-rose-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 relative">
            <ErrorBoundary>
              <Switch>
                <Route path="/admin/analytics" component={AnalyticsReports} />
                <Route path="/admin/payments" component={AdminPayments} />
                <Route path="/admin/expenses" component={AdminExpenses} />
                <Route path="/admin/food-items" component={FoodItemsManager} />
                <Route path="/admin/reviews" component={ReviewsManager} />
                <Route path="/admin/bookings" component={BookingsManager} />
                {/* Remove the internal payment route as it's now handled by the main App router */}
                <Route path="/admin/staff" component={StaffManager} />
                <Route path="/admin/users"><Redirect to="/admin/account" /></Route>
                <Route path="/admin/chef-printout" component={ChefPrintout} />
                <Route path="/admin/company-info" component={CompanySettingsManager} />
                <Route path="/admin/branding"><Redirect to="/admin/company-info" /></Route>
                <Route path="/admin/history" component={AdminHistory} />
                <Route path="/admin/account" component={AdminAccount} />
                <Route path="/admin" component={DashboardOverview} />
              </Switch>
            </ErrorBoundary>

            {/* Elegant Floating Refresh Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
              <Button
                variant="default"
                size="icon"
                onClick={handleGlobalRefresh}
                disabled={isFetching > 0}
                className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:scale-110 active:scale-95 transition-all duration-300 border border-primary/20 flex items-center justify-center cursor-pointer"
                title="Refresh Page Data"
              >
                <RefreshCw className={`h-5 w-5 ${isFetching > 0 ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
