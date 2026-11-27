# Hostman — Project Overview & Complete Function Reference

Hostman is a lightweight, offline-first API client built with **React 19**, **TypeScript**, **React Router DOM**, **Tailwind CSS**, and **Vite PWA**. It runs entirely in the browser with zero backend dependencies, executing direct `fetch()` requests from the client while persisting workspaces, collections, environments, tabs, and history in `localStorage`.

---

## 1. How Hostman Works (Architecture & Data Flow)

### Boot & Application Shell
1. **Pre-Paint Theme Initialization (`index.html`):** Before React mounts, a synchronous inline `<script>` reads `localStorage.getItem('color-scheme')` (`"light"` or `"dark"`) and updates `<meta name="color-scheme">` so the page renders without a flash of un-themed content (FOUC).
2. **Entry & Routing (`src/main.tsx`, `src/App.tsx`):** `App` wraps the UI in `<BrowserRouter basename={import.meta.env.BASE_URL}>` and `<WorkspaceProvider>`. `AppShell` renders a persistent chrome consisting of `<TopNav />`, the active route view (`/` Workbench, `/collections`, `/environments`, `/mock-lab`), and `<StatusBar />`.
3. **Centralized State (`src/context/WorkspaceContext.tsx`, `src/context/useWorkspace.ts`):** On mount, `WorkspaceProvider` calls `storageService.loadWorkspace()`. On first boot, it seeds `Local Dev` (`BASE_URL = http://localhost:3000`) and `Starter Examples` (`GET JSONPlaceholder Post`, `GET Local Health Check`). Every tab change is persisted back to `localStorage`, and all four pages read/mutate the same synchronized state.

### Request Execution Pipeline
1. **Editing & Sync:** Typing in the URL bar calls `updateActiveUrl` -> `syncUrlToParams` to update the `Params` table without losing disabled rows. Editing the `Params` table calls `updateActiveParams` -> `syncParamsToUrl` while keeping `{{VAR_NAME}}` tokens unencoded and readable.
2. **Validation & Preview:** `findUnresolvedVariables` scans URL, enabled params, enabled headers, and body for `{{VAR_NAME}}` placeholders missing from the active environment. `buildInterpolatedUrl` renders a live resolved preview below the URL input. `validateRequestUrlInput` catches empty or malformed URLs before dispatch.
3. **Execution (`executeRequest`):** Creates a per-tab `AbortController`, interpolates URL, headers, and body, omits bodies on `GET`/`HEAD`, auto-injects `Content-Type` (`application/json`, `application/x-www-form-urlencoded`, or `text/plain`) unless user-defined, measures elapsed time via `performance.now()`, and calculates response byte size via `TextEncoder`.
4. **Error & CORS Diagnostics:** If `fetch()` aborts, an `aborted` response is returned without polluting history. If `fetch()` throws a `TypeError` (network failure or CORS block), `isLocalhostHostname` classifies `localhost` / `127.0.0.1` targets as `network` and remote origins as `cors`, rendering `<CorsDiagnosticCard />` with copyable Express, FastAPI, and Spring Boot CORS snippets.
5. **History Logging:** Completed non-aborted requests prepend a `HistoryItem` (capped at `MAX_HISTORY_ITEMS = 50`) and persist it to `localStorage`.

### Theming & Offline PWA
- **Light / Dark / System Theme (`src/index.css`, `src/hooks/useColorScheme.ts`):** CSS custom property RGB triplets (`--rack-*-rgb`) define both Light (brushed aluminum/paper `#F3F3F5` / `#FFFFFF`, `#C93B0B` accent) and Dark (`#000000` / `#0B0B0C`, `#FF5722` accent) themes. CSS responds natively to `@media (prefers-color-scheme: dark)` and `:root:has(> head > meta[name='color-scheme'][content='light|dark'])`.
- **Service Worker (`vite.config.ts`):** `vite-plugin-pwa` generates a Workbox service worker (`sw.js`) precaching static assets (`js`, `css`, `html`, `ico`, `png`, `svg`, `woff2`) so the full app shell loads offline and `useOnlineStatus` updates `StatusBar` live via `online`/`offline` window events.

