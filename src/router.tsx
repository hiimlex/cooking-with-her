import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { TabBar } from "./components/molecules";
import { TabScrollContainer } from "./components/templates/TabScrollContainer";
import {
  AIGeneratePage,
  AIResultsPage,
  AddIngredientPage,
  AddRecipePage,
  CookCompletePage,
  CookModePage,
  EditIngredientPage,
  EditRecipePage,
  HomePage,
  LoginPage,
  MemoriesPage,
  MyRecipesPage,
  PantryPage,
  RecipeDetailPage,
  SettingsPage,
  ShoppingPage,
  StatsPage,
  UsPage,
  UtensilsPage,
  LogPastDinnerPage,
} from "./pages";
import { useAppSelector } from "./store/hooks";

function AuthLayout() {
  const token = useAppSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/" replace />;
  return <Outlet />;
}

function TabLayout() {
  return (
    <div className="relative h-screen overflow-hidden">
      <TabScrollContainer>
        <Outlet />
      </TabScrollContainer>
      <TabBar />
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route element={<AuthLayout />}>
        <Route element={<TabLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/pantry" element={<PantryPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/us" element={<UsPage />} />
        </Route>

        <Route path="/ai" element={<AIGeneratePage />} />
        <Route path="/ai/results" element={<AIResultsPage />} />
        <Route path="/recipe/:id" element={<RecipeDetailPage />} />
        <Route path="/recipe/:id/edit" element={<EditRecipePage />} />
        <Route path="/cook/:id" element={<CookModePage />} />
        <Route path="/cook/:id/complete" element={<CookCompletePage />} />
        <Route path="/pantry/add" element={<AddIngredientPage />} />
        <Route path="/pantry/edit/:id" element={<EditIngredientPage />} />
        <Route path="/us/recipes" element={<MyRecipesPage />} />
        <Route path="/us/recipes/add" element={<AddRecipePage />} />
        <Route path="/us/utensils" element={<UtensilsPage />} />
        <Route path="/us/memories" element={<MemoriesPage />} />
        <Route path="/us/settings" element={<SettingsPage />} />
        <Route path="/us/log-past" element={<LogPastDinnerPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
