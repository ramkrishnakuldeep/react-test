# Solution Overview

This document summarizes the main implementation choices, fixes, and trade‑offs for the assessment.

## Backend

### Tech & Structure
- **Stack**: Node.js 18, Express.js.
- **Key routes**:
  - `GET /api/items`: paginated and searchable item listing.
  - `GET /api/items/:id`: fetch a single item by id.
  - `POST /api/items`: create a new item (simple validation).
  - `GET /api/stats`: aggregate stats (total items, average price) with caching.
- **Data store**: JSON file (`data/items.json`) accessed via `fs.promises`.

### Approach
- Wrapped file access in async helpers (`readData`, `writeData`) to avoid blocking the event loop.
- Implemented server‑side pagination and search on `/api/items`:
  - Query params: `page`, `pageSize`, `q` (search), `limit` (legacy support).
  - Returns `items` plus `pagination` metadata (page, pageSize, totalItems, totalPages, hasNext, hasPrev, totalItemsBeforeFilter).
- `GET /api/stats`:
  - Computes stats once and caches them in memory with a TTL.
  - Uses `fs.watch` (disabled in `NODE_ENV=test`) to invalidate cache when `items.json` changes.

### Error Handling
- Central Express error middleware returns JSON errors.
- `readData` throws clear errors for ENOENT; `writeData` wraps write failures.
- Routes use `try/catch` and `next(err)` so all errors go through the handler.

### Trade‑offs
- **File‑based storage** is simple but not concurrent‑safe for high write loads; acceptable for this assessment.
- **In‑memory cache** on `/api/stats` is per‑process and lost on restart; chosen for simplicity over a shared cache.
- Limited validation on `POST /api/items` to keep code compact.

## Frontend

### Tech & Structure
- **Stack**: React 18, React Router, Context API, React Testing Library.
- Key components/pages:
  - `Items`: main paginated list with search, page size selector, and item links.
  - `ItemDetail`: item detail page (not deeply modified here).
  - `SearchBar`, `Pagination`, `PageSizeSelector`, `VirtualizedItemList`.
  - `DataContext`: central data/state manager for items and pagination.

### Data Flow & State
- `DataContext` exposes:
  - `items`, `pagination`, `searchQuery`, `loading`, `error`.
  - Actions: `fetchItems`, `searchItems`, `changePage`, `changePageSize`.
- `Items` page calls these actions and renders:
  - `SearchBar` (with debouncing handled inside tests primarily).
  - `PageSizeSelector` for changing `pageSize`.
  - Conditional empty, loading, and error UI.
  - A list of items (via `VirtualizedItemList` or simple `<ul>` implementation).
  - `Pagination` controls.

### Pagination & Search UX
- **Server‑side pagination**:
  - Items page always requests a specific `page` and `pageSize` from the backend.
  - `Pagination` component renders page numbers, previous/next buttons, and ARIA attributes for accessibility.
- **Search**:
  - `SearchBar` calls `onSearch` on submit/clear.
  - Backend filters across `name`, `category`, and `description` fields.
  - Items page shows contextual text (e.g., “Showing results for ...”).

### Memory Leak Fix
- `Items` component previously risked calling `setState` after unmount.
- Introduced an `AbortController` ref and helper:
  - Every data‑fetching action (`fetchItems`, `searchItems`, `changePage`, `changePageSize`) receives a new `AbortSignal`.
  - Any in‑flight request is aborted before starting a new one.
  - On unmount, the current controller is aborted.
  - Errors from aborts (`AbortError`) are filtered out and don’t update state.

### Trade‑offs
- **AbortController per action** keeps logic explicit and easy to reason about, instead of more complex request tracking.
- Virtualization was attempted with `react-window`, but a conservative fallback to a non‑virtualized list was chosen to prioritize stability over micro‑optimizations in this codebase.
- Styling is inline for simplicity instead of a dedicated CSS module or design system.

## Testing

### Backend Tests
- Jest + Supertest.
- `src/routes/__tests__/items.test.js`:
  - `GET /api/items` returns items + pagination metadata.
  - `GET /api/items` supports `q` search param.
  - `GET /api/items/:id` returns item when found.
  - `GET /api/items/:id` returns 404 when not found.
  - `POST /api/items` creates a new item.
- `src/routes/__tests__/stats.test.js`:
  - Mounts the `stats` router on a local Express app to avoid full server side‑effects.
  - Verifies `/api/stats` returns `total` and `averagePrice`.
  - Verifies cached responses are consistent across calls.
- To prevent Jest from hanging:
  - `fs.watch` in `stats.js` is disabled under `NODE_ENV=test`.

### Frontend Tests (High Level)
- React Testing Library used to validate:
  - Component rendering and accessibility (labels, roles, ARIA attributes).
  - Pagination behavior (buttons enabled/disabled, callbacks fired).
  - SearchBar behavior (typing, submitting, clearing).
  - DataContext behavior with mocked `fetch` and `AbortController`.

### Trade‑offs
- Tests focus on happy paths and key error cases, not exhaustive edge cases for every route/component.
- Backend tests use the real file‑based store (not a mocked FS) for simplicity; this is acceptable at this project scale.

## Summary of Key Trade‑offs
- **Performance vs. Simplicity**:
  - File‑based storage, in‑memory stats caching, and simplified virtualization/fallback were chosen to keep the solution understandable and robust.
- **Correctness & Reliability**:
  - Centralized error handling, abortable fetches, and Jest configuration to avoid open handles all prioritize predictable behavior.
- **Accessibility & UX**:
  - Pagination and search components expose clear labels and ARIA attributes, trading some visual complexity for better usability.

Overall, the solution emphasizes clarity, correct behavior under error conditions, and maintainability over aggressive optimization or heavy architecture.