---

## 2. Features

- **Multi-Tab Request Workbench (`/`):** Open, switch, dirty-track (`*`), and close multiple independent request tabs with per-tab `AbortController` cancellation.
- **HTTP Methods & Payloads:** Supports `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` with `none`, `json`, `text`, and `x-www-form-urlencoded` bodies, plus `FORMAT JSON` with syntax error reporting.
- **Response Inspector:** Displays HTTP status badge, `ms` latency (`tabular-nums`), formatted byte size, `PRETTY` JSON, `RAW` text, `HEADERS` table, and `COPY` to clipboard.
- **Two-Way URL $\leftrightarrow$ Params Sync & `{{VAR}}` Interpolation:** Live parameter parsing, unresolved variable warnings, and resolved URL preview.
- **CORS & Localhost Diagnostics:** Distinguishes unreachable local ports from missing `Access-Control-Allow-Origin` headers and provides copyable backend CORS middleware snippets.
- **Collections & 50-Entry History (`/collections` & Sidebar):** Create, rename, and delete collections; save (`Ctrl/Cmd + S`), duplicate, and delete requests; search and filter by HTTP method; inspect and reopen history entries.
- **Environments & Validated Config (`/environments` & Modal):** Create validated environments (`name`, `BASE_URL`, optional variable pair), toggle/edit `KEY = VALUE` variables, and export/import workspace backups as `.json`.
- **Offline Mock Lab (`/mock-lab`):** Test categorized (`REST`, `Auth`, `Webhook`) request presets offline with simulated responses or load any preset straight into a Workbench tab.
- **Keyboard Shortcuts:** `Ctrl/Cmd + Enter` (Send), `Ctrl/Cmd + S` (Save to collection), and `Ctrl/Cmd + K` / `Ctrl/Cmd + L` (Focus and select URL input).
- **Light & Dark Themes:** Two-state header toggle in `TopNav` plus tri-state (`System`, `Light`, `Dark`) control in `/environments`.

---

## 3. Complete Function, Hook, Service & Component Reference

### 3.1 Application Entry & Context

| Symbol | Location | Description |
| :--- | :--- | :--- |
| `App()` | `src/App.tsx` | Root component wrapping `<BrowserRouter basename={import.meta.env.BASE_URL}>` and `<WorkspaceProvider>`. |
| `AppShell()` | `src/App.tsx` | Renders the persistent `<TopNav />`, `<Routes>` (`/`, `/collections`, `/environments`, `/mock-lab`, `*` fallback), and `<StatusBar />`. |
| `WorkspaceProvider({ children })` | `src/context/WorkspaceContext.tsx` | Holds and synchronizes all workspace state (tabs, active tab, collections, saved requests, environments, active environment, history, sidebar state, modals, import status) with `storageService`. |
| `createBlankRequest()` | `src/context/WorkspaceContext.tsx` | Internal helper that builds an empty `ApiRequest` with a fresh UUID and timestamp. |
| `createTab(request, isDirty?)` | `src/context/WorkspaceContext.tsx` | Internal helper that clones an `ApiRequest` into a new `RequestTab`. |
| `useWorkspace()` | `src/context/useWorkspace.ts` | Custom hook that reads `WorkspaceContext` and throws if invoked outside `WorkspaceProvider`. |

