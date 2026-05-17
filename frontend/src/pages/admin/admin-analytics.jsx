import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { printElement } from "@/lib/print-utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Printer,
  TrendingUp,
  Users,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const COLORS = ["#e95a1a", "#2563eb", "#16a34a", "#9333ea", "#ca8a04", "#dc2626"];

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const toDateInput = (date) => date.toISOString().split("T")[0];

const getBookingTotal = (booking) =>
  Number(booking.totalAmount) || (Number(booking.guestCount) || 0) * (Number(booking.pricePerPlate) || 0);

const getCollected = (booking) => {
  const total = getBookingTotal(booking);
  const advance = Number(booking.advanceAmount) || Math.ceil(total * 0.5);
  const final = total - advance;
  
  const advanceApproved = booking.advancePaymentStatus === "paid" && 
    (!booking.advancePaymentApprovalStatus || booking.advancePaymentApprovalStatus === "approved");
  const finalApproved = booking.finalPaymentStatus === "paid" && 
    (!booking.finalPaymentApprovalStatus || booking.finalPaymentApprovalStatus === "approved");
    
  return (advanceApproved ? advance : 0) + (finalApproved ? final : 0);
};

const getBookingDate = (booking) => {
  const date = new Date(booking.eventDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getMonthKey = (date) => date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
const getWeekKey = (date) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const filterByDateRange = (items, startDate, endDate, getDate) => {
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59`) : null;
  return items.filter((item) => {
    const date = getDate(item);
    if (!date) return false;
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  });
};

function writeWorkbook(sheets, filename) {
  const workbook = XLSX.utils.book_new();
  sheets.forEach(({ name, rows }) => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = Object.keys(rows[0] || { Empty: "" }).map(() => ({ wch: 22 }));
    XLSX.utils.book_append_sheet(workbook, worksheet, name.slice(0, 31));
  });
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}_${toDateInput(new Date())}.xlsx`);
}

function CalendarGrid({ bookings }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const visibleDate = new Date();
  visibleDate.setMonth(visibleDate.getMonth() + monthOffset, 1);

  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = firstDay.getDay();

  const byDay = useMemo(() => {
    const map = {};
    bookings.forEach((booking) => {
      const date = getBookingDate(booking);
      if (!date || date.getMonth() !== month || date.getFullYear() !== year) return;
      const day = date.getDate();
      map[day] = [...(map[day] || []), booking];
    });
    return map;
  }, [bookings, month, year]);

  const cells = [
    ...Array.from({ length: leading }, (_, index) => ({ key: `empty-${index}`, empty: true })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({ key: `day-${index + 1}`, day: index + 1 })),
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-primary" />
            Booking Calendar
          </CardTitle>
          <CardDescription>Busy, moderate, and free dates at a glance</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMonthOffset((v) => v - 1)}>Prev</Button>
          <Button variant="outline" size="sm" onClick={() => setMonthOffset(0)}>Today</Button>
          <Button variant="outline" size="sm" onClick={() => setMonthOffset((v) => v + 1)}>Next</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm font-semibold">
          {visibleDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell) => {
            if (cell.empty) return <div key={cell.key} className="min-h-24 rounded-lg border border-transparent" />;
            const dayBookings = byDay[cell.day] || [];
            const intensity = dayBookings.length >= 3 ? "bg-red-50 border-red-200" : dayBookings.length >= 1 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-100";
            return (
              <div key={cell.key} className={`min-h-24 rounded-lg border p-2 ${intensity}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{cell.day}</span>
                  {dayBookings.length > 0 && <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{dayBookings.length}</Badge>}
                </div>
                <div className="mt-2 space-y-1">
                  {dayBookings.slice(0, 2).map((booking) => (
                    <div key={booking.id || booking._id} className="truncate rounded bg-white/80 px-1.5 py-1 text-[10px] font-medium">
                      {booking.eventType}
                    </div>
                  ))}
                  {dayBookings.length > 2 && <div className="text-[10px] text-muted-foreground">+{dayBookings.length - 2} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsReports() {
  const reportRef = useRef(null);
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(toDateInput(new Date(new Date().getFullYear(), 0, 1)));
  const [endDate, setEndDate] = useState(toDateInput(new Date()));
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({ queryKey: ["/api/bookings"] });
  const { data: staff = [], isLoading: loadingStaff } = useQuery({ queryKey: ["/api/staff"] });
  const { data: staffPayments = [], isLoading: loadingPayments } = useQuery({ queryKey: ["/api/staff-payments"] });
  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({ queryKey: ["/api/expenses"] });

  const filteredBookings = useMemo(
    () => filterByDateRange(bookings, startDate, endDate, getBookingDate),
    [bookings, startDate, endDate]
  );

  const filteredStaffPayments = useMemo(
    () => filterByDateRange(staffPayments, startDate, endDate, (payment) => {
      const date = new Date(payment.paymentDate || payment.createdAt);
      return Number.isNaN(date.getTime()) ? null : date;
    }),
    [staffPayments, startDate, endDate]
  );

  const filteredExpenses = useMemo(
    () => filterByDateRange(expenses, startDate, endDate, (expense) => {
      const date = new Date(expense.expenseDate || expense.createdAt);
      return Number.isNaN(date.getTime()) ? null : date;
    }),
    [expenses, startDate, endDate]
  );

  const analytics = useMemo(() => {
    const revenueBookings = filteredBookings.filter((b) => ["confirmed", "completed"].includes(b.status));
    const totalRevenue = revenueBookings.reduce((sum, booking) => sum + getCollected(booking), 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const avgBookingValue = revenueBookings.length ? Math.round(totalRevenue / revenueBookings.length) : 0;

    const monthlyMap = {};
    const weeklyMap = {};
    const typeMap = {};
    const monthHeat = {};

    filteredBookings.forEach((booking) => {
      const date = getBookingDate(booking);
      if (!date) return;
      const total = ["confirmed", "completed"].includes(booking.status) ? getCollected(booking) : 0;
      const monthKey = getMonthKey(date);
      const weekKey = getWeekKey(date);

      monthlyMap[monthKey] = monthlyMap[monthKey] || { month: monthKey, revenue: 0, bookings: 0 };
      monthlyMap[monthKey].revenue += total;
      monthlyMap[monthKey].bookings += 1;

      weeklyMap[weekKey] = weeklyMap[weekKey] || { week: weekKey, revenue: 0, bookings: 0 };
      weeklyMap[weekKey].revenue += total;
      weeklyMap[weekKey].bookings += 1;

      const eventType = booking.eventType || "Other";
      typeMap[eventType] = typeMap[eventType] || { name: eventType, value: 0, revenue: 0 };
      typeMap[eventType].value += 1;
      typeMap[eventType].revenue += total;

      const heatKey = date.toLocaleDateString("en-IN", { month: "short" });
      monthHeat[heatKey] = (monthHeat[heatKey] || 0) + 1;
    });

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      avgBookingValue,
      confirmedCount: revenueBookings.length,
      pendingCount: filteredBookings.filter((b) => b.status === "pending").length,
      monthlyData: Object.values(monthlyMap),
      weeklyData: Object.values(weeklyMap).slice(-10),
      eventTypes: Object.values(typeMap).sort((a, b) => b.value - a.value),
      heatmap: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => ({
        month,
        count: monthHeat[month] || 0,
      })),
    };
  }, [filteredBookings, filteredExpenses]);

  const staffMap = useMemo(() => {
    const map = {};
    staff.forEach((member) => {
      map[member.id || member._id] = member;
    });
    return map;
  }, [staff]);

  const exportBookingSummary = () => {
    if (!filteredBookings.length) return toast({ title: "No data", description: "No bookings in this date range", variant: "destructive" });
    writeWorkbook([{
      name: "Booking Summary",
      rows: filteredBookings.map((booking) => ({
        Client: booking.clientName,
        Date: booking.eventDate,
        Event: booking.eventType,
        Guests: booking.guestCount,
        Status: booking.status,
        Total: getBookingTotal(booking),
        Advance: booking.advancePaymentStatus,
        Final: booking.finalPaymentStatus,
        Phone: booking.contactPhone,
      })),
    }], "booking_summary");
  };

  const exportPaymentReport = () => {
    if (!filteredBookings.length) return toast({ title: "No data", description: "No payments in this date range", variant: "destructive" });
    writeWorkbook([{
      name: "Payment Report",
      rows: filteredBookings.map((booking) => {
        const total = getBookingTotal(booking);
        const advance = Number(booking.advanceAmount) || Math.ceil(total * 0.5);
        const final = total - advance;
        return {
          Client: booking.clientName,
          EventDate: booking.eventDate,
          Total: total,
          AdvanceAmount: advance,
          AdvanceStatus: booking.advancePaymentStatus,
          AdvanceApproval: booking.advancePaymentApprovalStatus,
          FinalAmount: final,
          FinalStatus: booking.finalPaymentStatus,
          FinalApproval: booking.finalPaymentApprovalStatus,
          Balance: (booking.advancePaymentApprovalStatus === "approved" ? 0 : advance) + (booking.finalPaymentApprovalStatus === "approved" ? 0 : final),
        };
      }),
    }], "payment_report");
  };

  const exportStaffSalarySheet = () => {
    if (!filteredStaffPayments.length) return toast({ title: "No data", description: "No staff payments in this date range", variant: "destructive" });
    writeWorkbook([{
      name: "Staff Salary Sheet",
      rows: filteredStaffPayments.map((payment) => ({
        Staff: staffMap[payment.staffId]?.name || payment.staffName || payment.staffId,
        Role: staffMap[payment.staffId]?.role || "",
        Date: payment.paymentDate,
        Method: payment.paymentMethod,
        Status: payment.status,
        Amount: Number(payment.amount) || 0,
        Notes: payment.notes || "",
      })),
    }], "staff_salary_sheet");
  };

  const exportProfitReport = () => {
    writeWorkbook([{
      name: "Profit Report",
      rows: [{
        Revenue: analytics.totalRevenue,
        Expenses: analytics.totalExpenses,
        NetProfit: analytics.netProfit,
        From: startDate,
        To: endDate,
      }],
    }, {
      name: "Expenses",
      rows: filteredExpenses.map((expense) => ({
        Date: expense.expenseDate,
        Title: expense.title,
        Category: expense.category,
        Vendor: expense.vendor || "",
        Method: expense.paymentMethod,
        Amount: Number(expense.amount) || 0,
        Notes: expense.notes || "",
      })),
    }], "profit_report");
  };

  const handlePrintReport = async () => {
    setIsPrinting(true);
    await printElement(reportRef.current);
    setIsPrinting(false);
  };

  const isLoading = loadingBookings || loadingStaff || loadingPayments || loadingExpenses;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics & Reports</h2>
          <p className="text-muted-foreground">Revenue, bookings, calendar load, and exportable operating reports.</p>
        </div>
        <div className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[160px_160px_auto]">
          <div>
            <Label className="text-xs">From</Label>
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={handlePrintReport} disabled={isPrinting}>
              <Printer className="mr-2 h-4 w-4" />
              {isPrinting ? "Preparing..." : "Print / Save PDF"}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div ref={reportRef} className="space-y-6 bg-background">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revenue</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{money(analytics.totalRevenue)}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expenses</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{money(analytics.totalExpenses)}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Profit</CardTitle></CardHeader>
                <CardContent><div className={analytics.netProfit >= 0 ? "text-2xl font-bold text-emerald-600" : "text-2xl font-bold text-rose-600"}>{money(analytics.netProfit)}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg. Booking Value</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{money(analytics.avgBookingValue)}</div></CardContent>
              </Card>
            </div>

            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList className="grid h-auto w-full grid-cols-2 lg:w-[560px] lg:grid-cols-4">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="events">Event Types</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="exports">Exports</TabsTrigger>
              </TabsList>

              <TabsContent value="revenue" className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-primary" /> Monthly Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                          <Tooltip formatter={(value) => money(value)} />
                          <Area type="monotone" dataKey="revenue" stroke="#e95a1a" fill="#e95a1a" fillOpacity={0.18} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5 text-primary" /> Weekly Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="week" />
                          <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                          <Tooltip formatter={(value) => money(value)} />
                          <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Peak Months Heatmap</CardTitle>
                    <CardDescription>Darker cells mean more events.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2 sm:grid-cols-6 xl:grid-cols-12">
                    {analytics.heatmap.map((month) => {
                      const opacity = Math.min(0.15 + month.count * 0.14, 0.9);
                      return (
                        <div key={month.month} className="rounded-lg border p-3 text-center" style={{ backgroundColor: `rgba(233, 90, 26, ${opacity})` }}>
                          <p className="text-xs font-semibold">{month.month}</p>
                          <p className="text-xl font-bold">{month.count}</p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events" className="grid gap-4 xl:grid-cols-[1fr_360px]">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Best-Selling Event Types</CardTitle></CardHeader>
                  <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.eventTypes} layout="vertical" margin={{ left: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Revenue Share</CardTitle></CardHeader>
                  <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analytics.eventTypes} dataKey="revenue" nameKey="name" innerRadius={70} outerRadius={120}>
                          {analytics.eventTypes.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => money(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <CalendarGrid bookings={filteredBookings} />
              </TabsContent>

              <TabsContent value="exports">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Reports</CardTitle>
                    <CardDescription>Filtered by the selected date range.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-3">
                    <Button variant="outline" className="justify-start gap-2" onClick={exportBookingSummary}>
                      <FileSpreadsheet className="h-4 w-4" />
                      Booking Summary Excel
                    </Button>
                    <Button variant="outline" className="justify-start gap-2" onClick={exportPaymentReport}>
                      <IndianRupee className="h-4 w-4" />
                      Payment Report Excel
                    </Button>
                    <Button variant="outline" className="justify-start gap-2" onClick={exportStaffSalarySheet}>
                      <Users className="h-4 w-4" />
                      Staff Salary Sheet Excel
                    </Button>
                    <Button variant="outline" className="justify-start gap-2" onClick={exportProfitReport}>
                      <TrendingUp className="h-4 w-4" />
                      Profit Report Excel
                    </Button>
                    <Button className="justify-start gap-2 md:col-span-3" onClick={handlePrintReport}>
                      <FileText className="h-4 w-4" />
                      Print Report / Save as PDF
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
