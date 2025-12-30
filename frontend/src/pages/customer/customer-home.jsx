import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  ChefHat, Award, Users, Clock, Utensils, Search
} from "lucide-react";
import "@/schema";
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
    icon: Lock, 
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
      
        
          
            Our Philosophy
            
              Crafting Unforgettable  Culinary Memories
            
            
              {companyInfo?.description || "We believe that food is the heart of every event. Our team of expert chefs uses only the freshest, locally sourced ingredients to create dishes that are as beautiful as they are delicious."}
            
            
              
                {(companyInfo)?.yearsExperience || 15}+
                Experience
              
              
                {companyInfo?.eventsPerYear || 500}+
                Events
              
            
          

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}</div>
          
        
      

      {/* Signature Dishes Showcase */}
      
        
          
            Curated Gastronomy
            
              A Symphony of  Flavors
            
            
            
              Experience our hand-crafted selection of signature dishes, each telling a story of tradition and innovation.
            
            
            
              
                
                <Input 
                  placeholder="Search dishes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 rounded-full h-10 sm:h-12 text-center text-sm sm:text-lg border-primary/30 focus:border-primary transition-all"
                  data-testid="input-menu-search"
                />
              
            

            
              
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
                  
                ))}
              
            
          

          
            
              
                {loadingFood ? (
                  Array(6).fill(0).map((_, i) => (
                    
                      
                      
                        
                        
                        
                      
                    
                  ))
                ) ilteredItems.length > 0 ? (
                  filteredItems.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="group cursor-pointer relative" 
                      onClick={() => setSelectedItem(item)}
                    >
                      {/* Base Card (Visible in grid) */}
                      
                        
                          
                        
                        
                          
                            {item.name}
                            WELCOME DRINK'S
                          
                          
                            {item.name} - Specialty from our Welcome Drink's selection.
                          
                        
                      

                      {/* Pop-out Card (Visible on Click) */}
                      {selectedItem?.id === item.id && (
                        <div 
                          className="fixed inset-0 z-[1000000] flex items-center justify-center p-2 sm:p-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(null);
                          }}
                        >
                          
                          
                          
                            <Card 
                              className="relative w-full flex flex-col md:flex-row items-stretch overflow-visible border-none bg-white dark:bg-slate-900 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] rounded-[30px] max-h-[95vh] sm:max-h-[480px] overflow-y-auto sm:overflow-visible"
                              onClick={(e) => e.stopPropagation()}
                            >
                              
                                
                                  
                                
                                
                              

                              
                                
                                  
                                    WELCOME DRINK'S
                                  
                                  
                                    {item.name}
                                  
                                  
                                    {item.name} - Specialty from our Welcome Drink's selection.
                                  
                                
                                
                                
                                  <Button 
                                    className="h-12 sm:h-16 md:h-20 px-8 sm:px-12 rounded-[12px] sm:rounded-[15px] bg-[#FBBF24] hover:bg-[#F59E0B] text-white text-base sm:text-xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95 no-default-hover-elevate w-full sm:w-auto"
                                    onClick={() => {
                                      setSelectedItem(null);
                                      document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                  >
                                    Contact Us
                                  
                                  <Button 
                                    variant="outline"
                                    className="h-12 sm:h-16 md:h-20 px-6 sm:px-8 rounded-[12px] sm:rounded-[15px] border-slate-200 text-slate-500 text-base sm:text-xl font-bold hover:bg-slate-50 transition-all active:scale-95 w-full sm:w-auto"
                                    onClick={() => setSelectedItem(null)}
                                  >
                                    Close
                                  
                                
                              
                            
                          
                        
                      )}
                    
                  ))
                ) : (
                  
                    
                    No culinary masterpieces found in this selection.
                     setSelectedCategory("All")} className="mt-4 text-primary hover:text-primary/80">View All Selections
                  
                )}
              
            
          
        
      

      {/* Customer Testimonials Section */}
      
        
          
            Cherished Memories
            
              What Our Clients Say
            
            
              Real stories from those who trusted us with their most important moments
            
          
          
        
      

      {/* Share Your Review Section */}
      
        
          
            Your Feedback Matters
            
              Tell Us Your Story
            
            
              We'd love to hear about your experience with Elite Catering & Events
            
          
          
            
          
        
      

      {/* Premium CTA Section */}
      
        
          
            
            
              
                Begin Your  Culinary Journey
              
              
                We are ready to design an experience that perfectly matches your vision. Our consultants are standing by to assist you.
              
              
                
                  Call Our Studio
                  {companyInfo?.phone || "+91 98765 43210"}
                
                
                
                  Digital Inquiry
                  
                    {companyInfo?.email || "events@elite-catering.com"}
                  
                
              
            
          
        
      
    
  );
}
