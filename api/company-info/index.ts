import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase, storage } from '../../server/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectToDatabase();
  
  if (req.method === 'GET') {
    try {
      const info = await storage.getCompanyInfo();
      return res.status(200).json(info);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch company info" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}