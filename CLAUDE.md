# Cooking With Her — Engineering Guidelines

## Stack

- **React 18** + **TypeScript 5** (strict mode)
- **Vite 5** for bundling
- **React Router v6** for navigation
- **Tailwind CSS v3** for styling (custom design tokens in `tailwind.config.ts`)
- **Geist** typeface

---

## Folder Structure

```
src/
├── components/
│   ├── atoms/          # Primitive UI elements (Button, Card, Input…)
│   ├── molecules/      # Composed UI blocks (RecipeCard, TabBar…)
│   ├── organisms/      # Complex, self-contained sections (NutritionCard…)
│   └── templates/      # Layout wrappers (PhoneFrame, PhoneLayout)
├── hooks/              # Domain use-case hooks (useRecipeFilter, usePantry…)
├── model/              # Types, interfaces, DTOs, enums — no runtime logic
├── pages/              # Route-level page components
├── router.tsx          # Route definitions and navigation wiring
├── utils/              # Pure transform functions, formatters, mappers
├── data/               # Mock data (replaced by real API layer later)
├── icons/              # SVG icon components
├── index.css           # Tailwind base + global utilities
└── main.tsx            # App entry point
```

### Rules

| What | Where |
|---|---|
| Type, Interface, enum, DTO, API response shape | `src/model/` |
| Pure function: transform, format, map, sort, filter | `src/utils/` |
| Stateful domain logic: list management, filtering, computed state | `src/hooks/` |
| Primitive UI element with no business awareness | `src/components/atoms/` |
| Composed UI block (uses atoms + 1 domain concept) | `src/components/molecules/` |
| Complex section with own data-shape awareness | `src/components/organisms/` |
| Full-screen view wired to a route | `src/pages/` |

> `src/types/` is the legacy location — migrate types to `src/model/` as files are touched.

---

## Model Layer (`src/model/`)

All types, interfaces, enums, and DTO shapes live here. No logic, no imports from React, no side effects.

```
src/model/
├── recipe.ts         # Recipe, RecipeIngredient, RecipeStep, Nutrition, Difficulty, RecipeTag
├── ingredient.ts     # Ingredient, IngredientCat, RecipeIngredient
├── person.ts         # PersonId, Person, Couple
├── shopping.ts       # ShoppingEntry, Suggestion
├── stats.ts          # Stats, HistoryEntry, CuisineMix
├── memory.ts         # Memory
├── utensil.ts        # Utensil
├── ai.ts             # AITag, AIGenerateRequest, AIGenerateResponse
└── index.ts          # Re-exports everything
```

### Conventions

- One domain concept per file.
- Name files after their primary type in `kebab-case`.
- Suffix API response shapes with `Dto`: `RecipeDto`, `IngredientDto`.
- Use `type` for aliases and unions; use `interface` for object shapes.
- Export everything from `src/model/index.ts`.

```ts
// src/model/recipe.ts
export type RecipeTag = 'Brunch' | 'Lunch' | 'Dinner' | 'Snack' | 'Weekday' | 'AI';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Recipe {
  id: string;
  name: string;
  tag: RecipeTag;
  // ...
}

// API response shape
export interface RecipeDto {
  recipe_id: string;
  title: string;
  // ...
}
```

---

## Utils Layer (`src/utils/`)

Pure functions only — no hooks, no React imports, no side effects, no state.

```
src/utils/
├── recipe.ts         # filterRecipes, sortRecipes, toRecipeFromDto
├── ingredient.ts     # groupByCategory, isExpiringSoon, toIngredientFromDto
├── shopping.ts       # splitDoneItems, buildShoppingFromMissing
├── stats.ts          # calcStreak, calcMacroTotals
├── format.ts         # formatTime, formatDate, formatQty
└── index.ts          # Re-exports
```

### Conventions

- One function per concern; name clearly in `camelCase` with a verb prefix.
- Every util is a pure function: same input → same output, no mutation.
- Co-locate the types it operates on: import from `@/model/`.
- Write a unit test for every util (see Testing section).

```ts
// src/utils/recipe.ts
import type { Recipe } from '@/model';

export function filterRecipes(
  recipes: Recipe[],
  filter: string,
  search: string,
): Recipe[] {
  let list = recipes;
  if (filter !== 'all') {
    list = filter === 'quick'
      ? list.filter((r) => r.time <= 25)
      : list.filter((r) => r.tag === filter);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((r) => r.name.toLowerCase().includes(q));
  }
  return list;
}

export function toRecipeFromDto(dto: RecipeDto): Recipe {
  return {
    id: dto.recipe_id,
    name: dto.title,
    // ...
  };
}
```

