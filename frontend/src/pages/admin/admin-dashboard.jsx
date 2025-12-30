import { Route, Switch, useLocation, Link, Redirect } from "wouter";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, UtensilsCrossed, CalendarDays, Settings, ChefHat, Users, LogOut, UserCog, Home, Package, History, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { GlobalSearch } from "@/components/features/global-search";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import DashboardOverview from "./admin-dashboard-overview";
import FoodItemsManager from "./admin-food-items";
import EventBookingsManager from "./admin-event-bookings";
import AdminPaymentConfirmation from "./admin-payment-confirmation";
import CompanySettingsManager from "./admin-company-settings";
import StaffManager from "./admin-staff";
import AdminAccount from "./admin-account";
import ChefPrintout from "./admin-chef-printout";
import AuditHistory from "./admin-audit-history";
import ReviewsManager from "./admin-reviews";
import { useEffect, useState } from "react";
import { isAdminAuthenticated, clearAdminSession, refreshSession } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import "@/schema";
import { Skeleton } from "@/components/ui/skeleton";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Food Items", url: "/admin/food-items", icon: UtensilsCrossed },
  { title: "Event Bookings", url: "/admin/bookings", icon: CalendarDays },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Staff", url: "/admin/staff", icon: Users },
  { title: "Audit History", url: "/admin/audit-history", icon: History },
  { title: "Company Settings", url: "/admin/settings", icon: Settings },
  { title: "Account Settings", url: "/admin/account", icon: UserCog },
];

function AppSidebar({ onLogout }) {
  const [location] = useLocation();
  const { data: companyInfo, isLoading } = useQuery({
    queryKey: ["/api/company-info"],
  });

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarContent className="bg-gradient-to-b from-sidebar to-sidebar/95">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-3 px-4 py-6 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              {isLoading ? (
                <Skeleton className="h-5 w-24 mb-1" />
              ) : (
                <span className="font-serif font-bold text-lg block truncate" data-testid="text-sidebar-company-name">
                  {companyInfo?.companyName || "Elite Catering"}
                </span>
              )}
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Admin</Badge>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className="rounded-lg transition-all duration-200"
                  >
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-3 space-y-2">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            data-testid="button-back-to-home"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsAuthenticated(isAdminAuthenticated());
    setIsChecking(false);
    
    // Refresh session on activity
    const handleActivity = () => refreshSession();
    window.addEventListener("click", handleActivity);
    window.addEventListener("keypress", handleActivity);
    
    return () => {
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keypress", handleActivity);
    };
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    setLocation("/admin/login");
  };

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
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "2.5rem",
  };

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full">
        <AppSidebar onLogout={handleLogout} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-border/50 bg-background/95 backdrop-blur-sm flex-wrap">
            <SidebarTrigger data-testid="button-sidebar-toggle" className="w-9 h-9" />
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden sm:block">
                <GlobalSearch />
              </div>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/20">
            
              
                <Route path="/admin" component={DashboardOverview} />
                <Route path="/admin/food-items" component={FoodItemsManager} />
                <Route path="/admin/bookings" component={EventBookingsManager} />
                <Route path="/admin/payment/:bookingId" component={AdminPaymentConfirmation} />
                <Route path="/admin/chef-printout" component={ChefPrintout} />
                <Route path="/admin/reviews" component={ReviewsManager} />
                <Route path="/admin/staff" component={StaffManager} />
                <Route path="/admin/audit-history" component={AuditHistory} />
                <Route path="/admin/settings" component={CompanySettingsManager} />
                <Route path="/admin/account" component={AdminAccount} />
              </Switch>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
