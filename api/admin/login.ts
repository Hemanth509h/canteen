import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase, storage } from '../../server/db';
import { verifyPassword } from '../../server/password-manager';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectToDatabase();
  
  if (req.method === 'POST') {
    try {
      const { password } = req.body;
      const isValid = await verifyPassword(password);
      if (isValid) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(401).json({ error: "Invalid password" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Login failed" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}