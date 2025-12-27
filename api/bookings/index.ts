import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase, storage } from '../../server/db';
import { insertEventBookingSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectToDatabase();
  
  if (req.method === 'GET') {
    try {
      const bookings = await storage.getBookings();
      return res.status(200).json(bookings);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch bookings" });
    }
  }

  if (req.method === 'POST') {
    try {
      const result = insertEventBookingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      const booking = await storage.createBooking(result.data);
      return res.status(201).json(booking);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create booking" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}