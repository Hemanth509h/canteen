import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UtensilsCrossed, RefreshCw } from "lucide-react";
import { PageLoader } from "@/components/features/loading-spinner";

export default function DashboardOverview() {
  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
  });

  useEffect(() => {
    if (companyInfo?.primaryColor) {
      document.documentElement.style.setProperty('--primary', companyInfo.primaryColor);
    }
  }, [companyInfo?.primaryColor]);

  const { data: foodItems, isLoading: isLoadingFood, isFetching: isFetchingFood, refetch: refetchFood } = useQuery({
    queryKey: ["/api/food-items"],
  });

  const handleRefresh = () => {
    refetchFood();
  };

  const metrics = [
    {
      title: "Total Menu Items",
      value: foodItems?.length || 0,
      icon: UtensilsCrossed,
      color: "text-purple-600",
      loading: isLoadingFood,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animated-gradient-bg min-h-screen">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Welcome to your catering management dashboard
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isFetchingFood}
          data-testid="button-refresh-dashboard"
        >
          <RefreshCw className={`w-4 h-4 ${isFetchingFood ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric, idx) => (
          <Card key={metric.title} data-testid={`card-metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`} className="card-hover-lift stagger-item hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${metric.color}`} />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {metric.loading ? (
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-24" />
              ) : (
                <div className="text-lg sm:text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {metric.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoadingFood ? (
        <PageLoader text="Loading..." />
      ) : (
        <Card className="card-hover-lift transition-all duration-300">
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Welcome to the Admin Panel</h3>
            <p className="text-muted-foreground text-sm">
              Manage your food items and hero images using the sidebar menu.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
