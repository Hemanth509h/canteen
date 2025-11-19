import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EventBooking, FoodItem, BookingItem } from "@shared/schema";

interface BookingWithItems extends EventBooking {
  items: (BookingItem & { foodItem: FoodItem })[];
}

type GroupedBookings = Record<string, BookingWithItems[]>;

export default function ChefPrintout() {
  const [selectedDate, setSelectedDate] = useState<string>("");

  const { data: groupedBookings, isLoading } = useQuery<GroupedBookings>({
    queryKey: ["/api/chef-printout"],
  });

  const dates = groupedBookings ? Object.keys(groupedBookings).sort() : [];
  const activeDate = selectedDate || dates[0] || "";
  const bookingsForDate = activeDate && groupedBookings ? groupedBookings[activeDate] || [] : [];

  const combinedItems: Record<string, { 
    name: string; 
    category: string; 
    totalQuantity: number;
    members: number;
  }> = {};

  let totalMembers = 0;

  bookingsForDate.forEach(booking => {
    totalMembers += booking.guestCount;
    
    booking.items.forEach(item => {
      if (combinedItems[item.foodItemId]) {
        combinedItems[item.foodItemId].totalQuantity += item.quantity;
      } else {
        combinedItems[item.foodItemId] = {
          name: item.foodItem?.name || "Unknown Item",
          category: item.foodItem?.category || "Unknown",
          totalQuantity: item.quantity,
          members: booking.guestCount
        };
      }
    });
  });

  const combinedItemsArray = Object.entries(combinedItems).map(([id, data]) => ({
    id,
    ...data
  }));

  const groupedByCategory: Record<string, typeof combinedItemsArray> = {};
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
            display: none !important;
          }
          body {
            margin: 0;
            padding: 20px;
          }
          .print-container {
            max-width: none !important;
          }
        }

        .print-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .header-section {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border: 2px solid #dee2e6;
        }

        .header-title {
          font-size: 32px;
          font-weight: bold;
          color: #212529;
          margin: 0 0 10px 0;
          text-align: center;
        }

        .header-subtitle {
          font-size: 18px;
          color: #6c757d;
          margin: 0;
          text-align: center;
        }

        .controls-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 15px;
          flex-wrap: wrap;
        }

        .date-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .date-selector label {
          font-weight: 600;
          font-size: 14px;
        }

        .date-selector select {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          background-color: white;
          cursor: pointer;
        }

        .print-button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .print-button:hover {
          background-color: #0056b3;
        }

        .summary-section {
          background-color: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .summary-title {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 15px 0;
          color: #856404;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .summary-item {
          background-color: white;
          padding: 12px;
          border-radius: 6px;
          border-left: 4px solid #ffc107;
        }

        .summary-label {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 4px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #212529;
        }

        .events-section {
          margin-bottom: 30px;
          background-color: #e9ecef;
          padding: 15px;
          border-radius: 8px;
        }

        .events-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #495057;
        }

        .event-card {
          background-color: white;
          border: 1px solid #ced4da;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 10px;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .event-name {
          font-weight: 600;
          font-size: 16px;
          color: #212529;
        }

        .event-details {
          font-size: 14px;
          color: #6c757d;
        }

        .category-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }

        .category-title {
          font-size: 20px;
          font-weight: bold;
          color: white;
          background-color: #28a745;
          padding: 12px 15px;
          border-radius: 6px 6px 0 0;
          margin: 0;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
          border: 2px solid #28a745;
          border-radius: 0 0 6px 6px;
          overflow: hidden;
        }

        .items-table thead {
          background-color: #f8f9fa;
        }

        .items-table th {
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
        }

        .items-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #e9ecef;
          font-size: 14px;
        }

        .items-table tbody tr:last-child td {
          border-bottom: none;
        }

        .items-table tbody tr:hover {
          background-color: #f8f9fa;
        }

        .quantity-cell {
          font-weight: bold;
          color: #007bff;
          font-size: 16px;
          text-align: center;
        }

        .no-data {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
          font-size: 16px;
        }

        .loading {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
          font-size: 16px;
        }

        @page {
          margin: 0.5in;
        }
      `}</style>

      <div className="print-container">
        <div className="header-section">
          <h1 className="header-title">🍽️ Chef Preparation Sheet</h1>
          <p className="header-subtitle">Event Menu Planning & Preparation Guide</p>
        </div>

        <div className="controls-section no-print">
          <div className="date-selector">
            <label htmlFor="date-select">Select Date:</label>
            <select 
              id="date-select"
              value={activeDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              data-testid="select-date"
            >
              {dates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handlePrint} 
            className="print-button"
            data-testid="button-print"
          >
            🖨️ Print This Sheet
          </button>
        </div>

        {isLoading ? (
          <div className="loading">Loading chef printout data...</div>
        ) : !activeDate ? (
          <div className="no-data">No bookings found. Create some confirmed bookings to see the chef printout.</div>
        ) : (
          <>
            <div className="summary-section">
              <h2 className="summary-title">📊 Daily Summary - {activeDate}</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-label">Total Events</div>
                  <div className="summary-value">{bookingsForDate.length}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Total Guests</div>
                  <div className="summary-value">{totalMembers}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Unique Dishes</div>
                  <div className="summary-value">{combinedItemsArray.length}</div>
                </div>
              </div>
            </div>

            <div className="events-section">
              <h3 className="events-title">📅 Events for {activeDate}</h3>
              {bookingsForDate.map((booking, idx) => (
                <div key={booking.id} className="event-card">
                  <div className="event-header">
                    <span className="event-name">
                      Event {idx + 1}: {booking.clientName} - {booking.eventType}
                    </span>
                    <span className="event-details">
                      {booking.guestCount} guests
                    </span>
                  </div>
                  <div className="event-details">
                    Contact: {booking.contactPhone} | {booking.contactEmail}
                  </div>
                  {booking.specialRequests && (
                    <div className="event-details" style={{ marginTop: '8px', fontStyle: 'italic' }}>
                      Special Requests: {booking.specialRequests}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {Object.keys(groupedByCategory).length === 0 ? (
              <div className="no-data">
                No menu items have been selected for these bookings.
                <br />
                Please edit the bookings and add menu items.
              </div>
            ) : (
              <>
                {Object.entries(groupedByCategory).map(([category, items]) => (
                  <div key={category} className="category-section">
                    <h2 className="category-title">{category}</h2>
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th style={{ width: '10%' }}>#</th>
                          <th style={{ width: '50%' }}>Dish Name</th>
                          <th style={{ width: '20%', textAlign: 'center' }}>Quantity to Prepare</th>
                          <th style={{ width: '20%', textAlign: 'center' }}>For Guests</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <tr key={item.id}>
                            <td>{idx + 1}</td>
                            <td style={{ fontWeight: 500 }}>{item.name}</td>
                            <td className="quantity-cell">{item.totalQuantity}</td>
                            <td style={{ textAlign: 'center' }}>{totalMembers} guests</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

                <div style={{ 
                  marginTop: '40px', 
                  padding: '20px', 
                  backgroundColor: '#d4edda', 
                  border: '2px solid #28a745',
                  borderRadius: '8px' 
                }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#155724',
                    fontWeight: 600
                  }}>
                    ✅ Total items to prepare: {combinedItemsArray.length} unique dishes
                    <br />
                    👥 Serving: {totalMembers} guests across {bookingsForDate.length} event(s)
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
