import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase, storage } from '../../server/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectToDatabase();
  
  if (req.method === 'GET') {
    try {
      const items = await storage.getFoodItems();
      return res.status(200).json(items);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch food items" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}