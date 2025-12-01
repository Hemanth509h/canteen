import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  UtensilsCrossed, Phone, Mail, MapPin, ShieldCheck, Search, 
  ChefHat, Award, Users, Calendar, Star, Clock, Heart,
  Sparkles, ArrowRight, Quote, CheckCircle2, Utensils, Send, Settings
} from "lucide-react";
import type { FoodItem, CompanyInfo, CustomerReview } from "@shared/schema";
import { insertCustomerReviewSchema } from "@shared/schema";

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
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const { toast } = useToast();

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);

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

  const filteredItems = foodItems?.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         item.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                         item.category.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
      {/* Animated Intro Screen */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="mb-6"
              >
                <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse-glow">
                  <UtensilsCrossed className="w-12 h-12 text-amber-200" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-5xl md:text-6xl font-serif font-bold text-white mb-4"
              >
                OM Caterers
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "200px" }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto mb-4"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-xl text-amber-100/80"
              >
                Crafting Culinary Excellence
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="mt-8 flex justify-center gap-2"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-amber-300 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Admin Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/admin/login">
            <Button
              size="icon"
              variant="secondary"
              className="fixed bottom-6 right-6 z-50 shadow-lg"
              data-testid="button-floating-admin"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Admin Portal</p>
        </TooltipContent>
      </Tooltip>

      <div className="min-h-screen bg-background">
        {/* Hero Section with Parallax */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-8">
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImage})`,
              opacity: heroOpacity,
              scale: heroScale,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          </motion.div>

          {/* Floating Icons */}
          {floatingIcons.map(({ Icon, delay, x, y }, index) => (
            <motion.div
              key={index}
              className="absolute z-10 opacity-20"
              style={{ left: x, top: y }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.2, scale: 1 }}
              transition={{ delay: delay + 2.5, duration: 0.5 }}
            >
              <div className={index % 2 === 0 ? "animate-float" : "animate-float-delayed"}>
                <Icon className="w-12 h-12 text-primary" />
              </div>
            </motion.div>
          ))}

          <motion.div 
            className="relative z-10 text-center px-4 max-w-5xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.7, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <div className="p-4 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30">
                <UtensilsCrossed className="w-10 h-10 text-primary" />
              </div>
            </motion.div>

            {loadingCompany ? (
              <>
                <Skeleton className="h-12 md:h-20 w-64 md:w-[500px] mx-auto mb-4 bg-white/20" />
                <Skeleton className="h-6 md:h-8 w-48 md:w-80 mx-auto mb-8 bg-white/20" />
              </>
            ) : (
              <>
                <motion.h1 
                  className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 md:mb-6 leading-tight px-2"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 2.9, duration: 0.8 }}
                >
                  {companyInfo?.companyName || "OM Caterers"}
                </motion.h1>
                <motion.p 
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-10 font-light px-4"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 3.1, duration: 0.6 }}
                >
                  {companyInfo?.tagline || "Exceptional Food for Unforgettable Events"}
                </motion.p>
              </>
            )}

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 3.3, duration: 0.6 }}
            >
              <Button 
                size="lg"
                className="group bg-primary text-primary-foreground px-8 py-6 text-lg"
                data-testid="button-view-menu"
                onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Our Menu
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md text-white border-white/30 px-8 py-6 text-lg"
                data-testid="button-contact"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                Book Your Event
              </Button>
            </motion.div>

            <motion.div
              className="mt-8 md:mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-md md:max-w-lg mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
            >
              <div className="text-center" data-testid="stat-events">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary" data-testid="text-stat-events">
                  <AnimatedCounter end={companyInfo?.eventsPerYear || 500} suffix="+" />
                </p>
                <p className="text-white/70 text-xs sm:text-sm">Events Annually</p>
              </div>
              <div className="text-center border-x border-white/20" data-testid="stat-experience">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary" data-testid="text-stat-experience">
                  <AnimatedCounter end={15} suffix="+" />
                </p>
                <p className="text-white/70 text-xs sm:text-sm">Years Experience</p>
              </div>
              <div className="text-center" data-testid="stat-cuisines">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary" data-testid="text-stat-cuisines">
                  <AnimatedCounter end={50} suffix="+" />
                </p>
                <p className="text-white/70 text-xs sm:text-sm">Cuisines</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 4, duration: 2, repeat: Infinity }}
          >
            <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <motion.div
                className="w-1.5 h-3 bg-primary rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-warm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1">
                <Sparkles className="w-3 h-3 mr-1" /> Why Choose Us
              </Badge>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Culinary Excellence in Every Bite
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We bring together tradition, innovation, and passion to create memorable dining experiences
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card 
                    className="h-full text-center hover-elevate transition-all duration-300 border-none bg-card/50 backdrop-blur-sm"
                    data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <CardHeader>
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <feature.icon className="w-8 h-8 text-primary" />
                      </div>
                      <CardTitle className="font-serif text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Navigation */}
        <section className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 flex-1">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <ThemeToggle />
            </div>
          </div>
        </section>

        {/* Menu Section */}
        <section id="menu" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1">
                <Utensils className="w-3 h-3 mr-1" /> Our Specialties
              </Badge>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Exquisite Menu Selection
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Discover our carefully curated selection of gourmet dishes, crafted to delight every palate
              </p>
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for dishes, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-base rounded-full border-2"
                  data-testid="input-search-food"
                />
              </div>
            </motion.div>

            {loadingFood ? (
              <div className="space-y-8">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx}>
                    <Skeleton className="h-8 w-48 mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                          <Skeleton className="h-40 w-full" />
                          <CardHeader className="pb-3">
                            <Skeleton className="h-5 w-3/4" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-4 w-full" />
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
                  <motion.div 
                    key={category}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: categoryIndex * 0.1 }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <h3 className="text-2xl md:text-3xl font-serif font-bold">
                        {category}
                      </h3>
                      <Badge variant="outline" className="px-3">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </Badge>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className="group cursor-pointer overflow-visible hover-elevate transition-all duration-300"
                            data-testid={`card-food-${item.id}`}
                            onClick={() => setSelectedItem(item)}
                          >
                            {item.imageUrl && (
                              <div className="relative h-44 overflow-hidden rounded-t-lg">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <motion.div
                                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100"
                                  initial={false}
                                  animate={{ scale: 1 }}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <Button size="sm" variant="secondary" className="gap-1">
                                    View <ArrowRight className="w-3 h-3" />
                                  </Button>
                                </motion.div>
                              </div>
                            )}
                            <CardHeader className="space-y-1 pb-2">
                              <CardTitle className="text-lg font-serif line-clamp-1 group-hover:text-primary transition-colors">
                                {item.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <CardDescription className="line-clamp-2 text-sm">
                                {item.description}
                              </CardDescription>
                              {item.dietaryTags && item.dietaryTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {item.dietaryTags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No items found matching your search</p>
                <Button 
                  variant="ghost" 
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                  className="mt-2 underline"
                  data-testid="button-clear-filters"
                >
                  Clear filters
                </Button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 md:py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-8 md:mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1">
                <Star className="w-3 h-3 mr-1" /> Testimonials
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
                What Our Clients Say
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Hear from those who have experienced our exceptional catering services
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card 
                    className="h-full hover-elevate"
                    data-testid={`card-testimonial-${index}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-1 mb-3" data-testid={`rating-${index}`}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 md:w-8 md:h-8 text-primary/20 mb-2" />
                      <CardDescription className="text-sm md:text-base text-foreground/80 leading-relaxed">
                        "{testimonial.content}"
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-base md:text-lg font-semibold text-primary" data-testid={`text-testimonial-author-${index}`}>
                            {testimonial.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm md:text-base" data-testid={`text-testimonial-name-${index}`}>{testimonial.name}</p>
                          <p className="text-xs md:text-sm text-muted-foreground" data-testid={`text-testimonial-role-${index}`}>{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Customer Submitted Reviews */}
            {reviews && reviews.length > 0 && (
              <motion.div
                className="mt-8 md:mt-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl md:text-2xl font-serif font-bold mb-4 md:mb-6 text-center">Recent Customer Reviews</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reviews.slice(0, 6).map((review, index) => (
                    <Card key={review.id} className="hover-elevate" data-testid={`card-customer-review-${index}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                          ))}
                        </div>
                        <CardDescription className="text-sm text-foreground/80">
                          "{review.comment}"
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {review.customerName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{review.customerName}</p>
                              <p className="text-xs text-muted-foreground">{review.eventType}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Review Submission Section */}
        <section id="submit-review" className="py-12 md:py-20 bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-8 md:mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1">
                <Send className="w-3 h-3 mr-1" /> Share Your Experience
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-4">
                Leave a Review
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                We would love to hear about your experience with our catering services
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardContent className="pt-6">
                  <Form {...reviewForm}>
                    <form 
                      onSubmit={reviewForm.handleSubmit((data) => createReviewMutation.mutate(data))}
                      className="space-y-4 md:space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={reviewForm.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your name" 
                                  {...field} 
                                  data-testid="input-review-name"
                                />
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-review-event-type">
                                    <SelectValue placeholder="Select event type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Wedding">Wedding</SelectItem>
                                  <SelectItem value="Birthday Party">Birthday Party</SelectItem>
                                  <SelectItem value="Corporate Event">Corporate Event</SelectItem>
                                  <SelectItem value="Anniversary">Anniversary</SelectItem>
                                  <SelectItem value="Religious Ceremony">Religious Ceremony</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
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
                            <FormControl>
                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => field.onChange(star)}
                                    className="p-1 transition-transform hover:scale-110"
                                    data-testid={`button-rating-${star}`}
                                  >
                                    <Star
                                      className={`w-6 h-6 md:w-8 md:h-8 ${
                                        star <= field.value
                                          ? "fill-primary text-primary"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </button>
                                ))}
                                <span className="ml-2 text-sm text-muted-foreground">
                                  {field.value} out of 5
                                </span>
                              </div>
                            </FormControl>
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
                                className="min-h-[100px] md:min-h-[120px] resize-none"
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
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full animate-float" />
            <div className="absolute bottom-10 right-10 w-48 h-48 border border-white/20 rounded-full animate-float-delayed" />
            <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-white/20 rounded-full animate-float" />
          </div>
          
          <motion.div 
            className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">
              Ready to Create Something Extraordinary?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Let us transform your next event into an unforgettable culinary experience
            </p>
            
            {loadingCompany ? (
              <div className="flex flex-col gap-4 items-center">
                <Skeleton className="h-8 w-64 bg-white/20" />
                <Skeleton className="h-8 w-56 bg-white/20" />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a href={`tel:${companyInfo?.phone}`} data-testid="link-phone">
                  <Button size="lg" className="bg-white text-amber-900 gap-2 px-8 py-6 text-lg">
                    <Phone className="w-5 h-5" />
                    {companyInfo?.phone || "Call Us"}
                  </Button>
                </a>
                <a href={`mailto:${companyInfo?.email}`} data-testid="link-email">
                  <Button size="lg" variant="outline" className="bg-transparent text-white border-white/50 gap-2 px-8 py-6 text-lg">
                    <Mail className="w-5 h-5" />
                    {companyInfo?.email || "Email Us"}
                  </Button>
                </a>
              </div>
            )}
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UtensilsCrossed className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-serif font-bold text-xl">
                    {companyInfo?.companyName || "OM Caterers"}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Creating exceptional culinary experiences for your most memorable occasions.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <div className="space-y-3 text-muted-foreground">
                  {companyInfo?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{companyInfo.phone}</span>
                    </div>
                  )}
                  {companyInfo?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{companyInfo.email}</span>
                    </div>
                  )}
                  {companyInfo?.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{companyInfo.address}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <div className="space-y-2">
                  <button 
                    className="block text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                    onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
                    data-testid="button-footer-menu"
                  >
                    Our Menu
                  </button>
                  <button 
                    className="block text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                    onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                    data-testid="button-footer-contact"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                {new Date().getFullYear()} {companyInfo?.companyName || "OM Caterers"}. All rights reserved.
              </p>
              <Link href="/admin/login">
                <Button 
                  variant="ghost" 
                  size="sm"
                  data-testid="button-admin-login"
                  className="text-muted-foreground gap-1"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Food Item Preview Modal */}
      {selectedItem && (
        <FoodCardPreview item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
}
