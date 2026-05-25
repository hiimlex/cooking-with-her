if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL;
    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base })
      .catch((err) => {
        if (import.meta.env.DEV) console.warn('[SW] Registration failed:', err);
      });
  });
}
