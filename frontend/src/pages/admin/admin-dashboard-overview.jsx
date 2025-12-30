import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, CalendarDays, IndianRupee, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { RevenueChart, BookingStatusChart, MonthlyBookingsChart } from "@/components/features/dashboard-charts";
import { BookingCalendar } from "@/components/features/booking-calendar";
import { PageLoader } from "@/components/features/loading-spinner";

export default function DashboardOverview() {
  const { data: foodItems, isLoading: isLoadingFood, isFetching: isFetchingFood, refetch: refetchFood } = useQuery({
    queryKey: ["/api/food-items"],
  });

  const { data: bookings, isLoading: isLoadingBookings, isFetching: isFetchingBookings, refetch: refetchBookings } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const isFetching = isFetchingFood || isFetchingBookings;
  const isLoading = isLoadingFood || isLoadingBookings;

  const handleRefresh = () => {
    refetchFood();
    refetchBookings();
  };

  const totalRevenue = bookings?.reduce((sum, booking) => {
    if (booking.status === "confirmed" || booking.status === "completed") {
      return sum + (booking.guestCount * booking.pricePerPlate);
    }
    return sum;
  }, 0) || 0;

  const activeEvents = bookings?.filter(b => b.status === "confirmed" || b.status === "pending").length || 0;

  const pendingPayments = bookings?.filter(b => 
    b.advancePaymentStatus === "pending" || b.finalPaymentStatus === "pending"
  ).length || 0;

  const upcomingBookings = bookings?.filter(b => {
    const eventDate = new Date(b.eventDate);
    return eventDate >= new Date() && b.status !== "cancelled";
  }).length || 0;

  const metrics = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: "text-green-600",
      loading: isLoadingBookings,
    },
    {
      title: "Upcoming Bookings",
      value: upcomingBookings,
      icon: CalendarDays,
      color: "text-blue-600",
      loading: isLoadingBookings,
    },
    {
      title: "Pending Payments",
      value: pendingPayments,
      icon: AlertCircle,
      color: "text-orange-600",
      loading: isLoadingBookings,
    },
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
          disabled={isFetching}
          data-testid="button-refresh-dashboard"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric, idx) => (
          <Card key={metric.title} data-testid={`card-metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`} className="card-hover-lift stagger-item hover:shadow-lg transition-all duration-300" style={{ animationDelay: `${idx * 0.1}s` }}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${metric.color} animate-gentle-pulse`} />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {metric.loading ? (
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-24 animate-shimmer" />
              ) : (
                <div className="text-lg sm:text-2xl font-bold animate-scale-in" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {metric.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoadingBookings ? (
        <PageLoader text="Loading charts..." />
      ) : bookings && bookings.length > 0 ? (
        <>
          <div 
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 stagger-item"
          >
            <div className="card-hover-lift"><RevenueChart bookings={bookings} /></div>
            <div className="card-hover-lift"><BookingStatusChart bookings={bookings} /></div>
            <div className="card-hover-lift"><MonthlyBookingsChart bookings={bookings} /></div>
          </div>

          <div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-item"
          >
            <BookingCalendar bookings={bookings} />
            
            <Card className="card-hover-lift transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking, index) => {
                    const delay = index * 0.1;
                    const isPending = booking.advancePaymentStatus === "pending" || booking.finalPaymentStatus === "pending";
                    const isCompleted = booking.status === "completed";
                    
                    let icon = Clock;
                    let color = "text-blue-500";
                    let bgColor = "bg-blue-100 dark:bg-blue-900/30";
                    
                    if (isCompleted) {
                      icon = CheckCircle2;
                      color = "text-green-500";
                      bgColor = "bg-green-100 dark:bg-green-900/30";
                    } else if (isPending) {
                      icon = AlertCircle;
                      color = "text-orange-500";
                      bgColor = "bg-orange-100 dark:bg-orange-900/30";
                    }
                    
                    const IconComponent = icon;
                    
                    return (
                      <div 
                        key={booking.id}
                        className="flex gap-3 p-3 border border-border/50 rounded-lg hover-elevate stagger-item card-hover-lift transition-all duration-300"
                        data-testid={`timeline-item-${booking.id}`}
                        style={{ animationDelay: `${delay}s` }}
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
                          <IconComponent className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{booking.clientName}</p>
                          <p className="text-xs text-muted-foreground">{booking.eventType} • {booking.eventDate}</p>
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            <Badge variant="outline" className="text-xs capitalize">{booking.status}</Badge>
                            {isPending && <Badge variant="secondary" className="text-xs">Payment Pending</Badge>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="card-hover-lift transition-all duration-300">
          <CardContent className="py-12 text-center">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-bounce-soft" />
            <h3 className="text-lg font-semibold mb-2 animate-slide-up">No bookings yet</h3>
            <p className="text-muted-foreground text-sm animate-fade-in">
              Your booking statistics and charts will appear here once you have bookings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
