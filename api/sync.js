import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Find the latest menu.json
      const { blobs } = await list({ prefix: 'warung-menu.json' });
      if (blobs.length === 0) return res.status(200).json([]);
      
      const response = await fetch(blobs[0].url);
      const data = await response.json();
      return res.status(200).json(data);
    } 

    if (req.method === 'POST') {
      const { products } = req.body;
      if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'Data tidak valid' });
      }
      
      // Upload the menu as a JSON file
      const { url } = await put('warung-menu.json', JSON.stringify(products), {
        access: 'public',
        addRandomSuffix: false, // Overwrite existing
        contentType: 'application/json'
      });
      
      return res.status(200).json({ success: true, url });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
