import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import CustomerHome from "@/pages/customer/customer-home";
import BookingSuccess from "@/pages/customer/booking-success";
import NotFound from "@/pages/not-found";
import branding from "@/lib/branding.json";
import { CartProvider } from "@/lib/cart-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerHome} />
      <Route path="/booking-success" component={BookingSuccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const companyInfo = branding;

  useEffect(() => {
    const baseTitle = companyInfo?.companyName || branding.companyName;
    let pageTitle = "";

    if (location === "/") {
      pageTitle = companyInfo?.tagline ? ` | ${companyInfo.tagline}` : "";
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
    <ThemeProvider defaultTheme="system" storageKey="elite-catering-theme">
      <TooltipProvider>
        <CartProvider>
          <AppContent />
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
