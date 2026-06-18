import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = Router();

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer memory storage and filters
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG, and WEBP image files are allowed.'));
    }
  }
});

// POST /api/upload
router.post('/', requireAuth, requireAdmin, (req, res, next) => {
  // Use multer upload wrapper to handle errors cleanly
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.warn("[Upload Route] Multer/Validation error:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      if (!req.file) {
        console.warn("[Upload Route] No file provided in request.");
        return res.status(400).json({ success: false, message: 'No image file uploaded.' });
      }

      console.log(`[Upload Route] File upload request received: ${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`);

      // Fallback if Cloudinary is not configured: convert buffer to base64 data URL
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.warn("[Upload Route] Cloudinary credentials are not defined in env. Returning base64 Data URL fallback...");
        
        // Convert the buffer to a base64 Data URL
        const base64Data = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;
        
        console.log(`[Upload Route] Converted uploaded image to base64 data URL (${dataUrl.length} characters)`);
        return res.status(200).json({ success: true, secure_url: dataUrl });
      }

      console.log("[Upload Route] Uploading image buffer to Cloudinary...");
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'campusbites' },
        (cloudinaryErr, result) => {
          if (cloudinaryErr) {
            console.error("[Upload Route] Cloudinary upload error:", cloudinaryErr);
            return res.status(500).json({ 
              success: false, 
              message: 'Cloudinary upload failure', 
              error: cloudinaryErr.message 
            });
          }

          console.log("[Upload Route] Cloudinary upload success. Secure URL:", result?.secure_url);
          return res.status(200).json({ success: true, secure_url: result?.secure_url });
        }
      );

      uploadStream.end(req.file.buffer);
    } catch (routeErr: any) {
      console.error("[Upload Route] Unexpected controller error:", routeErr);
      next(routeErr);
    }
  });
});

export default router;
