import type { ApiRequest, ApiResponse, HttpMethod } from '../types/api';

export interface MockPreset {
  id: string;
  title: string;
  category: 'REST' | 'Auth' | 'Localhost' | 'Webhook';
  description: string;
  request: Omit<ApiRequest, 'id' | 'updatedAt'>;
  mockResponse: ApiResponse;
}

export const MOCK_PRESETS: MockPreset[] = [
  {
    id: 'mock-users-list',
    title: 'List Users (JSONPlaceholder)',
    category: 'REST',
    description: 'Paginated user directory request with query parameters ready for live or offline inspection.',
    request: {
      name: 'List Users',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users?_limit=3',
      params: [{ id: 'p-limit', key: '_limit', value: '3', enabled: true }],
      headers: [{ id: 'h-accept', key: 'Accept', value: 'application/json', enabled: true }],
      bodyType: 'none',
      body: '',
    },
    mockResponse: {
      status: 200,
      statusText: 'OK',
      timeMs: 14,
      sizeBytes: 342,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'x-hostman-source': 'offline-mock-lab',
      },
      body: JSON.stringify(
        [
          { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' },
          { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' },
          { id: 3, name: 'Clementine Bauch', username: 'Samantha', email: 'Nathan@yesenia.net' },
        ],
        null,
        2
      ),
    },
  },
  {
    id: 'mock-create-post',
    title: 'Create Post Resource',
    category: 'REST',
    description: 'JSON POST payload with Content-Type auto-injection and 201 Created mock response.',
    request: {
      name: 'Create Post',
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      params: [],
      headers: [],
      bodyType: 'json',
      body: JSON.stringify(
        {
          title: 'Hostman Hardware Rack',
          body: 'Offline-first API testing payload',
          userId: 1,
        },
        null,
        2
      ),
    },
    mockResponse: {
      status: 201,
      statusText: 'Created',
      timeMs: 18,
      sizeBytes: 118,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        location: '/posts/101',
      },
      body: JSON.stringify(
        {
          id: 101,
          title: 'Hostman Hardware Rack',
          body: 'Offline-first API testing payload',
          userId: 1,
        },
        null,
        2
      ),
    },
  },
  {
    id: 'mock-auth-token',
    title: 'Bearer Token Session Check',
    category: 'Auth',
    description: 'Uses {{BASE_URL}} and {{API_TOKEN}} environment variables for authenticated local testing.',
    request: {
      name: 'Session Verify',
      method: 'GET',
      url: '{{BASE_URL}}/api/v1/auth/session',
      params: [],
      headers: [
        { id: 'h-auth', key: 'Authorization', value: 'Bearer {{API_TOKEN}}', enabled: true },
      ],
      bodyType: 'none',
      body: '',
    },
    mockResponse: {
      status: 200,
      statusText: 'OK',
      timeMs: 9,
      sizeBytes: 132,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      },
      body: JSON.stringify(
        {
          authenticated: true,
          role: 'developer',
          environment: 'Local Dev',
          expiresInSeconds: 3600,
        },
        null,
        2
      ),
    },
  },
  {
    id: 'mock-webhook-event',
    title: 'Webhook Event Dispatch',
    category: 'Webhook',
    description: 'Simulates an outbound webhook signature header and JSON event payload.',
    request: {
      name: 'Webhook Dispatch',
      method: 'POST',
      url: '{{BASE_URL}}/webhooks/events',
      params: [],
      headers: [
        { id: 'h-sig', key: 'X-Webhook-Signature', value: 'sha256=demo9a7f3c', enabled: true },
      ],
      bodyType: 'json',
      body: JSON.stringify(
        {
          event: 'deployment.succeeded',
          service: 'hostman-worker',
          timestamp: '2026-11-27T08:00:00Z',
        },
        null,
        2
      ),
    },
    mockResponse: {
      status: 202,
      statusText: 'Accepted',
      timeMs: 11,
      sizeBytes: 64,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ queued: true, deliveryId: 'deliv_88412' }, null, 2),
    },
  },
];

export function buildSimulatedResponse(method: HttpMethod, url: string, body: string): ApiResponse {
  const started = performance.now();
  const payload = {
    simulated: true,
    method,
    endpoint: url,
    echoedBodyLength: body.length,
    timestamp: new Date().toISOString(),
  };
  const json = JSON.stringify(payload, null, 2);
  return {
    status: method === 'POST' ? 201 : 200,
    statusText: method === 'POST' ? 'Created (Simulated)' : 'OK (Simulated)',
    headers: {
      'content-type': 'application/json',
      'x-hostman-mode': 'offline-mock-simulator',
    },
    body: json,
    timeMs: Math.max(4, performance.now() - started),
    sizeBytes: new TextEncoder().encode(json).length,
    targetUrl: url,
  };
}
