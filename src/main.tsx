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

// Fire-and-forget: ping /health as soon as the app loads so the server wakes
// up while the user is still on the login screen (cold-start on free hosting).
(function warmUpServer() {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';
  fetch(`${base}/health`, { method: 'GET', cache: 'no-store' }).catch(() => {/* best-effort */});
}());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
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
