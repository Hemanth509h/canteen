import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { UtensilsCrossed, Phone, Mail, MapPin, ShieldCheck, Search } from "lucide-react";
import type { FoodItem, CompanyInfo } from "@shared/schema";

const heroImage = "/images/Elegant_catering_buffet_hero_image_05c8db1b.png";

const categories = ["All", "Appetizers", "Main Courses", "Desserts", "Beverages"];

const categoryMap: Record<string, string> = {
  "appetizer": "Appetizers",
  "main": "Main Courses",
  "dessert": "Desserts",
  "beverage": "Beverages"
};

export default function CustomerHome() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: foodItems, isLoading: loadingFood } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: companyInfo, isLoading: loadingCompany } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
  });

  const filteredItems = foodItems?.filter((item) => {
    const matchesCategory = selectedCategory === "All" || categoryMap[item.category] === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                {companyInfo?.companyName || "Premium Catering Services"}
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
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                data-testid={`button-category-${category.toLowerCase().replace(' ', '-')}`}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
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
            <div className="space-y-6 max-h-[800px] overflow-y-auto">
              {[...Array(3)].map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden flex-shrink-0 w-80">
                      <Skeleton className="h-48 w-full" />
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          ) : filteredItems && filteredItems.length > 0 ? (
            <div className="space-y-6 max-h-[1200px] overflow-y-auto pr-2">
              {Array.from({ length: Math.ceil(filteredItems.length / 8) }, (_, rowIndex) => {
                const startIdx = rowIndex * 8;
                const rowItems = filteredItems.slice(startIdx, startIdx + 8);
                return (
                  <div key={rowIndex} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {rowItems.map((item) => (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden hover-elevate transition-all duration-300 flex-shrink-0 w-80"
                        data-testid={`card-food-${item.id}`}
                      >
                        <div className="h-48 overflow-hidden bg-muted">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <CardHeader className="space-y-2 pb-6">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-xl line-clamp-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {item.name}
                            </CardTitle>
                            <Badge variant="secondary" className="shrink-0">
                              {categoryMap[item.category]}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-3 max-h-[72px]">
                            {item.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No items found in this category</p>
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
                {companyInfo?.companyName || "Premium Catering"}
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
