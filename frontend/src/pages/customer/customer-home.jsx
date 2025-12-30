import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  ChefHat, Award, Users, Clock, Utensils, Search, Lock, Moon, Sun,
  Leaf, Sprout, Wind, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReviewsCarousel from "@/components/reviews-carousel";
import ReviewForm from "@/components/review-form";
import { ThemeToggle } from "@/components/layout/theme-toggle";

// Preload component
const ImagePreloader = ({ images }) => (
  <div className="hidden">
    {images.map((img, i) => (
      <img key={i} src={img} alt="" />
    ))}
  </div>
);

const features = [
  { 
    icon: ChefHat, 
    title: "Expert Chefs", 
    description: "Our culinary masters craft each dish with passion and precision" 
  },
  { 
    icon: Award, 
    title: "Premium Quality", 
    description: "Only the finest ingredients for unforgettable flavors" 
  },
  { 
    icon: Users, 
    title: "Any Occasion", 
    description: "From intimate gatherings to grand celebrations" 
  },
  { 
    icon: Clock, 
    title: "On-Time Service", 
    description: "Punctual delivery and setup for stress-free events" 
  },
];

const BackgroundLeaf = ({ className }) => (
  <div className={cn("absolute pointer-events-none text-primary/10", className)}>
    <Leaf size={120} />
  </div>
);

