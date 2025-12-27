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
  const [showIntro, setShowIntro] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: foodItems, isLoading: loadingFood } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: companyInfo, isLoading: loadingCompany } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
  });

  const { data: reviews, isLoading: loadingReviews } = useQuery<CustomerReview[]>({
    queryKey: ["/api/reviews"],
    select: (data) => [...data].sort((a, b) => Number(b.id) - Number(a.id)),
  });

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

  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Non-Veg", "Spicy", "Nut-Free", "Dairy-Free"];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;
    let isPaused = false;

    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    const scroll = () => {
      if (!scrollContainer || isPaused) {
        animationFrameId = requestAnimationFrame(scroll);
        return;
      }
      
      const maxScroll = scrollContainer.scrollWidth / 2;
      
      if (scrollContainer.scrollLeft >= maxScroll) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    // Small delay to ensure layout is calculated
    const timer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(scroll);
    }, 500);
    
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [reviews, loadingReviews, testimonials]);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black animate-in fade-in duration-300">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 animate-in fade-in duration-500">
              {companyInfo?.companyName}
            </h1>
            <p className="text-lg text-gray-300 animate-in fade-in duration-500 delay-100">
              Crafting Culinary Excellence
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background">
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImage})`,
              transform: `scale(${heroScale})`,
            }}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          </div>

          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto" style={{ opacity: heroOpacity }}>
            {loadingCompany ? (
              <Skeleton className="h-20 md:h-28 w-64 md:w-full mx-auto mb-8 bg-white/20" />
            ) : (
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight animate-fade-in-down tracking-tight drop-shadow-2xl">
                {companyInfo?.companyName}
              </h1>
            )}
            
            <p className="text-2xl md:text-3xl text-gray-200 mb-14 max-w-3xl mx-auto font-light animate-fade-in-up animation-delay-200 leading-relaxed drop-shadow-lg">
              {companyInfo?.tagline || "Exceptional Food for Unforgettable Events"}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-zoom-in animation-delay-400">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-8 text-xl font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-xl"
                data-testid="button-view-menu"
                onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Menu
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-black/10 backdrop-blur-md text-foreground border-foreground/20 border-2 hover:bg-black/20 px-10 py-8 text-xl font-semibold rounded-full transition-all duration-300 hover:scale-105"
                data-testid="button-contact"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                Get Started
              </Button>
            </div>
          </div>
        </section>

        <section className="py-32 relative overflow-hidden border-b border-border/20 bg-background">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="absolute top-0 left-0 w-80 h-80 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
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
                    className="h-full text-center hover-elevate transition-all duration-500 border border-border/50 bg-card shadow-md hover:shadow-xl hover:border-primary/30 group"
                    data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <CardHeader className="pt-10 pb-6">
                      <div className="mx-auto w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 shadow-inner">
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

        <section className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
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

        <section id="menu" className="py-32 bg-background relative border-t border-border/20">
          <div className="absolute top-0 left-0 w-80 h-80 bg-primary/4 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />

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

        <section className="py-32 bg-background border-t border-border/20">
          <div className="absolute top-0 left-0 w-80 h-80 bg-primary/4 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <Badge variant="secondary" className="mb-6 px-5 py-2 rounded-full text-sm font-medium">
                <Quote className="w-4 h-4 mr-2" /> Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold">
                What Our Clients Say
              </h2>
            </div>

            <div className="relative mb-12 group">
              <div 
                ref={scrollRef}
                className="flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory px-4 md:px-0 scrollbar-hide"
                style={{ scrollBehavior: 'auto' }}
              >
                {(() => {
                  const displayReviews = loadingReviews ? testimonials : (reviews && reviews.length > 0 ? reviews : testimonials);
                  const doubledReviews = [...displayReviews, ...displayReviews];
                  return doubledReviews.map((review: any, index: number) => (
                    <div 
                      key={`${review.id || index}-${index}`}
                      className="flex-shrink-0 w-[300px] md:w-[380px] snap-center" 
                    >
                      <Card className="h-full hover-elevate transition-all duration-500 border border-border/50 bg-card/70 backdrop-blur-sm relative pt-16 hover:border-primary/30 shadow-xl">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                          <Quote className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <CardHeader className="text-center pt-8 pb-4">
                          <div className="flex justify-center gap-1 mb-2">
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
                        <CardContent className="text-center italic text-muted-foreground pb-8">
                          "{review.comment || review.content}"
                        </CardContent>
                      </Card>
                    </div>
                  ));
                })()}
              </div>
              
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none md:block hidden" />
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none md:block hidden" />
            </div>

            <div className="mt-20 max-w-2xl mx-auto">
              <Card className="bg-card hover-elevate animate-scale-in/70 backdrop-blur-sm border border-dashed border-border/50 hover:border-primary/30 transition-colors duration-300">
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

        <section id="contact" className="py-24 relative overflow-hidden bg-background">
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
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
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

        <footer className="bg-background border-t border-border py-16">
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
            
            <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                {new Date().getFullYear()} {companyInfo?.companyName || "OM Caterers"}. All rights reserved. | Crafting culinary excellence since day one.
              </p>
              <Link href="/admin/login" className="order-1 sm:order-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors h-8">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Admin Login
                </Button>
              </Link>
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
