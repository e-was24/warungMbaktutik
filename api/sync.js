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
      let body = req.body;
      
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch(e) { body = null; }
      }

      if (!body) return res.status(400).json({ error: 'Body kosong' });

      const action = body.action || 'sync_all';
      
      // Fetch current data first if we are doing an incremental update (like adding an order)
      let currentData = { products: [], categoryStatus: {}, orders: [], isInitialized: true };
      try {
        const { blobs } = await list({ prefix: 'warung-menu.json' });
        if (blobs && blobs.length > 0) {
          const fetchRes = await fetch(blobs[0].url);
          currentData = await fetchRes.json();
        }
      } catch (err) { console.error("Fetch current data failed", err); }

      let finalData;

      if (action === 'add_order') {
        const newOrder = body.order;
        if (!newOrder) return res.status(400).json({ error: 'Data pesanan (order) missing' });
        
        // Ensure orders array exists
        if (!Array.isArray(currentData.orders)) currentData.orders = [];
        
        // Append new order
        currentData.orders.push(newOrder);
        finalData = currentData;
      } else if (action === 'update_order_status') {
        const { timestamp, status } = body;
        if (!timestamp || !status) return res.status(400).json({ error: 'Timestamp/status missing' });
        
        if (Array.isArray(currentData.orders)) {
          currentData.orders = currentData.orders.map(o => 
            o.timestamp === timestamp ? { ...o, status } : o
          );
        }
        finalData = currentData;
      } else {
        // Default: sync_all (Overwrite products and categories, but KEEP existing orders if not provided)
        finalData = {
          products: body.products || currentData.products || [],
          categoryStatus: body.categoryStatus || currentData.categoryStatus || {},
          orders: body.orders || currentData.orders || [],
          isInitialized: true
        };
      }
      
      console.log(`Action: ${action}. Uploading updated data object to Blob`);
      
      const result = await put('warung-menu.json', JSON.stringify(finalData), {
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
