import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart-context";
import { Phone } from "lucide-react";

import FoodItemQuickView from "@/components/features/food-item-quick-view";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { STATIC_COMPANY_INFO, STATIC_REVIEWS } from "@/lib/static-data";
import localMenuItems from "@/lib/menu.json";

import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Features from "./components/features";
import MenuSection from "./components/menu-section";
import Testimonials from "./components/testimonials";
import Footer from "./components/footer";
import CustomerDashboardView from "./components/customer-dashboard-view";

export default function CustomerHome() {
  const [view, setView] = useState("home");
  const { addToCart, cartItems } = useCart();
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: foodItems, isLoading: isLoadingFood } = useQuery({
    queryKey: ["/api/food-items"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/food-items");
        if (!res.ok) throw new Error("Food API unavailable");
        const json = await res.json();
        return json.data || json || localMenuItems;
      } catch {
        return localMenuItems;
      }
    },
    staleTime: 5000,
    gcTime: 10000,
    placeholderData: localMenuItems,
    refetchOnWindowFocus: false
  });
  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
    staleTime: 5000,
    gcTime: 10000,
    placeholderData: STATIC_COMPANY_INFO,
    refetchOnWindowFocus: false
  });
  const { data: reviews } = useQuery({
    queryKey: ["/api/reviews"],
    staleTime: 5000,
    gcTime: 10000,
    placeholderData: STATIC_REVIEWS,
    refetchOnWindowFocus: false
  });

  const logoSrc = companyInfo?.logoUrl || "/leaf_logo.png";
  const phoneNumber = companyInfo?.phone || companyInfo?.contactPhone || companyInfo?.phoneNumber;


  return view === "bookings" ? (
    <CustomerDashboardView onBack={() => setView("home")} />
  ) : (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Navbar companyName={companyInfo?.companyName} logoSrc={logoSrc} setView={setView} />
      <main>
        <Hero
          companyName={companyInfo?.companyName}
          tagline={companyInfo?.tagline}
          description={companyInfo?.description}
          heroImages={companyInfo?.heroImages}
          yearsExperience={companyInfo?.yearsExperience}
          eventsPerYear={companyInfo?.eventsPerYear}
        />
        <Features />
        <MenuSection
          foodItems={foodItems}
          isLoading={isLoadingFood}
          onSelectItem={setSelectedItem}
          addToCart={addToCart}
          cartItems={cartItems}
        />
        <Testimonials reviews={reviews} />
        <Footer companyInfo={companyInfo} logoSrc={logoSrc} setView={setView} />
      </main>

      {phoneNumber && (
        <a
          href={`tel:${phoneNumber.replace(/\D/g, "")}`}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-110 transition-transform"
        >
          <Phone size={22} />
        </a>
      )}

      <Dialog open={!!selectedItem} onOpenChange={(o) => !o && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <FoodItemQuickView
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            defaultFoodImage="https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=800&auto=format&fit=crop"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
