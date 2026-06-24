const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.array('images', 5), (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Generate URLs for the uploaded files
    const uploadedUrls = files.map(file => {
      // Assuming backend runs on localhost:5000
      return `http://localhost:5000/uploads/${file.filename}`;
    });

    res.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Local upload error:", error);
    res.status(500).json({ message: 'Failed to upload locally', error: error.message });
  }
});

module.exports = router;
