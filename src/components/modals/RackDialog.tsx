import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from '@phosphor-icons/react';

interface RackDialogProps {
  title: string;
  maxWidthClass?: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}

export function RackDialog({
  title,
  maxWidthClass = 'w-[min(520px,94vw)]',
  closeLabel,
  onClose,
  children,
}: RackDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  // Fallback light-dismiss for engines without <dialog closedby="any">
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    let pressedOutside = false;
    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) {
        dialog.close();
      }
    };

    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as Record<string, string>)}
      aria-labelledby={titleId}
      onClose={onClose}
      className={`m-auto ${maxWidthClass} rounded-[2px] border border-rack-borderStrong bg-rack-surface p-0 text-rack-text`}
    >
      <div className="flex items-center justify-between border-b border-rack-border bg-rack-canvas px-4 py-3">
        <h1 id={titleId} className="font-mono text-xs font-semibold uppercase tracking-wider">
          {title}
        </h1>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label={closeLabel}
          className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-rack-border bg-rack-elevated text-rack-muted hover:text-rack-text"
        >
          <X size={14} weight="bold" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
