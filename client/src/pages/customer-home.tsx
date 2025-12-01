import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { UtensilsCrossed, Phone, Mail, MapPin, ShieldCheck, Search } from "lucide-react";
import type { FoodItem, CompanyInfo } from "@shared/schema";

const heroImage = "/images/Elegant_catering_buffet_hero_image_05c8db1b.png";

export default function CustomerHome() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const { data: foodItems, isLoading: loadingFood } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: companyInfo, isLoading: loadingCompany } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
  });

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6">
            <UtensilsCrossed className="w-12 h-12 text-primary" />
          </div>
          {loadingCompany ? (
            <>
              <Skeleton className="h-16 w-96 mx-auto mb-4 bg-white/20" />
              <Skeleton className="h-8 w-64 mx-auto mb-8 bg-white/20" />
            </>
          ) : (
            <>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {companyInfo?.companyName || "OM Caterers"}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                {companyInfo?.tagline || "Exceptional Food for Unforgettable Events"}
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="default"
              className="bg-primary/90 backdrop-blur-sm border border-primary-border"
              data-testid="button-view-menu"
              onClick={() => {
                document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View Our Menu
            </Button>
            <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-white/20 px-6 py-3 text-base">
              Catering {companyInfo?.eventsPerYear || 500}+ Events Annually
            </Badge>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 pb-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="whitespace-nowrap flex-shrink-0"
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
      <section id="menu" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Our Menu
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Discover our carefully curated selection of gourmet dishes, perfect for any occasion
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-food"
              />
            </div>
          </div>

          {loadingFood ? (
            <div className="space-y-8">
              {[...Array(3)].map((_, idx) => (
                <div key={idx}>
                  <Skeleton className="h-8 w-48 mb-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="overflow-hidden">
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
            <div className="space-y-10">
              {Object.entries(groupedByCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {category}
                    </h3>
                    <Badge variant="secondary" className="text-sm">
                      {items.length} items
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map((item) => (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden hover-elevate transition-all duration-300"
                        data-testid={`card-food-${item.id}`}
                      >
                        {item.imageUrl && (
                          <div className="h-32 overflow-hidden bg-muted">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader className="space-y-1 pb-2">
                          <CardTitle className="text-base line-clamp-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {item.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="line-clamp-2 text-sm">
                            {item.description}
                          </CardDescription>
                          {item.dietaryTags && item.dietaryTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.dietaryTags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                                  {tag}
                                </Badge>
                              ))}
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
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No items found matching your search</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Ready to Book Your Event?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let us make your next event unforgettable with our exceptional catering services
          </p>
          {loadingCompany ? (
            <div className="flex flex-col gap-4 items-center">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-6 w-56" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-left">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Call us</p>
                  <a 
                    href={`tel:${companyInfo?.phone}`} 
                    className="font-semibold hover:text-primary transition-colors"
                    data-testid="link-phone"
                  >
                    {companyInfo?.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email us</p>
                  <a 
                    href={`mailto:${companyInfo?.email}`} 
                    className="font-semibold hover:text-primary transition-colors"
                    data-testid="link-email"
                  >
                    {companyInfo?.email}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
              <span className="font-semibold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {companyInfo?.companyName || "OM Caterers"}
              </span>
            </div>
            {companyInfo?.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{companyInfo.address}</span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 All rights reserved
              </p>
              <Link href="/admin/login">
                <Button 
                  variant="ghost" 
                  size="sm"
                  data-testid="button-admin-login"
                  className="text-muted-foreground"
                >
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
