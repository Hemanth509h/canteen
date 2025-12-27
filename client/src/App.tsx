import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/Navbar";
import CustomerHome from "@/pages/customer/customer-home";
import CustomerBookingLookup from "@/pages/customer/customer-booking-lookup";
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="elite-catering-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-1">
              <Router />
            </main>
            <footer className="border-t py-6 md:py-0 bg-muted/30">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  © 2025 Elite Catering & Events. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                  <Link href="/admin/login" className="hover:text-primary">Admin Portal</Link>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
