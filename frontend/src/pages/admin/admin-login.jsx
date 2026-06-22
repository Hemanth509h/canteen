import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isAdminAuthenticated, setAdminSession } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/queryClient";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (companyInfo?.primaryColor) {
      document.documentElement.style.setProperty('--primary', companyInfo.primaryColor);
    }
  }, [companyInfo?.primaryColor]);

  useEffect(() => {
    let isMounted = true;

    isAdminAuthenticated().then((authenticated) => {
      if (isMounted && authenticated) {
        setLocation("/admin");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [setLocation]);

  const logoSrc = "/leaf_logo.svg";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        let errorMessage = "Invalid username or password";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.data?.error || errorMessage;
        } catch {
          // Keep default message for non-JSON failures.
        }
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();
      if (data.success || data.data?.success) {
        const payload = data.data || data;
        setAdminSession({ role: payload.role || "superadmin", user: payload.user || null, token: payload.token || null });
        setLocation("/admin");
      } else {
        toast({
          title: "Login Failed",
          description: data.error || data.data?.error || "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error.message || "Unable to reach the authentication service.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden fade-in dark">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/6 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Back to Home */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/">
          <Button variant="ghost" className="font-jakarta text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 slide-up">
        <Card className="border border-border/50 shadow-gold-lg bg-card/95 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="space-y-5 text-center pb-3 pt-10">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
                <img src={logoSrc} alt="Logo" className="w-12 h-12" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-playfair font-bold">
                Admin Portal
              </CardTitle>
              <CardDescription className="mt-2 font-jakarta">
                Enter your admin username and password to access the management panel
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-4 pb-8 px-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-jakarta font-medium">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="pl-10 h-12 font-jakarta rounded-xl border-border/60 focus:ring-2 focus:ring-primary/20"
                    data-testid="input-username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-jakarta font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pl-10 h-12 font-jakarta rounded-xl border-border/60 focus:ring-2 focus:ring-primary/20"
                    data-testid="input-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-jakarta font-bold rounded-xl bg-primary text-primary-foreground shadow-gold hover:shadow-gold-lg hover:bg-primary/90 transition-all duration-300"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground font-jakarta pt-1">
                Protected area for authorised personnel only
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
