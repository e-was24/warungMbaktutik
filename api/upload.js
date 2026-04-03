import { put, del } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req, res) {
  // Handle DELETE request to remove orphaned images
  if (req.method === 'DELETE') {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'URL required' });
      await del(url);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete Error:', error);
      return res.status(500).json({ error: 'Delete failed' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const originalFilename = req.headers['x-filename'] || 'product.png';
    const filename = `warung-${Date.now()}-${originalFilename}`;
    
    const blob = await put(filename, req, {
      access: 'public',
      addRandomSuffix: true,
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
