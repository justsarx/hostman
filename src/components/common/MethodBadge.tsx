import type { HttpMethod } from '../../types/api';
import { METHOD_BADGE_STYLES } from '../../utils/methodStyles';

interface MethodBadgeProps {
  method: HttpMethod;
  size?: 'xs' | 'sm';
}

export function MethodBadge({ method, size = 'xs' }: MethodBadgeProps) {
  const sizeClass =
    size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-1 py-0.5 text-[9px]';

  return (
    <span
      className={`inline-block shrink-0 rounded-[2px] border text-center font-mono font-semibold leading-none ${sizeClass} ${METHOD_BADGE_STYLES[method]}`}
    >
      {method}
    </span>
  );
}
