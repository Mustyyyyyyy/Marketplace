'use client';

import React, { useRef, useState } from 'react';
import { uploadFile, UploadKind, checkUploadsConfigured } from '@/lib/upload';

interface ImageUploaderProps {
  kind: UploadKind;
  value?: string | null;
  onChange: (url: string, publicId?: string) => void;
  onError?: (msg: string) => void;
  label?: string;
  shape?: 'square' | 'wide' | 'auto';
  size?: number;
  disabled?: boolean;
}

export default function ImageUploader({ kind, value, onChange, onError, label, shape = 'auto', size = 96, disabled }: ImageUploaderProps) {
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => { checkUploadsConfigured().then(setConfigured); }, []);

  const handle = async (file: File) => {
    setBusy(true);
    try {
      const access = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
      if (!access) throw new Error('Please sign in to upload images.');
      if (file.size > 10 * 1024 * 1024) throw new Error('File is too large (max 10MB).');
      const res = await uploadFile(file, kind, access, file.name);
      onChange(res.url, res.publicId);
    } catch (e: any) {
      onError?.(e.message || 'Upload failed');
    } finally { setBusy(false); }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) handle(f); e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0]; if (f) handle(f);
  };

  const containerStyle: React.CSSProperties = shape === 'square'
    ? { width: size, height: size, borderRadius: '50%' }
    : shape === 'wide'
    ? { width: '100%', height: 160, borderRadius: 16 }
    : { width: size, height: size, borderRadius: 12 };

  return (
    <div className="flex flex-col gap-2">
      {label ? <span className="font-label-md text-label-md font-semibold text-on-surface">{label}</span> : null}
      <div
        onClick={() => !busy && !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        style={{ ...containerStyle, backgroundColor: value ? 'transparent' : 'var(--surface-container-high)', border: drag ? '2px dashed var(--secondary)' : '2px dashed var(--outline-variant)', overflow: 'hidden', position: 'relative', cursor: disabled || busy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : 1 }}
        role="button" tabIndex={0}
      >
        {value ? (
          <img src={value} alt="upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="flex flex-col items-center justify-center text-on-surface-variant text-center p-2">
            <span className="material-symbols-outlined text-2xl">add_a_photo</span>
            <span className="text-xs mt-1">{busy ? 'Uploading…' : 'Add image'}</span>
          </div>
        )}
        {busy ? <div className="absolute inset-0 bg-surface-container-lowest/70 flex items-center justify-center"><span className="text-on-surface text-sm font-semibold">Uploading…</span></div> : null}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
      {configured === false ? (
        <p className="text-xs text-on-surface-variant">Image uploads are not configured. Set CLOUDINARY_* in your backend <code>.env</code>.</p>
      ) : null}
    </div>
  );
}
