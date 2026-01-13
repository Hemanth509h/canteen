import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { CartProvider } from "@/lib/cart-context";
import CustomerHome from "@/pages/customer/customer-home";
import AdminLogin from "@/pages/admin/admin-login";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminPaymentConfirmation from "@/pages/admin/admin-payment";
import PaymentConfirmation from "@/pages/staff/payment-confirmation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerHome} />
      <Route path="/payment/:bookingId">
        {(params) => <PaymentConfirmation bookingId={params.bookingId} />}
      </Route>
      <Route path="/admin/login" component={AdminLogin} />
      {/* Specific admin routes must come BEFORE the generic /admin/:rest* catch-all */}
      <Route path="/admin/bookings/payment/:bookingId">
        {(params) => <AdminPaymentConfirmation bookingId={params.bookingId} />}
      </Route>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/:rest*">
        {(params) => <AdminDashboard rest={params.rest} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <ThemeProvider defaultTheme="light" storageKey="elite-catering-theme">
          <TooltipProvider>
            <div className="min-h-screen bg-background flex flex-col">
              <main className="flex-1">
                <Router />
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
