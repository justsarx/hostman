import type { KeyValuePair } from '../types/api';

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

/**
 * Percent-encodes query components while preserving `{{VAR_NAME}}` template tokens
 * so environment placeholders remain human-readable in the URL bar.
 */
function encodeQueryPartPreservingVars(input: string): string {
  const tokenRegex = /(\{\{\s*[A-Za-z0-9_.-]+\s*\}\})/g;
  return input
    .split(tokenRegex)
    .map((segment, index) => (index % 2 === 1 ? segment : encodeURIComponent(segment)))
    .join('');
}

export function syncUrlToParams(url: string, existingParams: KeyValuePair[]): KeyValuePair[] {
  const disabledParams = existingParams.filter((p) => !p.enabled);
  const existingEnabled = existingParams.filter((p) => p.enabled);

  const hashIdx = url.indexOf('#');
  const withoutHash = hashIdx >= 0 ? url.slice(0, hashIdx) : url;
  const qIdx = withoutHash.indexOf('?');

  if (qIdx < 0) {
    return disabledParams;
  }

  const queryString = withoutHash.slice(qIdx + 1);
  if (queryString === '') {
    return disabledParams;
  }

  const pairs = queryString.split('&');
  const parsedEnabled: KeyValuePair[] = pairs.map((rawPair, index) => {
    const eqIdx = rawPair.indexOf('=');
    const rawKey = eqIdx >= 0 ? rawPair.slice(0, eqIdx) : rawPair;
    const rawVal = eqIdx >= 0 ? rawPair.slice(eqIdx + 1) : '';
    const existing = existingEnabled[index];

    return {
      id: existing?.id ?? crypto.randomUUID(),
      key: safeDecode(rawKey),
      value: safeDecode(rawVal),
      enabled: true,
    };
  });

  return [...parsedEnabled, ...disabledParams];
}

export function syncParamsToUrl(currentUrl: string, params: KeyValuePair[]): string {
  const hashIdx = currentUrl.indexOf('#');
  const hash = hashIdx >= 0 ? currentUrl.slice(hashIdx) : '';
  const withoutHash = hashIdx >= 0 ? currentUrl.slice(0, hashIdx) : currentUrl;
  const qIdx = withoutHash.indexOf('?');
  const base = qIdx >= 0 ? withoutHash.slice(0, qIdx) : withoutHash;

  const activeParams = params.filter((p) => p.enabled && (p.key !== '' || p.value !== ''));
  if (activeParams.length === 0) {
    return `${base}${hash}`;
  }

  const query = activeParams
    .map((p) => {
      const k = encodeQueryPartPreservingVars(p.key);
      const v = encodeQueryPartPreservingVars(p.value);
      return v !== '' ? `${k}=${v}` : k;
    })
    .join('&');

  return `${base}?${query}${hash}`;
}
