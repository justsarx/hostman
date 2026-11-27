export const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export type BodyType = 'none' | 'json' | 'text' | 'form-urlencoded';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  bodyType: BodyType;
  body: string;
  collectionId?: string;
  updatedAt: number;
}

export type ApiErrorType = 'network' | 'cors' | 'aborted' | 'invalid-url';

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timeMs: number;
  sizeBytes: number;
  errorType?: ApiErrorType;
  errorMessage?: string;
  targetUrl?: string;
}

export interface Collection {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValuePair[];
}

export interface HistoryItem {
  id: string;
  request: ApiRequest;
  responseMeta: {
    status: number;
    statusText: string;
    timeMs: number;
    sizeBytes: number;
    errorType?: ApiErrorType;
  };
  executedAt: number;
}

export interface RequestTab {
  id: string;
  request: ApiRequest;
  isDirty: boolean;
  response: ApiResponse | null;
  isLoading: boolean;
}
