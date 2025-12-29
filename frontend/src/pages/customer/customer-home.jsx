import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  ChefHat, Award, Users, Clock, Utensils, Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReviewsCarousel from "@/components/reviews-carousel";
import ReviewForm from "@/components/review-form";

const heroImage = "/images/Elegant_catering_buffet_hero_image_05c8db1b.png";

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

export default function CustomerHome() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: foodItems, isLoading: loadingFood, error: foodError } = useQuery({
    queryKey: ["/api/food-items"],
    staleTime: 0,
    gcTime: 0,
  });

  const { data: companyInfo, error: companyError } = useQuery({
    queryKey: ["/api/company-info"],
    staleTime: 0,
    gcTime: 0,
  });

  const { data: reviews, isLoading: loadingReviews, error: reviewsError } = useQuery({
    queryKey: ["/api/reviews"],
    staleTime: 0,
    gcTime: 0,
  });

  if (foodError || companyError || reviewsError) {
    console.error("Query Error:", { foodError, companyError, reviewsError });
  }

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

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/70" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 py-1.5 px-6 rounded-full text-sm font-medium tracking-wide">
            {companyInfo?.companyName || "Elite Catering & Events"}
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight tracking-tight max-w-4xl">
            Elevating Your <span className="text-primary italic">Events</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-200 mb-8 sm:mb-12 max-w-3xl font-light leading-relaxed">
            {companyInfo?.tagline || "From intimate gatherings to grand celebrations, we provide a sophisticated culinary experience tailored to your unique taste."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full sm:w-auto px-4">
            <Button 
              size="lg" 
              className="rounded-full px-8 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl shadow-2xl hover:shadow-primary/40 transition-all duration-300 active-elevate-2 w-full sm:w-auto"
              onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Menu
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 transition-all duration-300 w-full sm:w-auto">
              Get Quote
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-32 bg-background relative overflow-hidden flex flex-col items-center">
        <div className="container px-4 mx-auto relative z-10 flex flex-col items-center">
          <div className="max-w-4xl w-full text-center mb-12 sm:mb-20 flex flex-col items-center">
            <Badge variant="outline" className="mb-4 sm:mb-6 border-primary text-primary px-4 py-1 uppercase tracking-widest text-[10px] sm:text-xs">Our Philosophy</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 sm:mb-8 text-foreground leading-tight">
              Crafting Unforgettable <br className="hidden sm:block" /> Culinary Memories
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-8 sm:mb-12 leading-relaxed font-light max-w-2xl mx-auto text-center">
              {companyInfo?.description || "We believe that food is the heart of every event. Our team of expert chefs uses only the freshest, locally sourced ingredients to create dishes that are as beautiful as they are delicious."}
            </p>
            <div className="flex gap-8 sm:gap-12 justify-center w-full">
              <div className="text-center space-y-1 sm:space-y-2">
                <h3 className="text-3xl sm:text-4xl font-bold text-primary">{companyInfo?.yearsExperience || 15}+</h3>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-semibold">Experience</p>
              </div>
              <div className="text-center space-y-1 sm:space-y-2">
                <h3 className="text-3xl sm:text-4xl font-bold text-primary">{companyInfo?.eventsPerYear || 500}+</h3>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-semibold">Events</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto w-full">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-none bg-white/80 dark:bg-slate-800/80 p-6 sm:p-8 hover-elevate card-hover-lift transition-all duration-300 rounded-2xl group flex flex-col items-center text-center shadow-md hover:shadow-lg">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h4>
                <p className="text-muted-foreground font-light text-xs sm:text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="menu" className="py-16 sm:py-32 bg-muted/10 flex flex-col items-center border-y">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center text-center mb-12 sm:mb-24 max-w-4xl mx-auto">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs mb-3 sm:mb-4">Curated Gastronomy</span>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold mb-6 sm:mb-8 leading-tight tracking-tight px-4">
              A Symphony of <br className="block sm:hidden" /> <span className="text-primary italic">Flavors</span>
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-primary/20 mb-6 sm:mb-8 rounded-full" />
            <p className="text-base sm:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-10 sm:mb-16 px-4">
              Experience our hand-crafted selection of signature dishes, each telling a story of tradition and innovation.
            </p>
            
            <div className="mb-6 sm:mb-8 max-w-2xl mx-auto w-full px-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search dishes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 rounded-full h-10 sm:h-12 text-center text-sm sm:text-lg border-primary/30 focus:border-primary transition-all"
                  data-testid="input-menu-search"
                />
              </div>
            </div>

            <div className="max-h-32 sm:max-h-48 overflow-y-auto mb-10 sm:mb-16 max-w-5xl mx-auto px-4 custom-scrollbar">
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {categories.map((cat) => (
                  <Button 
                    key={cat} 
                    variant="ghost"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "rounded-full px-4 sm:px-6 py-1.5 sm:py-2 h-auto text-[10px] sm:text-xs font-medium transition-all duration-300",
                      selectedCategory === cat 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "text-muted-foreground hover:bg-muted"
                    )}
                    data-testid={`button-category-${cat}`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full max-w-7xl mx-auto px-4 relative">
            <div className="max-h-[500px] sm:max-h-[650px] overflow-y-auto overflow-x-visible p-4 sm:p-12 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 py-6">
                {loadingFood ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="flex flex-row items-center overflow-hidden h-36 border-none bg-muted/20 p-4">
                      <Skeleton className="w-24 h-24 rounded-full" />
                      <div className="flex-1 px-4 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </Card>
                  ))
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="group cursor-pointer relative" 
                      onClick={() => setSelectedItem(item)}
                    >
                      <Card className="flex flex-row items-center overflow-hidden h-32 sm:h-36 border-none bg-[#FDFBF7] dark:bg-slate-900/80 shadow-sm transition-all duration-300 rounded-[24px] p-3 sm:p-4 hover-elevate">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden shrink-0 rounded-full border-2 border-white shadow-sm ml-1">
                          <img src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} alt={item.name} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1 px-3 sm:px-4 py-1 space-y-1 sm:space-y-1.5 overflow-hidden text-left">
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-lg font-bold text-[#1A1A1A] dark:text-white leading-tight truncate max-w-[120px] sm:max-w-none">{item.name}</h3>
                            <Badge className="bg-[#FEF3C7] text-[#D97706] border-none text-[7px] sm:text-[9px] px-1.5 sm:px-2 py-0 sm:py-0.5 uppercase font-bold rounded-[4px] shrink-0">WELCOME DRINK'S</Badge>
                          </div>
                          <p className="text-[#666666] dark:text-slate-400 text-[10px] sm:text-xs font-normal line-clamp-2 leading-tight sm:leading-relaxed">
                            {item.name} - Specialty from our Welcome Drink's selection.
                          </p>
                        </div>
                      </Card>

                      {selectedItem?.id === item.id && (
                        <div 
                          className="fixed inset-0 z-[1000000] flex items-center justify-center p-2 sm:p-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(null);
                          }}
                        >
                          <div className="absolute inset-0 bg-white/40 dark:bg-black/80 backdrop-blur-[2px]" />
                          
                          <div className="relative w-full max-w-5xl flex items-center justify-center animate-in zoom-in-95 duration-300">
                            <Card 
                              className="relative w-full flex flex-col md:flex-row items-stretch overflow-visible border-none bg-white dark:bg-slate-900 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] rounded-[30px] max-h-[95vh] sm:max-h-[480px] overflow-y-auto sm:overflow-visible"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="relative w-full md:w-[45%] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-50 dark:bg-slate-800/50 sm:bg-transparent rounded-t-[30px] sm:rounded-none">
                                <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-[8px] sm:border-[12px] border-white z-10 transition-transform duration-500">
                                  <img src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} alt={item.name} className="object-cover w-full h-full" />
                                </div>
                                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 rounded-l-[30px] -z-10 hidden md:block" />
                              </div>

                              <div className="flex-1 p-6 sm:p-8 md:p-14 flex flex-col justify-center space-y-4 sm:space-y-6 text-center sm:text-left">
                                <div className="space-y-2 sm:space-y-4 flex flex-col items-center sm:items-start">
                                  <Badge className="bg-[#FEF3C7] text-[#D97706] border-none text-[10px] sm:text-[12px] px-3 sm:px-4 py-1 sm:py-1.5 uppercase font-bold rounded-lg tracking-wide w-fit">
                                    WELCOME DRINK'S
                                  </Badge>
                                  <h3 className="text-2xl sm:text-4xl md:text-6xl font-bold text-[#1A1A1A] dark:text-white tracking-tight leading-[1.1]">
                                    {item.name}
                                  </h3>
                                  <p className="text-[#666666] dark:text-slate-400 text-sm sm:text-lg md:text-2xl leading-relaxed font-light">
                                    {item.name} - Specialty from our Welcome Drink's selection.
                                  </p>
                                </div>
                                
                                <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                                  <Button 
                                    className="h-12 sm:h-16 md:h-20 px-8 sm:px-12 rounded-[12px] sm:rounded-[15px] bg-[#FBBF24] hover:bg-[#F59E0B] text-white text-base sm:text-xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95 no-default-hover-elevate w-full sm:w-auto"
                                    onClick={() => {
                                      setSelectedItem(null);
                                      document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                  >
                                    Contact Us
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    className="h-12 sm:h-16 md:h-20 px-6 sm:px-8 rounded-[12px] sm:rounded-[15px] border-slate-200 text-slate-500 text-base sm:text-xl font-bold hover:bg-slate-50 transition-all active:scale-95 w-full sm:w-auto"
                                    onClick={() => setSelectedItem(null)}
                                  >
                                    Close
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 sm:py-40 text-center flex flex-col items-center justify-center bg-background rounded-3xl border border-dashed border-muted px-4">
                    <Utensils className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/30 mb-4" />
                    <p className="text-base sm:text-lg text-muted-foreground font-light">No culinary masterpieces found in this selection.</p>
                    <Button variant="ghost" onClick={() => setSelectedCategory("All")} className="mt-4 text-primary hover:text-primary/80">View All Selections</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-32 bg-muted/20 flex flex-col items-center w-full">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center mb-12 sm:mb-20 max-w-3xl mx-auto flex flex-col items-center">
            <Badge variant="outline" className="mb-4 sm:mb-6 border-primary text-primary px-4 py-1 uppercase tracking-widest text-[10px] sm:text-xs">Cherished Memories</Badge>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 sm:mb-8 text-foreground px-4">
              What Our Clients Say
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-light px-4">
              Real stories from those who trusted us with their most important moments
            </p>
          </div>
          <ReviewsCarousel reviews={reviews} isLoading={loadingReviews} />
        </div>
      </section>

      <section className="py-16 sm:py-32 bg-background flex flex-col items-center w-full">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto flex flex-col items-center">
            <Badge variant="outline" className="mb-4 sm:mb-6 border-primary text-primary px-4 py-1 uppercase tracking-widest text-[10px] sm:text-xs">Your Feedback Matters</Badge>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 sm:mb-6 text-foreground px-4">
              Tell Us Your Story
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-light px-4">
              We'd love to hear about your experience with Elite Catering & Events
            </p>
          </div>
          <div className="px-4 w-full">
            <ReviewForm />
          </div>
        </div>
      </section>

      <section id="contact-section" className="py-16 sm:py-32 flex flex-col items-center w-full">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-foreground text-background py-16 sm:py-24 px-6 sm:px-16 text-center shadow-3xl flex flex-col items-center">
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b')] bg-cover bg-center mix-blend-overlay" />
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold mb-6 sm:mb-8 leading-tight px-4">
                Begin Your <br className="hidden sm:block" /> Culinary Journey
              </h2>
              <p className="text-sm sm:text-lg md:text-xl opacity-80 mb-8 sm:mb-12 font-light leading-relaxed max-w-2xl px-4">
                We are ready to design an experience that perfectly matches your vision. Our consultants are standing by to assist you.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12 w-full px-4">
                <div className="text-center group flex flex-col items-center">
                  <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-2 sm:mb-3 group-hover:text-primary/80 transition-colors">Call Our Studio</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-serif font-medium">{companyInfo?.phone || "+91 98765 43210"}</p>
                </div>
                <div className="w-12 sm:w-px h-px sm:h-12 bg-white/10" />
                <div className="text-center group flex flex-col items-center">
                  <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-2 sm:mb-3 group-hover:text-primary/80 transition-colors">Digital Inquiry</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-serif font-medium underline underline-offset-8 decoration-primary/30 group-hover:decoration-primary transition-all break-all sm:break-normal">
                    {companyInfo?.email || "events@elite-catering.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
