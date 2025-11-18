import { Route, Switch, useLocation, Link } from "wouter";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, UtensilsCrossed, CalendarDays, Settings, ChefHat } from "lucide-react";
import DashboardOverview from "./admin-dashboard-overview";
import FoodItemsManager from "./admin-food-items";
import EventBookingsManager from "./admin-event-bookings";
import CompanySettingsManager from "./admin-company-settings";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Food Items", url: "/admin/food-items", icon: UtensilsCrossed },
  { title: "Event Bookings", url: "/admin/bookings", icon: CalendarDays },
  { title: "Company Settings", url: "/admin/settings", icon: Settings },
];

function AppSidebar() {
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminDashboard() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
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
              <Route path="/admin/settings" component={CompanySettingsManager} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
