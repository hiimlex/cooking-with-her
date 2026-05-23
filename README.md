# Cooking With Her

A recipe app prototype for Alex & Yuka — React + Vite + Tailwind, with atomic design.

## Quick start

```bash
pnpm install   # or npm / yarn
pnpm dev
```

Open the dev URL — you'll see a gallery of every screen. Click any card to inspect it in a phone frame.

## Structure

```
src/
├── components/
│   ├── atoms/          ← Button, Avatar, Card, Chip, Input, Label, Stars, Toggle, Progress, FoodIcon
│   ├── molecules/      ← TabBar, ScreenHeader, SubHeader, Section, Segmented, KPI, Badge,
│   │                     Callout, FieldGroup, RecipeCard, RecipeRow, MenuRow, ShoppingItem,
│   │                     StickerStat, DetailStat, Macro, MacroRing
│   ├── organisms/      ← CookingHeatmap, NutritionCard, AILoading
│   └── templates/      ← PhoneFrame
├── pages/              ← 16 screens, fully styled, no routing logic
├── icons/              ← Octicon-style line icons + food glyphs
├── data/mock.ts        ← Mock data (recipes, ingredients, history…)
├── types/index.ts      ← TypeScript types
├── App.tsx             ← Gallery
├── main.tsx
└── index.css           ← Tailwind + Geist font
```

## Design system at a glance

| Token        | Value                  |
|--------------|------------------------|
| Font         | Geist                  |
| Primary      | `#7c3aed` (`accent`)   |
| Surface      | `#faf8ff` (`bg`)       |
| Card         | `#ffffff` (`card`)     |
| Soft tint    | `#f3eefe` (`canvas`)   |
| Ink          | `#1e1730`              |
| Muted text   | `#6b6580`              |
| Radius       | 14 / 18 / 22 px        |
| Shadow       | None (flat)            |
| Tab bar      | Glass blur (24px)      |

All semantic colors are Tailwind classes:
- Surface: `bg-bg`, `bg-canvas`, `bg-card`, `bg-sunken`
- Text: `text-ink`, `text-muted`, `text-subtle`
- Brand: `text-accent`, `bg-accent`, `bg-accent-tint`, `text-accent-em`
- Label pairs: `bg-lab-{color}-bg` + `text-lab-{color}-fg` for green/yellow/red/blue/purple/pink/orange/gray

## Pages

| File                       | Route purpose                                           |
|----------------------------|---------------------------------------------------------|
| `LoginPage.tsx`            | Shared-code sign-in (default code: `mochi`)             |
| `HomePage.tsx`             | Cook tab — feed of recipes, AI hero, daily stats        |
| `AIGeneratePage.tsx`       | Ask Nonna — mood/time/constraint pickers                |
| `AIResultsPage.tsx`        | Nonna's 3 picks with rationale                          |
| `RecipeDetailPage.tsx`     | Details + ingredients + steps + nutrition + cook CTA    |
| `CookModePage.tsx`         | Fullscreen step-by-step with live timer                 |
| `CookCompletePage.tsx`     | Star + note + photo                                     |
| `PantryPage.tsx`           | Inventory grid + expiring soon shelf                    |
| `AddIngredientPage.tsx`    | Live-preview form + icon picker + shelf life            |
| `ShoppingPage.tsx`         | Shared live list + AI suggestions                       |
| `StatsPage.tsx`            | KPIs, who-cooks split, cuisine mix, heatmap, badges     |
| `UsPage.tsx`               | Couple profile + menu                                   |
| `UtensilsPage.tsx`         | Kitchen inventory with toggles                          |
| `MyRecipesPage.tsx`        | Recipe library                                          |
| `MemoriesPage.tsx`         | Polaroid-style photo gallery                            |
| `AddRecipePage.tsx`        | New-recipe form                                         |

## Notes

- **No routing logic in pages.** Each page accepts optional callback props (e.g. `onBack`, `onOpenRecipe`) so you can wire up React Router, file-based routing, or anything you prefer.
- **Geist font** is loaded via the `geist` npm package — no Google Fonts dependency.
- **Glass effect** uses `.glass` and `.glass-soft` utility classes (defined in `index.css`).
- Tailwind tokens live in `tailwind.config.js` — extend there to add new colors / radii / fonts.
