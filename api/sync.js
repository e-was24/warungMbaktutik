import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  // Set CORS headers for local debugging
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      console.log("GET sync initiated");
      const { blobs } = await list({ prefix: 'warung-menu.json' });
      if (!blobs || blobs.length === 0) return res.status(200).json([]);
      
      const response = await fetch(blobs[0].url);
      const data = await response.json();
      return res.status(200).json(data);
    } 

    if (req.method === 'POST') {
      let products = req.body;
      
      // Manual parsing if req.body is a string
      if (typeof products === 'string') {
        try { products = JSON.parse(products).products; } catch(e) { products = null; }
      } else if (products && products.products) {
        products = products.products;
      }

      if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'Data tidak valid (Bukan Array)', received: typeof req.body });
      }
      
      console.log(`Uploading ${products.length} products to Blob`);
      
      const result = await put('warung-menu.json', JSON.stringify(products), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json'
      });
      
      return res.status(200).json({ success: true, url: result.url });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('CRITICAL API ERROR:', error);
    return res.status(500).json({ 
      error: 'CRITICAL_SERVER_ERROR',
      message: error.message,
      stack: error.stack?.split('\n')[0], // Just first line for alert
      token_check: process.env.BLOB_READ_WRITE_TOKEN ? "Token OK" : "Token MISSING"
    });
  }
}
