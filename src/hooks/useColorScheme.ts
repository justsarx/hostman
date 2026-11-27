import { useCallback, useEffect, useState } from 'react';

export type ColorSchemePreference = 'system' | 'light' | 'dark';
export type ResolvedScheme = 'light' | 'dark';

const STORAGE_KEY = 'color-scheme';

function readStoredPreference(): ColorSchemePreference {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'light' || val === 'dark') return val;
  } catch {
    // Storage unavailable
  }
  return 'system';
}

function getSystemScheme(): ResolvedScheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function syncMetaTag(pref: ColorSchemePreference): void {
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.setAttribute('content', pref === 'system' ? 'light dark' : pref);
  }
}

export function useColorScheme() {
  const [preference, setPreference] = useState<ColorSchemePreference>(readStoredPreference);
  const [systemScheme, setSystemScheme] = useState<ResolvedScheme>(getSystemScheme);

  const resolvedScheme: ResolvedScheme = preference === 'system' ? systemScheme : preference;

  useEffect(() => {
    syncMetaTag(preference);
  }, [preference]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      setSystemScheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        setPreference(readStoredPreference());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setSchemePreference = useCallback((next: ColorSchemePreference) => {
    try {
      if (next === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // Ignore storage errors
    }
    setPreference(next);
    syncMetaTag(next);
  }, []);

  const toggleScheme = useCallback(() => {
    const target: ResolvedScheme = resolvedScheme === 'dark' ? 'light' : 'dark';
    const nextPref: ColorSchemePreference = target === systemScheme ? 'system' : target;
    setSchemePreference(nextPref);
  }, [resolvedScheme, systemScheme, setSchemePreference]);

  return {
    preference,
    systemScheme,
    resolvedScheme,
    setSchemePreference,
    toggleScheme,
  };
}
