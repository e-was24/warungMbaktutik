import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const products = await kv.get('warung_products') || [];
      return res.status(200).json(products);
    } 

    if (req.method === 'POST') {
      const { products } = req.body;
      if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'Data tidak valid' });
      }
      await kv.set('warung_products', products);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
