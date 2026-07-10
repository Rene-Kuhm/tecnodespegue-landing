/* plausible-loader.js
 *
 * Carga Plausible Analytics diferido con requestIdleCallback.
 * Self-contained: 200 bytes, served as external file so the CSP
 * doesn't need 'unsafe-inline' for analytics.
 */
(function () {
  var PLAUSIBLE_DOMAIN = document.documentElement.getAttribute('data-plausible-domain');
  if (!PLAUSIBLE_DOMAIN) return;

  // Plausible's official queue pattern: callers can record events immediately,
  // even before the remote script arrives. An existing test/consent wrapper wins.
  window.plausible = window.plausible || function () {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };

  var load = function () {
    var s = document.createElement('script');
    s.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
    s.src = 'https://plausible.io/js/script.js';
    s.defer = true;
    document.head.appendChild(s);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(load, { timeout: 1500 });
  } else {
    setTimeout(load, 0);
  }
})();
