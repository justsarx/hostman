# Hostman — Lightweight Offline-First API Client

Hostman is a React + TypeScript single-page API client built with a high-contrast hardware-rack UI supporting both **Dark (`#000000` OLED)** and **Light** themes, local persistence, and offline PWA capabilities.

**Live Demo:** https://justsarx.me/hostman/  
**Architecture & Full Function Reference:** See [OVERVIEW.md](./OVERVIEW.md)

## Features

- **Connected Multi-View Workspace (`react-router-dom`):**
  - `/` **Workbench:** Collapsible collections/history sidebar, multi-tab request editor, live `fetch()` execution with `AbortController` cancellation, URL $\leftrightarrow$ Query Params two-way sync, `COPY AS CURL`, `FORMAT JSON`, and CORS / unreachable localhost diagnostics.
  - `/collections` **Collections & History Explorer:** Searchable, method-filtered directory of saved collections and execution history with one-click reopening into the Workbench.
  - `/environments` **Environments & Workspace Config:** Client-side validated environment creation form, tri-state (`System` / `Light` / `Dark`) appearance selector, inline variable matrix editor (`{{BASE_URL}}`, `{{API_TOKEN}}`), and JSON workspace export/import.
  - `/mock-lab` **Offline Mock Lab:** Local simulated endpoint presets (`REST`, `Auth`, `Webhook`) that run completely offline and load directly into Workbench tabs.
- **Light & Dark Themes:** Follows OS preference by default (`color-scheme: light dark`) with FOUC-free inline initialization, a quick toggle in the top navigation bar, and an explicit 3-state selector on `/environments`.
- **Keyboard Shortcuts:**
  - `Ctrl/Cmd + Enter` — Send active request
  - `Ctrl/Cmd + S` — Save request to collection
  - `Ctrl/Cmd + K` or `Ctrl/Cmd + L` — Focus and select URL bar
- **Offline-First Persistence & PWA:** LocalStorage persistence (`mini_postman_v1_*`) with first-boot starter data plus Workbox service worker precaching via `vite-plugin-pwa`.

## Tech Stack

- **Frontend:** React 19, TypeScript, React Router DOM v7
- **Styling & Icons:** Tailwind CSS, IBM Plex Sans & IBM Plex Mono, `@phosphor-icons/react`
- **Build & PWA:** Vite 8, `vite-plugin-pwa`

## Run Instructions

### Prerequisites
- Node.js 20+ and npm 10+

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```
Open the local URL printed in the terminal (typically `http://localhost:5173`).

### 3. Build for production & preview
```bash
npm run build
npm run preview
```

### 4. Lint check
```bash
npm run lint
```

## Project Structure

```text
src/
├── components/
│   ├── common/          # KeyValueTable, MethodBadge, StatusBadge
│   ├── layout/          # TopNav, Sidebar, TabBar, RequestPane, ResponsePane, StatusBar
│   ├── modals/          # RackDialog, EnvironmentModal, SaveRequestModal
│   ├── response/        # CorsDiagnosticCard (Express / FastAPI / Spring Boot)
│   └── sidebar/         # CollectionsPanel, HistoryPanel
├── context/             # WorkspaceContext & useWorkspace hook
├── hooks/               # useColorScheme, useShortcuts, useOnlineStatus
├── pages/               # WorkbenchPage, CollectionsPage, EnvironmentsPage, MockLabPage
├── services/            # httpClient, storageService, mockResponder
├── types/               # TypeScript domain interfaces
└── utils/               # interpolation, urlSync, curlGenerator, importExport, validation, methodStyles
```
