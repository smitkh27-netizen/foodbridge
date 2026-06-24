const express = require('express');
const router = express.Router();
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const KEYFILEPATH = path.join(__dirname, '../secret.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const driveService = google.drive({ version: 'v3', auth });

router.post('/upload', upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const folderId = '14v23AdAvyY9cg41Q3RaFUmEZJTsGt5G6';
    const uploadedUrls = [];

    for (let file of files) {
      const fileMetadata = {
        name: `${Date.now()}_${file.originalname}`,
        parents: [folderId],
      };
      
      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      };

      const response = await driveService.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
      });

      // Give anyone with the link view access so the frontend can display it
      await driveService.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      uploadedUrls.push(response.data.webViewLink);
      
      // Clean up temp file
      fs.unlinkSync(file.path);
    }

    res.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Drive upload error:", error);
    res.status(500).json({ message: 'Failed to upload to Google Drive', error: error.message });
  }
});

module.exports = router;
