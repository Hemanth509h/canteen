import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  ChefHat, Award, Users, Clock, Phone, Mail, Utensils, Star, ArrowRight
} from "lucide-react";
import type { FoodItem, CompanyInfo } from "@shared/schema";
import { cn } from "@/lib/utils";

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
  const [searchQuery] = useState("");

  const { data: foodItems, isLoading: loadingFood } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: companyInfo } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
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

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 py-1.5 px-6 rounded-full text-sm font-medium tracking-wide">
            Elite Catering & Events
          </Badge>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-8 leading-tight tracking-tight max-w-4xl">
            Elevating Your <span className="text-primary italic">Events</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl font-light leading-relaxed">
            From intimate gatherings to grand celebrations, we provide a sophisticated culinary experience tailored to your unique taste.
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
      <section className="py-32 bg-background relative overflow-hidden flex flex-col items-center">
        <div className="container px-4 mx-auto relative z-10 flex flex-col items-center">
          <div className="max-w-4xl w-full text-center mb-20 flex flex-col items-center">
            <Badge variant="outline" className="mb-6 border-primary text-primary px-4 py-1 uppercase tracking-widest text-xs">Our Philosophy</Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-8 text-foreground leading-tight">
              Crafting Unforgettable <br /> Culinary Memories
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed font-light max-w-2xl mx-auto text-center">
              We believe that food is the heart of every event. Our team of expert chefs uses only the freshest, locally sourced ingredients to create dishes that are as beautiful as they are delicious.
            </p>
            <div className="flex gap-12 justify-center w-full">
              <div className="text-center space-y-2">
                <h3 className="text-4xl font-bold text-primary">15+</h3>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Years Experience</p>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-4xl font-bold text-primary">500+</h3>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Events Served</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto w-full">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-none bg-muted/50 p-8 hover-elevate transition-all duration-300 rounded-2xl group flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-muted-foreground font-light text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Dishes Showcase - REDESIGNED */}
      <section id="menu" className="py-32 bg-muted/10 flex flex-col items-center border-y">
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
            
            <div className="flex flex-wrap justify-center gap-2 mb-16 max-w-5xl mx-auto">
              {categories.map((cat) => (
                <Button 
                  key={cat} 
                  variant="ghost"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-6 py-2 h-auto text-sm font-medium transition-all duration-300",
                    selectedCategory === cat 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {loadingFood ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-6">
                  <Skeleton className="h-[450px] w-full rounded-[2.5rem]" />
                  <div className="space-y-3 px-4">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item.id} className="group relative flex flex-col items-center">
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-700 group-hover:shadow-primary/10 group-hover:-translate-y-2">
                    <img 
                      src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                      alt={item.name}
                      className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-70" />
                    
                    <div className="absolute top-8 right-8">
                      <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white px-4 py-1.5 rounded-full font-semibold uppercase tracking-widest text-[10px]">
                        {item.category}
                      </Badge>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 flex flex-col items-start gap-4">
                      <div className="flex gap-1 text-primary">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <h3 className="text-3xl font-serif font-bold text-white leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-gray-300 text-sm font-light line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      <Button variant="outline" className="mt-4 rounded-full border-white/30 text-white bg-white/5 backdrop-blur-sm hover:bg-white/20 hover:border-white transition-all group/btn">
                        Learn More <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-40 text-center flex flex-col items-center justify-center bg-background rounded-[3rem] border border-dashed">
                <Utensils className="w-12 h-12 text-muted-foreground/30 mb-6" />
                <p className="text-xl text-muted-foreground font-light">No culinary masterpieces found in this selection.</p>
                <Button variant="link" onClick={() => setSelectedCategory("All")} className="mt-4 text-primary">View All Selections</Button>
              </div>
            )}
          </div>
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
              <p className="text-xl md:text-2xl opacity-80 mb-12 font-light leading-relaxed max-w-2xl">
                We are ready to design an experience that perfectly matches your vision. <br /> Our consultants are standing by to assist you.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-12 w-full">
                <div className="text-center group flex flex-col items-center">
                  <p className="text-primary text-xs uppercase tracking-[0.3em] font-bold mb-3 group-hover:text-primary/80 transition-colors">Call Our Studio</p>
                  <p className="text-3xl font-serif font-medium">{companyInfo?.phone || "+91 98765 43210"}</p>
                </div>
                <div className="w-px h-12 bg-white/10 hidden sm:block" />
                <div className="text-center group flex flex-col items-center">
                  <p className="text-primary text-xs uppercase tracking-[0.3em] font-bold mb-3 group-hover:text-primary/80 transition-colors">Digital Inquiry</p>
                  <p className="text-3xl font-serif font-medium underline underline-offset-8 decoration-primary/30 group-hover:decoration-primary transition-all">
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
