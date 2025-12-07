import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UtensilsCrossed, CalendarDays, IndianRupee, TrendingUp, RefreshCw } from "lucide-react";
import type { FoodItem, EventBooking } from "@shared/schema";

export default function DashboardOverview() {
  const { data: foodItems, isLoading: loadingFood, isFetching: fetchingFood, refetch: refetchFood } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: bookings, isLoading: loadingBookings, isFetching: fetchingBookings, refetch: refetchBookings } = useQuery<EventBooking[]>({
    queryKey: ["/api/bookings"],
  });

  const isFetching = fetchingFood || fetchingBookings;
  const handleRefresh = () => {
    refetchFood();
    refetchBookings();
  };

  const totalRevenue = bookings?.reduce((sum, booking) => {
    if (booking.status === "confirmed") {
      return sum + (booking.guestCount * booking.pricePerPlate);
    }
    return sum;
  }, 0) || 0;

  const activeEvents = bookings?.filter(b => b.status === "confirmed" || b.status === "pending").length || 0;

  const metrics = [
    {
      title: "Total Food Items",
      value: foodItems?.length || 0,
      icon: UtensilsCrossed,
      color: "text-primary",
      loading: loadingFood,
    },
    {
      title: "Active Events",
      value: activeEvents,
      icon: CalendarDays,
      color: "text-blue-500",
      loading: loadingBookings,
    },
    {
      title: "Total Bookings",
      value: bookings?.length || 0,
      icon: TrendingUp,
      color: "text-green-500",
      loading: loadingBookings,
    },
    {
      title: "Estimated Revenue",
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: "text-amber-500",
      loading: loadingBookings,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
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
          disabled={isFetching}
          data-testid="button-refresh-dashboard"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} data-testid={`card-metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBookings ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : bookings && bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <div 
                    key={booking.id} 
                    className="flex items-center justify-between p-3 border border-border rounded-md hover-elevate"
                    data-testid={`item-booking-${booking.id}`}
                  >
                    <div>
                      <p className="font-semibold">{booking.clientName}</p>
                      <p className="text-sm text-muted-foreground">{booking.eventType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{booking.eventDate}</p>
                      <p className="text-xs text-muted-foreground capitalize">{booking.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No bookings yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Food Categories</span>
                <span className="font-semibold">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending Bookings</span>
                <span className="font-semibold">
                  {bookings?.filter(b => b.status === "pending").length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Confirmed Events</span>
                <span className="font-semibold">
                  {bookings?.filter(b => b.status === "confirmed").length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Average Guest Count</span>
                <span className="font-semibold">
                  {bookings && bookings.length > 0
                    ? Math.round(bookings.reduce((sum, b) => sum + b.guestCount, 0) / bookings.length)
                    : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
