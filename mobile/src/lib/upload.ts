import { Platform } from 'react-native';
import { API_BASE, loadTokens } from './api';

export type UploadKind = 'avatar' | 'portfolio' | 'task-media' | 'message-attachment' | 'kyc';

export interface UploadResponse {
  url: string;
  publicId: string;
  kind: UploadKind;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export async function uploadFile(uri: string, kind: UploadKind, originalName?: string, mimeType?: string): Promise<UploadResponse> {
  const { access } = await loadTokens();
  if (!access) throw new Error('Please sign in to upload images.');

  const fd = new FormData();
  const name = originalName || (uri.split('/').pop() || `upload-${Date.now()}.jpg`);
  // RN FormData accepts { uri, name, type } directly
  // @ts-ignore
  fd.append('file', { uri, name, type: mimeType || guessMime(uri) });

  const res = await fetch(`${API_BASE}/api/uploads/${kind}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access}` },
    body: fd as any,
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = 'Upload failed';
    try { const j = JSON.parse(text); if (j?.error) msg = j.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return JSON.parse(text);
}

export async function checkUploadsConfigured(): Promise<boolean> {
  try { const r = await fetch(`${API_BASE}/api/uploads/config`); const j = await r.json(); return !!j?.configured; }
  catch { return false; }
}

function guessMime(uri: string): string {
  const ext = (uri.split('.').pop() || '').toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  return 'image/jpeg';
}