**`WorkspaceContextValue` Actions:**
- `setActiveTabId(tabId)` — Switches the active tab in the Workbench.
- `setActiveEnvironment(envId)` — Sets and persists the active environment ID.
- `createNewRequest()` — Opens a blank tab and activates it.
- `openSavedRequest(req)` — Focuses an existing tab for `req.id` or opens a new tab with synced query params.
- `openRequestInNewTab(req)` — Opens a fresh unsaved tab from a history item or mock template.
- `closeTab(tabId)` — Aborts any in-flight request on `tabId`, removes the tab (or resets to a blank tab if last), and selects an adjacent fallback tab.
- `updateActiveRequest(patch)` — Applies partial updates to the active tab's request and marks `isDirty: true`.
- `updateActiveUrl(nextUrl)` — Updates URL and runs `syncUrlToParams`.
- `updateActiveParams(nextParams)` — Updates params and runs `syncParamsToUrl`.
- `sendActiveRequest()` — Executes `executeRequest` with per-tab `AbortController`, updates tab response, and appends to `history`.
- `cancelActiveRequest()` — Calls `.abort()` on the active tab's `AbortController`.
- `createCollection(name)`, `renameCollection(id, name)`, `deleteCollection(id)` — CRUD operations on collections (cascade-removing owned requests on delete).
- `saveActiveRequest()` — Updates an already-collected request in place or opens `SaveRequestModal`.
- `saveModalSubmit(name, targetCollectionId, newColName?)` — Saves the active request into an existing or newly created collection.
- `duplicateRequest(req)`, `deleteSavedRequest(id)` — Duplicates or removes a saved request.
- `clearHistory()` — Empties persisted execution history.
- `saveEnvironments(nextEnvs, nextActiveId)` — Persists updated environments from modal or page editors.
- `createEnvironmentFromForm(env, activate?)` — Appends a validated environment from `EnvironmentsPage` and optionally activates it.
- `importWorkspaceFile(file)` — Reads a `.json` backup file, merges collections/requests/environments via `parseAndMergeImport`, and saves to `localStorage`.
- `exportWorkspace()` — Downloads the current workspace backup via `exportWorkspaceJson`.

---

### 3.2 Pages (`src/pages/`)

| Component | Route | Description |
| :--- | :--- | :--- |
| `WorkbenchPage()` | `/` | Primary split-pane API workspace combining `Sidebar`, `TabBar`, `RequestPane`, `ResponsePane`, `CorsDiagnosticCard`, `EnvironmentModal`, `SaveRequestModal`, and `useShortcuts`. |
| `CollectionsPage()` | `/collections` | Full-page searchable and HTTP-method-filtered explorer for collections and execution history, with validated collection creation and one-click navigation back to `/`. |
| `EnvironmentsPage()` | `/environments` | Features the tri-state `Appearance / Color Scheme` selector, the validated `Create New Environment` form (`validateEnvironmentForm`), JSON import/export buttons, and an inline `KeyValueTable` variable editor. |
| `MockLabPage()` | `/mock-lab` | Category-filtered (`ALL`, `REST`, `Auth`, `Webhook`) offline request template lab with `Simulate` preview and `Open in Workbench` loader. |

---

### 3.3 Services (`src/services/`)

| Symbol | Location | Description |
| :--- | :--- | :--- |
| `isLocalhostHostname(hostname)` | `src/services/httpClient.ts` | Checks if a hostname is `localhost`, `127.0.0.1`, `0.0.0.0`, `[::1]`, `::1`, or `*.localhost`. |
| `executeRequest(req, env, signal?)` | `src/services/httpClient.ts` | Validates URL protocol (`http:`/`https:`), interpolates URL/headers/body, omits body on `GET`/`HEAD`, auto-injects `Content-Type`, measures latency via `performance.now()`, measures size via `TextEncoder`, and classifies errors (`invalid-url`, `aborted`, `network`, `cors`). |
| `readJson(key, fallback)` | `src/services/storageService.ts` | Safely parses a JSON value from `localStorage`, returning `fallback` on missing or invalid JSON. |
| `writeJson(key, value)` | `src/services/storageService.ts` | Serializes and writes a value to `localStorage` while catching quota errors. |
| `createSeedData()` | `src/services/storageService.ts` | Builds initial `Local Dev` environment, `Starter Examples` collection, two starter requests, and initial open tab. |
| `storageService.loadWorkspace()` | `src/services/storageService.ts` | Async method that seeds first-boot data or loads persisted collections, requests, environments, history (capped at 50), and tabs. |
| `storageService.saveCollections(collections)` | `src/services/storageService.ts` | Async persistence for `Collection[]`. |
| `storageService.saveRequests(requests)` | `src/services/storageService.ts` | Async persistence for `ApiRequest[]`. |
| `storageService.saveEnvironments(environments)` | `src/services/storageService.ts` | Async persistence for `Environment[]`. |
| `storageService.saveActiveEnvironmentId(envId)` | `src/services/storageService.ts` | Async persistence for the active environment ID. |
| `storageService.saveHistory(history)` | `src/services/storageService.ts` | Async persistence for `HistoryItem[]` capped at `MAX_HISTORY_ITEMS` (50). |
| `storageService.saveTabsState(tabs, activeTabId)` | `src/services/storageService.ts` | Async persistence for open tabs and active tab ID, truncating cached response bodies over 100 KB. |
| `buildSimulatedResponse(method, url, body)` | `src/services/mockResponder.ts` | Generates a synthetic `ApiResponse` (`200`/`201`) echoing method, endpoint, body length, and timestamp for offline testing. |

