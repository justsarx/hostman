import type { Environment } from '../types/api';

export interface EnvFormValues {
  name: string;
  baseUrl: string;
  tokenKey: string;
  tokenValue: string;
}

export interface EnvFormErrors {
  name?: string;
  baseUrl?: string;
  tokenKey?: string;
  tokenValue?: string;
}

const VAR_NAME_REGEX = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

export function validateEnvironmentForm(
  values: EnvFormValues,
  existingEnvs: Environment[]
): EnvFormErrors {
  const errors: EnvFormErrors = {};
  const trimmedName = values.name.trim();

  if (!trimmedName) {
    errors.name = 'Environment name is required.';
  } else if (trimmedName.length < 2) {
    errors.name = 'Environment name must be at least 2 characters.';
  } else if (trimmedName.length > 40) {
    errors.name = 'Environment name cannot exceed 40 characters.';
  } else if (existingEnvs.some((e) => e.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
    errors.name = `An environment named "${trimmedName}" already exists.`;
  }

  const trimmedUrl = values.baseUrl.trim();
  if (!trimmedUrl) {
    errors.baseUrl = 'Base URL is required.';
  } else {
    try {
      const parsed = new URL(trimmedUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        errors.baseUrl = 'Base URL must start with http:// or https://.';
      }
    } catch {
      errors.baseUrl = 'Enter a valid URL (e.g. http://localhost:3000 or https://api.example.com).';
    }
  }

  const trimmedKey = values.tokenKey.trim();
  const trimmedVal = values.tokenValue.trim();

  if (trimmedKey && !VAR_NAME_REGEX.test(trimmedKey)) {
    errors.tokenKey =
      'Variable key must start with a letter or underscore and contain only letters, numbers, "_", ".", or "-".';
  } else if (trimmedKey === 'BASE_URL') {
    errors.tokenKey = 'BASE_URL is configured above; choose a different key such as API_TOKEN.';
  }

  if (trimmedKey && !trimmedVal) {
    errors.tokenValue = 'Provide a value when specifying an extra variable key.';
  } else if (!trimmedKey && trimmedVal) {
    errors.tokenKey = 'Provide a variable key (e.g. API_TOKEN) for this value.';
  }

  return errors;
}

export function validateRequestUrlInput(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return 'Request URL cannot be empty.';
  }
  if (/\{\{[^}]+\}\}/.test(trimmed)) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'URL must begin with http:// or https://.';
    }
    return null;
  } catch {
    return 'Invalid URL format. Include http:// or https:// (or an {{ENV_VAR}}).';
  }
}
