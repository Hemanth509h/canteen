import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  ChefHat, Award, Users, Clock, Utensils, Search, Lock
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
    <div>
      {/* Hero Section */}
      <div className="relative h-[500px] sm:h-[600px] md:h-[700px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4">
            {companyInfo?.companyName || "Elite Catering & Events"}
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6">
            Elevating Your Events
          </h3>
          <p className="text-lg sm:text-xl max-w-2xl mb-8">
            {companyInfo?.tagline || "From intimate gatherings to grand celebrations, we provide a sophisticated culinary experience tailored to your unique taste."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="rounded-full px-8 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl shadow-2xl hover:shadow-primary/40 transition-all duration-300 active-elevate-2 w-full sm:w-auto"
              onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Menu
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-full px-8 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl text-white border-white hover:bg-white hover:text-black transition-all duration-300 active-elevate-2 w-full sm:w-auto"
            >
              Get Quote
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Value Prop Section */}
      <section className="py-20 px-6 sm:px-8 md:px-12 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Philosophy</h2>
              <h3 className="text-3xl md:text-4xl font-light text-primary mb-6">
                Crafting Unforgettable  Culinary Memories
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                {companyInfo?.description || "We believe that food is the heart of every event. Our team of expert chefs uses only the freshest, locally sourced ingredients to create dishes that are as beautiful as they are delicious."}
              </p>
              <div className="flex gap-8 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {(companyInfo)?.yearsExperience || 15}+
                  </div>
                  <div className="text-muted-foreground">Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {companyInfo?.eventsPerYear || 500}+
                  </div>
                  <div className="text-muted-foreground">Events</div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Signature Dishes Showcase */}
      <section id="menu" className="py-20 px-6 sm:px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Curated Gastronomy</h2>
            <h3 className="text-3xl md:text-4xl font-light text-primary mb-6">
              A Symphony of  Flavors
            </h3>
            <div className="mb-8" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Experience our hand-crafted selection of signature dishes, each telling a story of tradition and innovation.
            </p>

            <div className="flex justify-center mb-8">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search dishes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 rounded-full h-10 sm:h-12 text-center text-sm sm:text-lg border-primary/30 focus:border-primary transition-all"
                  data-testid="input-menu-search"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-8">
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
            {isLoadingFood ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
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
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-square bg-muted overflow-hidden rounded-t-lg">
                      <img 
                        src={item.image || "/placeholder.png"} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </Card>

                  {/* Pop-out Card (Visible on Click) */}
                  {selectedItem?.id === item.id && (
                    <div 
                      className="fixed inset-0 z-[1000000] flex items-center justify-center p-2 sm:p-4 bg-black/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(null);
                      }}
                    >
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="md:w-1/2">
                            <img 
                              src={item.image || "/placeholder.png"}
                              alt={item.name}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </div>

                          <div className="md:w-1/2">
                            <Badge className="mb-3">{item.category}</Badge>
                            <h2 className="text-3xl font-bold mb-2">
                              {item.name}
                            </h2>
                            <p className="text-muted-foreground mb-4">
                              {item.description}
                            </p>

                            <div className="flex gap-4 mt-6">
                              <Button 
                                className="h-12 sm:h-16 md:h-20 px-8 sm:px-12 rounded-[12px] sm:rounded-[15px] bg-[#FBBF24] hover:bg-[#F59E0B] text-white text-base sm:text-xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95 w-full sm:w-auto"
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
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center min-h-[300px]">
                <p className="text-muted-foreground mb-4">
                  No culinary masterpieces found in this selection.
                </p>
                <Button onClick={() => setSelectedCategory("All")} className="mt-4 text-primary hover:text-primary/80">
                  View All Selections
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-20 px-6 sm:px-8 md:px-12 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Cherished Memories</h2>
            <h3 className="text-3xl md:text-4xl font-light text-primary mb-6">
              What Our Clients Say
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from those who trusted us with their most important moments
            </p>
          </div>
          <ReviewsCarousel reviews={reviews || []} />
        </div>
      </section>

      {/* Share Your Review Section */}
      <section className="py-20 px-6 sm:px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Feedback Matters</h2>
            <h3 className="text-3xl md:text-4xl font-light text-primary mb-6">
              Tell Us Your Story
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We'd love to hear about your experience with Elite Catering & Events
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ReviewForm />
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-20 px-6 sm:px-8 md:px-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-lg">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Begin Your  Culinary Journey
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              We are ready to design an experience that perfectly matches your vision. Our consultants are standing by to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg"
                className="rounded-full px-8 py-6 text-lg font-semibold"
                onClick={() => window.location.href = `tel:${companyInfo?.phone || "+91 98765 43210"}`}
              >
                Call Our Studio
                {companyInfo?.phone || "+91 98765 43210"}
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-lg font-semibold"
                onClick={() => window.location.href = `mailto:${companyInfo?.email || "events@elite-catering.com"}`}
              >
                Digital Inquiry
                <a href={`mailto:${companyInfo?.email || "events@elite-catering.com"}`}>
                  {companyInfo?.email || "events@elite-catering.com"}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
