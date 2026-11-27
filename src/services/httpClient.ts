import type { ApiRequest, ApiResponse, Environment } from '../types/api';
import { buildInterpolatedUrl, interpolateString } from '../utils/interpolation';

function isLocalhostHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h === '[::1]' ||
    h === '::1' ||
    h.endsWith('.localhost')
  );
}

export async function executeRequest(
  req: ApiRequest,
  env: Environment | null,
  signal?: AbortSignal
): Promise<ApiResponse> {
  const finalUrl = buildInterpolatedUrl(req, env);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(finalUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return {
        status: 0,
        statusText: 'Invalid Protocol',
        headers: {},
        body: '',
        timeMs: 0,
        sizeBytes: 0,
        errorType: 'invalid-url',
        errorMessage: `Unsupported protocol "${parsedUrl.protocol}". Only http:// and https:// are supported by browser fetch.`,
        targetUrl: finalUrl,
      };
    }
  } catch {
    return {
      status: 0,
      statusText: 'Invalid URL',
      headers: {},
      body: '',
      timeMs: 0,
      sizeBytes: 0,
      errorType: 'invalid-url',
      errorMessage: `Could not parse URL "${finalUrl || '(empty)'}". Include http:// or https://, or check unresolved {{VARIABLES}}.`,
      targetUrl: finalUrl,
    };
  }

  const headers = new Headers();
  let hasContentType = false;

  for (const h of req.headers) {
    if (!h.enabled || h.key.trim() === '') continue;
    const key = interpolateString(h.key.trim(), env);
    const value = interpolateString(h.value, env);
    if (key.toLowerCase() === 'content-type') {
      hasContentType = true;
    }
    headers.set(key, value);
  }

  const omitBody = req.method === 'GET' || req.method === 'HEAD';
  let body: string | undefined;

  if (!omitBody && req.bodyType !== 'none') {
    body = interpolateString(req.body, env);
    if (!hasContentType) {
      if (req.bodyType === 'json') {
        headers.set('Content-Type', 'application/json');
      } else if (req.bodyType === 'form-urlencoded') {
        headers.set('Content-Type', 'application/x-www-form-urlencoded');
      } else if (req.bodyType === 'text') {
        headers.set('Content-Type', 'text/plain');
      }
    }
  }

  const startedAt = performance.now();

  try {
    const response = await fetch(parsedUrl.toString(), {
      method: req.method,
      headers,
      body,
      signal,
    });

    const responseText = await response.text();
    const timeMs = performance.now() - startedAt;
    const sizeBytes = new TextEncoder().encode(responseText).length;

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    return {
      status: response.status,
      statusText: response.statusText || 'OK',
      headers: responseHeaders,
      body: responseText,
      timeMs,
      sizeBytes,
      targetUrl: parsedUrl.toString(),
    };
  } catch (err) {
    const timeMs = performance.now() - startedAt;

    if (
      signal?.aborted ||
      (err instanceof DOMException && err.name === 'AbortError') ||
      (err instanceof Error && err.name === 'AbortError')
    ) {
      return {
        status: 0,
        statusText: 'Aborted',
        headers: {},
        body: '',
        timeMs,
        sizeBytes: 0,
        errorType: 'aborted',
        errorMessage: 'Request was cancelled before completion.',
        targetUrl: parsedUrl.toString(),
      };
    }

    const message = err instanceof Error ? err.message : 'Network request failed';
    const isLocal = isLocalhostHostname(parsedUrl.hostname);

    return {
      status: 0,
      statusText: 'Fetch Failed',
      headers: {},
      body: '',
      timeMs,
      sizeBytes: 0,
      errorType: isLocal ? 'network' : 'cors',
      errorMessage: message,
      targetUrl: parsedUrl.toString(),
    };
  }
}
