import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import CustomerHome from "@/pages/customer/customer-home";
import BookingSuccess from "@/pages/customer/booking-success";
import AboutUs from "@/pages/customer/about-us";
import EventGallery from "@/pages/customer/event-gallery";
import PrivacyPolicy from "@/pages/customer/privacy-policy";
import TermsAndConditions from "@/pages/customer/terms-and-conditions";
import NotFound from "@/pages/not-found";
import { CartProvider } from "@/lib/cart-context";
import { useSiteContent } from "@/lib/site-content";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerHome} />
      <Route path="/booking-success" component={BookingSuccess} />
      <Route path="/about-us" component={AboutUs} />
      <Route path="/gallery" component={EventGallery} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsAndConditions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const { branding } = useSiteContent();

  useEffect(() => {
    const baseTitle = branding.companyName;
    let pageTitle = "";

    if (location === "/") {
      pageTitle = branding.tagline ? ` | ${branding.tagline}` : "";
    } else if (location === "/about-us") {
      pageTitle = " | About Us";
    } else if (location === "/gallery") {
      pageTitle = " | Event Gallery";
    } else if (location === "/privacy-policy") {
      pageTitle = " | Privacy Policy";
    } else if (location === "/terms") {
      pageTitle = " | Terms & Conditions";
    }

    document.title = `${baseTitle}${pageTitle}`;
  }, [location, branding]);

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
