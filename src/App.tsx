import { useNavigate } from 'react-router-dom';
import { PhoneFrame } from '@/components/templates';
import {
  AIGeneratePage, AIResultsPage, AddIngredientPage, AddRecipePage,
  CookCompletePage, CookModePage, HomePage, LoginPage,
  MemoriesPage, MyRecipesPage, PantryPage, RecipeDetailPage,
  ShoppingPage, StatsPage, UsPage, UtensilsPage,
} from '@/pages';
import { RECIPES } from '@/data/mock';

type ScreenKey =
  | 'login' | 'home' | 'ai' | 'ai-results' | 'recipe' | 'cook' | 'cook-complete'
  | 'pantry' | 'add-ingredient' | 'shopping' | 'stats'
  | 'us' | 'recipes' | 'utensils' | 'memories' | 'add-recipe';

interface ScreenDef {
  id: ScreenKey;
  label: string;
  group: string;
  route: string;
  render: () => JSX.Element;
}

const aiResults = RECIPES.slice(0, 3);

const SCREENS: ScreenDef[] = [
  { id: 'login',         label: '01 · Sign in',       group: 'Entry',   route: '/login',            render: () => <LoginPage /> },
  { id: 'home',          label: '02 · Home',          group: 'Entry',   route: '/home',             render: () => <HomePage /> },
  { id: 'ai',            label: '03 · Ask Nonna',     group: 'Entry',   route: '/ai',               render: () => <AIGeneratePage /> },
  { id: 'ai-results',    label: '04 · Nonna results', group: 'Entry',   route: '/ai/results',       render: () => <AIResultsPage results={aiResults} /> },

  { id: 'recipe',        label: '05 · Recipe detail', group: 'Cooking', route: '/recipe/salmon',     render: () => <RecipeDetailPage /> },
  { id: 'cook',          label: '06 · Cook mode',     group: 'Cooking', route: '/cook/shakshuka',    render: () => <CookModePage /> },
  { id: 'cook-complete', label: '07 · Nailed it',     group: 'Cooking', route: '/cook/shakshuka/complete', render: () => <CookCompletePage /> },

  { id: 'pantry',         label: '08 · Pantry',         group: 'Daily', route: '/pantry',       render: () => <PantryPage /> },
  { id: 'add-ingredient', label: '09 · Add ingredient', group: 'Daily', route: '/pantry/add',   render: () => <AddIngredientPage /> },
  { id: 'shopping',       label: '10 · Shopping',       group: 'Daily', route: '/shopping',     render: () => <ShoppingPage /> },
  { id: 'stats',          label: '11 · Insights',       group: 'Daily', route: '/stats',        render: () => <StatsPage /> },

  { id: 'us',          label: '12 · Us',          group: 'Couple', route: '/us',              render: () => <UsPage /> },
  { id: 'recipes',     label: '13 · My recipes',  group: 'Couple', route: '/us/recipes',      render: () => <MyRecipesPage /> },
  { id: 'utensils',    label: '14 · Utensils',    group: 'Couple', route: '/us/utensils',     render: () => <UtensilsPage /> },
  { id: 'memories',    label: '15 · Memories',    group: 'Couple', route: '/us/memories',     render: () => <MemoriesPage /> },
  { id: 'add-recipe',  label: '16 · New recipe',  group: 'Couple', route: '/us/recipes/add',  render: () => <AddRecipePage /> },
];

export default function App() {
  const navigate = useNavigate();
  const groups = Array.from(new Set(SCREENS.map((s) => s.group)));

  return (
    <div className="min-h-screen w-full" style={{ background: '#ece6f7' }}>
      {/* Header */}
      <header className="px-8 pt-12 pb-8">
        <div className="text-[11px] font-bold text-accent uppercase tracking-[1.2px]">
          Cooking With Her · Design System
        </div>
        <h1 className="m-0 mt-1 text-[36px] font-extrabold text-ink tracking-[-1px]">
          Screens preview
        </h1>
        <p className="m-0 mt-2 text-[14px] text-muted max-w-[560px] leading-[1.55]">
          Every page rendered with the design system. Click a card to navigate to it.
          All components live under <code className="bg-card px-1.5 py-0.5 rounded">src/components/&#123;atoms,molecules,organisms&#125;</code>.
        </p>
      </header>

      {/* Gallery */}
      <main className="px-8 pb-16 flex flex-col gap-12">
        {groups.map((g) => (
          <section key={g}>
            <h2 className="m-0 mb-4 text-[14px] font-extrabold text-ink uppercase tracking-[1px]">
              {g}
            </h2>
            <div className="flex flex-wrap gap-10">
              {SCREENS.filter((s) => s.group === g).map((s) => (
                <div
                  key={s.id}
                  onClick={() => navigate(s.route)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(s.route)}
                  className="cursor-pointer text-left transition-transform hover:scale-[1.02]"
                >
                  <div
                    className="pointer-events-none"
                    style={{ width: 280, transform: 'scale(0.55)', transformOrigin: 'top left', height: 481 }}
                  >
                    <PhoneFrame label={s.label}>{s.render()}</PhoneFrame>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
