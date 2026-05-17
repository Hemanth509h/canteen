import { useEffect } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { socket } from "./lib/socket";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { CartProvider } from "@/lib/cart-context";
import CustomerHome from "@/pages/customer/customer-home";
import BookingSuccess from "@/pages/customer/booking-success";
import AdminLogin from "@/pages/admin/admin-login";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminPaymentConfirmation from "@/pages/admin/admin-payment";
import PaymentConfirmation from "@/pages/staff/payment-confirmation";
import StaffLogin from "@/pages/staff/staff-login";
import StaffDashboard from "@/pages/staff/staff-dashboard";
import StaffPaymentPage from "@/pages/staff/staff-payment";
import StaffPaymentsListPage from "@/pages/staff/staff-payments-list";
import NotFound from "@/pages/not-found";
import { STATIC_COMPANY_INFO } from "@/lib/static-data";
import branding from "@/lib/branding.json";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerHome} />
      <Route path="/booking-success" component={BookingSuccess} />
      <Route path="/payment/:bookingId">
        {(params) => <PaymentConfirmation bookingId={params.bookingId} />}
      </Route>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/staff/login" component={StaffLogin} />
      <Route path="/staff/dashboard" component={StaffDashboard} />
      <Route path="/staff/payments" component={StaffPaymentsListPage} />
      <Route path="/staff/payment/:bookingId">
        {(params) => <StaffPaymentPage bookingId={params.bookingId} />}
      </Route>
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


function AppContent() {
  const [location] = useLocation();
  const { data: companyInfo } = useQuery({ 
    queryKey: ["/api/company-info"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: STATIC_COMPANY_INFO,
  });
  const { toast } = useToast();

  useEffect(() => {
    const handlePayment = (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/assignments"] });
      if (location.startsWith("/admin")) {
        toast({
          title: "Payment Received!",
          description: `A ${data?.type || ""} payment screenshot was uploaded.`,
        });
      }
    };

    socket.on("payment:uploaded", handlePayment);

    return () => {
      socket.off("payment:uploaded", handlePayment);
    };
  }, [location, toast]);

  useEffect(() => {
    const baseTitle = companyInfo?.companyName || branding.companyName;
    let pageTitle = "";

    if (location === "/") {
      pageTitle = companyInfo?.tagline ? ` | ${companyInfo.tagline}` : "";
    } else if (location.startsWith("/admin")) {
      pageTitle = " | Admin Portal";
    } else if (location.startsWith("/payment/")) {
      pageTitle = " | Payment Confirmation";
    } else if (location.startsWith("/staff")) {
      pageTitle = " | Staff Portal";
    } else if (location.startsWith("/admin/bookings/payment/")) {
      pageTitle = " | Payment Confirmation";
    }

    document.title = `${baseTitle}${pageTitle}`;
  }, [location, companyInfo]);

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-background text-foreground">
      <main className="min-w-0 flex-1">
        <Router />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <ThemeProvider defaultTheme="system" storageKey="elite-catering-theme">
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
