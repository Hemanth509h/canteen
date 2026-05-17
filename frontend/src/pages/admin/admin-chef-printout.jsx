import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Calendar, RefreshCw, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { printElement } from "@/lib/print-utils";

export default function ChefPrintout() {
  const printRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

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
    setIsPreparingPrint(true);
    await printElement(printRef.current);
    setIsPreparingPrint(false);
  };

  const printableContent = (
    <div className="space-y-6">
      <div className="border-b-4 border-blue-600 pb-5 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Chef Preparation Menu</h1>
        <p className="mt-1 text-sm text-gray-600">Preparation Guide for {activeDate}</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-700">Loading data...</div>
      ) : !activeDate ? (
        <div className="text-center py-12 text-gray-700">No bookings found for this date.</div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border bg-gray-50 p-4">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Daily Summary - {activeDate}</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-xs font-bold uppercase text-gray-500">Events</p><p className="text-2xl font-bold text-gray-900">{bookingsForDate.length}</p></div>
              <div><p className="text-xs font-bold uppercase text-gray-500">Guests</p><p className="text-2xl font-bold text-gray-900">{totalMembers}</p></div>
              <div><p className="text-xs font-bold uppercase text-gray-500">Dishes</p><p className="text-2xl font-bold text-gray-900">{combinedItemsArray.length}</p></div>
            </div>
          </div>

          <div className="columns-1 md:columns-2 gap-6">
            {Object.entries(groupedByCategory).map(([category, items]) => (
              <div key={category} className="overflow-hidden rounded-lg border mb-6 break-inside-avoid">
                <div className="bg-gray-900 px-4 py-3">
                  <h2 className="text-lg font-bold text-white">{category}</h2>
                </div>
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-100">
                    <tr className="border-b">
                      <th className="w-[10%] p-3 text-left text-gray-900">#</th>
                      <th className="w-[50%] p-3 text-left text-gray-900">Dish</th>
                      <th className="w-[20%] p-3 text-center text-gray-900">Qty</th>
                      <th className="w-[20%] p-3 text-center text-gray-900">Guests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="p-3 text-gray-600">{idx + 1}</td>
                        <td className="p-3 font-semibold text-gray-900">{item.name}</td>
                        <td className="p-3 text-center font-bold text-gray-900">{item.totalQuantity}</td>
                        <td className="p-3 text-center text-gray-700">{item.totalGuests}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {!activeDate && !isLoading && (
        <div className="flex flex-wrap items-center justify-between gap-4">
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
        <div className="flex flex-wrap items-center justify-between gap-4">
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
              disabled={isPreparingPrint}
            >
              {isPreparingPrint ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              {isPreparingPrint ? 'Preparing...' : 'Print'}
            </Button>
          </div>
        </div>
      )}

      <div
        ref={printRef}
        className="bg-white p-6"
        style={{ width: "210mm", maxWidth: "100%", margin: "0 auto", boxSizing: "border-box" }}
      >
        {printableContent}
      </div>
    </div>
  );
}
