import { v2 as cloudinary } from 'cloudinary';

const env = process.env;

let configured = false;

export function configureCloudinary() {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    configured = false;
    return false;
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  configured = true;
  return true;
}

export const isCloudinaryConfigured = () => configured;

export type UploadKind = 'avatar' | 'portfolio' | 'task-media' | 'message-attachment' | 'kyc';

const FOLDER_BY_KIND: Record<UploadKind, string> = {
  avatar: 'avatars',
  portfolio: 'portfolio',
  'task-media': 'tasks',
  'message-attachment': 'messages',
  kyc: 'kyc',
};

const TRANSFORMS_BY_KIND: Record<UploadKind, any> = {
  avatar: { width: 600, height: 600, crop: 'fill', gravity: 'auto', quality: 'auto', fetch_format: 'auto' },
  portfolio: { width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
  'task-media': { width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
  'message-attachment': { width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
  kyc: { quality: 'auto', fetch_format: 'auto' },
};

export interface UploadResult { url: string; publicId: string; width?: number; height?: number; bytes?: number; format?: string; }

export async function uploadBuffer(buffer: Buffer, kind: UploadKind, originalName?: string): Promise<UploadResult> {
  if (!configured) throw new Error('Cloudinary is not configured');
  const folder = `${env.CLOUDINARY_FOLDER || 'tasksphere'}/${FOLDER_BY_KIND[kind]}`;
  const result: any = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: TRANSFORMS_BY_KIND[kind], public_id: originalName ? originalName.replace(/\.[^.]+$/, '').slice(0, 80) : undefined },
      (err, r) => (err ? reject(err) : resolve(r))
    );
    stream.end(buffer);
  });
  return { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, bytes: result.bytes, format: result.format };
}

export async function deleteAsset(publicId: string) {
  if (!configured || !publicId) return;
  try { await cloudinary.uploader.destroy(publicId); } catch { /* ignore */ }
}
