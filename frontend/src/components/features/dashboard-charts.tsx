import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { TrendingUp, PieChartIcon, BarChart3, Calendar } from "lucide-react";
import type { EventBooking, FoodItem } from "@/schema";
import { format, parseISO, startOfMonth, subMonths, isAfter, isBefore, endOfMonth } from "date-fns";

interface DashboardChartsProps {
  bookings: EventBooking[];
}

interface FoodItemsChartsProps {
  foodItems: FoodItem[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function RevenueChart({ bookings }: DashboardChartsProps) {
  const monthlyData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, "MMM"),
        start: startOfMonth(date),
        end: endOfMonth(date),
        revenue: 0,
        bookings: 0,
      };
    });

    bookings.forEach((booking) => {
      if (booking.status === "confirmed" || booking.status === "completed") {
        try {
          const bookingDate = parseISO(booking.eventDate);
          const monthEntry = last6Months.find(
            (m) => isAfter(bookingDate, m.start) && isBefore(bookingDate, m.end) || 
                   format(bookingDate, "MMM") === m.month
          );
          if (monthEntry) {
            monthEntry.revenue += booking.guestCount * booking.pricePerPlate;
            monthEntry.bookings += 1;
          }
        } catch (e) {
          console.error("Error parsing date:", e);
        }
      }
    });

    return last6Months.map((m) => ({
      month: m.month,
      revenue: m.revenue,
      bookings: m.bookings,
    }));
  }, [bookings]);

  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const growth = monthlyData.length >= 2 
    ? ((monthlyData[monthlyData.length - 1].revenue - monthlyData[monthlyData.length - 2].revenue) / 
       (monthlyData[monthlyData.length - 2].revenue || 1) * 100).toFixed(1)
    : "0";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Revenue Trend</CardTitle>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString("en-IN")}</p>
          <p className={`text-xs ${Number(growth) >= 0 ? "text-green-600" : "text-red-600"}`}>
            {Number(growth) >= 0 ? "+" : ""}{growth}% vs last month
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] animate-in fade-in duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))"
                }}
                formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function BookingStatusChart({ bookings }: DashboardChartsProps) {
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    bookings.forEach((booking) => {
      if (counts[booking.status] !== undefined) {
        counts[booking.status]++;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    })).filter((d) => d.value > 0);
  }, [bookings]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <PieChartIcon className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg">Booking Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] animate-in fade-in duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {statusData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyBookingsChart({ bookings }: DashboardChartsProps) {
  const monthlyData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, "MMM"),
        start: startOfMonth(date),
        end: endOfMonth(date),
        count: 0,
      };
    });

    bookings.forEach((booking) => {
      try {
        const bookingDate = parseISO(booking.eventDate);
        const monthEntry = last6Months.find(
          (m) => format(bookingDate, "MMM yyyy") === format(m.start, "MMM yyyy")
        );
        if (monthEntry) {
          monthEntry.count += 1;
        }
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    });

    return last6Months.map((m) => ({
      month: m.month,
      bookings: m.count,
    }));
  }, [bookings]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg">Monthly Bookings</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] animate-in fade-in duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))"
                }}
              />
              <Bar 
                dataKey="bookings" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function EventTypeChart({ bookings }: DashboardChartsProps) {
  const eventTypeData = useMemo(() => {
    const counts: Record<string, number> = {};

    bookings.forEach((booking) => {
      const type = booking.eventType || "Other";
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [bookings]);

  if (eventTypeData.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Calendar className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg">Event Types</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] animate-in fade-in duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={eventTypeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {eventTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryDistributionChart({ foodItems }: FoodItemsChartsProps) {
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};

    foodItems.forEach((item) => {
      const category = item.category || "Uncategorized";
      counts[category] = (counts[category] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [foodItems]);

  if (categoryData.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg">Menu Categories</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] animate-in fade-in duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                width={100}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))"
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
