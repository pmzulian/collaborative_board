# Collaborative Board Activity Explorer

A frontend application for exploring activity on a collaborative brainstorming board. Built as part of a Mural Engineering frontend interview exercise.

---

## Setup & Running

### Prerequisites
- Node.js 18+
- npm 9+

### Install dependencies
```bash
npm install
```

### Start json-server (API)
```bash
npm run server
```

### Start the dev server (separate terminal)
```bash
npm run dev
```

### Start concurrently Frontend and json-server
```bash
npm run start
```

App runs at **http://localhost:5173** - API at **http://localhost:3001/notes**

### Run tests
```bash
npm run test          # Vitest watch mode
npm run test:run      # Single run (CI)
npm run test:coverage # Coverage report
```

### Run E2E tests (Playwright)
```bash
# Requires the dev server AND json-server to be running first:
npm run start           # starts both concurrently
npm run test:e2e        # runs all Playwright tests
```

### Build for production
```bash
npm run build
```

---

## Features Implemented

| Feature | Notes |
|---|---|
| Load & render notes | Via TanStack Query against json-server |
| Filter by author | Accessible checkboxes, multi-select |
| Filter by color | Color swatches with aria-pressed |
| Sort | Newest / Oldest / Position X / Position Y |
| Clear filters | One-click reset with visible indicator |
| Empty state | Accessible aria-live status message |

---

## Testing

### Unit & Integration — Vitest + React Testing Library

| File | Tests | Scope |
|---|---|---|
| `boardReducer.test.ts` | 20 | Pure reducer — all action types |
| `boardSelectors.test.ts` | 19 | Derived state with filters + sort |
| `FilterPanel.test.tsx` | 27 | AuthorList, ColorSwatches, SortControl integration |
| `StickyNote.test.tsx` | 12 | View mode, inline edit, delete |
| `CreateNoteForm.test.tsx` | 9 | Rendering, validation, submit/cancel interactions |
| `BoardCanvas.test.tsx` | 4 | Smoke: loading, notes list, empty state, error |
| `ActivityTimeline.test.tsx` | 4 | Smoke: loading, articles, empty state, error |
| **Total** | **95** | |

### E2E — Playwright (Chromium)

Two spec files cover critical user flows and keyboard accessibility:

**`e2e/board.spec.ts`** — CRUD and filtering flows:

| Test | What it verifies |
|---|---|
| App loads and renders notes | Page title visible, at least one note on screen |
| Create a note | POST via form → new note appears on the board |
| Filter by author | Only notes from selected author remain visible |
| Edit a note (inline) | PATCH via inline edit → updated text persists |
| Delete a note | DELETE → note removed from the board |

**`e2e/accessibility-e2e.spec.ts`** — Keyboard and focus management:

| Test | What it verifies |
|---|---|
| Tab order reaches interactive controls | Filter checkboxes, sort select, board notes all reachable |
| "New note" button is keyboard-reachable | Button can receive focus programmatically |
| Focus is trapped inside the dialog | `showModal()` native trap keeps focus inside while open |
| Escape triggers the closing animation | Dialog is hidden after Escape key |
| Focus returns to opener on close | WCAG 2.1 SC 2.4.3 — opener button regains focus after dialog closes |

### axe-core — intentionally excluded

`@axe-core/playwright` was evaluated and deliberately left out. The keyboard/focus tests in `accessibility-e2e.spec.ts` already cover the WCAG criteria most relevant to this application (focus order, focus trap, focus return, keyboard reachability). Axe-core catches a broader surface of automated rules, but it also introduces:

- An additional runtime dependency
- Overlap with the manual ARIA and label checks already in the RTL suite

The trade-off is intentional: targeted, readable assertions over a blanket automated audit. Axe-core would be the right addition in a production CI pipeline where the rule set can be tuned and violations tracked over time.

---

## Short Write-Up

### How I approached the challenge and scoped the work

I started by identifying the two most demonstrable features: **filtering** (by author + color) and **sorting**. 
These showcase state management, derived state, and accessible UI patterns which are exactly what the exercise evaluates.

The board uses a flex-wrap grid layout rather than absolute positioning (despite `x`/`y` being in the data model), 
because accessibility with DOM elements is the stated priority and a grid is more usable and testable.

### Assumptions made

