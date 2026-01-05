import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
  });

  useEffect(() => {
    if (companyInfo?.primaryColor) {
      document.documentElement.style.setProperty('--primary', companyInfo.primaryColor);
    }
  }, [companyInfo?.primaryColor]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardContent className="pt-8 text-center">
          <div className="flex flex-col items-center mb-6 gap-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-3xl font-poppins font-bold">404</h1>
            <h2 className="text-xl font-semibold text-foreground">Page Not Found</h2>
          </div>

          <p className="mt-4 text-muted-foreground leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="mt-8">
            <Link href="/">
              <Button className="w-full h-12 rounded-xl gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                <ArrowLeft size={18} />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
