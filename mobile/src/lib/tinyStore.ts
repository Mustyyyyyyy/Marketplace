// Minimal hook-based store, no external dep. Just enough for auth/socket state.
import { useSyncExternalStore } from 'react';

export function create<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };
  const get = () => state;
  return {
    get,
    setState(patch: Partial<T>) {
      state = { ...state, ...patch } as T;
      listeners.forEach((l) => l());
    },
    use: () => useSyncExternalStore(subscribe, get, get),
  };
}
