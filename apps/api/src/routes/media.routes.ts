import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { uploadLimiter } from '../middleware/rateLimiter';
import { authenticate, requireEmailVerification, adminOnly } from '../middleware/auth';
import { MAX_IMAGE_SIZE, IMAGE_FORMATS } from '@ayeza/shared';
import { BadRequestError } from '../utils/errors';
import { testSmtpConnection } from '../utils/email';

const router = express.Router();

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!(IMAGE_FORMATS as readonly string[]).includes(file.mimetype)) {
      return cb(new Error('Invalid image type'));
    }
    cb(null, true);
  },
});

const hasRealCloudinary = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(name && key && secret && name !== 'demo' && key !== 'demo');
};

router.post(
  '/upload',
  authenticate,
  requireEmailVerification,
  uploadLimiter,
  upload.array('files', 8),
  async (req: Request, res: Response) => {
    const files = (req.files ?? []) as Express.Multer.File[];
    if (!files.length) throw new BadRequestError('No files uploaded');

    const uploads = [];
    for (const file of files) {
      if (hasRealCloudinary()) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'ayeza-cosmetics',
            resource_type: 'image',
          });
          fs.unlinkSync(file.path);
          uploads.push({
            url: result.secure_url,
            publicId: result.public_id,
            alt: file.originalname,
          });
          continue;
        } catch {
          // fall through to local
        }
      }

      const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5001}`;
      uploads.push({
        url: `${baseUrl}/uploads/${file.filename}`,
        publicId: file.filename,
        alt: file.originalname,
      });
    }

    res.status(201).json({ success: true, message: 'Upload successful', data: uploads });
  }
);

router.get('/smtp-status', adminOnly, async (_req: Request, res: Response) => {
  const result = await testSmtpConnection();
  res.json({ success: result.ok, message: result.message, data: result });
});

export default router;
