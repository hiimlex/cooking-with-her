// Apply stored theme before React renders to avoid flash of unstyled content
(function applyStoredTheme() {
  const theme  = localStorage.getItem('cwh_theme')  ?? 'light';
  const accent = localStorage.getItem('cwh_accent') ?? '#7c3aed';
  const root   = document.documentElement;
  if (theme === 'dark') root.dataset.theme = 'dark';
  root.style.setProperty('--c-accent', accent);
  root.style.setProperty('--c-accent-em', accent);
}());

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./router";
import { store } from "./store";
import "./index.css";
import "./registerSW";
import { API_BASE } from '@/lib/http';

// Fire-and-forget: ping /health as soon as the app loads so the server wakes
// up while the user is still on the login screen (cold-start on free hosting).
(function warmUpServer() {
  fetch(`${API_BASE}/health`, { method: 'GET', cache: 'no-store' }).catch(() => {/* best-effort */});
}());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:     1,
      staleTime: 1000 * 60 * 5,   // 5 min — revalida em background mas serve do cache
      gcTime:    1000 * 60 * 60,  // 1 h  — mantém no cache ao navegar entre abas
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AppRouter />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
