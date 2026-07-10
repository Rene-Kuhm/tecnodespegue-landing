/* TikTok pixel bootstrap.
 *
 * The SDK is intentionally kept out of the critical rendering path. It starts
 * after a real four-second delay or on the first meaningful interaction. The
 * state lives on window so repeated Astro lifecycle events cannot install
 * duplicate SDK scripts, timers, or delegated click handlers.
 */
(function () {
  var SDK_DELAY_MS = 4000;
  var INTERACTION_EVENTS = ['pointerdown', 'keydown'];
  var state = window.__tdTikTokLoaderState = window.__tdTikTokLoaderState || {
    sdkRequested: false,
    timerId: null,
    interactionBound: false,
    clickBound: false,
    lifecycleBound: false,
    firedPages: Object.create(null)
  };

  var pageKey = function () {
    return window.location.pathname + window.location.search;
  };

  var loadTikTok = function () {
    var tiktokPixelId = document.documentElement.getAttribute('data-tt-pixel');
    if (!tiktokPixelId) return false;
    if (state.sdkRequested) return true;

    state.sdkRequested = true;
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
        if (d.querySelector('script[data-td-tiktok-sdk]')) return;
        var script = d.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.dataset.tdTiktokSdk = 'true';
        script.src = url + '?sdkid=' + id + '&lib=' + t;
        var firstScript = d.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
      };
      ttq.load(tiktokPixelId);
    }(window, document, 'ttq');
    return true;
  };

  window.tdTikTokEventId = window.tdTikTokEventId || function () {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'td_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2);
  };

  window.tdTrackTikTok = window.tdTrackTikTok || function (eventName, params, customer) {
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

  var removeInteractionListeners = function () {
    if (!state.interactionBound) return;
    INTERACTION_EVENTS.forEach(function (eventName) {
      window.removeEventListener(eventName, activate);
    });
    state.interactionBound = false;
  };

  var activate = function () {
    if (state.timerId !== null) {
      clearTimeout(state.timerId);
      state.timerId = null;
    }
    removeInteractionListeners();

    var key = pageKey();
    if (state.firedPages[key] || !loadTikTok()) return;
    state.firedPages[key] = true;
    window.ttq.page();
    window.tdTrackTikTok('ViewContent', {
      content_name: document.title,
      url: window.location.href
    });
  };

  var schedule = function () {
    if (state.firedPages[pageKey()]) return;
    if (state.timerId !== null) clearTimeout(state.timerId);

    if (!state.interactionBound) {
      INTERACTION_EVENTS.forEach(function (eventName) {
        window.addEventListener(eventName, activate, { passive: true });
      });
      state.interactionBound = true;
    }
    state.timerId = setTimeout(activate, SDK_DELAY_MS);
  };

  if (!state.clickBound) {
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
    state.clickBound = true;
  }

  if (!state.lifecycleBound) {
    document.addEventListener('astro:page-load', schedule);
    state.lifecycleBound = true;
  }

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
})();