export default function CustomerHome() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

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

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["/api/reviews"],
    staleTime: 0,
    gcTime: 0,
  });

  const dynamicHeroImages = useMemo(() => {
    if (companyInfo?.heroImages && companyInfo.heroImages.length > 0) {
      return companyInfo.heroImages;
    }
    return [
      "/images/luxury_indian_wedding_buffet_setup.png",
      "/images/gourmet_indian_food_platter_biryani_thali.png",
      "/images/indian_event_catering_dessert_station.png",
      "/images/elegant_indian_dining_table_arrangement.png"
    ];
  }, [companyInfo?.heroImages]);

  // Hero Slider Effect
  useMemo(() => {
    if (!dynamicHeroImages || dynamicHeroImages.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % dynamicHeroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [dynamicHeroImages?.length]);

  // Auto-hide intro after animation
  useMemo(() => {
    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const categories = useMemo(() => {
    if (!foodItems) return ["All"];
    const uniqueCategories = Array.from(new Set(foodItems.map(item => item.category))).sort();
    return ["All", ...uniqueCategories];
  }, [foodItems]);

  const filteredItems = useMemo(() => {
    return foodItems?.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch = searchQuery === "" || 
                           item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }) || [];
  }, [foodItems, selectedCategory, searchQuery]);

  const defaultFoodImage = "https://images.unsplash.com/photo-1585937421612-70a008356f46?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="font-inter relative overflow-hidden bg-background text-foreground selection:bg-primary/20">
      <ImagePreloader images={dynamicHeroImages} />
      {showIntro && (
        <div className="intro-overlay bg-background">
          <div className="intro-logo flex flex-col items-center">
            <Sprout size={80} className="text-primary mb-6 animate-pulse" />
            <h1 className="text-4xl font-poppins font-bold tracking-tighter text-foreground">
              {companyInfo?.companyName || "ELITE"}
            </h1>
            <div className="w-12 h-1 bg-primary mt-4 rounded-full" />
          </div>
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <BackgroundLeaf className="top-20 -left-10 rotate-12 leaf-float-1 opacity-10 dark:opacity-20" />
        <BackgroundLeaf className="top-[40%] -right-10 -rotate-12 leaf-float-2 opacity-10 dark:opacity-20" />
        <BackgroundLeaf className="bottom-20 left-[10%] rotate-45 leaf-float-3 opacity-10 dark:opacity-20" />
      </div>

      <div className="relative h-screen min-h-[600px] overflow-hidden">
        <div className="absolute top-6 right-6 z-50 fade-in theme-toggle-container">
          <ThemeToggle />
        </div>
        
        <div className="absolute inset-0 flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${heroIndex * 100}%)` }}>
          {dynamicHeroImages.map((img, idx) => (
            <div 
              key={idx}
              className="min-w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 slide-up">
            <Sprout size={16} className="text-primary" />
            <span className="text-sm font-medium tracking-wider uppercase">Nature's Finest Catering</span>
          </div>
          
          <h2 className="text-3xl sm:text-7xl md:text-8xl font-poppins font-bold mb-4 sm:mb-8 leading-[1.1] tracking-tight slide-up">
            {companyInfo?.companyName || "Elite Catering"}
          </h2>
          
          <p className="text-base sm:text-xl md:text-2xl max-w-2xl mb-8 sm:mb-12 font-inter font-light opacity-90 slide-up">
            {companyInfo?.tagline || "Artisan culinary experiences inspired by the organic beauty of nature."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto slide-up">
            <Button 
              size="lg" 
              className="group rounded-2xl px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl shadow-2xl hover:shadow-primary/40 transition-all duration-500 font-bold bg-primary hover:scale-105"
              onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Menu
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-2xl px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl text-white border-white/40 hover:bg-white hover:text-black transition-all duration-500 font-bold backdrop-blur-md"
            >
              Custom Quote
            </Button>
          </div>
        </div>
      </div>

      <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-20 items-center">
            <div className="slide-up">
              <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs sm:text-sm mb-4 block">Our Story</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold mb-6 sm:mb-8 leading-tight">The Art of Organic Gastronomy</h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 leading-relaxed font-light italic">
                "{companyInfo?.description || "We bring the garden to your table, celebrating the pure essence of every ingredient."}"
              </p>
              
              <div className="grid grid-cols-2 gap-8 sm:gap-12">
                <div className="group">
                  <div className="text-4xl sm:text-6xl font-bold text-primary mb-2 transition-transform group-hover:scale-110 duration-500">
                    {companyInfo?.yearsExperience || 15}+
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Years of Craft</div>
                </div>
                <div className="group">
                  <div className="text-4xl sm:text-6xl font-bold text-primary mb-2 transition-transform group-hover:scale-110 duration-500">
                    {companyInfo?.eventsPerYear || 500}+
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Annual Celebrations</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="p-4 sm:p-8 bg-card rounded-[1.5rem] sm:rounded-[2rem] border border-border/50 hover:border-primary/30 transition-all duration-500 group slide-up"
                >
                  <div className="w-10 h-10 sm:w-14 h-14 rounded-xl sm:rounded-2xl bg-primary/5 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary transition-colors duration-500">
                    <feature.icon className="w-5 h-5 sm:w-7 h-7 text-primary group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="font-poppins font-bold text-sm sm:text-lg mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed font-inter line-clamp-2">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/5 rounded-[2rem] sm:rounded-[4rem] mx-2 sm:mx-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20 slide-up">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold mb-4 sm:mb-6">Seasonal Selections</h2>
            <div className="w-16 sm:w-20 h-1 bg-primary mx-auto mb-6 sm:mb-8 rounded-full" />
            
            <div className="flex justify-center mb-8 sm:mb-12">
              <div className="relative w-full max-w-xl group">
                <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input 
                  placeholder="Find your flavor..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 sm:pl-14 rounded-2xl sm:rounded-3xl h-14 sm:h-16 border-none bg-background shadow-lg shadow-primary/5 focus:ring-2 focus:ring-primary/20 transition-all text-base sm:text-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              {categories.map((cat) => (
                <Button 
                  key={cat} 
                  variant="ghost"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-4 sm:px-8 py-2 sm:py-4 h-auto text-xs sm:text-sm font-bold tracking-wide transition-all duration-500",
                    selectedCategory === cat 
                      ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105" 
                      : "hover:bg-background/80"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="max-h-[600px] sm:max-h-[800px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-10">
              {isLoadingFood ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="space-y-4 slide-up">
                    <Skeleton className="h-48 sm:h-80 w-full rounded-[1rem] sm:rounded-[2.5rem]" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))
              ) : (
                filteredItems.map((item) => (
                  <div 
                    key={item.id}
                    className="group relative slide-up"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Card className="overflow-hidden bg-card border-none shadow-sm hover:shadow-2xl transition-all duration-700 rounded-[1rem] sm:rounded-[2rem] cursor-pointer group-hover:-translate-y-3 hover:ring-2 hover:ring-primary/20 h-full">
                      <div className="h-32 sm:h-64 relative overflow-hidden">
                        <img 
                          src={item.imageUrl || defaultFoodImage} 
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute top-2 left-2 sm:top-4 left-4">
                          <Badge className="bg-white/90 dark:bg-black/80 backdrop-blur-md text-primary border-none py-0.5 px-2 sm:py-1.5 sm:px-4 rounded-full text-[8px] sm:text-xs font-bold uppercase tracking-widest shadow-lg">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3 sm:p-8">
                        <h3 className="font-poppins font-bold text-xs sm:text-2xl mb-1 sm:mb-3 text-foreground group-hover:text-primary transition-colors duration-500 line-clamp-1">{item.name}</h3>
                        <p className="text-muted-foreground text-[10px] sm:text-sm line-clamp-2 leading-relaxed font-light">{item.description}</p>
                        <div className="mt-2 sm:mt-6 pt-2 sm:pt-6 border-t border-border/30 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Wind size={10} className="text-primary" />
                            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-tighter text-foreground">Organic</span>
                          </div>
                          <ChefHat size={12} className="text-primary" />
                        </div>
                      </div>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          />
          <div className="relative bg-card rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl max-w-3xl w-full overflow-hidden z-10 slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-2/5 h-[200px] sm:h-auto">
                <img src={selectedItem.imageUrl || defaultFoodImage} className="w-full h-full object-cover" alt={selectedItem.name} />
              </div>
              <div className="w-full sm:w-3/5 p-6 sm:p-12">
                <Badge className="mb-3 rounded-full px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest">{selectedItem.category}</Badge>
                <h2 className="text-xl sm:text-3xl font-poppins font-bold mb-3 sm:mb-4 leading-tight">{selectedItem.name}</h2>
                <p className="text-muted-foreground text-xs sm:text-base leading-relaxed mb-6 sm:mb-8 font-light italic">
                  {selectedItem.description}
                </p>
                <div className="flex gap-3 sm:gap-4">
                  <Button 
                    className="flex-1 h-10 sm:h-12 rounded-xl text-xs sm:text-sm font-bold shadow-xl hover:shadow-primary/30 transition-all duration-500"
                    onClick={() => {
                      setSelectedItem(null);
                      document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Inquire Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-10 sm:h-12 w-10 sm:w-12 rounded-xl p-0 border-2"
                    onClick={() => setSelectedItem(null)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <section id="contact-section" className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto relative slide-up">
          <div className="bg-primary rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-24 text-center text-primary-foreground shadow-[0_40px_100px_-20px_rgba(var(--primary),0.4)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
               <Wind size={200} className="absolute -top-20 -left-20 animate-pulse" />
               <Leaf size={200} className="absolute -bottom-20 -right-20 animate-pulse" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold mb-6 sm:mb-10 leading-tight">Start Your Organic Journey</h2>
            <p className="text-base sm:text-xl opacity-90 mb-8 sm:mb-16 max-w-2xl mx-auto font-light leading-relaxed">
              Let us curate a breathtaking culinary experience that honors your most precious moments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center">
              <a href={`tel:${companyInfo?.phone || "+1234567890"}`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-xl sm:rounded-2xl px-8 sm:px-14 py-6 sm:py-9 text-lg sm:text-xl font-bold transition-all duration-500 hover:scale-105">
                  Call: {companyInfo?.phone || "+1234567890"}
                </Button>
              </a>
              <a href={`mailto:${companyInfo?.email || "hello@elitecatering.com"}`} className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 rounded-xl sm:rounded-2xl px-8 sm:px-14 py-6 sm:py-9 text-lg sm:text-xl font-bold transition-all duration-500">
                  Email: {companyInfo?.email || "hello@elitecatering.com"}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
      <footer className="py-12 px-6 border-t border-border/30 text-center">
        <p className="text-muted-foreground dark:text-gray-400 text-sm font-light">
          © 2025 {companyInfo?.companyName || "Elite Catering"}. Nature's finest flavors.
        </p>
      </footer>
    </div>
  );
}