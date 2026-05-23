import type { ReactNode } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import App from './App';
import { RECIPES } from './data/mock';
import { TabBar, type TabId } from './components/molecules';
import {
  AIGeneratePage,
  AIResultsPage,
  AddIngredientPage,
  AddRecipePage,
  CookCompletePage,
  CookModePage,
  HomePage,
  LoginPage,
  MemoriesPage,
  MyRecipesPage,
  PantryPage,
  RecipeDetailPage,
  ShoppingPage,
  StatsPage,
  UsPage,
  UtensilsPage,
} from './pages';
import { useAppSelector } from './store/hooks';

function AuthLayout() {
  const token = useAppSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/" replace />;
  return <Outlet />;
}

function TabLayout({ children, active }: { children: ReactNode; active: TabId }) {
  return (
    <div className="relative h-screen overflow-hidden">
      <div className="h-full overflow-y-auto overflow-x-hidden no-scrollbar">
        {children}
        <div className="h-[100px]" />
      </div>
      <TabBar active={active} />
    </div>
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  const token    = useAppSelector((s) => s.auth.token);
  if (token) return <Navigate to="/home" replace />;
  return <LoginPage onUnlock={() => navigate('/home')} />;
}

function HomeRoute() {
  const navigate = useNavigate();
  return (
    <TabLayout active="home">
      <HomePage
        onOpenRecipe={(id) => navigate(`/recipe/${id}`)}
        onAIGenerate={() => navigate('/ai')}
      />
    </TabLayout>
  );
}

function AIGenerateRoute() {
  const navigate = useNavigate();
  return (
    <AIGeneratePage
      onBack={() => navigate(-1 as never)}
      onGenerate={() =>
        navigate('/ai/results', { state: { results: RECIPES.slice(0, 3) } })
      }
    />
  );
}

function AIResultsRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const results =
    (location.state as { results?: typeof RECIPES } | null)?.results ??
    RECIPES.slice(0, 3);
  return (
    <AIResultsPage
      results={results}
      onBack={() => navigate(-1 as never)}
      onRetry={() => navigate('/ai')}
      onOpenRecipe={(id) => navigate(`/recipe/${id}`)}
    />
  );
}

function RecipeRoute() {
  const navigate = useNavigate();
  const { id = 'salmon' } = useParams<{ id: string }>();
  return (
    <RecipeDetailPage
      recipeId={id}
      onBack={() => navigate(-1 as never)}
      onCook={(rid) => navigate(`/cook/${rid}`)}
    />
  );
}

function CookRoute() {
  const navigate = useNavigate();
  const { id = 'shakshuka' } = useParams<{ id: string }>();
  return (
    <CookModePage
      recipeId={id}
      onExit={() => navigate(-1 as never)}
      onComplete={() => navigate(`/cook/${id}/complete`)}
    />
  );
}

function CookCompleteRoute() {
  const navigate = useNavigate();
  const { id = 'shakshuka' } = useParams<{ id: string }>();
  return <CookCompletePage recipeId={id} onExit={() => navigate('/home')} />;
}

function PantryRoute() {
  const navigate = useNavigate();
  return (
    <TabLayout active="pantry">
      <PantryPage onAdd={() => navigate('/pantry/add')} />
    </TabLayout>
  );
}

function AddIngredientRoute() {
  const navigate = useNavigate();
  return (
    <AddIngredientPage
      onBack={() => navigate(-1 as never)}
      onSave={() => navigate('/pantry')}
    />
  );
}

function ShoppingRoute() {
  return (
    <TabLayout active="shop">
      <ShoppingPage />
    </TabLayout>
  );
}

function StatsRoute() {
  return (
    <TabLayout active="stats">
      <StatsPage />
    </TabLayout>
  );
}

function UsRoute() {
  const navigate = useNavigate();
  return (
    <TabLayout active="us">
      <UsPage
        onSub={(sub) => {
          if (sub === 'recipes') navigate('/us/recipes');
          if (sub === 'memories') navigate('/us/memories');
          if (sub === 'utensils') navigate('/us/utensils');
        }}
      />
    </TabLayout>
  );
}

function MyRecipesRoute() {
  const navigate = useNavigate();
  return (
    <MyRecipesPage
      onBack={() => navigate(-1 as never)}
      onOpen={(id) => navigate(`/recipe/${id}`)}
      onAdd={() => navigate('/us/recipes/add')}
    />
  );
}

function UtensilsRoute() {
  const navigate = useNavigate();
  return <UtensilsPage onBack={() => navigate(-1 as never)} />;
}

function MemoriesRoute() {
  const navigate = useNavigate();
  return <MemoriesPage onBack={() => navigate(-1 as never)} />;
}

function AddRecipeRoute() {
  const navigate = useNavigate();
  return (
    <AddRecipePage
      onBack={() => navigate(-1 as never)}
      onSave={() => navigate('/us/recipes')}
    />
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/"       element={<LoginRoute />} />
      <Route path="/screens" element={<App />} />

      <Route element={<AuthLayout />}>
        <Route path="/home"             element={<HomeRoute />} />
        <Route path="/ai"               element={<AIGenerateRoute />} />
        <Route path="/ai/results"       element={<AIResultsRoute />} />
        <Route path="/recipe/:id"       element={<RecipeRoute />} />
        <Route path="/cook/:id"         element={<CookRoute />} />
        <Route path="/cook/:id/complete" element={<CookCompleteRoute />} />
        <Route path="/pantry"           element={<PantryRoute />} />
        <Route path="/pantry/add"       element={<AddIngredientRoute />} />
        <Route path="/shopping"         element={<ShoppingRoute />} />
        <Route path="/stats"            element={<StatsRoute />} />
        <Route path="/us"               element={<UsRoute />} />
        <Route path="/us/recipes"       element={<MyRecipesRoute />} />
        <Route path="/us/recipes/add"   element={<AddRecipeRoute />} />
        <Route path="/us/utensils"      element={<UtensilsRoute />} />
        <Route path="/us/memories"      element={<MemoriesRoute />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
