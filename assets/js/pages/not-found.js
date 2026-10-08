(() => {
  'use strict';
  const previous = document.getElementById('previous-page');
  if (!previous) return;
  // A real href remains a useful Home fallback without scripts or browser history.
  const canGoBack = () => typeof window.navigation?.canGoBack === 'boolean'
    ? window.navigation.canGoBack
    : window.history.length > 1 && Boolean(document.referrer);
  previous.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (!canGoBack()) return;
    event.preventDefault();
    window.history.back();
  });
})();
