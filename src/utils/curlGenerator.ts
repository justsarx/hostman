import type { ApiRequest, Environment } from '../types/api';
import { buildInterpolatedUrl, interpolateString } from './interpolation';

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

export function generateCurlCommand(req: ApiRequest, env: Environment | null): string {
  const finalUrl = buildInterpolatedUrl(req, env) || 'http://localhost:3000';
  const parts: string[] = [`curl -X ${req.method} ${shellQuote(finalUrl)}`];

  let hasContentType = false;
  for (const h of req.headers) {
    if (!h.enabled || h.key.trim() === '') continue;
    const key = interpolateString(h.key.trim(), env);
    const val = interpolateString(h.value, env);
    if (key.toLowerCase() === 'content-type') {
      hasContentType = true;
    }
    parts.push(`-H ${shellQuote(`${key}: ${val}`)}`);
  }

  const omitBody = req.method === 'GET' || req.method === 'HEAD';
  if (!omitBody && req.bodyType !== 'none') {
    if (!hasContentType) {
      if (req.bodyType === 'json') {
        parts.push(`-H ${shellQuote('Content-Type: application/json')}`);
      } else if (req.bodyType === 'form-urlencoded') {
        parts.push(`-H ${shellQuote('Content-Type: application/x-www-form-urlencoded')}`);
      } else if (req.bodyType === 'text') {
        parts.push(`-H ${shellQuote('Content-Type: text/plain')}`);
      }
    }

    const body = interpolateString(req.body, env);
    if (body !== '') {
      parts.push(`-d ${shellQuote(body)}`);
    }
  }

  return parts.join(' \\\n  ');
}
