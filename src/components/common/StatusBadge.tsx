import { getStatusBadgeStyle } from '../../utils/methodStyles';

interface StatusBadgeProps {
  status: number;
  statusText?: string;
  errorType?: string;
}

export function StatusBadge({ status, statusText, errorType }: StatusBadgeProps) {
  if (errorType) {
    return (
      <span className="rounded-[2px] border border-rose-500/50 bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-rose-400">
        {errorType}
      </span>
    );
  }

  return (
    <span
      className={`rounded-[2px] border px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${getStatusBadgeStyle(
        status
      )}`}
    >
      {status}
      {statusText ? ` ${statusText}` : ''}
    </span>
  );
}
