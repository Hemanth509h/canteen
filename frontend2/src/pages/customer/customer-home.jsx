import { useState } from "react";


import { Phone } from "lucide-react";

import FoodItemQuickView from "@/components/features/food-item-quick-view";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "@/lib/cart-context";
import { saveSiteContent, useSiteContent } from "@/lib/site-content";

import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Features from "./components/features";
import MenuSection from "./components/menu-section";
import Testimonials from "./components/testimonials";
import OwnerAndVideos from "./components/owner-and-videos";
import Footer from "./components/footer";
import { CartDrawer } from "@/components/features/cart-drawer";

export default function CustomerHome() {
  const [view, setView] = useState("home");
  const { cartItems, addToCart } = useCart();
  const [selectedItem, setSelectedItem] = useState(null);
  const siteContent = useSiteContent();
  const { branding, menuItems } = siteContent;
  const reviews = branding?.reviews || [];

  const foodItems = menuItems;
  const isLoadingFood = false;
  const companyInfo = branding;
  const logoSrc = companyInfo?.logoUrl || "/leaf_logo.svg";
  const phoneNumber = companyInfo?.phone || companyInfo?.contactPhone || companyInfo?.phoneNumber;

  const handleSubmitReview = async (review) => {
    saveSiteContent({
      ...siteContent,
      branding: {
        ...branding,
        reviews: [
          {
            ...review,
            id: `review-${Date.now()}`,
          },
          ...(reviews || []),
        ],
      },
    });
  };

  return (
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
        <OwnerAndVideos companyInfo={companyInfo} />
        <MenuSection
          foodItems={foodItems}
          isLoading={isLoadingFood}
          onSelectItem={setSelectedItem}
          addToCart={addToCart}
          cartItems={cartItems}
        />
        <Testimonials reviews={reviews} onSubmitReview={handleSubmitReview} />
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

      <div className="fixed bottom-6 right-6 z-50">
        <CartDrawer />
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(o) => !o && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="sr-only">
            <DialogTitle>{selectedItem?.name || "Food Item Details"}</DialogTitle>
            <DialogDescription>
              View details and description for {selectedItem?.name || "this food item"}.
            </DialogDescription>
          </div>
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