- The 30 notes in `src/data/notes.json` are representative of the real dataset scale
- json-server is an acceptable stand-in for a REST backend for this exercise
- "Pixel-perfect UI" is explicitly out of scope; readable information hierarchy is the target
- Boards have 5 authors and 6 possible note colors (as defined by the schema)
- `x` / `y` coordinates are kept in the data model for future canvas rendering, but the current view uses grid layout for accessibility reasons

### Frontend architecture

#### Component structure

```
src/
+-- components/          # Presentational - receives data via props or hooks
   +-- StickyNote/      # Pure display, 6 color variants, aria-label
   +-- BoardCanvas/     # Renders filtered note list, handles empty state
   +-- FilterPanel/     # Compound Component: AuthorList + ColorSwatches
   +-- SortControl/     # Accessible <select> with label
+-- features/board/      # Domain logic
   +-- boardReducer.ts  # Pure reducer - filters + sort only (UI state)
   +-- boardSelectors.ts# Derived state (filtered+sorted list)
   +-- BoardProvider.tsx# Context + useReducer provider
   +-- useBoardActions.ts # Stable memoized dispatch wrappers
+-- hooks/               # Reusable hooks
   +-- useFilteredNotes.ts     # Merges TanStack data + Context filters
   +-- useKeyboardNavigation.ts# Enter/Space/Escape keyboard handler
+-- lib/
   +-- queryClient.ts   # TanStack QueryClient configuration
+-- utils/
   +-- dateHelpers.ts   # Pure date grouping and formatting functions
+-- types/index.ts       # Domain types: StickyNote, FilterState, etc.
+-- data/notes.json      # Static seed data for json-server
```

#### State management - two distinct layers

**Server state ? TanStack Query**

Notes are remote data. TanStack Query handles fetching, caching, loading/error states, and cache invalidation after mutations. This eliminates manual `status` tracking in a reducer and gives automatic deduplication of concurrent requests.

**UI state ? React Context + useReducer**

Filters and sort order are synchronous, local interaction state with no async concerns. Context + useReducer is the right tool: zero bundle overhead, predictable pure reducer, easy to unit test, no Redux dependency.

**Why not Redux Toolkit?** RTK + RTK Query solves the same problem at +15 KB bundle cost and forces the full Redux stack. The key insight is the separation of server state vs. UI state; the tools are secondary. TanStack Query composes cleanly with any UI state solution and is narrowly focused on a single problem.

#### Key technical decisions

| Decision | Rationale |
|---|---|
| CSS Modules over SCSS | CSS Custom Properties replace SCSS variables. Native CSS nesting (Chrome 112+) replaces SCSS nesting. Removing `sass` eliminates a build dependency with zero functional benefit at this scale. |
| `FilterPanel` as Compound Component | Avoids boolean prop proliferation. Sub-components share context implicitly; consumer controls layout. Follows Inversion of Control. |
| `boardSelectors.ts` as pure functions | Framework-agnostic — easily unit tested without rendering or context. |
| `useMemo` on filtered list | `selectFilteredNotes` runs on every render if not memoized. With 100+ notes the filter+sort pass is non-trivial. |
| json-server for persistence | Realistic REST API (GET/POST/PATCH/DELETE) with zero backend code. Makes TanStack Query mutations meaningful and demonstrable. |
| Native `<dialog>` for the create-note modal | `showModal()` provides focus trap, top-layer stacking (immune to `z-index` and `overflow: hidden` ancestors), native `::backdrop`, Escape handling, scroll lock and correct ARIA semantics — all for zero JS and zero dependencies. A custom `<div role="dialog">` would require reimplementing every one of those manually. |

### Performance - what I implemented and what I'd do next

**Implemented:**
- `React.memo` on `BoardCanvas`: Avoids re-render when unrelated state changes
- `useMemo` on the filtered+sorted note array: Recomputes only when notes or filters change
- `useCallback` on all action dispatchers in `useBoardActions`
- CSS transitions instead of JS animations for hover effects
- TanStack Query `staleTime: 30s`: avoids redundant refetches on tab focus

**Would do next with more time:**
- **Virtualization**: For 500+ notes, replace the flex-wrap grid with `@tanstack/react-virtual`. The current DOM approach degrades beyond ~300 simultaneous elements.
- **Optimistic updates**: On POST/PATCH/DELETE, update the local cache immediately via `onMutate` before the server confirms.
- **Canvas rendering**: For >1000 notes, render on a `<canvas>` element with a separate ARIA layer. DOM rendering is the right choice under 500 notes.

