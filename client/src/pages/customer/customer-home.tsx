import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  ChefHat, Award, Users, Clock, Utensils, Search, ArrowRight, Star
} from "lucide-react";
import type { FoodItem, CompanyInfo, CustomerReview } from "@shared/schema";
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

  const { data: foodItems, isLoading: loadingFood, error: foodError } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
    staleTime: 0,
    gcTime: 0,
  });

  const { data: companyInfo, error: companyError } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
    staleTime: 0,
    gcTime: 0,
  });

  const { data: reviews, isLoading: loadingReviews, error: reviewsError } = useQuery<CustomerReview[]>({
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
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden animate-fade-in">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/70" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center animate-slide-up">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 py-1.5 px-6 rounded-full text-sm font-medium tracking-wide animate-gentle-pulse">
            {companyInfo?.companyName || "Elite Catering & Events"}
          </Badge>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-8 leading-tight tracking-tight max-w-4xl animate-slide-up">
            Elevating Your <span className="text-primary italic">Events</span>
          </h1>
          <p className="text-sm md:text-base text-gray-200 mb-12 max-w-3xl font-light leading-relaxed animate-slide-up">
            {companyInfo?.tagline || "From intimate gatherings to grand celebrations, we provide a sophisticated culinary experience tailored to your unique taste."}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto">
            <Button 
              size="lg" 
              className="rounded-full px-12 py-7 text-xl shadow-2xl hover:shadow-primary/40 transition-all duration-300 active-elevate-2"
              onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Menu
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-12 py-7 text-xl bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 transition-all duration-300">
              Get Quote
            </Button>
          </div>
        </div>
      </section>

      {/* Modern Value Prop Section */}
      <section className="py-32 bg-background animated-gradient-bg relative overflow-hidden flex flex-col items-center">
        <div className="container px-4 mx-auto relative z-10 flex flex-col items-center">
          <div className="max-w-4xl w-full text-center mb-20 flex flex-col items-center">
            <Badge variant="outline" className="mb-6 border-primary text-primary px-4 py-1 uppercase tracking-widest text-xs">Our Philosophy</Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-8 text-foreground leading-tight">
              Crafting Unforgettable <br /> Culinary Memories
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-12 leading-relaxed font-light max-w-2xl mx-auto text-center">
              {companyInfo?.description || "We believe that food is the heart of every event. Our team of expert chefs uses only the freshest, locally sourced ingredients to create dishes that are as beautiful as they are delicious."}
            </p>
            <div className="flex gap-12 justify-center w-full">
              <div className="text-center space-y-2">
                <h3 className="text-4xl font-bold text-primary">{(companyInfo as any)?.yearsExperience || 15}+</h3>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Years Experience</p>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-4xl font-bold text-primary">{companyInfo?.eventsPerYear || 500}+</h3>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Events Served</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto w-full">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-none bg-white/80 dark:bg-slate-800/80 p-8 hover-elevate card-hover-lift transition-all duration-300 rounded-2xl group flex flex-col items-center text-center stagger-item shadow-md hover:shadow-lg">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all animate-gentle-pulse">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-muted-foreground font-light text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Dishes Showcase */}
      <section id="menu" className="py-32 bg-muted/10 animated-gradient-bg flex flex-col items-center border-y">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center text-center mb-24 max-w-4xl mx-auto">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4">Curated Gastronomy</span>
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight tracking-tight">
              A Symphony of <span className="text-primary italic">Flavors</span>
            </h2>
            <div className="w-24 h-1 bg-primary/20 mb-8 rounded-full" />
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-16">
              Experience our hand-crafted selection of signature dishes, each telling a story of tradition and innovation.
            </p>
            
            <div className="mb-8 max-w-2xl mx-auto w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search dishes by name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 rounded-full h-12 text-center text-lg border-primary/30 focus:border-primary transition-all"
                  data-testid="input-menu-search"
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto mb-16 max-w-5xl mx-auto px-4 custom-scrollbar">
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat) => (
                  <Button 
                    key={cat} 
                    variant="ghost"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "rounded-full px-6 py-2 h-auto text-xs font-medium transition-all duration-300",
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

          <div className="max-h-[800px] overflow-y-auto w-full custom-scrollbar pr-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 max-w-[95rem] mx-auto">
              {loadingFood ? (
                Array(16).fill(0).map((_, i) => (
                  <div key={i} className="space-y-3 stagger-item">
                    <Skeleton className="aspect-square w-full rounded-xl" />
                    <div className="space-y-2 px-1">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                ))
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => (
                  <div key={item.id} className="group relative stagger-item" style={{ animationDelay: `${idx * 0.03}s` }}>
                    <Card className="relative w-full aspect-square overflow-hidden rounded-xl shadow-md border-none transition-all duration-300 hover:scale-110 hover:z-50 hover:shadow-2xl cursor-default bg-background">
                      <div className="absolute inset-0">
                        <img 
                          src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                          alt={item.name}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
                      </div>
                      
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-black/40 backdrop-blur-md border-white/10 text-[8px] px-1.5 py-0 rounded-full font-medium text-white/90">
                          {item.category}
                        </Badge>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-0.5">
                        <h3 className="text-xs md:text-sm font-medium text-white leading-tight truncate">
                          {item.name}
                        </h3>
                        <p className="text-gray-300 text-[9px] font-light line-clamp-1 leading-tight opacity-0 group-hover:opacity-100 group-hover:line-clamp-2 transition-all duration-300">
                          {item.description}
                        </p>
                      </div>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-40 text-center flex flex-col items-center justify-center bg-background rounded-3xl border border-dashed border-muted">
                  <Utensils className="w-10 h-10 text-muted-foreground/30 mb-4" />
                  <p className="text-lg text-muted-foreground font-light">No culinary masterpieces found in this selection.</p>
                  <Button variant="ghost" onClick={() => setSelectedCategory("All")} className="mt-4 text-primary hover:text-primary/80">View All Selections</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-32 bg-muted/20 animated-gradient-bg flex flex-col items-center w-full">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-6 border-primary text-primary px-4 py-1 uppercase tracking-widest text-xs">Cherished Memories</Badge>
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 text-foreground">
              What Our Clients Say
            </h2>
            <p className="text-base text-muted-foreground font-light">
              Real stories from those who trusted us with their most important moments
            </p>
          </div>
          <ReviewsCarousel reviews={reviews} isLoading={loadingReviews} />
        </div>
      </section>

      {/* Share Your Review Section */}
      <section className="py-32 bg-background animated-gradient-bg flex flex-col items-center w-full">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-6 border-primary text-primary px-4 py-1 uppercase tracking-widest text-xs">Your Feedback Matters</Badge>
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-foreground">
              Tell Us Your Story
            </h2>
            <p className="text-base text-muted-foreground font-light">
              We'd love to hear about your experience with Elite Catering & Events
            </p>
          </div>
          <ReviewForm />
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-32 flex flex-col items-center w-full">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="relative rounded-[3rem] overflow-hidden bg-foreground text-background py-24 px-8 md:px-16 text-center shadow-3xl flex flex-col items-center">
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b')] bg-cover bg-center mix-blend-overlay" />
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight">
                Begin Your <br /> Culinary Journey
              </h2>
              <p className="text-lg md:text-xl opacity-80 mb-12 font-light leading-relaxed max-w-2xl">
                We are ready to design an experience that perfectly matches your vision. <br /> Our consultants are standing by to assist you.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-12 w-full">
                <div className="text-center group flex flex-col items-center">
                  <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-3 group-hover:text-primary/80 transition-colors">Call Our Studio</p>
                  <p className="text-xl md:text-2xl font-serif font-medium">{companyInfo?.phone || "+91 98765 43210"}</p>
                </div>
                <div className="w-px h-12 bg-white/10 hidden sm:block" />
                <div className="text-center group flex flex-col items-center">
                  <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-3 group-hover:text-primary/80 transition-colors">Digital Inquiry</p>
                  <p className="text-xl md:text-2xl font-serif font-medium underline underline-offset-8 decoration-primary/30 group-hover:decoration-primary transition-all">
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
