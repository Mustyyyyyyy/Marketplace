'use client';

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

export async function uploadFile(file: File | Blob, kind: UploadKind, accessToken: string, originalName?: string): Promise<UploadResponse> {
  const fd = new FormData();
  const name = (file as File).name || originalName || 'upload';
  fd.append('file', file, name);
  const res = await fetch('/api/backend/api/uploads/' + kind, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: fd,
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
  try { const r = await fetch('/api/backend/api/uploads/config'); const j = await r.json(); return !!j?.configured; }
  catch { return false; }
}
