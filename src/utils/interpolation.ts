import type { ApiRequest, Environment } from '../types/api';

const VAR_PATTERN = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g;

export function interpolateString(input: string, env: Environment | null): string {
  if (!input || !env) return input;
  const varMap = new Map<string, string>();
  for (const variable of env.variables) {
    if (variable.enabled && variable.key.trim() !== '') {
      varMap.set(variable.key.trim(), variable.value);
    }
  }

  return input.replace(VAR_PATTERN, (match, varName: string) => {
    return varMap.has(varName) ? (varMap.get(varName) as string) : match;
  });
}

export function findUnresolvedVariables(inputs: string[], env: Environment | null): string[] {
  const definedKeys = new Set<string>();
  if (env) {
    for (const variable of env.variables) {
      if (variable.enabled && variable.key.trim() !== '') {
        definedKeys.add(variable.key.trim());
      }
    }
  }

  const missing = new Set<string>();
  for (const text of inputs) {
    if (!text) continue;
    const regex = new RegExp(VAR_PATTERN.source, 'g');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const varName = match[1];
      if (!definedKeys.has(varName)) {
        missing.add(varName);
      }
    }
  }

  return Array.from(missing);
}

export function buildInterpolatedUrl(req: ApiRequest, env: Environment | null): string {
  const interpolatedUrl = interpolateString(req.url.trim(), env);
  const enabledParams = req.params.filter((p) => p.enabled && p.key.trim() !== '');

  if (enabledParams.length === 0) {
    return interpolatedUrl;
  }

  const hashIdx = interpolatedUrl.indexOf('#');
  const hash = hashIdx >= 0 ? interpolatedUrl.slice(hashIdx) : '';
  const withoutHash = hashIdx >= 0 ? interpolatedUrl.slice(0, hashIdx) : interpolatedUrl;
  const qIdx = withoutHash.indexOf('?');
  const base = qIdx >= 0 ? withoutHash.slice(0, qIdx) : withoutHash;

  const search = new URLSearchParams();
  for (const param of enabledParams) {
    search.append(
      interpolateString(param.key.trim(), env),
      interpolateString(param.value, env)
    );
  }

  const qs = search.toString();
  return qs ? `${base}?${qs}${hash}` : `${base}${hash}`;
}
