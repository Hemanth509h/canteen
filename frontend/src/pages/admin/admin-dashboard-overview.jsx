import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UtensilsCrossed, RefreshCw, CalendarDays, Users, IndianRupee, Clock, CheckCircle2, AlertCircle, ChefHat, TrendingUp } from "lucide-react";
import { PageLoader } from "@/components/features/loading-spinner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function DashboardOverview() {
  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const { data: foodItems, isLoading: isLoadingFood, isFetching: isFetchingFood, refetch: refetchAll } = useQuery({
    queryKey: ["/api/food-items"],
  });

  const { data: staff, isLoading: isLoadingStaff } = useQuery({
    queryKey: ["/api/staff"],
  });

  useEffect(() => {
    if (companyInfo?.primaryColor) {
      document.documentElement.style.setProperty('--primary', companyInfo.primaryColor);
    }
  }, [companyInfo?.primaryColor]);

  const handleRefresh = () => {
    refetchAll();
  };

  const pendingBookings = bookings?.filter(b => b.status === "pending") || [];
  const confirmedBookings = bookings?.filter(b => b.status === "confirmed") || [];
  const upcomingEvents = confirmedBookings
    .filter(b => new Date(b.eventDate) >= new Date())
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  const totalRevenue = bookings?.filter(b => b.status === "completed" || b.status === "confirmed")
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0) || 0;

  const metrics = [
    {
      title: "Active Bookings",
      value: confirmedBookings.length,
      description: `${pendingBookings.length} pending requests`,
      icon: CalendarDays,
      color: "text-blue-600",
      loading: isLoadingBookings,
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      description: "Confirmed & Completed",
      icon: IndianRupee,
      color: "text-green-600",
      loading: isLoadingBookings,
    },
    {
      title: "Menu Items",
      value: foodItems?.length || 0,
      description: "Across all categories",
      icon: UtensilsCrossed,
      color: "text-purple-600",
      loading: isLoadingFood,
    },
    {
      title: "Staff Members",
      value: staff?.length || 0,
      description: "Active personnel",
      icon: Users,
      color: "text-orange-600",
      loading: isLoadingStaff,
    },
  ];

  if (isLoadingFood && isLoadingBookings && isLoadingStaff) {
    return <PageLoader text="Analyzing catering data..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-muted/30 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground">
            Real-time insights and management for {companyInfo?.companyName || "Elite Catering"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isFetchingFood}
          className="w-full sm:w-auto shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetchingFood ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="shadow-sm border-border/50 hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-muted/50 ${metric.color}`}>
                <metric.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {metric.loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    {metric.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Your next scheduled catering events</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                        <span className="text-xs font-bold uppercase">{format(new Date(event.eventDate), "MMM")}</span>
                        <span className="text-sm font-black">{format(new Date(event.eventDate), "dd")}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm sm:text-base">{event.clientName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <ChefHat className="w-3 h-3" /> {event.eventType} • {event.guestCount} Guests
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-mono font-bold">₹{Number(event.totalAmount).toLocaleString()}</p>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {event.advancePaymentStatus === "paid" ? "Advance Paid" : "Advance Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed rounded-xl">
                <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No upcoming events scheduled</p>
                <p className="text-xs text-muted-foreground mt-1">Confirmed bookings will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Pending Actions
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingBookings.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">{pendingBookings.length} Pending Requests</span>
                </div>
                <Badge className="bg-orange-600">Action Needed</Badge>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">System Health</p>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Tracking</p>
                  <p className="text-xs text-muted-foreground">Verify pending bank transfers</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
