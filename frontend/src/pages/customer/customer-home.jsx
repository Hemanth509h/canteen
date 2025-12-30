import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  ChefHat, Award, Users, Clock, Utensils, Search, Lock, Moon, Sun
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
    <div className="font-inter">
      {/* Hero Section */}
      <div className="relative h-[350px] sm:h-[450px] md:h-[550px] overflow-hidden">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4 sm:px-6 md:px-8">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-poppins font-bold mb-6 sm:mb-8 leading-tight tracking-tight">
            {companyInfo?.companyName || "Elite Catering & Events"}
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-inter font-300 mb-6 sm:mb-8 tracking-wide">
            Elevating Your Events
          </h3>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mb-8 sm:mb-12 font-inter font-light leading-relaxed">
            {companyInfo?.tagline || "From intimate gatherings to grand celebrations, we provide a sophisticated culinary experience tailored to your unique taste."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
            <Button 
              size="lg" 
              className="rounded-full px-8 sm:px-12 py-6 sm:py-7 text-base sm:text-xl shadow-2xl hover:shadow-primary/40 transition-all duration-300 active-elevate-2 font-semibold"
              onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Menu
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-full px-8 sm:px-12 py-6 sm:py-7 text-base sm:text-xl text-white border-white hover:bg-white hover:text-black transition-all duration-300 active-elevate-2 font-semibold"
            >
              Get Quote
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Value Prop Section */}
      <section className="py-12 sm:py-16 md:py-20 px-6 sm:px-8 md:px-12 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
                Our Philosophy
              </h2>
              <h3 className="text-xl md:text-2xl font-inter font-300 text-primary mb-4 sm:mb-6 leading-relaxed">
                Crafting Unforgettable Culinary Memories
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed font-inter">
                {companyInfo?.description || "We believe that food is the heart of every event. Our team of expert chefs uses only the freshest, locally sourced ingredients to create dishes that are as beautiful as they are delicious."}
              </p>
              <div className="flex gap-8 sm:gap-12 mb-6">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-primary mb-3">
                    {(companyInfo)?.yearsExperience || 15}+
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground font-medium">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-primary mb-3">
                    {companyInfo?.eventsPerYear || 500}+
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground font-medium">Events Annually</div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-6 sm:p-8 hover:shadow-lg transition-shadow duration-300 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 sm:mb-6">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg sm:text-xl mb-3 sm:mb-4">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground font-inter leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Signature Dishes Showcase */}
      <section id="menu" className="py-12 sm:py-16 md:py-20 px-6 sm:px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              Curated Gastronomy
            </h2>
            <h3 className="text-xl md:text-2xl font-inter font-300 text-primary mb-4 sm:mb-6 leading-relaxed">
              A Symphony of Flavors
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 font-inter leading-relaxed">
              Experience our hand-crafted selection of signature dishes, each telling a story of tradition and innovation.
            </p>

            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search dishes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 rounded-full h-11 sm:h-13 text-sm sm:text-base border-primary/30 focus:border-primary transition-all"
                  data-testid="input-menu-search"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6 sm:mb-8">
              {categories.map((cat) => (
                <Button 
                  key={cat} 
                  variant="ghost"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-5 sm:px-7 py-2 sm:py-2.5 h-auto text-xs sm:text-sm font-medium transition-all duration-300",
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

          <div className="h-[1200px] sm:h-[900px] md:h-[1000px] overflow-y-auto rounded-xl border bg-white dark:bg-slate-800 p-4 sm:p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {isLoadingFood ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="group cursor-pointer relative" 
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Base Card (Visible in grid) */}
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-[420px] sm:h-[450px] flex flex-col">
                    <div className="h-48 sm:h-56 bg-muted overflow-hidden rounded-t-lg">
                      <img 
                        src={item.image || "/placeholder.png"} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <h3 className="font-poppins font-semibold text-base sm:text-lg mb-2 sm:mb-3 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 font-inter">
                        {item.description}
                      </p>
                    </div>
                  </Card>

                  {/* Pop-out Card (Visible on Click) */}
                  {selectedItem?.id === item.id && (
                    <div 
                      className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(null);
                      }}
                    >
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
                          <div className="md:w-1/2">
                            <img 
                              src={item.image || "/placeholder.png"}
                              alt={item.name}
                              className="w-full h-64 object-cover rounded-xl"
                            />
                          </div>

                          <div className="md:w-1/2 flex flex-col justify-between">
                            <div>
                              <Badge className="mb-4 text-xs sm:text-sm py-1 sm:py-1.5">{item.category}</Badge>
                              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold mb-4 sm:mb-5 leading-tight tracking-tight">
                                {item.name}
                              </h2>
                              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 font-inter leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-0">
                              <Button 
                                className="h-12 sm:h-14 px-6 sm:px-8 rounded-lg bg-primary hover:bg-primary/90 text-white text-base sm:text-lg font-semibold shadow-lg transition-all active:scale-95"
                                onClick={() => {
                                  setSelectedItem(null);
                                  document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
                                }}
                              >
                                Contact Us
                              </Button>
                              <Button 
                                variant="outline"
                                className="h-12 sm:h-14 px-6 sm:px-8 rounded-lg text-base sm:text-lg font-semibold transition-all active:scale-95"
                                onClick={() => setSelectedItem(null)}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center min-h-[300px]">
                  <p className="text-base sm:text-lg text-muted-foreground mb-6 font-light">
                    No culinary masterpieces found in this selection.
                  </p>
                  <Button onClick={() => setSelectedCategory("All")} className="mt-4 font-semibold">
                    View All Selections
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 px-6 sm:px-8 md:px-12 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              Cherished Memories
            </h2>
            <h3 className="text-xl md:text-2xl font-inter font-300 text-primary mb-4 sm:mb-6 leading-relaxed">
              What Our Clients Say
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
              Real stories from those who trusted us with their most important moments
            </p>
          </div>
          <ReviewsCarousel reviews={reviews || []} />
        </div>
      </section>

      {/* Share Your Review Section */}
      <section className="py-12 sm:py-16 md:py-20 px-6 sm:px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              Your Feedback Matters
            </h2>
            <h3 className="text-xl md:text-2xl font-inter font-300 text-primary mb-4 sm:mb-6 leading-relaxed">
              Tell Us Your Story
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
              We'd love to hear about your experience with Elite Catering & Events
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ReviewForm />
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section id="contact-section" className="py-12 sm:py-16 md:py-20 px-6 sm:px-8 md:px-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 md:p-12 text-center shadow-lg">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              Begin Your Culinary Journey
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto font-inter leading-relaxed">
              We are ready to design an experience that perfectly matches your vision. Our consultants are standing by to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Button 
                size="lg"
                className="rounded-full px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-semibold"
                onClick={() => window.location.href = `tel:${companyInfo?.phone || "+91 98765 43210"}`}
              >
                Call Our Studio
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="rounded-full px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-semibold"
                onClick={() => window.location.href = `mailto:${companyInfo?.email || "events@elite-catering.com"}`}
              >
                Digital Inquiry
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
