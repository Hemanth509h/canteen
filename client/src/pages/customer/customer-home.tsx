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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
import { EmptyState } from "@/components/features/empty-state";
import { CardSkeleton } from "@/components/features/loading-spinner";

const heroImage = "/images/Elegant_catering_buffet_hero_image_05c8db1b.png";

const floatingIcons = [
  { Icon: ChefHat, delay: 0, x: "10%", y: "20%" },
  { Icon: Utensils, delay: 0.5, x: "85%", y: "15%" },
  { Icon: Heart, delay: 1, x: "15%", y: "70%" },
  { Icon: Star, delay: 1.5, x: "80%", y: "65%" },
  { Icon: Award, delay: 2, x: "50%", y: "10%" },
];

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

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Wedding Client",
    content: "OM Caterers made our wedding reception absolutely magical. The food was exceptional and the service impeccable!",
    rating: 5,
  },
  {
    name: "Rajesh Kumar",
    role: "Corporate Event",
    content: "Professional, punctual, and the food quality is consistently outstanding. Our go-to caterer for all company events.",
    rating: 5,
  },
  {
    name: "Anita Patel",
    role: "Birthday Celebration",
    content: "The variety of dishes and presentation exceeded our expectations. Guests are still talking about the food!",
    rating: 5,
  },
];