### Accessibility - what I implemented and what I'd do next

**Implemented:**
- Filter checkboxes use `<fieldset>` + `<legend>` for proper group labeling
- Color swatches use `aria-pressed` + `aria-label="Filter by yellow notes"`
- Board section announces note count: `aria-label="Board - 12 notes"`
- Empty state uses `role="status"` + `aria-live="polite"` for screen-reader announcement
- All interactive elements have `:focus-visible` outlines (not `:focus` to avoid mouse noise)
- `<time>` element with `dateTime` attribute for semantic date markup

**Would do next with more time:**
- Increase swatch touch target to 44 x 44px (WCAG 2.5.5)
- Add `aria-live="polite"` to note count on filter change
- Test with VoiceOver (macOS) and NVDA (Windows)
- Add keyboard navigation between sticky notes (arrow keys on the grid)
- Ensure color is never the *only* differentiator - add text labels alongside swatches

### UX decisions

- **Sidebar filter panel**: Persistent sidebar keeps filters always visible. Familiar from e-commerce faceted search; reduces cognitive load vs. a modal or popover.
- **Multi-select additive filters**: Selecting multiple authors/colors shows notes matching any of them (OR logic), useful for exploration.
- **"Clear all" link**: Only appears when filters are active, reducing visual noise. Positioned in the header for proximity to what it resets.
- **Sort in the header**: Sort is a global view decision, not a per-category filter, so it lives in the app header.
- **Grid layout over canvas**: Wrapping flex grid instead of absolute `x`/`y` positioning. Readable, accessible, testable. Coordinates are preserved in the data for a future canvas mode.
- **Fixed note width (200px)**: Consistent width creates a scannable grid. Longer content wraps vertically.

### AI usage

GitHub Copilot was used throughout this project:

- **Boilerplate reduction**: Generating the `notes.json` dataset.
- **Code review**: Catching an unused import and a residual boilerplate block before compilation.
- **Documentation**: Structuring this README.

All generated code was reviewed and intentionally accepted or modified.

### Trade-offs & next steps

| Trade-off | Decision made | Alternative |
|---|---|---|
| Grid vs canvas layout | Grid accessibility wins at this scale | Canvas needed for >500 notes |
| CSS Modules vs SCSS | CSS Modules - no extra build dep needed | SCSS - if token complexity grows significantly |
| TanStack Query vs RTK | TanStack Query - clean server/UI state separation | RTK - if multiple async feature slices appear |
| json-server vs real backend | json-server - sufficient for CRUD demo | PostgreSQL + REST/GraphQL next step |
| No virtualization | Acceptable at 30-100 notes | `@tanstack/react-virtual` - needed beyond ~300 |
| axe-core excluded | Targeted a11y assertions cover the key WCAG criteria; avoids false positives | Add in CI with a tuned rule set when the project scales |

**Next steps with more time:**
1. Activity timeline: Group notes by day using `groupNotesByDay`
2. Keyboard navigation on the board grid (arrow keys between notes)
3. Unit tests for `dateHelpers.ts` (`groupNotesByDay`, `formatDayLabel`, `formatTime`) — excluded from this sample due to the overhead of making `toLocaleTimeString` deterministic across environments
4. Playwright e2e for the full filter → sort → clear flow
5. Optimistic updates on mutations
6. Responsive layout (collapsible sidebar on mobile)

### Time spent

| Phase | Approximate time |
|---|---|
| Initial scaffolding, types, dataset | 30 min |
| Reducer, selectors, Context provider | 25 min |
| Components (StickyNote, BoardCanvas, FilterPanel, SortControl) | 45 min |
| Styling (CSS Modules, design tokens) | 30 min |
| Architecture review and migration decisions | 20 min |
| Documentation (README, instructions files) | 30 min |
| **Total** | **~3h 00min** |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 8 |
| Server state | TanStack Query v5 |
| UI state | React Context + useReducer |
| Styling | CSS Modules |
| API | json-server |
| Testing | Vitest + React Testing Library |
| E2E Testing | Playwright |
| Linting | ESLint + typescript-eslint |
