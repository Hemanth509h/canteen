import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
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
      <Route path="/check-booking" component={CustomerBookingLookup} />
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
      <ThemeProvider defaultTheme="light" storageKey="ravi-canteen-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
