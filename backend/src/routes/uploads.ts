import { Router } from 'express';
import multer from 'multer';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { uploadBuffer, deleteAsset, isCloudinaryConfigured } from '../services/cloudinaryService';
import { ApiError } from '../middleware/error';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp|gif|heic|heif)$/i.test(file.mimetype)) {
      return cb(new ApiError(400, 'Only image files (png, jpg, webp, gif, heic) are allowed.'));
    }
    cb(null, true);
  },
});

router.get('/config', (_req, res) => {
  res.json({ configured: isCloudinaryConfigured() });
});

router.post('/:kind', requireAuth, upload.single('file'), async (req: AuthedRequest, res, next) => {
  try {
    const kind = (req.params.kind || '').toLowerCase();
    const allowed = ['avatar', 'portfolio', 'task-media', 'message-attachment', 'kyc'] as const;
    if (!allowed.includes(kind as any)) throw new ApiError(400, 'Invalid upload kind. Use: ' + allowed.join(', '));
    if (!req.file) throw new ApiError(400, 'No file uploaded. Use multipart form-data with field name "file".');
    if (!isCloudinaryConfigured()) throw new ApiError(503, 'Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in your backend .env.');
    const result = await uploadBuffer(req.file.buffer, kind as any, req.file.originalname);
    res.status(201).json({ ...result, kind, originalName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size });
  } catch (e) { next(e); }
});

router.delete('/:publicId', requireAuth, async (req, res, next) => {
  try {
    await deleteAsset(req.params.publicId);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
