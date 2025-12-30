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

const heroImage = "/images/nature-hero.png";

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

  const { data: foodItems, isLoading: isLoadingFood, error: foodError } = useQuery({
    queryKey: ["/api/food-items"],
    staleTime: 0,
    gcTime: 0,
  });

  const { data: companyInfo, error: companyError } = useQuery({
    queryKey: ["/api/company-info"],
    staleTime: 0,
    gcTime: 0,
  });

  const { data: reviews, isLoading: isLoadingReviews, error: reviewsError } = useQuery({
    queryKey: ["/api/reviews"],
    staleTime: 0,
    gcTime: 0,
  });

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

  const defaultFoodImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="font-inter relative overflow-hidden bg-background selection:bg-primary/20">
      {/* Animated Background Elements */}
      <BackgroundLeaf className="top-20 -left-10 rotate-12 leaf-float-1" />
      <BackgroundLeaf className="top-[40%] -right-10 -rotate-12 leaf-float-2" />
      <BackgroundLeaf className="bottom-20 left-[10%] rotate-45 leaf-float-3" />

      {/* Hero Section */}
      <div className="relative h-[450px] sm:h-[550px] md:h-[650px] overflow-hidden">
        <div className="absolute top-6 right-6 z-50 fade-in">
          <ThemeToggle />
        </div>
        <div 
          className="absolute inset-0 bg-cover bg-center animate-[kenburns_20s_ease-out_infinite]"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 slide-up">
            <Sprout size={16} className="text-primary" />
            <span className="text-sm font-medium tracking-wider uppercase">Nature's Finest Catering</span>
          </div>
          
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-poppins font-bold mb-8 leading-[1.1] tracking-tight slide-up">
            {companyInfo?.companyName || "Elite Catering"}
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mb-12 font-inter font-light opacity-90 slide-up">
            {companyInfo?.tagline || "Artisan culinary experiences inspired by the organic beauty of nature."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto slide-up">
            <Button 
              size="lg" 
              className="group rounded-2xl px-12 py-8 text-xl shadow-2xl hover:shadow-primary/40 transition-all duration-500 font-bold bg-primary hover:scale-105"
              onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Menu
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-2xl px-12 py-8 text-xl text-white border-white/40 hover:bg-white hover:text-black transition-all duration-500 font-bold backdrop-blur-md"
            >
              Custom Quote
            </Button>
          </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="slide-up">
              <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Our Story</span>
              <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-8 leading-tight">The Art of Organic Gastronomy</h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-light italic">
                "{companyInfo?.description || "We bring the garden to your table, celebrating the pure essence of every ingredient."}"
              </p>
              
              <div className="grid grid-cols-2 gap-12">
                <div className="group">
                  <div className="text-6xl font-bold text-primary mb-2 transition-transform group-hover:scale-110 duration-500">
                    {(companyInfo)?.yearsExperience || 15}+
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Years of Craft</div>
                </div>
                <div className="group">
                  <div className="text-6xl font-bold text-primary mb-2 transition-transform group-hover:scale-110 duration-500">
                    {companyInfo?.eventsPerYear || 500}+
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Annual Celebrations</div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="p-8 bg-card rounded-[2rem] border border-border/50 hover:border-primary/30 transition-all duration-500 group slide-up"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-500">
                    <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="font-poppins font-bold text-lg mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-inter">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 px-6 bg-secondary/5 rounded-[4rem] mx-4 sm:mx-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 slide-up">
            <h2 className="text-4xl md:text-6xl font-poppins font-bold mb-6">Seasonal Selections</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-8 rounded-full" />
            
            <div className="flex justify-center mb-12">
              <div className="relative w-full max-w-xl group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input 
                  placeholder="Find your flavor..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 rounded-3xl h-16 border-none bg-background shadow-lg shadow-primary/5 focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <Button 
                  key={cat} 
                  variant="ghost"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-8 py-4 h-auto text-sm font-bold tracking-wide transition-all duration-500",
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

          <div className="max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {isLoadingFood ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="space-y-4 slide-up">
                    <Skeleton className="h-80 w-full rounded-[2.5rem]" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))
              ) : (
                filteredItems.map((item, idx) => (
                  <div 
                    key={item.id}
                    className="group relative slide-up"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Card className="overflow-hidden bg-background border-none shadow-sm hover:shadow-2xl transition-all duration-700 rounded-[3rem] cursor-pointer group-hover:-translate-y-4 hover:ring-2 hover:ring-primary/20">
                      <div className="h-80 relative overflow-hidden">
                        <img 
                          src={defaultFoodImage} 
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute top-6 left-6">
                          <Badge className="bg-white/80 backdrop-blur-md text-primary border-none py-2 px-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10">
                          <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                             <Button className="w-full rounded-2xl h-14 font-bold text-lg">View Details</Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-10">
                        <h3 className="font-poppins font-bold text-2xl mb-4 group-hover:text-primary transition-colors duration-500">{item.name}</h3>
                        <p className="text-muted-foreground text-base line-clamp-2 leading-relaxed font-light">{item.description}</p>
                        <div className="mt-8 pt-8 border-t border-border/30 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="flex items-center gap-2">
                            <Wind size={16} className="text-primary" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Freshly Sourced</span>
                          </div>
                          <ChefHat size={20} className="text-primary" />
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

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedItem(null)}
          />
          <div className="relative bg-card rounded-[3.5rem] shadow-2xl max-w-5xl w-full overflow-hidden z-10 slide-up">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 h-[400px] md:h-auto">
                <img src={defaultFoodImage} className="w-full h-full object-cover" />
              </div>
              <div className="md:w-1/2 p-12 md:p-20">
                <Badge className="mb-8 rounded-full px-6 py-2">{selectedItem.category}</Badge>
                <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-8 leading-tight">{selectedItem.name}</h2>
                <p className="text-muted-foreground text-xl leading-relaxed mb-12 font-light italic">
                  {selectedItem.description}
                </p>
                <div className="flex gap-6">
                  <Button 
                    className="flex-1 h-16 rounded-[1.5rem] text-xl font-bold shadow-2xl hover:shadow-primary/40 transition-all duration-500"
                    onClick={() => {
                      setSelectedItem(null);
                      document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Inquire Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 w-16 rounded-[1.5rem] p-0 border-2"
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

      {/* Contact Section */}
      <section id="contact-section" className="py-32 px-6">
        <div className="max-w-5xl mx-auto relative slide-up">
          <div className="bg-primary rounded-[4rem] p-16 sm:p-24 text-center text-primary-foreground shadow-[0_40px_100px_-20px_rgba(var(--primary),0.4)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
               <Wind size={400} className="absolute -top-40 -left-40 animate-pulse" />
               <Leaf size={400} className="absolute -bottom-40 -right-40 animate-pulse" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-poppins font-bold mb-10 leading-tight">Start Your Organic Journey</h2>
            <p className="text-xl opacity-90 mb-16 max-w-2xl mx-auto font-light leading-relaxed">
              Let us curate a breathtaking culinary experience that honors your most precious moments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-2xl px-14 py-9 text-xl font-bold transition-all duration-500 hover:scale-105">
                Call Studio
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-2xl px-14 py-9 text-xl font-bold transition-all duration-500">
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}