---

### 3.4 Utilities (`src/utils/`)

| Symbol | Location | Description |
| :--- | :--- | :--- |
| `interpolateString(input, env)` | `src/utils/interpolation.ts` | Replaces `{{VAR_NAME}}` tokens in `input` with matching enabled variable values from `env`, leaving unresolved tokens intact. |
| `findUnresolvedVariables(inputs, env)` | `src/utils/interpolation.ts` | Scans an array of strings for `{{VAR_NAME}}` tokens absent from `env`'s enabled variables and returns unique missing names. |
| `buildInterpolatedUrl(req, env)` | `src/utils/interpolation.ts` | Interpolates `req.url` and appends enabled `req.params` using `URLSearchParams` while preserving `#hash` fragments. |
| `safeDecode(value)` | `src/utils/urlSync.ts` | Decodes URL query components safely (`+` -> space, `decodeURIComponent`), returning raw text on malformed percent sequences. |
| `encodeQueryPartPreservingVars(input)` | `src/utils/urlSync.ts` | Encodes query keys/values with `encodeURIComponent` while leaving `{{VAR_NAME}}` placeholders unencoded. |
| `syncUrlToParams(url, existingParams)` | `src/utils/urlSync.ts` | Parses query parameters from `url` into enabled `KeyValuePair[]` rows, preserving existing row IDs and keeping disabled rows. |
| `syncParamsToUrl(currentUrl, params)` | `src/utils/urlSync.ts` | Rebuilds the query string on `currentUrl` from enabled `params` while preserving the base path and `#hash`. |
| `shellQuote(value)` | `src/utils/curlGenerator.ts` | Wraps a string in POSIX single quotes with internal single quotes escaped (`'\''`). |
| `generateCurlCommand(req, env)` | `src/utils/curlGenerator.ts` | Generates a multi-line `curl -X <METHOD> '<URL>' -H '...' -d '...'` command using interpolated values and auto-injected `Content-Type`. |
| `exportWorkspaceJson(collections, requests, environments)` | `src/utils/importExport.ts` | Serializes workspace entities into a dated `hostman-workspace-YYYY-MM-DD.json` download via `Blob` and object URL. |
| `mergeById(existing, incoming)` | `src/utils/importExport.ts` | Merges two entity arrays keyed by `id`, updating matching IDs and preserving non-conflicting entries. |
| `parseAndMergeImport(rawText, current)` | `src/utils/importExport.ts` | Validates and parses an imported JSON backup, merges it with `current`, and returns merged data plus summary counts. |
| `getStatusBadgeStyle(status)` | `src/utils/methodStyles.ts` | Returns theme-aware Tailwind badge classes for HTTP `2xx`, `3xx`, `4xx`, and `5xx` status codes. |
| `formatBytes(bytes)` | `src/utils/methodStyles.ts` | Formats byte counts into `B`, `KB`, or `MB`. |
| `validateEnvironmentForm(values, existingEnvs)` | `src/utils/validation.ts` | Validates environment creation inputs: required/unique 2–40 char name, valid `http://`/`https://` `BASE_URL`, identifier regex (`VAR_NAME_REGEX`), and paired secondary key/value checks. |
| `validateRequestUrlInput(url)` | `src/utils/validation.ts` | Validates non-empty request URLs (allowing `{{VAR}}` templates or valid `http:`/`https:` URLs). |

---

### 3.5 Custom Hooks (`src/hooks/`)

