import { Route, Switch, useLocation, Link, Redirect } from "wouter";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, UtensilsCrossed, CalendarDays, Settings, ChefHat, Users, LogOut, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardOverview from "./admin-dashboard-overview";
import FoodItemsManager from "./admin-food-items";
import EventBookingsManager from "./admin-event-bookings";
import CompanySettingsManager from "./admin-company-settings";
import StaffManager from "./admin-staff";
import AdminAccount from "./admin-account";
import ChefPrintout from "./admin-chef-printout";
import { useEffect, useState } from "react";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Food Items", url: "/admin/food-items", icon: UtensilsCrossed },
  { title: "Event Bookings", url: "/admin/bookings", icon: CalendarDays },
  { title: "Staff", url: "/admin/staff", icon: Users },
  { title: "Company Settings", url: "/admin/settings", icon: Settings },
  { title: "Account Settings", url: "/admin/account", icon: UserCog },
];

function AppSidebar({ onLogout }: { onLogout: () => void }) {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-lg py-4">
            <ChefHat className="w-5 h-5" />
            <span style={{ fontFamily: 'Poppins, sans-serif' }}>Admin Panel</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <div className="mt-4 px-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuthenticated");
    setIsAuthenticated(authStatus === "true");
    setIsChecking(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setLocation("/admin/login");
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ChefHat className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar onLogout={handleLogout} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b border-border bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="text-xl font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Catering Management
            </h1>
          </header>
          <main className="flex-1 overflow-auto bg-background">
            <Switch>
              <Route path="/admin" component={DashboardOverview} />
              <Route path="/admin/food-items" component={FoodItemsManager} />
              <Route path="/admin/bookings" component={EventBookingsManager} />
              <Route path="/admin/chef-printout" component={ChefPrintout} />
              <Route path="/admin/staff" component={StaffManager} />
              <Route path="/admin/settings" component={CompanySettingsManager} />
              <Route path="/admin/account" component={AdminAccount} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
