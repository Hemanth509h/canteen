import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase, storage } from '../../server/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectToDatabase();
  
  if (req.method === 'GET') {
    try {
      const { date } = req.query;
      const allBookings = await storage.getBookings();
      
      let filteredBookings = allBookings.filter((b: any) => b.status === 'confirmed' || b.status === 'pending');
      
      if (date) {
        filteredBookings = filteredBookings.filter((b: any) => b.eventDate === String(date));
      }
      
      const bookingsWithItems = [];
      for (const booking of filteredBookings) {
        const items = await storage.getBookingItems(booking.id);
        bookingsWithItems.push({ ...booking, items });
      }
      
      const groupedByDate: Record<string, typeof bookingsWithItems> = {};
      for (const booking of bookingsWithItems) {
        if (!groupedByDate[booking.eventDate]) {
          groupedByDate[booking.eventDate] = [];
        }
        groupedByDate[booking.eventDate].push(booking);
      }
      
      return res.status(200).json(groupedByDate);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch chef printout data" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}