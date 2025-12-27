import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  UtensilsCrossed, Phone, Mail, MapPin, ShieldCheck, Search, 
  ChefHat, Award, Users, Calendar, Star, Clock, Heart,
  Sparkles, ArrowRight, Quote, CheckCircle2, Utensils, Send
} from "lucide-react";
import type { FoodItem, CompanyInfo, CustomerReview } from "@shared/schema";
import { insertCustomerReviewSchema } from "@shared/schema";
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
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: foodItems, isLoading: loadingFood } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: companyInfo } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
  });

  const { data: reviews } = useQuery<CustomerReview[]>({
    queryKey: ["/api/reviews"],
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 py-1.5 px-6 rounded-full text-sm font-medium tracking-wide">
            Elite Catering & Events
          </Badge>
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-8 leading-tight tracking-tight">
            Elevating Your <span className="text-primary italic">Events</span>
          </h1>
          <p className="text-2xl text-gray-200 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            From intimate gatherings to grand celebrations, we provide a sophisticated culinary experience tailored to your unique taste.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="rounded-full px-12 py-7 text-xl shadow-2xl hover:shadow-primary/40 transition-all duration-300 active-elevate-2">
              View Menu
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-12 py-7 text-xl bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 transition-all duration-300">
              Get Quote
            </Button>
          </div>
        </div>
      </section>

      {/* Modern Value Prop Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-muted/30 -skew-x-12 translate-x-1/2" />
        <div className="container px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <Badge variant="outline" className="mb-6 border-primary text-primary px-4 py-1">Our Philosophy</Badge>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-foreground leading-tight">
                Crafting Unforgettable <br /> Culinary Memories
              </h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-light">
                We believe that food is the heart of every event. Our team of expert chefs uses only the freshest, locally sourced ingredients to create dishes that are as beautiful as they are delicious.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-primary">15+</h3>
                  <p className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Years Experience</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-primary">500+</h3>
                  <p className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Events Served</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <Card key={idx} className="border-none bg-muted/50 p-8 hover-elevate transition-all duration-300 rounded-2xl group">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                  <p className="text-muted-foreground font-light">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Signature Dishes Showcase */}
      <section id="menu" className="py-32 bg-muted/20">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-6 border-primary text-primary px-4 py-1 uppercase tracking-widest text-xs">Curated Selection</Badge>
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">Our Menu Specialties</h2>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                A masterpiece of flavor in every bite. Explore our seasonal menu designed for excellence.
              </p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
              {categories.map((cat) => (
                <Button 
                  key={cat} 
                  variant={selectedCategory === cat ? "default" : "ghost"}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-8 py-6 text-base font-medium transition-all duration-300",
                    selectedCategory === cat ? "shadow-xl shadow-primary/20 scale-105" : "text-muted-foreground"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loadingFood ? (
              Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-[400px] rounded-3xl" />)
            ) : filteredItems.length > 0 ? (
              filteredItems.slice(0, 8).map((item) => (
                <Card key={item.id} className="overflow-hidden border-none group bg-background shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img 
                      src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                      alt={item.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
                    <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <Button size="sm" className="w-full rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/40">
                        View Details
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="p-8">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl font-serif">{item.name}</CardTitle>
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-none">{item.category}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2 text-base font-light text-muted-foreground">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-40 text-center text-muted-foreground bg-muted/10 rounded-3xl border border-dashed border-muted">
                No items found in this selection.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-32 container px-4">
        <div className="relative rounded-[3rem] overflow-hidden bg-foreground text-background py-24 px-8 md:px-16 text-center shadow-3xl">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b')] bg-cover bg-center mix-blend-overlay" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight">
              Begin Your <br /> Culinary Journey
            </h2>
            <p className="text-xl md:text-2xl opacity-80 mb-12 font-light leading-relaxed">
              We are ready to design an experience that perfectly matches your vision. <br /> Our consultants are standing by to assist you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-12">
              <div className="text-center group">
                <p className="text-primary text-xs uppercase tracking-[0.3em] font-bold mb-3 group-hover:text-primary/80 transition-colors">Call Our Studio</p>
                <p className="text-3xl font-serif font-medium">{companyInfo?.phone || "+91 98765 43210"}</p>
              </div>
              <div className="w-px h-12 bg-white/10 hidden sm:block" />
              <div className="text-center group">
                <p className="text-primary text-xs uppercase tracking-[0.3em] font-bold mb-3 group-hover:text-primary/80 transition-colors">Digital Inquiry</p>
                <p className="text-3xl font-serif font-medium underline underline-offset-8 decoration-primary/30 group-hover:decoration-primary transition-all">
                  {companyInfo?.email || "events@elite-catering.com"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