---

## Hooks Layer (`src/hooks/`)

Use-case hooks encapsulate stateful domain logic. A page component should orchestrate UI; a hook should own the data lifecycle.

```
src/hooks/
├── useRecipeFilter.ts    # Filtering + search for recipe lists
├── usePantry.ts          # Pantry CRUD, expiry sorting
├── useShoppingList.ts    # Add, toggle, clear shopping entries
├── useCookSession.ts     # Step navigation, timer, completion
├── useAIGenerate.ts      # Prompt state, tag selection, time picker
└── index.ts              # Re-exports
```

### When to create a hook

Create a hook when a page component contains:
- A `useMemo` or `useCallback` with non-trivial logic
- Multiple `useState` calls managing related state
- A `useEffect` that isn't a simple lifecycle guard
- Business logic that is (or could be) shared across pages

### Convention

- Name: `use` + domain noun + optional verb: `useRecipeFilter`, `usePantry`.
- Return a plain object, not a tuple (unless the hook is a simple getter/setter pair).
- Keep types for parameters and return value in `src/model/` if reused; inline locally if not.
- No direct JSX; hooks return data and callbacks only.

```ts
// src/hooks/useRecipeFilter.ts
import { useMemo, useState } from 'react';
import type { Recipe } from '@/model';
import { filterRecipes } from '@/utils/recipe';

export function useRecipeFilter(recipes: Recipe[]) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => filterRecipes(recipes, filter, search),
    [recipes, filter, search],
  );

  return { filtered, filter, setFilter, search, setSearch };
}
```

Then in the page:

```ts
// src/pages/HomePage.tsx
export function HomePage({ onOpenRecipe, onAIGenerate }: HomePageProps) {
  const { filtered, filter, setFilter, search, setSearch } = useRecipeFilter(RECIPES);
  // ...
}
```

---

## Component Guidelines

### Atoms

- Accept only primitive props (strings, numbers, booleans, callbacks, ReactNode).
- No direct imports from `@/model` — accept typed props from the caller.
- Define `Props` interface in the same file; export it.
- Use `variant` and `size` string-union props + record lookup maps (not `if/else`).

### Molecules

- May import from `@/model` to type their `recipe`, `item`, etc. prop.
- Must not own state beyond UI micro-state (hover, open, liked).
- Must not call hooks beyond `useState`.

### Organisms

- May own local async state or call domain hooks.
- Responsible for one clearly named domain section.

### Pages

- Wire navigation via props passed from `router.tsx` — no `useNavigate` inside page components.
- Delegate filtered/computed state to hooks.
- Contain only UI layout decisions: which components to show, how to position them.

---

## SOLID Principles in Practice

### Single Responsibility

Each file owns one concern:
- `useRecipeFilter` → filtering logic only
- `formatTime` → formatting only
- `RecipeCard` → visual representation of one recipe only

### Open/Closed

Add behavior by adding a new variant/hook/util — not by branching inside an existing component.

Bad:
```ts
function RecipeCard({ recipe, layout }: props) {
  if (layout === 'row') return <RowLayout ... />;
  return <GridLayout ... />;
}
```

Good:
```ts
// Two components, same model
function RecipeCard({ recipe }: props) { /* grid */ }
function RecipeRow({ recipe }: props) { /* row */ }
```

### Liskov Substitution

Any component accepting `recipe: Recipe` must work with any valid `Recipe`. No `if recipe.id === 'special-case'` inside components.

### Interface Segregation

Don't bundle unrelated props. If a component only needs `name` and `rating`, don't pass the full `Recipe`.

```ts
// Bad
function RecipeBadge({ recipe }: { recipe: Recipe }) { ... }

// Good
function RecipeBadge({ name, rating }: { name: string; rating: number }) { ... }
```

### Dependency Inversion

Pages depend on abstractions (callbacks, hooks), not on concrete navigation or data modules.

```ts
// Bad — page depends on navigate directly
import { useNavigate } from 'react-router-dom';
export function HomePage() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/ai')}>...</button>;
}

// Good — page depends on a callback
export function HomePage({ onAIGenerate }: { onAIGenerate: () => void }) {
  return <button onClick={onAIGenerate}>...</button>;
}
```

Navigation is wired only in `router.tsx`.

---

## Code Style

### Comments

Write **zero comments** by default. Add one only when the WHY is non-obvious:
- A hidden constraint or platform quirk
- A subtle invariant that would surprise a reader
- A deliberate workaround for a known bug

