if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => {
        if (import.meta.env.DEV) console.warn('[SW] Registration failed:', err);
      });
  });
}
