import { Link } from "wouter";
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
  Leaf, Sprout, Wind, ChevronRight, Star, Quote, MapPin, Instagram, Facebook, Twitter, MessageCircle,
  ArrowUp, Camera, Calendar, CheckCircle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import ReviewsCarousel from "@/components/reviews-carousel";
import ReviewForm from "@/components/review-form";
import { ThemeToggle } from "@/components/layout/theme-toggle";

import HowItWorks from "@/components/features/how-it-works";
import NavigationButton from "@/components/features/back-to-top";
import FoodItemQuickView from "@/components/features/food-item-quick-view";

const WhatsAppButton = ({ phone }) => (
  <a 
    href={`https://wa.me/${phone?.replace(/\D/g, '') || '1234567890'}`}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 left-6 z-[90] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
  >
    <MessageCircle size={32} />
    <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 whitespace-nowrap font-bold">
      Chat with us
    </span>
  </a>
);

const Testimonials = ({ reviews }) => (
  <section className="py-24 px-6 bg-secondary/5">
    <div className="max-w-7xl mx-auto text-center">
      <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-12 md:mb-16">What Our Clients Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(reviews || [
          { customerName: "Sarah J.", eventType: "Wedding", comment: "The food was absolutely divine! Every guest was impressed by the presentation and flavor." },
          { customerName: "Michael R.", eventType: "Corporate", comment: "Professional service and exceptional quality. They made our event truly special." },
          { customerName: "Elena W.", eventType: "Birthday", comment: "Best catering experience we've ever had. Highly recommend their organic menu!" }
        ]).slice(0, 3).map((review, idx) => (
          <Card key={idx} className="p-6 md:p-8 bg-card border-none shadow-xl rounded-[1.5rem] md:rounded-[2rem] hover:-translate-y-2 transition-transform">
            <Quote className="text-primary/20 mb-4 md:mb-6" size={32} md:size={40} />
            <p className="text-base md:text-lg italic mb-4 md:mb-6">"{review.comment}"</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-primary text-primary" />)}
            </div>
            <h4 className="font-bold text-base text-primary">{review.customerName}</h4>
            <span className="text-sm text-muted-foreground font-medium">{review.eventType}</span>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const Footer = ({ companyInfo, logoSrc }) => (
  <footer className="bg-card pt-24 pb-12 px-6 border-t border-border/30 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
       <Leaf size={300} className="absolute -bottom-20 -left-20 rotate-45" />
    </div>
    <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-8 text-center relative z-10">
      <div className="flex items-center gap-3">
        <img src={logoSrc} alt="Logo" className="w-8 h-8 text-primary" />
        <h3 className="text-3xl font-poppins font-bold">{companyInfo?.companyName || "Elite Catering"}</h3>
      </div>
      
      <p className="text-muted-foreground max-w-md leading-relaxed italic text-base px-4">
        "{companyInfo?.tagline || "Artisan culinary experiences inspired by the organic beauty of nature."}"
      </p>

      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium">
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-primary transition-colors cursor-pointer">Home</button>
        <button onClick={() => document.getElementById('menu')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-primary transition-colors cursor-pointer">Our Menu</button>
        <button onClick={() => document.getElementById('contact-section')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-primary transition-colors cursor-pointer">Contact Us</button>
        <Link href="/admin/login" className="hover:text-primary transition-colors flex items-center gap-2 font-semibold">
          <Lock size={14} className="text-primary" />
          Admin Portal
        </Link>
      </div>

      <div className="flex gap-6 py-2">
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 hover:bg-primary hover:text-white transition-colors">
          <Instagram size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 hover:bg-primary hover:text-white transition-colors">
          <Facebook size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 hover:bg-primary hover:text-white transition-colors">
          <Twitter size={20} />
        </Button>
      </div>

      <div className="w-full pt-8 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <span className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> {companyInfo?.address || "123 Culinary St, Food City"}</span>
          <span className="flex items-center gap-2 font-medium text-foreground">Email: events@elite-catering.com</span>
          <span className="flex items-center gap-2"><Clock size={16} className="text-primary" /> Mon - Sun: 9AM - 10PM</span>
        </div>
        <p>© 2025 {companyInfo?.companyName || "Elite Catering"}. All rights reserved.</p>
      </div>
    </div>
  </footer>
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
  const [selectedType, setSelectedType] = useState("Veg");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
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

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["/api/reviews"],
    staleTime: 0,
    gcTime: 0,
  });

  const dynamicHeroImages = useMemo(() => {
    if (companyInfo?.heroImages && Array.isArray(companyInfo.heroImages)) {
      const validImages = companyInfo.heroImages.filter(img => 
        typeof img === 'string' && 
        img.trim() !== "" && 
        (img.startsWith('http') || img.startsWith('/'))
      );
      if (validImages.length > 0) return validImages;
    }
    return [];
  }, [companyInfo?.heroImages]);

  useEffect(() => {
    if (!dynamicHeroImages.length && !isLoadingFood) {
      setIsPageLoaded(true);
      return;
    }
    let loadedCount = 0;
    const totalToLoad = dynamicHeroImages.length;
    if (totalToLoad === 0) {
      if (!isLoadingFood) setIsPageLoaded(true);
      return;
    }
    const images = dynamicHeroImages.map(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalToLoad) setIsPageLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalToLoad) setIsPageLoaded(true);
      };
      return img;
    });
    return () => {
      images.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [dynamicHeroImages, isLoadingFood]);

  useEffect(() => {
    if (isPageLoaded) {
      const timer = setTimeout(() => setShowWebsite(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isPageLoaded]);

  useEffect(() => {
    if (!dynamicHeroImages || dynamicHeroImages.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % dynamicHeroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [dynamicHeroImages?.length]);

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
        <div className="relative">
          <LoadingSpinner size="lg" className="text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={logoSrc} alt="Logo" className="w-16 h-16 text-primary animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-xl font-poppins font-bold animate-pulse text-primary tracking-widest uppercase">
          {companyInfo?.companyName || "Elite Catering"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground font-light italic">
          Preparing your culinary experience...
        </p>
      </div>
    );
  }

  return (
    <div className="font-inter relative overflow-hidden bg-background text-foreground selection:bg-primary/20 animate-in fade-in zoom-in-95 duration-1000">
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
            <img src={logoSrc} alt="Logo" className="w-12 h-12 text-primary" />
            <span className="text-sm font-medium tracking-wider uppercase">Nature's Finest Catering</span>
          </div>
          
          <h1 className="text-3xl sm:text-7xl md:text-8xl font-poppins font-bold mb-4 sm:mb-8 leading-[1.1] tracking-tight slide-up text-white drop-shadow-lg">
            {companyInfo?.companyName || "Elite Catering"}
          </h1>
          
          <p className="text-base sm:text-xl md:text-2xl max-w-2xl mb-8 sm:mb-12 font-inter font-light slide-up text-white drop-shadow-md">
            {companyInfo?.tagline || "Artisan culinary experiences inspired by the organic beauty of nature."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto slide-up">
            <Button 
              size="lg" 
              className="group rounded-2xl px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl shadow-2xl hover:shadow-primary/40 transition-all duration-500 font-bold bg-primary hover:scale-105"
              onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            >
              Add One
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
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
              variant="default"
              className="rounded-2xl px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl text-primary bg-white hover:bg-white/90 transition-all duration-500 font-bold"
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

      <HowItWorks />

      <section id="menu" className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/5 rounded-[2rem] sm:rounded-[4rem] mx-2 sm:mx-4 lg:mx-8">
        <div className="max-w-[95%] sm:max-w-[90%] md:max-w-[95%] lg:max-w-[98%] 2xl:max-w-[1920px] mx-auto">
          <div className="text-center mb-12 sm:mb-20 slide-up">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold mb-4 sm:mb-6">Seasonal Selections</h2>
            <div className="w-16 sm:w-20 h-1 bg-primary mx-auto mb-6 sm:mb-8 rounded-full" />
            
            <div className="flex justify-center mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
                <div className="w-full sm:w-1/3">
                  <Select value={selectedType} onValueChange={(val) => {
                    setSelectedType(val);
                    setSelectedCategory("All");
                  }}>
                    <SelectTrigger className="rounded-2xl h-14 sm:h-16 border-none bg-background shadow-lg shadow-primary/5 focus:ring-2 focus:ring-primary/20 transition-all text-base sm:text-lg text-foreground">
                      <SelectValue placeholder="Type" className="text-foreground" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Veg">Veg</SelectItem>
                      <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input 
                    placeholder="Find your flavor..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    list="food-suggestions"
                    className="pl-12 sm:pl-14 rounded-2xl sm:rounded-3xl h-14 sm:h-16 border-none bg-background shadow-lg shadow-primary/5 focus:ring-2 focus:ring-primary/20 transition-all text-base sm:text-lg text-foreground"
                  />
                  <datalist id="food-suggestions">
                    {foodItems?.map((item, idx) => (
                      <option key={idx} value={item.name} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4 justify-center max-w-5xl mx-auto px-4">
              {categories.map((cat) => (
                <Button 
                  key={cat} 
                  variant="ghost"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-xl px-4 sm:px-6 py-2 h-auto text-[10px] sm:text-xs font-bold tracking-wide transition-all duration-300 border border-transparent",
                    selectedCategory === cat 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 border-primary" 
                      : "bg-background text-foreground hover:bg-secondary/50 hover:border-secondary-foreground/10"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
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
                          src={item.imageUrl || "https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=800&auto=format&fit=crop"} 
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=800&auto=format&fit=crop';
                          }}
                        />
                        <div className="absolute top-2 left-2 sm:top-4 left-4">
                          <Badge className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            item.type === "Veg" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                          )}>
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        <h3 className="text-sm sm:text-xl font-poppins font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                        <p className="text-[10px] sm:text-sm text-muted-foreground line-clamp-2 mb-4 font-inter leading-relaxed">{item.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs sm:text-lg font-bold text-primary">₹{item.price || "---"}/plate</span>
                          <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary hover:text-white transition-all duration-500 group-hover:translate-x-1">
                            Details <ChevronRight size={14} className="ml-1" />
                          </Button>
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

      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl slide-up">
              <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-6">Our Client Reviews</h2>
              <p className="text-lg text-muted-foreground mb-8">Hear from the people who have experienced our culinary magic firsthand.</p>
              <Dialog>
                <Button size="lg" className="rounded-2xl px-8 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  Share Your Story
                </Button>
                <DialogContent className="max-w-2xl rounded-[2rem] p-0 overflow-hidden">
                   <ReviewForm onComplete={() => queryClient.invalidateQueries({ queryKey: ["/api/reviews"] })} />
                </DialogContent>
              </Dialog>
            </div>
            <div className="w-full md:w-1/2 slide-up">
               <ReviewsCarousel reviews={reviews} />
            </div>
          </div>
        </div>
      </section>

      <Footer companyInfo={companyInfo} logoSrc={logoSrc} />

      <WhatsAppButton phone={companyInfo?.phone} />
      
      <NavigationButton />

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="p-0 max-w-4xl rounded-[2rem] overflow-hidden border-none shadow-2xl">
          {selectedItem && (
            <FoodItemQuickView 
              item={selectedItem} 
              onClose={() => setSelectedItem(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
