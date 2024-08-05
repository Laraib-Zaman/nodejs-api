import express from 'express';
import Lens from 'chrome-lens-ocr'; // Default import

const app = express();
const port = process.env.PORT || 3100;

// Middleware to parse raw image data
app.use(express.raw({ type: 'image/*', limit: '10mb' }));

app.post('/extract-text', async (req, res) => {
  if (!req.body || !req.body.length) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    // Use Lens to process the image buffer
    const lens = new Lens();
    const result = await lens.scanByBuffer(req.body);

    // Extract the first bounding box and corresponding text
    const firstSegment = result.segments[0] || {};
    
    const formattedResult = {
      language: result.language,
      text: result.segments.map(segment => segment.text).join(' '),
      boundingBox: firstSegment.boundingBox || {}
    };

    // Send the result as JSON response
    res.json(formattedResult);
  } catch (error) {
    res.status(500).json({ error: 'Text extraction failed', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
