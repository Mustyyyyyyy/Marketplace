'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // PWA support is optional and must not affect normal page loading.
      });
    }
  }, []);

  return null;
}