Never:
- Describe what the code does (the code already does that)
- Reference the current task, PR, or issue number
- Write section dividers like `// --- header ---`
- Write file-path comments like `// src/pages/HomePage.tsx`

### Naming

- React components: `PascalCase`
- Hooks: `useCamelCase`
- Utils: `camelCase` with a verb prefix (`filterRecipes`, `formatTime`)
- Types/Interfaces: `PascalCase`; DTOs suffixed with `Dto`
- Constants: `SCREAMING_SNAKE_CASE`
- Files: `PascalCase` for components; `camelCase` for hooks and utils

### Import order (enforced mentally, not by linter yet)

1. React and third-party
2. `@/model`
3. `@/hooks`
4. `@/utils`
5. `@/components/*`
6. `@/icons`
7. Relative imports

### Tailwind

- Use design tokens (`text-ink`, `bg-canvas`, `text-accent`) — never raw hex in `className`.
- Raw hex only in `style={{}}` for data-driven colors (e.g., `accent + '18'` from a recipe's palette).
- Keep `className` strings as a `[...].join(' ')` array when they have conditionals.
- Never `@apply` utility classes in CSS; keep all styles in JSX.

### No inline `<style>` in TSX

Never inject CSS via a `<style>` tag inside JSX. All keyframe animations and global CSS rules belong in `src/index.css`.

Bad:
```tsx
<style>{`@keyframes shake { 0% { transform: translateX(0); } ... }`}</style>
```

Good — add to `src/index.css`:
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-8px); }
}
```

Then reference by name in JSX:
```tsx
<div style={{ animation: 'shake 0.4s' }}>...</div>
```

### No `.js` files in source

All source files must be `.ts` or `.tsx`. Config files use TypeScript:
- `vite.config.ts` — Vite + PostCSS inline config (no separate `postcss.config.*`)
- `tailwind.config.ts` — Tailwind design tokens
- `tsconfig.json` has `"noEmit": true` — TypeScript only type-checks; Vite handles bundling

`tsconfig.dist.json` is the only intentional emit path (see **Test Pipeline** below).

---

## Unit Testing Guide

### Setup (to be configured)

Install testing dependencies:

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Add to `vite.config.ts`:

```ts
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/test/setup.ts',
}
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom';
```

Add to `tsconfig.json` `compilerOptions`:

```json
"types": ["vitest/globals", "@testing-library/jest-dom"]
```

### File location

Tests live next to the file they test:

```
src/
├── utils/
│   ├── recipe.ts
│   └── recipe.test.ts
├── hooks/
│   ├── useRecipeFilter.ts
│   └── useRecipeFilter.test.ts
├── components/
│   └── atoms/
│       ├── Button.tsx
│       └── Button.test.tsx
```

### What to test

| Layer | Test focus | Coverage priority |
|---|---|---|
| `utils/` | Pure function output for all branches | **High — test every exported function** |
| `hooks/` | State transitions, return values | **High** |
| `atoms/` | Renders correctly, fires callbacks | **Medium** |
| `molecules/` | Renders with required props, user interaction | **Medium** |
| `organisms/` | Key computed output visible in DOM | **Low-Medium** |
| `pages/` | Happy path smoke test only | **Low** |

### Utils test example

```ts
// src/utils/recipe.test.ts
import { describe, it, expect } from 'vitest';
import { filterRecipes } from './recipe';
import type { Recipe } from '@/model';

const BASE: Recipe[] = [
  { id: 'a', name: 'Shakshuka', tag: 'Brunch', time: 25, difficulty: 'Easy', /* ... */ },
  { id: 'b', name: 'Salmon',    tag: 'Dinner', time: 20, difficulty: 'Easy', /* ... */ },
  { id: 'c', name: 'Carbonara', tag: 'Dinner', time: 40, difficulty: 'Hard', /* ... */ },
];

