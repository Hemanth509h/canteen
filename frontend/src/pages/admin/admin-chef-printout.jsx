import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import "@/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Calendar, RefreshCw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function ChefPrintout() {
  const [selectedDate, setSelectedDate] = useState("");

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
    
    booking.items.forEach(item => {
      const foodItem = item.foodItem;
      
      if (!foodItem) {
        return;
      }
      
      if (combinedItems[item.foodItemId]) {
        combinedItems[item.foodItemId].totalQuantity += item.quantity;
        combinedItems[item.foodItemId].totalGuests += booking.guestCount;
      } else {
        combinedItems[item.foodItemId] = {
          name: foodItem.name,
          category: foodItem.category,
          totalQuantity: item.quantity,
          totalGuests: booking.guestCount
        };
      }
    });
  });

  const combinedItemsArray = Object.entries(combinedItems).map(([id, data]) => ({
    id,
    ...data
  }));

  const groupedByCategory = {} = {};
  combinedItemsArray.forEach(item => {
    if (!groupedByCategory[item.category]) {
      groupedByCategory[item.category] = [];
    }
    groupedByCategory[item.category].push(item);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            displayone !important;
          }
          .print-page {
            max-widthone !important;
            margin: 0 !important;
            padding: 0.5in !important;
          }
          .print-header {
            backgroundone !important;
            borderone !important;
            padding-bottom: 1rem !important;
          }
          
          /* Allow small sections to avoid page breaks */
          .print-section-avoid {
            page-break-insidevoid;
            break-insidevoid;
          }
          
          /* Allow table sections to break across pages */
          .print-section-table {
            page-break-insideuto;
            break-insideuto;
          }
          
          /* Hide non-menu sections for Chef Menu Only requirement */
          .print-summary, .print-events {
            displayone !important;
          }

          .print-header h1, .print-header .text-3xl {
            content: "Chef Preparation Menu" !important;
          }
          
          /* Tables should break across pages */
          table {
            page-break-insideuto;
            width: 100% !important;
          }
          
          /* Keep table rows together */
          tr {
            page-break-insidevoid;
            page-break-afteruto;
          }
          
          /* Repeat table headers on each page */
          thead {
            displayable-header-group;
          }
          
          tbody {
            displayable-row-group;
          }
          
          /* Preserve colors and backgrounds */
          * {
            -webkit-print-color-adjustxact !important;
            print-color-adjustxact !important;
            color-adjustxact !important;
          }
          
          /* Remove shadows and unnecessary styles */
          .shadow-sm, .shadow, .shadow-md, .shadow-lg {
            box-shadowone !important;
          }
          
          /* Ensure borders are visible */
          .border, .border-b {
            border-color: #000 !important;
          }
          
          /* Make text more readable */
          body {
            font-size: 11pt !important;
          }
          
          h1, h2, h3, h4, h5, h6 {
            page-break-aftervoid;
          }
        }
        
        @page {
          margin: 0.5in;
          sizeortrait;
        }
      `}</style>

      <div className="print-page max-w-6xl mx-auto p-6 space-y-6">
        <Card className="print-header">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl">Chef Preparation Menu</CardTitle>
            <p className="text-muted-foreground">Preparation Guide for {activeDate}</p>
          </CardHeader>
        </Card>

        {dates.length > 0 && (
          <div className="no-print flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={activeDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[200px]" data-testid="select-date">
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                
                  {dates.map(date => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                disabled={isRefetching}
                data-testid="button-refresh"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                {isRefetching ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button 
                onClick={handlePrint} 
                variant="default"
                data-testid="button-print"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print This Sheet
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading chef printout data...
          </div>
        ) : !activeDate ? (
          <div className="text-center py-12 text-muted-foreground">
            No bookings found. Create some confirmed bookings to see the chef printout.
          </div>
        ) : (
          <>
            <Card className="print-section-avoid print-summary">
              
                Daily Summary - {activeDate}</CardTitle>
              </CardHeader>
              
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Events
                    </p>
                    <p className="text-3xl font-bold">{bookingsForDate.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Guests
                    </p>
                    <p className="text-3xl font-bold">{totalMembers}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Unique Dishes
                    </p>
                    <p className="text-3xl font-bold">{combinedItemsArray.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="print-section-avoid print-events">
              
                Events for {activeDate}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookingsForDate.map((booking, idx) => (
                  <div key={booking.id} className="p-4 rounded-md border-2 border-primary bg-card space-y-3 print-section-avoid">
                    <div className="flex flex-wrap justify-between items-start gap-2 pb-3 border-b">
                      <div>
                        <span className="font-bold text-lg">
                          Event {idx + 1}: {booking.clientName}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {booking.eventType}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {booking.guestCount} guests
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-semibold">Contact:</span> {booking.contactPhone} | {booking.contactEmail}
                      </p>
                      {booking.specialRequests && (
                        <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                            Special Instructions/Dietary Requirements:
                          </p>
                          <p className="text-sm text-amber-800 dark:text-amber-100 mt-1">
                            {booking.specialRequests}
                          </p>
                        </div>
                      )}
                    </div>

                    {booking.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-semibold mb-2">Menu Items for this Event:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {booking.items.map((item) => (
                            <div key={item.id} className="p-2 bg-muted/50 rounded text-sm">
                              <span className="font-medium">{item.foodItem.name}</span>
                              <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {Object.keys(groupedByCategory).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No menu items have been selected for these bookings.
                <br />
                Please edit the bookings and add menu items.
              </div>
            ) : (
              <>
                {Object.entries(groupedByCategory).map(([category, items]) => (
                  <Card key={category} className="print-section-table">
                    <CardHeader className="bg-primary text-primary-foreground rounded-t-md">
                      {category}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr className="border-b">
                              <th className="text-left p-3 font-semibold w-[10%]">#</th>
                              <th className="text-left p-3 font-semibold w-[50%]">Dish Name</th>
                              <th className="text-center p-3 font-semibold w-[20%]">Quantity to Prepare</th>
                              <th className="text-center p-3 font-semibold w-[20%]">For Guests</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => (
                              <tr key={item.id} className="border-b last:border-0 hover-elevate">
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3 font-medium">{item.name}</td>
                                <td className="p-3 text-center font-bold text-primary text-lg">
                                  {item.totalQuantity}
                                </td>
                                <td className="p-3 text-center text-muted-foreground">
                                  {item.totalGuests} guests
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="bg-green-50 dark:bg-green-950 border-green-500 print-section-avoid print-summary">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Total items to prepare: {combinedItemsArray.length} unique dishes
                      <br />
                      Serving: {totalMembers} guests across {bookingsForDate.length} event(s)
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
