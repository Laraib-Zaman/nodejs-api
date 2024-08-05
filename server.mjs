import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Lens from 'chrome-lens-ocr'; // Default import

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3100;

const upload = multer({ dest: 'uploads/' });

app.post('/extract-text', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const imagePath = path.join(__dirname, req.file.path);

  try {
    // Initialize Lens instance
    const lens = new Lens();

    // Use Lens to process the image
    const result = await lens.scanByFile(imagePath);

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
  } finally {
    // Clean up the uploaded file
    fs.unlinkSync(imagePath);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
