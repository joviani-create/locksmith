import { useState } from 'preact/hooks';
import type { Intervention } from './types';

function read<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* stockage indisponible */ }
}

export function usePersisted<T>(key: string, initial: T) {
  const [v, setState] = useState<T>(() => read(key, initial));
  // Écriture immédiate : évite de perdre la donnée si l'écran change aussitôt après.
  const setV = (next: T) => { write(key, next); setState(next); };
  return [v, setV] as const;
}

export const useFavoris = () => usePersisted<string[]>('ls_favoris', []);
export const useRecents = () => usePersisted<string[]>('ls_recents', []);
export const useJournal = () => usePersisted<Intervention[]>('ls_journal', []);

export function pushRecent(list: string[], id: string): string[] {
  return [id, ...list.filter((x) => x !== id)].slice(0, 10);
}
export function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
