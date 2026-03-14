import { Link, useLocation } from "wouter";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChefHat, Award, Users, Clock, Utensils, Search, Lock, Moon, Sun,
  Sprout, Wind, ChevronRight, Star, Quote, MapPin, Instagram, Facebook, Twitter,
  Phone, ArrowUp, Camera, Calendar, CheckCircle, Plus, ShoppingCart, User, Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import ReviewsCarousel from "@/components/reviews-carousel";
import ReviewForm from "@/components/review-form";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useCart } from "@/lib/cart-context";
import { CartDrawer } from "@/components/features/cart-drawer";
import HowItWorks from "@/components/features/how-it-works";
import NavigationButton from "@/components/features/back-to-top";
import FoodItemQuickView from "@/components/features/food-item-quick-view";

const PhoneCallButton = ({ phone }) => (
  <a
    href={`tel:${phone?.replace(/\D/g, '') || '1234567890'}`}
    className="fixed bottom-6 left-6 z-[90] bg-primary text-primary-foreground p-4 rounded-full shadow-gold-lg hover:scale-110 transition-all duration-300 flex items-center justify-center group"
  >
    <Phone size={28} />
    <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 whitespace-nowrap font-bold text-sm">
      Call us
    </span>
  </a>
);

const OrnamentalDivider = ({ label }) => (
  <div className="flex items-center justify-center gap-4 my-2">
    <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-primary/40" />
    {label ? (
      <span className="text-primary text-xs uppercase tracking-[0.25em] font-jakarta font-semibold">{label}</span>
    ) : (
      <Sparkles size={14} className="text-primary/60" />
    )}
    <div className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-primary/40" />
  </div>
);

