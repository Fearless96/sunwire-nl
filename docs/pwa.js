// SunWire NL 2.10.0 – web app: offline + updates
(function () {
  var CURRENT = "2.10.0";
  var cb = null, reg = null, told = '';
  function cmp(a, b) { a = String(a).split('.').map(Number); b = String(b).split('.').map(Number); for (var i = 0; i < 3; i++) { if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) < (b[i] || 0) ? -1 : 1; } return 0; }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127.0.0.1)$/.test(location.hostname))) {
    navigator.serviceWorker.register('sw.js').then(function (r) { reg = r; }).catch(function () {});
    var reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () { if (window.__swUpdating && !reloading) { reloading = true; location.reload(); } });
  }
  function check() {
    return fetch('web-version.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (m) {
        var info = { current: CURRENT, latest: String(m.version || CURRENT), message: String(m.message || '').slice(0, 500), notes: Array.isArray(m.notes) ? m.notes.slice(0, 20).map(String) : [] };
        if (cmp(CURRENT, info.latest) >= 0) { info.status = 'none'; return info; }
        info.status = m.force === true ? 'forced' : 'available'; info.forced = m.force === true; info.url = 'web';
        return info;
      })
      .catch(function (e) { return { status: 'error', current: CURRENT, message: navigator.onLine === false ? 'You are offline – connect to the internet to check for updates.' : 'Could not check for updates: ' + e.message }; });
  }
  function install() {
    window.__swUpdating = true;
    if (cb) cb({ type: 'installing' });
    if (!reg) { setTimeout(function () { location.reload(); }, 600); return Promise.resolve({ ok: true }); }
    return reg.update().then(function () {
      var w = reg.waiting || reg.installing;
      if (w) { w.postMessage('SKIP_WAITING'); setTimeout(function () { location.reload(); }, 4000); }
      else setTimeout(function () { location.reload(); }, 600);
      return { ok: true };
    }).catch(function (e) { window.__swUpdating = false; return { ok: false, message: e.message }; });
  }
  function poll() {
    check().then(function (i) {
      if (!cb) return;
      if (i.status === 'forced') cb({ type: 'forced', info: i });
      else if (i.status === 'available' && told !== i.latest) { told = i.latest; cb({ type: 'available', info: i }); }
    });
  }
  window.sunwireWebUpdate = {
    info: function () { return Promise.resolve({ current: CURRENT, configured: true, repo: 'web' }); },
    check: check, install: install,
    onEvent: function (f) { cb = f; setTimeout(poll, 8000); setInterval(poll, 15 * 60000); }
  };
})();