function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function FoodCardPreview({ item, onClose }: { item: FoodItem; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" data-testid="dialog-food-preview">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl" data-testid="text-food-preview-title">{item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {item.imageUrl && (
            <div className="relative h-48 rounded-lg overflow-hidden">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" data-testid="img-food-preview" />
            </div>
          )}
          <p className="text-muted-foreground" data-testid="text-food-preview-description">{item.description}</p>
          {item.dietaryTags && item.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-2" data-testid="container-dietary-tags">
              {item.dietaryTags.map((tag) => (
                <Badge key={tag} variant="secondary" data-testid={`badge-dietary-${tag.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" data-testid="badge-food-category">{item.category}</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomerHome() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Non-Veg", "Spicy", "Nut-Free", "Dairy-Free"];

  const [heroOpacity, setHeroOpacity] = useState(1);
  const [heroScale, setHeroScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const opacity = Math.max(0, 1 - scrollY / 400);
      const scale = 1 + (scrollY / 400) * 0.1;
      setHeroOpacity(opacity);
      setHeroScale(Math.min(scale, 1.1));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: foodItems, isLoading: loadingFood } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: companyInfo, isLoading: loadingCompany } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
  });

  const { data: reviews, isLoading: loadingReviews } = useQuery<CustomerReview[]>({
    queryKey: ["/api/reviews"],
  });

  const reviewForm = useForm({
    resolver: zodResolver(insertCustomerReviewSchema),
    defaultValues: {
      customerName: "",
      eventType: "",
      rating: 5,
      comment: "",
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: { customerName: string; eventType: string; rating: number; comment: string }) => {
      return apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Thank you!", description: "Your review has been submitted successfully." });
      reviewForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit review. Please try again.", variant: "destructive" });
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
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
      const matchesDietary = selectedDietary.length === 0 || 
                            (item.dietaryTags && item.dietaryTags.length > 0 && 
                              selectedDietary.some(tag => 
                                item.dietaryTags?.some(itemTag => 
                                  itemTag.toLowerCase() === tag.toLowerCase()
                                )
                              )
                            );
      const matchesSearch = searchQuery === "" || 
                           item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesDietary && matchesSearch;
    }) || [];
  }, [foodItems, selectedCategory, selectedDietary, searchQuery]);

  const groupedByCategory = useMemo(() => {
    if (!filteredItems) return {};
    return filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, FoodItem[]>);
  }, [filteredItems]);

  return (
    <>
      {showIntro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 animate-in fade-in duration-300">
          <div className="text-center">
            <div className="mb-6 animate-in fade-in duration-300">
              <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse-glow">
                <UtensilsCrossed className="w-12 h-12 text-amber-200" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {companyInfo?.companyName}
            </h1>
            <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-6 w-[250px] animate-in fade-in duration-1000 delay-300" />
            <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              Crafting Culinary Excellence
            </p>
            <div className="mt-8 flex justify-center gap-2 animate-in fade-in duration-300">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-amber-300 rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImage})`,
              opacity: heroOpacity,
              transform: `scale(${heroScale})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/75" />
          </div>

          {floatingIcons.map(({ Icon, delay, x, y }, index) => (
            <div
              key={index}
              className="absolute z-10 opacity-15 animate-in fade-in duration-300"
              style={{ left: x, top: y }}
            >
              <div className={index % 2 === 0 ? "animate-float" : "animate-float-delayed"}>
                <Icon className="w-16 h-16 text-primary" />
              </div>
            </div>
          ))}

          <div className="relative z-10 text-center px-4 max-w-6xl mx-auto animate-in fade-in duration-500 py-24">
            <div className="inline-flex items-center gap-3 mb-12 animate-in fade-in duration-500">
              <div className="p-4 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/40">
                <UtensilsCrossed className="w-12 h-12 text-primary" />
              </div>
            </div>

            {loadingCompany ? (
              <>
                <Skeleton className="h-16 md:h-24 w-72 md:w-[600px] mx-auto mb-6 bg-white/20" />
                <Skeleton className="h-7 md:h-10 w-56 md:w-96 mx-auto mb-12 bg-white/20" />
              </>
            ) : (
              <>
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 md:mb-8 leading-tight px-2 animate-in fade-in duration-500">
                  {companyInfo?.companyName}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/95 mb-10 md:mb-14 font-light tracking-wide px-4 animate-in fade-in duration-500 delay-100">
                  {companyInfo?.tagline || "Exceptional Food for Unforgettable Events"}
                </p>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in duration-500 delay-200 mb-12">
              <Button 
                size="lg"
                className="group bg-primary text-primary-foreground px-10 py-7 text-lg font-medium"
                data-testid="button-view-menu"
                onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Our Menu
                <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md text-white border-white/40 hover:bg-white/20 px-10 py-7 text-lg font-medium"
                data-testid="button-contact"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                Book Your Event
              </Button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6 md:gap-12 max-w-2xl mx-auto animate-in fade-in duration-500 delay-300">
              <div className="text-center" data-testid="stat-events">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary font-serif" data-testid="text-stat-events">
                  <AnimatedCounter end={companyInfo?.eventsPerYear || 500} suffix="+" />
                </p>
                <p className="text-white/60 text-sm sm:text-base mt-2 font-light">Events Annually</p>
              </div>
              <div className="text-center" data-testid="stat-experience">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary font-serif" data-testid="text-stat-experience">
                  <AnimatedCounter end={15} suffix="+" />
                </p>
                <p className="text-white/60 text-sm sm:text-base mt-2 font-light">Years Experience</p>
              </div>
              <div className="text-center" data-testid="stat-cuisines">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary font-serif" data-testid="text-stat-cuisines">
                  <AnimatedCounter end={50} suffix="+" />
                </p>
                <p className="text-white/60 text-sm sm:text-base mt-2 font-light">Cuisines</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce z-20">
            <div className="w-8 h-12 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        </section>

        <section className="py-32 bg-gradient-to-br from-background via-background/95 to-background relative overflow-hidden border-b border-border/20">
          <div className="absolute top-0 left-0 w-80 h-80 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge variant="secondary" className="mb-6 px-5 py-2 rounded-full bg-primary/10 text-primary border-primary/20 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" /> Why Choose Us
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-8 text-foreground leading-tight">
                Culinary Excellence in Every Bite
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We bring together tradition, innovation, and passion to create memorable dining experiences that exceed expectations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {features.map((feature, index) => (
                <div key={feature.title} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                  <Card 
                    className="h-full text-center hover-elevate transition-all duration-500 border border-border/50 bg-card/60 backdrop-blur-md shadow-md hover:shadow-lg hover:border-primary/30 group"
                    data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <CardHeader className="pt-10 pb-6">
                      <div className="mx-auto w-24 h-24 bg-primary/12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                        <feature.icon className="w-11 h-11 text-primary group-hover:text-primary transition-colors duration-500" />
                      </div>
                      <CardTitle className="font-serif text-2xl mb-3">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-10">
                      <CardDescription className="text-base text-muted-foreground leading-relaxed">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <div className="md:hidden flex-1">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full" data-testid="select-category-mobile">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem 
                        key={category} 
                        value={category}
                        data-testid={`select-item-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="hidden md:flex flex-1 overflow-x-auto scrollbar-hide items-center justify-center">
                <div className="flex gap-4 pb-1">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(category);
                        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`whitespace-nowrap flex-shrink-0 rounded-full px-6 transition-all duration-300 ${
                        selectedCategory === category ? "shadow-md scale-105" : "hover:bg-primary/10"
                      }`}
                      data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              
              <ThemeToggle />
            </div>
          </div>
        </section>

        <section id="menu" className="py-32 bg-gradient-to-br from-background/95 via-background to-card/20 relative border-t border-border/20">
          <div className="absolute top-0 left-0 w-80 h-80 bg-primary/4 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/4 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16 animate-in fade-in duration-300">
              <Badge variant="secondary" className="mb-6 px-5 py-2 rounded-full text-sm font-medium">
                <Utensils className="w-4 h-4 mr-2" /> Our Specialties
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
                Exquisite Menu Selection
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
                Discover our carefully curated selection of gourmet dishes, crafted to delight every palate
              </p>
              
              <div className="max-w-md mx-auto mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-menu"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {dietaryOptions.map((option) => (
                  <Button
                    key={option}
                    variant={selectedDietary.includes(option) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDietary(prev => 
                      prev.includes(option) 
                        ? prev.filter(d => d !== option)
                        : [...prev, option]
                    )}
                    className="text-xs sm:text-sm"
                    data-testid={`button-dietary-${option.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {loadingFood ? (
              <div className="space-y-8">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx}>
                    <Skeleton className="h-8 w-48 mb-4" />
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                          <Skeleton className="h-28 sm:h-40 w-full" />
                          <CardHeader className="p-2 sm:pb-3 sm:p-4">
                            <Skeleton className="h-4 sm:h-5 w-3/4" />
                          </CardHeader>
                          <CardContent className="p-2 pt-0 sm:p-4 sm:pt-0">
                            <Skeleton className="h-3 sm:h-4 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems && filteredItems.length > 0 ? (
              <div className="space-y-12">
                {Object.entries(groupedByCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, items], categoryIndex) => (
                  <div key={category} className="animate-in fade-in duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <h3 className="text-2xl md:text-3xl font-serif font-bold">
                        {category}
                      </h3>
                      <Badge variant="outline" className="px-3">
                        {items.length} {items.length === 1 ? 'Item' : 'Items'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                      {items.map((item) => (
                        <Card 
                          key={item.id} 
                          className="group cursor-pointer hover-elevate transition-all duration-500 overflow-hidden bg-card/50 backdrop-blur-sm border-none shadow-sm hover:shadow-xl"
                          onClick={() => setSelectedItem(item)}
                          data-testid={`card-food-item-${item.id}`}
                        >
                          {item.imageUrl && (
                            <div className="relative h-28 sm:h-48 overflow-hidden">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                data-testid={`img-food-item-${item.id}`}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                            </div>
                          )}
                          <CardHeader className="p-2 sm:pb-3 sm:p-4">
                            <CardTitle className="text-sm sm:text-lg font-serif group-hover:text-primary transition-colors duration-300" data-testid={`text-food-name-${item.id}`}>{item.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-2 pt-0 sm:p-4 sm:pt-0">
                            <CardDescription className="text-xs sm:text-base line-clamp-2" data-testid={`text-food-desc-${item.id}`}>{item.description}</CardDescription>
                            {item.dietaryTags && item.dietaryTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2 sm:mt-3" data-testid={`container-tags-${item.id}`}>
                                {item.dietaryTags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                                {item.dietaryTags.length > 2 && (
                                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                                    +{item.dietaryTags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No dishes found" 
                description="We couldn't find any dishes matching your filters. Try adjusting your search or category."
                icon={<Utensils className="w-12 h-12 text-muted-foreground" />}
              />
            )}
          </div>
        </section>

        <section className="py-32 bg-gradient-to-br from-background via-background to-card/15 border-t border-border/20">
          <div className="absolute top-0 left-0 w-80 h-80 bg-primary/4 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/4 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20 animate-in fade-in duration-300">
              <Badge variant="secondary" className="mb-6 px-5 py-2 rounded-full text-sm font-medium">
                <Quote className="w-4 h-4 mr-2" /> Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold">
                What Our Clients Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {(loadingReviews ? testimonials : (reviews || testimonials)).slice(0, 3).map((review: any, index: number) => (
                <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 150}ms` }}>
                  <Card className="h-full hover-elevate transition-all duration-500 border border-border/50 bg-card/70 backdrop-blur-sm relative pt-16 hover:border-primary/30">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                      <Quote className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <CardHeader className="text-center pt-8 pb-6">
                      <div className="flex justify-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < (review.rating || 5) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                          />
                        ))}
                      </div>
                      <CardTitle className="font-serif text-xl">{review.customerName || review.name}</CardTitle>
                      <CardDescription className="text-sm">{review.eventType || review.role}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center italic text-muted-foreground pb-10">
                      "{review.comment || review.content}"
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="mt-20 max-w-2xl mx-auto">
              <Card className="bg-card/70 backdrop-blur-sm border border-dashed border-border/50 hover:border-primary/30 transition-colors duration-300">
                <CardHeader className="pb-8">
                  <CardTitle className="text-center font-serif text-2xl">Share Your Experience</CardTitle>
                  <CardDescription className="text-center text-base">How was our service? We'd love to hear from you!</CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                  <Form {...reviewForm}>
                    <form onSubmit={reviewForm.handleSubmit((data) => createReviewMutation.mutate(data))} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={reviewForm.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Name" {...field} data-testid="input-review-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={reviewForm.control}
                          name="eventType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Type</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Wedding, Birthday" {...field} data-testid="input-review-event" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={reviewForm.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating</FormLabel>
                            <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value.toString()}>
                              <FormControl>
                                <SelectTrigger data-testid="select-review-rating">
                                  <SelectValue placeholder="Select rating" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[5, 4, 3, 2, 1].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>{num} Stars</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={reviewForm.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Review</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about your experience..." 
                                className="min-h-[100px] resize-none" 
                                {...field}
                                data-testid="textarea-review-comment"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={createReviewMutation.isPending}
                        data-testid="button-submit-review"
                      >
                        {createReviewMutation.isPending ? (
                          "Submitting..."
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Review
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="contact" className="py-24 relative overflow-hidden bg-gradient-to-br from-background via-background to-background">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 border border-primary rounded-full animate-float" />
            <div className="absolute bottom-10 right-10 w-48 h-48 border border-primary rounded-full animate-float-delayed" />
            <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-primary rounded-full animate-float" />
          </div>
          
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 px-4 py-1">
                <Phone className="w-3 h-3 mr-1" /> Get in Touch
              </Badge>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Ready to Create Something Extraordinary?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Let us transform your next event into an unforgettable culinary experience
              </p>
            </div>

            {loadingCompany ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-8 w-24 mb-2" />
                      <Skeleton className="h-6 w-full" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="hover-elevate transition-all duration-300 border-none bg-card/60 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Phone className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-serif text-xl">Call Us</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <a href={`tel:${companyInfo?.phone}`} data-testid="link-phone" className="text-primary hover:underline font-semibold">
                      {companyInfo?.phone || "Contact"}
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">Available during business hours</p>
                  </CardContent>
                </Card>

                <Card className="hover-elevate transition-all duration-300 border-none bg-card/60 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-serif text-xl">Email Us</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <a href={`mailto:${companyInfo?.email}`} data-testid="link-email" className="text-primary hover:underline font-semibold break-all">
                      {companyInfo?.email || "Contact"}
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">We respond within 24 hours</p>
                  </CardContent>
                </Card>

                <Card className="hover-elevate transition-all duration-300 border-none bg-card/60 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-serif text-xl">Location</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <p className="text-primary font-semibold">{companyInfo?.address || "Visit Us"}</p>
                    <p className="text-sm text-muted-foreground mt-2">Stop by our kitchen</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>

        <footer className="bg-gradient-to-b from-card/30 to-background border-t border-border py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card className="border-none bg-card/40 backdrop-blur-sm hover-elevate transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <UtensilsCrossed className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="font-serif text-lg">
                      {companyInfo?.companyName}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Creating exceptional culinary experiences for your most memorable occasions.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none bg-card/40 backdrop-blur-sm hover-elevate transition-all duration-300">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {companyInfo?.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground text-sm">
                      <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{companyInfo.phone}</span>
                    </div>
                  )}
                  {companyInfo?.email && (
                    <div className="flex items-center gap-3 text-muted-foreground text-sm">
                      <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="break-all">{companyInfo.email}</span>
                    </div>
                  )}
                  {companyInfo?.address && (
                    <div className="flex items-start gap-3 text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{companyInfo.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="border-none bg-card/40 backdrop-blur-sm hover-elevate transition-all duration-300">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button 
                    className="flex items-center text-muted-foreground text-sm hover:text-foreground transition-colors gap-2 group"
                    onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
                    data-testid="button-footer-menu"
                  >
                    <Utensils className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    Our Menu
                  </button>
                  <button 
                    className="flex items-center text-muted-foreground text-sm hover:text-foreground transition-colors gap-2 group"
                    onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                    data-testid="button-footer-contact"
                  >
                    <Phone className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    Contact Us
                  </button>
                  <Link href="/admin/login" className="flex items-center text-muted-foreground text-sm hover:text-foreground transition-colors gap-2 group">
                    <ShieldCheck className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    Admin Portal
                  </Link>
                </CardContent>
              </Card>
            </div>
            
            <div className="border-t border-border pt-8 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {new Date().getFullYear()} {companyInfo?.companyName || "OM Caterers"}. All rights reserved. | Crafting culinary excellence since day one.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {selectedItem && (
        <FoodCardPreview item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
}
