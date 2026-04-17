import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart-context";
import { CartDrawer } from "@/components/features/cart-drawer";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import FoodItemQuickView from "@/components/features/food-item-quick-view";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Search, Star, Phone, MapPin, Instagram, Facebook, Twitter,
  ChevronRight, Plus, CheckCircle, Lock, Clock, Award, Users, ChefHat
} from "lucide-react";

/* ─── Navbar ─────────────────────────────────────────────────────────────── */
function Navbar({ companyName, logoSrc }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {logoSrc && <img src={logoSrc} alt="logo" className="w-8 h-8" />}
          <span className="font-playfair font-bold text-lg text-zinc-900 dark:text-white hidden sm:block transition-colors">
            {companyName || "Elite Catering"}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-jakarta font-medium text-zinc-500 dark:text-zinc-400">
          <button onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Menu</button>
          <button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">About</button>
          <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Contact</button>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/customer/dashboard">
            <button className="text-sm font-jakarta font-semibold text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors hidden sm:block">
              My Bookings
            </button>
          </Link>
          <CartDrawer />
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function Hero({ companyName, tagline }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #92400e 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/15 dark:bg-amber-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400/10 dark:bg-orange-500/15 rounded-full blur-[100px]" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/40 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-jakarta font-semibold tracking-widest uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
          Premium Catering Service
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-playfair font-bold text-zinc-900 dark:text-white leading-[1.05] mb-6 transition-colors">
          {companyName || "Elite Catering"}
        </h1>

        <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 font-jakarta font-light max-w-2xl mx-auto mb-12 leading-relaxed transition-colors">
          {tagline || "Crafting unforgettable culinary experiences for your most cherished occasions."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-jakarta font-bold text-base transition-all duration-200 hover:scale-105 shadow-lg shadow-amber-500/25"
          >
            Explore Menu <ChevronRight size={18} />
          </button>
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 font-jakarta font-semibold text-base transition-all duration-200 bg-white dark:bg-transparent"
          >
            Book an Event
          </button>
        </div>

        <div className="flex items-center justify-center gap-8 mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
          {[
            { value: "15+", label: "Years Experience" },
            { value: "500+", label: "Events Catered" },
            { value: "98%", label: "Happy Clients" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-playfair font-bold text-amber-600 dark:text-amber-400">{stat.value}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500 font-jakarta mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-600">
        <span className="text-xs font-jakarta tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-zinc-400 dark:from-zinc-600 to-transparent animate-pulse" />
      </div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────────────────────────────── */
function Features() {
  const items = [
    { icon: ChefHat, title: "Expert Chefs", desc: "Masters of their craft" },
    { icon: Award, title: "Premium Quality", desc: "Finest ingredients only" },
    { icon: Users, title: "Any Occasion", desc: "Intimate to grand" },
    { icon: Clock, title: "Always On Time", desc: "Punctual every time" },
  ];
  return (
    <section id="about" className="bg-white dark:bg-zinc-900 py-16 px-6 border-b border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((f) => (
          <div key={f.title} className="flex flex-col items-center text-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300">
              <f.icon className="w-6 h-6 text-amber-600 dark:text-amber-400 group-hover:text-white transition-colors duration-300" />
            </div>
            <div>
              <p className="font-playfair font-bold text-zinc-900 dark:text-white text-base transition-colors">{f.title}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-jakarta">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Menu Section ───────────────────────────────────────────────────────── */
function MenuSection({ foodItems, isLoading, onSelectItem, addToCart, cartItems }) {
  const [type, setType] = useState("All");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    if (!foodItems) return ["All"];
    const cats = foodItems.filter((i) => type === "All" || i.type === type).map((i) => i.category);
    return ["All", ...Array.from(new Set(cats)).sort()];
  }, [foodItems, type]);

  const filtered = useMemo(() => {
    return (foodItems || []).filter((item) => {
      const matchType = type === "All" || item.type === type;
      const matchCat = category === "All" || item.category === category;
      const matchSearch = !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(search.toLowerCase());
      return matchType && matchCat && matchSearch;
    });
  }, [foodItems, type, category, search]);

  return (
    <section id="menu" className="bg-zinc-50 dark:bg-zinc-950 py-20 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-amber-600 dark:text-amber-400 text-xs font-jakarta font-bold uppercase tracking-[0.3em] mb-3">Our Menu</p>
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-zinc-900 dark:text-white mb-4 transition-colors">Seasonal Selections</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-jakarta max-w-lg mx-auto">Curated dishes made with the freshest seasonal ingredients.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shrink-0 transition-colors">
            {["All", "Veg", "Non-Veg"].map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setCategory("All"); }}
                className={cn(
                  "px-5 py-2.5 text-sm font-jakarta font-semibold transition-colors",
                  type === t
                    ? "bg-amber-500 text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}
              >{t}</button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-jakarta text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-jakarta font-bold border transition-all",
                category === cat
                  ? "bg-amber-500 text-white border-amber-500"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400"
              )}
            >{cat}</button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-h-[500px] overflow-y-auto custom-scrollbar p-2 -m-2">
          {isLoading
            ? Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 space-y-3 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-6 w-3/4 bg-zinc-100 dark:bg-zinc-800" />
                  <Skeleton className="h-5 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                </div>
                <Skeleton className="h-4 w-full bg-zinc-100 dark:bg-zinc-800" />
                <Skeleton className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-800" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800" />
                  <Skeleton className="h-9 w-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
            ))
            : filtered.map((item) => {
              const inCart = cartItems.find((c) => c.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => !inCart && onSelectItem(item)}
                  className={cn(
                    "group rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-300 cursor-pointer hover:-translate-y-1",
                    inCart
                      ? "border-amber-400 dark:border-amber-500 shadow-lg shadow-amber-500/10"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-zinc-900"
                  )}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-playfair font-bold text-zinc-900 dark:text-white text-lg line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex-1 min-w-0">
                        {item.name}
                      </h3>
                      <span className={cn(
                        "shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-jakarta font-bold uppercase tracking-wide border",
                        item.type === "Veg"
                          ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400"
                          : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400"
                      )}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-jakarta line-clamp-2 mb-5 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      {item.price && (
                        <span className="font-playfair font-bold text-amber-600 dark:text-amber-400 text-lg">₹{item.price}</span>
                      )}
                      {inCart ? (
                        <span className="ml-auto flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-jakarta font-bold text-sm">
                          <CheckCircle size={15} /> In Cart
                        </span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-jakarta font-bold text-sm transition-all hover:scale-105 shadow-md shadow-amber-500/20"
                        >
                          <Plus size={15} /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────────────────── */
function Testimonials({ reviews }) {
  const list = reviews?.length ? reviews.slice(0, 3) : [
    { customerName: "Sarah J.", eventType: "Wedding", comment: "Absolutely divine food! Every guest was blown away." },
    { customerName: "Michael R.", eventType: "Corporate", comment: "Professional, punctual, and exceptional quality." },
    { customerName: "Elena W.", eventType: "Birthday", comment: "Best catering we've ever experienced. Highly recommend!" },
  ];
  return (
    <section className="bg-white dark:bg-zinc-900 py-20 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-amber-600 dark:text-amber-400 text-xs font-jakarta font-bold uppercase tracking-[0.3em] mb-3">Reviews</p>
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-zinc-900 dark:text-white transition-colors">What Clients Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {list.map((r, i) => (
            <div key={i} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 flex flex-col gap-4 transition-colors">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 font-jakarta text-sm leading-relaxed flex-1">"{r.comment}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center font-playfair font-bold text-amber-700 dark:text-amber-400">
                  {r.customerName.charAt(0)}
                </div>
                <div>
                  <p className="font-jakarta font-bold text-sm text-zinc-900 dark:text-white">{r.customerName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-jakarta">{r.eventType}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
function Footer({ companyInfo, logoSrc }) {
  return (
    <footer id="contact" className="bg-zinc-900 dark:bg-zinc-950 text-zinc-400 py-16 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              {logoSrc && <img src={logoSrc} alt="logo" className="w-8 h-8" />}
              <span className="font-playfair font-bold text-white text-lg">{companyInfo?.companyName || "Elite Catering"}</span>
            </div>
            <p className="font-jakarta text-sm leading-relaxed italic">
              "{companyInfo?.tagline || "Artisan culinary experiences for life's finest moments."}"
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full border border-zinc-700 hover:border-amber-500 hover:text-amber-400 transition-colors flex items-center justify-center">
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-jakarta font-bold text-white text-sm uppercase tracking-widest mb-4">Navigate</p>
            <div className="flex flex-col gap-3 text-sm font-jakarta">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-left hover:text-amber-400 transition-colors">Home</button>
              <button onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })} className="text-left hover:text-amber-400 transition-colors">Menu</button>
              <Link href="/customer/dashboard" className="hover:text-amber-400 transition-colors">My Bookings</Link>
              <Link href="/admin/login" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                <Lock size={12} /> Admin Portal
              </Link>
            </div>
          </div>

          <div>
            <p className="font-jakarta font-bold text-white text-sm uppercase tracking-widest mb-4">Contact</p>
            <div className="flex flex-col gap-3 text-sm font-jakarta">
              {companyInfo?.address && (
                <span className="flex items-start gap-2"><MapPin size={14} className="text-amber-500 mt-0.5 shrink-0" />{companyInfo.address}</span>
              )}
              {companyInfo?.phoneNumber && (
                <a href={`tel:${companyInfo.phoneNumber}`} className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Phone size={14} className="text-amber-500 shrink-0" />{companyInfo.phoneNumber}
                </a>
              )}
              <span className="flex items-center gap-2"><Clock size={14} className="text-amber-500 shrink-0" />Mon – Sun: 9AM – 10PM</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-jakarta">
          <p>© 2025 {companyInfo?.companyName || "Elite Catering"}. All rights reserved.</p>
          {companyInfo?.phoneNumber && (
            <a href={`tel:${companyInfo.phoneNumber.replace(/\D/g, "")}`} className="flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors">
              <Phone size={13} /> Call Us Now
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function CustomerHome() {
  const { addToCart, cartItems } = useCart();
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: foodItems, isLoading: isLoadingFood } = useQuery({ queryKey: ["/api/food-items"], staleTime: 0, gcTime: 0 });
  const { data: companyInfo } = useQuery({ queryKey: ["/api/company-info"], staleTime: 0, gcTime: 0 });
  const { data: reviews } = useQuery({ queryKey: ["/api/reviews"], staleTime: 0, gcTime: 0 });

  const logoSrc = "/leaf_logo.png";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Navbar companyName={companyInfo?.companyName} logoSrc={logoSrc} />
      <main className="pt-16">
        <Hero companyName={companyInfo?.companyName} tagline={companyInfo?.tagline} />
        <Features />
        <MenuSection
          foodItems={foodItems}
          isLoading={isLoadingFood}
          onSelectItem={setSelectedItem}
          addToCart={addToCart}
          cartItems={cartItems}
        />
        <Testimonials reviews={reviews} />
        <Footer companyInfo={companyInfo} logoSrc={logoSrc} />
      </main>

      {companyInfo?.phoneNumber && (
        <a
          href={`tel:${companyInfo.phoneNumber.replace(/\D/g, "")}`}
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
