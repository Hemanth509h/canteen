import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import CustomerHome from "@/pages/customer/customer-home";
import AdminLogin from "@/pages/admin/admin-login";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import PaymentConfirmation from "@/pages/staff/payment-confirmation";
import AdminPaymentConfirmation from "@/pages/admin/admin-payment-confirmation";
import StaffAssignment from "@/pages/staff/staff-assignment";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerHome} />
      <Route path="/payment/:bookingId" component={PaymentConfirmation} />
      <Route path="/staff-assignment/:token" component={StaffAssignment} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/payment/:bookingId" component={AdminPaymentConfirmation} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/:rest*" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Footer() {
  const [location] = useLocation();
  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
    staleTime: 0,
  });

  // Don't show footer on admin pages
  if (location.startsWith("/admin")) {
    return null;
  }

  const companyName = companyInfo?.companyName || "Elite Catering & Events";

  return (
    <footer className="border-t py-12 bg-muted/30">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-6 text-center">
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold tracking-tight">{companyName}</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-md">
          {companyInfo?.description || "Crafting unforgettable culinary memories with passion, precision, and the finest ingredients."}
        </p>
        <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Portal</Link>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        </div>
        <div className="h-px w-24 bg-border/50" />
        <p className="text-xs text-muted-foreground/60 tracking-wider uppercase">
          © 2025 {companyName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="elite-catering-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
