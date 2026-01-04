import { useState } from "react";
import { useLocation, Link } from "wouter";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat, Lock, ArrowLeft, UtensilsCrossed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setAdminSession } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/lib/queryClient";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
    staleTime: 0,
    gcTime: 0,
  });

  const logoSrc = "/leaf_logo.svg";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the global API_URL configuration
      const url = `${API_URL}/admin/login`;
      
      console.log("Attempting login at URL:", url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ password }),
      });

      console.log("Login response status:", response.status);
      
      if (!response.ok) {
        let errorMessage = "Invalid password";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || (errorData.data && errorData.data.error) || errorMessage;
          } else {
            const errorText = await response.text();
            console.error("Login failed (non-JSON):", response.status, errorText.slice(0, 200));
            if (errorText.includes("<!DOCTYPE html>")) {
              errorMessage = "Authentication service temporarily unavailable. Please try again in a few seconds.";
            }
          }
        } catch (e) {
          console.error("Error parsing failure response:", e);
        }
        
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();
      console.log("Login success:", data);

      if (data.success || data.data?.success) {
        setAdminSession();
        setLocation("/admin");
      } else {
        toast({
          title: "Login Failed",
          description: data.error || (data.data && data.data.error) || "Invalid password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login fetch error:", error);
      
      // Automatic retry logic for Replit environment fluctuations
      toast({
        title: "Connection Error",
        description: "Checking backend connection... please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4 relative overflow-hidden animate-fade-in" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1585937421612-70a008356f46?q=80&w=2000&auto=format&fit=crop")' }}>
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 animate-float">
          <UtensilsCrossed className="w-16 h-16 text-white" />
        </div>
        <div className="absolute bottom-32 right-20 animate-float-delayed">
          <ChefHat className="w-20 h-20 text-white" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float">
          <UtensilsCrossed className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Back to Home Link */}
      <div 
        className="absolute top-6 left-6 animate-slide-up"
      >
        <Link href="/">
          <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div
        className="w-full max-w-md relative z-10 animate-scale-in"
      >
        <Card className="border-none shadow-2xl bg-card/95 backdrop-blur-sm card-hover-lift hover:shadow-3xl transition-all duration-300">
          <CardHeader className="space-y-4 text-center pb-2">
            <div 
              className="flex justify-center animate-scale-in"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20 animate-gentle-pulse">
                <img src={logoSrc} alt="Logo" className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div
            >
              <CardTitle className="text-2xl font-serif font-bold">
                Admin Portal
              </CardTitle>
              <CardDescription className="mt-2">
                Enter your credentials to access the management panel
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-5">
              <div 
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-sm font-medium">Admin Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password || ""}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pl-10 py-5"
                    data-testid="input-password"
                  />
                </div>
              </div>
              <div
              >
                <Button
                  type="submit"
                  className="w-full py-5 text-base font-medium"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </div>
              <div 
                className="text-center pt-2"
              >
                <p className="text-xs text-muted-foreground">
                  Protected area for authorized personnel only
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