const Testimonials = ({ reviews }) => (
  <section className="py-24 px-6 bg-secondary/30">
    <div className="max-w-7xl mx-auto text-center">
      <OrnamentalDivider label="Testimonials" />
      <h2 className="text-4xl md:text-6xl font-playfair font-bold mt-4 mb-4">What Our Clients Say</h2>
      <p className="text-muted-foreground font-jakarta mb-16 max-w-xl mx-auto">Experiences shared by those who've trusted us with their most important moments.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(reviews || [
          { customerName: "Sarah J.", eventType: "Wedding", comment: "The food was absolutely divine! Every guest was impressed by the presentation and flavor." },
          { customerName: "Michael R.", eventType: "Corporate", comment: "Professional service and exceptional quality. They made our event truly special." },
          { customerName: "Elena W.", eventType: "Birthday", comment: "Best catering experience we've ever had. Highly recommend their artisan menu!" }
        ]).slice(0, 3).map((review, idx) => (
          <div key={idx} className="relative p-8 bg-card border border-border/60 rounded-2xl card-hover text-left group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500" />
            <Quote className="text-primary/25 mb-5" size={36} />
            <p className="text-base italic mb-6 leading-relaxed text-foreground/80 font-jakarta">"{review.comment}"</p>
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-primary text-primary" />)}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold font-playfair text-lg">
                {review.customerName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm font-jakarta">{review.customerName}</h4>
                <span className="text-xs text-muted-foreground font-jakarta">{review.eventType} Event</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = ({ companyInfo, logoSrc }) => (
  <footer className="bg-card pt-20 pb-10 px-6 border-t border-border/30 relative overflow-hidden">
    <div className="max-w-7xl mx-auto flex flex-col items-center gap-10 text-center relative z-10">
      <div className="flex items-center gap-3">
        <img src={logoSrc} alt="Logo" className="w-9 h-9" />
        <h3 className="text-2xl font-playfair font-bold">{companyInfo?.companyName || "Elite Catering"}</h3>
      </div>

      <p className="text-muted-foreground max-w-md leading-relaxed italic text-sm font-jakarta px-4">
        "{companyInfo?.tagline || "Artisan culinary experiences crafted with passion and precision."}"
      </p>

      <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-jakarta font-medium">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-primary transition-colors cursor-pointer">Home</button>
        <button onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary transition-colors cursor-pointer">Our Menu</button>
        <button onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary transition-colors cursor-pointer">Contact Us</button>
        <Link href="/admin/login" className="hover:text-primary transition-colors flex items-center gap-2 font-semibold">
          <Lock size={13} className="text-primary" />
          Admin Portal
        </Link>
      </nav>

      <div className="flex gap-3">
        {[Instagram, Facebook, Twitter].map((Icon, i) => (
          <Button key={i} variant="ghost" size="icon" className="rounded-full w-10 h-10 border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
            <Icon size={16} />
          </Button>
        ))}
      </div>

      <div className="w-full pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-jakarta">
        <div className="flex flex-wrap gap-6 items-center justify-center">
          <span className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> {companyInfo?.address || "123 Culinary St, Food City"}</span>
          <span className="flex items-center gap-2"><Clock size={14} className="text-primary" /> Mon – Sun: 9AM – 10PM</span>
          {companyInfo?.phoneNumber && (
            <span className="flex items-center gap-2 text-primary font-semibold">
              <Phone size={14} /> {companyInfo.phoneNumber}
            </span>
          )}
        </div>
        <p>© 2025 {companyInfo?.companyName || "Elite Catering"}. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const features = [
  { icon: ChefHat, title: "Expert Chefs", description: "Our culinary masters craft each dish with passion and precision" },
  { icon: Award, title: "Premium Quality", description: "Only the finest ingredients for unforgettable flavors" },
  { icon: Users, title: "Any Occasion", description: "From intimate gatherings to grand celebrations" },
  { icon: Clock, title: "On-Time Service", description: "Punctual delivery and setup for stress-free events" },
];

const FloatingOrb = ({ className }) => (
  <div className={cn("absolute pointer-events-none rounded-full blur-3xl", className)} />
);

export default function CustomerHome() {
  const [, setLocation] = useLocation();
  const { addToCart, cartItems } = useCart();
  const [selectedType, setSelectedType] = useState("Veg");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showWebsite, setShowWebsite] = useState(false);

  const { data: foodItems, isLoading: isLoadingFood } = useQuery({
    queryKey: ["/api/food-items"],
    staleTime: 0,
    gcTime: 0,
  });

  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (companyInfo?.primaryColor) {
      document.documentElement.style.setProperty('--primary', companyInfo.primaryColor);
    }
  }, [companyInfo?.primaryColor]);

  const { data: reviews } = useQuery({
    queryKey: ["/api/reviews"],
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (!isLoadingFood) {
      setIsPageLoaded(true);
      return;
    }
    const timeout = setTimeout(() => setIsPageLoaded(true), 4000);
    return () => clearTimeout(timeout);
  }, [isLoadingFood]);

  useEffect(() => {
    if (isPageLoaded) {
      const timer = setTimeout(() => setShowWebsite(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isPageLoaded]);

  const categories = useMemo(() => {
    if (!foodItems) return ["All"];
    const categoriesForType = foodItems
      .filter(item => selectedType === "All" || item.type === selectedType)
      .map(item => item.category);
    const uniqueCategories = Array.from(new Set(categoriesForType)).sort();
    return ["All", ...uniqueCategories];
  }, [foodItems, selectedType]);

  const filteredItems = useMemo(() => {
    return foodItems?.filter((item) => {
      const isSearching = searchQuery !== "";
      const matchesType = isSearching ? true : (!selectedType || item.type === selectedType);
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch = searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    }) || [];
  }, [foodItems, selectedType, selectedCategory, searchQuery]);

  const logoSrc = "/leaf_logo.png";

  if (!showWebsite) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
        <div className="relative mb-6">
          <LoadingSpinner size="lg" className="text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={logoSrc} alt="Logo" className="w-14 h-14 animate-pulse" />
          </div>
        </div>
        <p className="text-xl font-playfair font-bold text-primary tracking-widest uppercase">
          {companyInfo?.companyName || "Elite Catering"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground font-jakarta font-light italic">
          Preparing your culinary experience...
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-background text-foreground selection:bg-primary/20 animate-in fade-in duration-700 dark">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <FloatingOrb className="top-[-10%] left-[-5%] w-96 h-96 bg-primary/6 dot-float-1" />
        <FloatingOrb className="top-[40%] right-[-8%] w-80 h-80 bg-primary/4 dot-float-2" />
        <FloatingOrb className="bottom-[10%] left-[15%] w-64 h-64 bg-primary/5 dot-float-3" />
      </div>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative min-h-[92vh] overflow-hidden flex items-center">
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3 fade-in">
          <ThemeToggle />
        </div>

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-zinc-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Subtle gold glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center text-white text-center px-6 py-28">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass bg-white/10 border border-white/20 mb-8 slide-up">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-jakarta font-medium tracking-[0.2em] uppercase text-white/90">Premium Catering</span>
          </div>

          <h1 className="text-4xl sm:text-7xl md:text-8xl font-playfair font-bold mb-6 leading-[1.05] tracking-tight slide-up text-white drop-shadow-2xl">
            {companyInfo?.companyName || "Elite Catering"}
          </h1>

          <p className="text-base sm:text-xl max-w-xl mb-10 font-jakarta font-light slide-up text-white/75 leading-relaxed">
            {companyInfo?.tagline || "Artisan culinary experiences crafted for life's most meaningful occasions."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 slide-up">
            <Button
              size="lg"
              className="group rounded-xl px-10 py-6 text-base font-jakarta font-bold shadow-gold-lg hover:shadow-gold transition-all duration-500 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 border-none"
              onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Menu
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group rounded-xl px-10 py-6 text-base font-jakarta font-semibold border-white/30 text-white hover:bg-white/15 glass backdrop-blur"
              onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Book an Event
            </Button>
          </div>
        </div>
      </div>

      {/* ─── ABOUT / STATS ─────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: story */}
            <div className="slide-up">
              <OrnamentalDivider label="Our Story" />
              <h2 className="text-3xl sm:text-5xl font-playfair font-bold mt-6 mb-6 leading-tight">
                The Art of<br />
                <span className="gold-shimmer">Gastronomy</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed font-jakarta font-light italic">
                "{companyInfo?.description || "We bring the finest ingredients together, celebrating the pure essence of every occasion with flavors that linger."}"
              </p>

              <div className="grid grid-cols-2 gap-8">
                <div className="group">
                  <div className="text-5xl sm:text-6xl font-playfair font-bold text-primary mb-1 transition-transform group-hover:scale-105 duration-500">
                    {companyInfo?.yearsExperience || 15}+
                  </div>
                  <div className="text-xs font-jakarta font-bold uppercase tracking-widest text-muted-foreground/70">Years of Craft</div>
                </div>
                <div className="group">
                  <div className="text-5xl sm:text-6xl font-playfair font-bold text-primary mb-1 transition-transform group-hover:scale-105 duration-500">
                    {companyInfo?.eventsPerYear || 500}+
                  </div>
                  <div className="text-xs font-jakarta font-bold uppercase tracking-widest text-muted-foreground/70">Annual Events</div>
                </div>
              </div>
            </div>

            {/* Right: feature cards */}
            <div className="grid grid-cols-2 gap-5 sm:gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 bg-card rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-500 group slide-up cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors duration-500">
                    <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                  </div>
                  <h3 className="font-playfair font-bold text-base sm:text-lg mb-2">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-jakarta line-clamp-2">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* ─── MENU ──────────────────────────────────────────────────────────── */}
      <section id="menu" className="py-20 sm:py-28 px-4 sm:px-6 bg-secondary/20 rounded-3xl mx-3 sm:mx-6 lg:mx-10 relative z-10">
        <div className="max-w-[98%] mx-auto">
          <div className="text-center mb-14 slide-up">
            <OrnamentalDivider label="Our Menu" />
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold mt-5 mb-4">Seasonal Selections</h2>
            <p className="text-muted-foreground font-jakarta mb-10 max-w-lg mx-auto">Explore our curated dishes, crafted from the freshest seasonal ingredients.</p>

            {/* Filters */}
            <div className="flex justify-center mb-8">
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
                <div className="w-full sm:w-1/3">
                  <Select value={selectedType} onValueChange={(val) => { setSelectedType(val); setSelectedCategory("All"); }}>
                    <SelectTrigger className="rounded-xl h-14 border border-border/60 bg-card shadow-sm focus:ring-2 focus:ring-primary/20 font-jakarta text-base">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="Veg">Vegetarian</SelectItem>
                      <SelectItem value="Non-Veg">Non-Vegetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    list="food-suggestions"
                    className="pl-11 rounded-xl h-14 border border-border/60 bg-card shadow-sm focus:ring-2 focus:ring-primary/20 font-jakarta text-base"
                  />
                  <datalist id="food-suggestions">
                    {foodItems?.map((item, idx) => <option key={idx} value={item.name} />)}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center max-w-5xl mx-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-5 py-2 text-xs font-jakarta font-semibold tracking-wide transition-all duration-300 border",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-gold"
                      : "bg-card text-foreground border-border/60 hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu grid */}
          <div className="max-h-[820px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {isLoadingFood ? (
                Array(8).fill(0).map((_, i) => (
                  <div key={i} className="space-y-4 slide-up">
                    <Skeleton className="h-52 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : (
                filteredItems.map((item) => {
                  const cartItem = cartItems.find(i => i.id === item.id);
                  const isSelected = !!cartItem;
                  const quantity = cartItem?.quantity || 0;

                  return (
                    <div key={item.id} className="group relative slide-up">
                      <Card
                        onClick={() => !isSelected && setSelectedItem(item)}
                        className={cn(
                          "overflow-hidden bg-card border border-border/50 hover:border-primary/25 shadow-sm hover:shadow-gold-lg transition-all duration-500 rounded-2xl cursor-pointer hover:-translate-y-2 h-full flex flex-col",
                          isSelected && "ring-2 ring-primary border-primary/50"
                        )}
                      >
                        <div className="h-48 sm:h-56 relative overflow-hidden">
                          <img
                            src={item.imageUrl || "https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=800&auto=format&fit=crop"}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=800&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute top-3 left-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] uppercase font-jakarta font-bold tracking-wider backdrop-blur-sm glass px-2.5 py-0.5",
                                item.type === 'Veg'
                                  ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                                  : 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                              )}
                            >
                              {item.type}
                            </Badge>
                          </div>
                          {isSelected && (
                            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                              <div className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-jakarta font-bold text-sm flex items-center gap-2">
                                <CheckCircle size={16} />
                                Added to Cart
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-5 flex flex-col flex-grow text-left">
                          <h3 className="font-playfair font-bold text-base sm:text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                            {item.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4 font-jakarta font-light italic flex-grow">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            {item.price && (
                              <span className="text-primary font-playfair font-bold text-lg">
                                ₹{item.price}
                              </span>
                            )}
                            {!isSelected && (
                              <Button
                                size="sm"
                                className="rounded-xl h-9 px-4 font-jakarta font-bold text-xs shadow-gold hover:shadow-gold-lg transition-all hover:scale-105 bg-primary text-primary-foreground border-none ml-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      <Testimonials reviews={reviews} />

      <Footer companyInfo={companyInfo} logoSrc={logoSrc} />

      <PhoneCallButton phone={companyInfo?.phone} />

      {/* Floating account button */}
      <Link href="/customer/dashboard">
        <div className="fixed bottom-40 right-6 z-[90] bg-card/80 glass border border-border/60 text-foreground p-4 rounded-full shadow-lg hover:scale-110 hover:border-primary/40 transition-all duration-300 flex items-center justify-center cursor-pointer">
          <User size={22} />
        </div>
      </Link>

      {/* Floating cart */}
      <div className="fixed bottom-24 right-6 z-[90]">
        <CartDrawer />
      </div>

      <NavigationButton />

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border border-border/50 rounded-3xl bg-card">
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
