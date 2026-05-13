import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Calendar, RefreshCw, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { printElement } from "@/lib/print-utils";

export default function ChefPrintout() {
  const printRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: groupedBookings, isLoading, isRefetching } = useQuery({
    queryKey: ["/api/chef-printout"],
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/chef-printout"] });
  };

  const dates = groupedBookings 
    ? Object.keys(groupedBookings).filter(date => date && date.trim() !== '').sort() 
    : [];
  const activeDate = selectedDate || dates[0] || "";
  const bookingsForDate = activeDate && groupedBookings ? groupedBookings[activeDate] || [] : [];

  const combinedItems = {};
  let totalMembers = 0;

  bookingsForDate.forEach(booking => {
    totalMembers += booking.guestCount;
    const uniqueFoodItemIds = new Set(); // Prevent duplicate items from same booking
    booking.items.forEach(item => {
      if (uniqueFoodItemIds.has(item.foodItemId)) return;
      uniqueFoodItemIds.add(item.foodItemId);

      const foodItem = item.foodItem;
      if (!foodItem) return;
      
      // Use the individual item's quantity (guest count for this specific dish)
      const itemGuestCount = parseInt(item.quantity) || 0;
      
      if (combinedItems[item.foodItemId]) {
        combinedItems[item.foodItemId].totalQuantity += itemGuestCount;
        combinedItems[item.foodItemId].totalGuests += itemGuestCount;
      } else {
        combinedItems[item.foodItemId] = {
          name: foodItem.name,
          category: foodItem.category,
          totalQuantity: itemGuestCount,
          totalGuests: itemGuestCount
        };
      }
    });
  });

  const combinedItemsArray = Object.entries(combinedItems).map(([id, data]) => ({
    id,
    ...data
  }));

  const groupedByCategory = {};
  combinedItemsArray.forEach(item => {
    if (!groupedByCategory[item.category]) {
      groupedByCategory[item.category] = [];
    }
    groupedByCategory[item.category].push(item);
  });

  const handlePrint = async () => {
    setIsGeneratingPDF(true);
    await printElement(printRef.current);
    setIsGeneratingPDF(false);
  };

  return (
    <>
      <div
        ref={printRef}
        className="bg-white p-6 space-y-6"
        style={{ width: "210mm", maxWidth: "100%", margin: "0 auto", boxSizing: "border-box" }}
      >
        <Card className="print-header">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl text-foreground">Chef Preparation Menu</CardTitle>
            <p className="text-muted-foreground">Preparation Guide for {activeDate}</p>
          </CardHeader>
        </Card>

        {!activeDate && !isLoading && (
          <div className="no-print flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground italic">No bookings found for selected date</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" disabled={isRefetching}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                {isRefetching ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        )}

        {dates.length > 0 && (
          <div className="no-print flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={activeDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[200px]" data-testid="select-date">
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                <SelectContent>
                  {dates.map(date => (
                    <SelectItem key={date} value={date}>{date}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" disabled={isRefetching}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                {isRefetching ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                onClick={handlePrint}
                variant="default"
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="mr-2 h-4 w-4" />
                )}
                {isGeneratingPDF ? 'Generating...' : 'Print'}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">Loading data...</div>
        ) : !activeDate ? (
          <div className="text-center py-12">No bookings found for this date.</div>
        ) : (
          <div className="space-y-6">
            <Card className="print-summary">
              <CardHeader><CardTitle>Daily Summary - {activeDate}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-xs uppercase text-muted-foreground">Events</p><p className="text-2xl font-bold">{bookingsForDate.length}</p></div>
                  <div><p className="text-xs uppercase text-muted-foreground">Guests</p><p className="text-2xl font-bold">{totalMembers}</p></div>
                  <div><p className="text-xs uppercase text-muted-foreground">Dishes</p><p className="text-2xl font-bold">{combinedItemsArray.length}</p></div>
                </div>
              </CardContent>
            </Card>

            {Object.entries(groupedByCategory).map(([category, items]) => (
              <Card key={category} className="print-section-table overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground py-3">
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr className="border-b">
                        <th className="text-left p-3 w-[10%]">#</th>
                        <th className="text-left p-3 w-[50%]">Dish</th>
                        <th className="text-center p-3 w-[20%]">Quantity</th>
                        <th className="text-center p-3 w-[20%]">Guests</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="p-3">{idx + 1}</td>
                          <td className="p-3 font-medium">{item.name}</td>
                          <td className="p-3 text-center font-bold text-primary">{item.totalQuantity}</td>
                          <td className="p-3 text-center text-muted-foreground">{item.totalGuests}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
