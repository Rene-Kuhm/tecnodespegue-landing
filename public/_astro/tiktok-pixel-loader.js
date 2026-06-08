/* tiktok-pixel-loader.js
 *
 * Bootstrap minimal del TikTok pixel + helpers de tracking.
 * Se carga diferido con `requestIdleCallback` para no bloquear el
 * critical render path. Se sirve como archivo externo para que
 * pueda ser hashed en el CSP y evitar 'unsafe-inline'.
 *
 * Requiere que el documentElement tenga data-tt-pixel="<pixel_id>".
 */
(function () {
  var loadTikTok = function () {
    var tiktokPixelId = document.documentElement.getAttribute('data-tt-pixel');
    if (!tiktokPixelId) return;
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = [
        'page', 'track', 'identify', 'instances', 'debug', 'on', 'off',
        'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
        'holdConsent', 'revokeConsent', 'grantConsent'
      ];
      ttq.setAndDefer = function (target, method) {
        target[method] = function () {
          target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.instance = function (id) {
        var instance = w[t]._i[id] || [];
        for (var j = 0; j < ttq.methods.length; j++) {
          ttq.setAndDefer(instance, ttq.methods[j]);
        }
        return instance;
      };
      ttq.load = function (id, opts) {
        var url = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[id] = [];
        ttq._i[id]._u = url;
        ttq._t = ttq._t || {};
        ttq._t[id] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[id] = opts || {};
        var script = d.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = url + '?sdkid=' + id + '&lib=' + t;
        var firstScript = d.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
      };
      ttq.load(tiktokPixelId);
      ttq.page();
    }(window, document, 'ttq');
  };

  // Event-id helper (no necesita el SDK)
  window.tdTikTokEventId = function () {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'td_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2);
  };

  // Track helper — funciona con o sin SDK cargado
  window.tdTrackTikTok = function (eventName, params, customer) {
    var eventId = (params && params.event_id) || window.tdTikTokEventId();
    var payload = Object.assign({
      content_type: 'product',
      content_id: 'tecnodespegue',
      content_name: document.title,
      value: 0,
      currency: 'USD',
      event_id: eventId
    }, params || {});

    if (window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track(eventName, payload, { event_id: eventId });
    }

    if (navigator.sendBeacon) {
      var body = JSON.stringify({ event: eventName, properties: payload, customer: customer || {} });
      navigator.sendBeacon('/api/tiktok-event', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/tiktok-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventName, properties: payload, customer: customer || {} }),
        keepalive: true
      }).catch(function () {});
    }
  };

  // Click delegation: cualquier click en [data-tiktok-event] trackea
  document.addEventListener('click', function (event) {
    var target = event.target instanceof Element
      ? event.target.closest('[data-tiktok-event]')
      : null;
    if (!target) return;

    var eventName = target.getAttribute('data-tiktok-event') || 'ClickButton';
    window.tdTrackTikTok(eventName, {
      content_name: target.getAttribute('data-tiktok-label') || (target.textContent && target.textContent.trim()) || document.title,
      url: target.getAttribute('href') || window.location.href
    });
  });

  // Defer SDK load + ViewContent fire
  var fireViewContent = function () {
    window.tdTrackTikTok('ViewContent', {
      content_name: document.title,
      url: window.location.href
    });
  };
  var schedule = function () {
    'requestIdleCallback' in window
      ? requestIdleCallback(function () { loadTikTok(); fireViewContent(); }, { timeout: 2500 })
      : setTimeout(function () { loadTikTok(); fireViewContent(); }, 1500);
  };
  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
})();
