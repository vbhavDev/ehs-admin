# EHS Admin

A robust, production-ready Next.js 16 (App Router) administration portal architecture for **EHS Admin**.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4, `clsx`, `tailwind-merge`
- **State Management**: Zustand (Global state), TanStack React Query (Server state)
- **Language**: TypeScript (v5.9+)
- **Icons**: Lucide React

---

## Project Structure & Architecture

The application is structured following feature-based modules and strict SOLID principles to ensure maintainability, scalability, and clean separation of concerns.

```text
src/
 ├── app/             # Next.js App Router (pages, layouts, error, loading, not-found)
 ├── components/      # Reusable UI components (buttons, cards, badges, modal, tables)
 ├── context/         # React Context providers (SidebarContext, ThemeContext)
 ├── modules/         # Active feature domains (/websites, /auth, /settings, /media)
 ├── services/        # Centralized API layer (apiFetch.ts, website.service.ts)
 ├── hooks/           # Custom React hooks (useAuth, useWebsites, useGlobalModal)
 ├── store/           # Zustand global state stores
 ├── lib/             # Utilities and helpers (cn for Tailwind)
 ├── types/           # TypeScript interfaces and response types
 ├── constants/       # App & API route configuration constants
 ├── archive/         # Archived legacy modules (excluded from build checks)
 └── providers/       # Global React Context providers (QueryProvider)
```

---

## Core Principles

1. **No API calls in UI components**: All data fetching must be handled by service abstractions (`services/`) and consumed via custom hooks or Server Components.
2. **Predictable State**: Use TanStack Query for server state (caching, refetching) and Zustand / React Context for client state.
3. **Robust Error Handling**: Utilize the centralized `apiFetch` wrapper alongside Next.js global `error.tsx` and `not-found.tsx` boundaries.
4. **Strict Security**: Next.js Edge proxy and middleware protect authenticated routes globally.
5. **Archived Module Isolation**: Retired modules (`blogs`, `events`, `attendees`, `contacts`, `nominations`, `sponsors`, `reports`) are moved into `src/archive/` and safely ignored by TypeScript compilation.

---

## 🚀 How to Use the API Fetcher

The application utilizes a centralized `apiFetch` wrapper located in `src/services/apiFetch.ts`. It automatically attaches the base URL, parses JSON responses, includes credentials for cookies, and centrally handles generic `ApiError` throwing.

### Step 1: Define endpoints in `constants/api.ts`

```typescript
export const API_ENDPOINTS = {
  WEBSITES: {
    BASE: '/websites',
    BY_ID: (id: string) => `/websites/${id}`,
  },
} as const;
```

### Step 2: Create a service in `services/`

Create a service file to encapsulate the API request logic.

```typescript
// src/services/website.service.ts
import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';
import { Website } from '@/types/website.types';

export const websiteService = {
  async getWebsites(): Promise<Website[]> {
    return apiFetch<Website[]>(API_ENDPOINTS.WEBSITES.BASE, {
      method: 'GET',
    });
  },
};
```

### Step 3: Consume in a Hook (TanStack Query)

Always fetch data through TanStack Query on the client to get caching, retries, and loading states automatically.

```typescript
// src/modules/websites/hooks/useWebsites.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { websiteService } from '@/services/website.service';

export function useWebsites() {
  return useQuery({
    queryKey: ['websites'],
    queryFn: () => websiteService.getWebsites(),
  });
}
```

### Step 4: Use in a Component

```tsx
'use client';

import { useWebsites } from '@/modules/websites/hooks/useWebsites';

export function WebsiteList() {
  const { data: websites, isLoading, error } = useWebsites();

  if (isLoading) return <p>Loading websites...</p>;
  if (error) return <p>Error loading websites: {error.message}</p>;

  return (
    <ul>
      {websites?.map((site) => (
        <li key={site.id}>{site.name}</li>
      ))}
    </ul>
  );
}
```

---

## Code Quality & Enforcement

This project enforces strict code quality standards to maintain a production-ready codebase. The build will **fail** if any of these standards are not met.

### 🛡️ Strict Quality Rules

1. **No `any` Types**: The use of `any` is strictly prohibited. Use `unknown` or define specific interfaces/types.
2. **No Console Logs**: `console.log` and `console.error` are not allowed in production code.
3. **Explicit Equality**: Always use `===` and `!==` (`eqeqeq` rule).
4. **Prettier Formatting**: All code must follow the project's Prettier configuration.
5. **Strict TypeScript**: `noImplicitAny` and `noUncheckedIndexedAccess` are enabled in `tsconfig.json`.

### ⚙️ Automated Enforcement

- **Pre-commit Hooks**: Husky and `lint-staged` run `eslint --fix` and `prettier --write` on all staged files automatically before every commit.
- **Build-time Validation**: The `yarn build` command runs a full check pipeline:
  ```bash
  yarn lint && yarn type-check && yarn format:check && next build
  ```

---

## 🛠️ Development Commands

| Command             | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `yarn dev`          | Starts the development server                          |
| `yarn lint`         | Runs ESLint to check for code quality issues           |
| `yarn format`       | Automatically formats all files using Prettier         |
| `yarn format:check` | Verifies that all files are correctly formatted        |
| `yarn type-check`   | Runs `tsc` to verify TypeScript type safety            |
| `yarn build`        | Runs all quality checks and creates a production build |
| `yarn start`        | Starts the production server                           |

---

## Setup & Running

1. **Install Dependencies**

   ```bash
   yarn install
   ```

2. **Start Development Server**

   ```bash
   yarn dev
   ```

3. **Production Build**
   ```bash
   yarn build
   yarn start
   ```

---

## 🧩 Global Modal System

We have a dynamic global modal architecture that allows you to easily trigger popups and confirmations from anywhere in the app without having to manually render `<Modal />` components locally.

### 1. The `useGlobalModal` Hook

Use `useGlobalModal` in any component to trigger popups programmatically.

```tsx
import { useGlobalModal } from '@/hooks/useGlobalModal';

export const MyComponent = () => {
  const { confirm } = useGlobalModal();

  const handleDelete = () => {
    confirm({
      title: 'Delete Item?',
      message: 'This action cannot be undone.',
      confirmText: 'Yes, Delete',
      type: 'danger',
      onConfirm: async () => {
        // await deleteApiCall();
      },
    });
  };

  return <button onClick={handleDelete}>Delete</button>;
};
```

---

## 🔒 Layout & Navigation

- **Sidebar Context**: Responsive sidebar state management handles mobile slide-over drawer and desktop collapse/expand functionality seamlessly.
- **Header**: Includes global shortcut search (`⌘+K`), dark mode toggle, and responsive mobile sidebar trigger.