| Hook | Location | Description |
| :--- | :--- | :--- |
| `useColorScheme()` | `src/hooks/useColorScheme.ts` | Manages `preference` (`'system' \| 'light' \| 'dark'`), tracks `matchMedia('(prefers-color-scheme: dark)')` via `getSystemScheme()`, syncs `<meta name="color-scheme">` via `syncMetaTag()`, persists overrides in `localStorage` via `readStoredPreference()`, syncs across tabs via `storage` events, and exposes `toggleScheme` and `setSchemePreference`. |
| `useOnlineStatus()` | `src/hooks/useOnlineStatus.ts` | Subscribes to `window` `online` and `offline` events and returns live `boolean` connectivity state. |
| `useShortcuts({ onSend, onSave, onFocusUrl })` | `src/hooks/useShortcuts.ts` | Binds global `Ctrl/Cmd + Enter` (`onSend`), `Ctrl/Cmd + S` (`onSave`), and `Ctrl/Cmd + K` / `Ctrl/Cmd + L` (`onFocusUrl`) while calling `preventDefault()`. |

---

### 3.6 UI Components (`src/components/`)

| Component | Location | Role |
| :--- | :--- | :--- |
| `TopNav` | `src/components/layout/TopNav.tsx` | Top navigation bar with `NavLink` routes, item count badges, active environment pill, and Light/Dark toggle button. |
| `Sidebar` | `src/components/layout/Sidebar.tsx` | Collapsible explorer panel with environment selector, `+ New Request`, `Collections` / `History` tabs, and footer actions slot. |
| `TabBar` | `src/components/layout/TabBar.tsx` | Horizontally scrollable open request tabs with `MethodBadge`, dirty `*` indicator, close button, and `+` new tab button. |
| `RequestPane` | `src/components/layout/RequestPane.tsx` | Request editor featuring method selector, URL input with client-side validation, `Send`/`Cancel`, `Copy as cURL`, `Save`, resolved URL preview, unresolved variable banner, and `Params` / `Headers` / `Body` (`Format JSON`) panels. |
| `ResponsePane` | `src/components/layout/ResponsePane.tsx` | Response inspector displaying status badge, latency (`ms`), size, `Pretty` / `Raw` / `Headers` tabs, `Copy`, loading state, and error diagnostic slot. |
| `StatusBar` | `src/components/layout/StatusBar.tsx` | Bottom `tmux`-style bar showing `ONLINE`/`OFFLINE`, active environment, `DIRECT BROWSER FETCH`, and shortcut hints. |
| `KeyValueTable` | `src/components/common/KeyValueTable.tsx` | Reusable enabled-checkbox + key + value + delete table with `Add Row` used for params, headers, and environment variables. |
| `MethodBadge` | `src/components/common/MethodBadge.tsx` | Theme-aware outlined monospace HTTP method badge. |
| `StatusBadge` | `src/components/common/StatusBadge.tsx` | Theme-aware HTTP status or error-type badge. |
| `CorsDiagnosticCard` | `src/components/response/CorsDiagnosticCard.tsx` | Renders aborted, invalid-URL, unreachable localhost, or CORS diagnostics with tabbed copyable snippets for Express, FastAPI, and Spring Boot. |
| `CollectionsPanel` | `src/components/sidebar/CollectionsPanel.tsx` | Sidebar tree for creating, renaming, collapsing, and deleting collections and opening, duplicating, or deleting saved requests. |
| `HistoryPanel` | `src/components/sidebar/HistoryPanel.tsx` | Sidebar execution log (newest first, up to 50 entries) with one-click reopen and `Clear History`. |
| `RackDialog` | `src/components/modals/RackDialog.tsx` | Reusable native `<dialog>` wrapper using `showModal()`, `closedby="any"` plus pointer-outside light-dismiss fallback, and accessible title linking. |
| `EnvironmentModal` | `src/components/modals/EnvironmentModal.tsx` | Modal editor for adding, renaming, deleting environments and editing variables. |
| `SaveRequestModal` | `src/components/modals/SaveRequestModal.tsx` | Validated modal for naming and saving an unsaved request to an existing or newly created collection. |
