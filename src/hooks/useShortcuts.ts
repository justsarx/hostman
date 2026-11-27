import { useEffect } from 'react';

interface ShortcutHandlers {
  onSend: () => void;
  onSave: () => void;
  onFocusUrl: () => void;
}

export function useShortcuts({ onSend, onSave, onFocusUrl }: ShortcutHandlers): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod || e.altKey) return;

      const key = e.key.toLowerCase();

      if (e.key === 'Enter') {
        e.preventDefault();
        onSend();
        return;
      }

      if (key === 's') {
        e.preventDefault();
        onSave();
        return;
      }

      if (key === 'k' || key === 'l') {
        e.preventDefault();
        onFocusUrl();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSend, onSave, onFocusUrl]);
}