describe('filterRecipes', () => {
  it('returns all when filter is "all" and search is empty', () => {
    expect(filterRecipes(BASE, 'all', '')).toHaveLength(3);
  });

  it('filters by quick (<=25 min)', () => {
    const result = filterRecipes(BASE, 'quick', '');
    expect(result.map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('filters by tag', () => {
    expect(filterRecipes(BASE, 'Dinner', '')).toHaveLength(2);
  });

  it('filters by search (case-insensitive)', () => {
    expect(filterRecipes(BASE, 'all', 'sal')).toHaveLength(1);
  });

  it('combines tag and search filters', () => {
    expect(filterRecipes(BASE, 'Dinner', 'carb')).toHaveLength(1);
  });
});
```

### Hook test example

```ts
// src/hooks/useRecipeFilter.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRecipeFilter } from './useRecipeFilter';
import { RECIPES } from '@/data/mock';

describe('useRecipeFilter', () => {
  it('returns all recipes by default', () => {
    const { result } = renderHook(() => useRecipeFilter(RECIPES));
    expect(result.current.filtered).toHaveLength(RECIPES.length);
  });

  it('filters when setFilter is called', () => {
    const { result } = renderHook(() => useRecipeFilter(RECIPES));
    act(() => result.current.setFilter('Dinner'));
    result.current.filtered.forEach((r) => expect(r.tag).toBe('Dinner'));
  });

  it('filters when setSearch is called', () => {
    const { result } = renderHook(() => useRecipeFilter(RECIPES));
    act(() => result.current.setSearch('salmon'));
    expect(result.current.filtered.every((r) =>
      r.name.toLowerCase().includes('salmon'),
    )).toBe(true);
  });
});
```

### Atom component test example

```ts
// src/components/atoms/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const handler = vi.fn();
    render(<Button disabled onClick={handler}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('applies primary variant class', () => {
    render(<Button variant="primary">Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent');
  });
});
```

### Molecule component test example

```ts
// src/components/molecules/RecipeCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '@/model';

const RECIPE: Recipe = {
  id: 'shakshuka',
  name: 'Sunday Shakshuka',
  tag: 'Brunch',
  time: 25,
  difficulty: 'Easy',
  by: 'alex',
  cookedCount: 7,
  rating: 5,
  sprites: ['Tomato'],
  ingredients: [],
  steps: [],
  bg: '#fff',
  accent: '#e63946',
};

describe('RecipeCard', () => {
  it('displays the recipe name', () => {
    render(<RecipeCard recipe={RECIPE} />);
    expect(screen.getByText('Sunday Shakshuka')).toBeInTheDocument();
  });

  it('displays cook time', () => {
    render(<RecipeCard recipe={RECIPE} />);
    expect(screen.getByText(/25m/)).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', async () => {
    const handler = vi.fn();
    render(<RecipeCard recipe={RECIPE} onClick={handler} />);
    await userEvent.click(screen.getByText('Sunday Shakshuka'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('like button does not bubble card click', async () => {
    const handler = vi.fn();
    render(<RecipeCard recipe={RECIPE} onClick={handler} />);
    const likeBtn = screen.getByRole('button');
    await userEvent.click(likeBtn);
    expect(handler).not.toHaveBeenCalled();
  });
});
```

### Test utilities

Keep shared render helpers in `src/test/utils.tsx`:

```ts
// src/test/utils.tsx
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

export function renderWithRouter(
  ui: React.ReactElement,
  { initialEntries = ['/'], ...options }: RenderOptions & { initialEntries?: string[] } = {},
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>,
    options,
  );
}
```

Use `renderWithRouter` for any component that contains a `Link`, `useNavigate`, or `TabBar`.

### Test pipeline — dist validation

`tsconfig.dist.json` compiles `src/` to `dist-test/` (JS + declarations + source maps) **without touching root config files**. Use it to validate that TypeScript emits correctly before shipping.

```bash
npm run test          # watch mode (Vitest)
npm run test:run      # single pass (CI)
npm run test:coverage # coverage report
npm run test:dist     # compile src/ → dist-test/ and validate TypeScript output
```

`dist-test/` is `.gitignore`'d and rebuilt on demand. It mirrors `src/` structure:
```
dist-test/
├── App.js / App.d.ts
├── pages/
├── components/
└── ...
```

`package.json` scripts (already configured):

```json
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage",
"test:dist": "tsc -p tsconfig.dist.json && echo '✓ dist-test compiled'"
```

---

## Architecture Decision Record

### Navigation ownership

Navigation callbacks are **defined in `router.tsx`** and passed as props to pages. Pages never import `useNavigate` directly. This makes pages independently testable without a router context and keeps routing logic in one place.

### State ownership

| State type | Lives in |
|---|---|
| UI micro-state (hover, open, liked) | Component `useState` |
| Domain list state (filter, search, items) | `hooks/` |
| Global shared state | Context or Zustand (when needed) |
| Server state | React Query / SWR (when API is integrated) |
| URL-derived state | `useParams`, `useSearchParams` in route wrappers |

### Adding a new feature

1. Define types in `src/model/feature.ts`
2. Write transform/filter logic in `src/utils/feature.ts` with tests
3. Create a domain hook in `src/hooks/useFeature.ts` with tests
4. Build UI components bottom-up (atom → molecule → organism if needed)
5. Create the page in `src/pages/FeaturePage.tsx`
6. Wire the route in `src/router.tsx`
