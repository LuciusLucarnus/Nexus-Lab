// Service Worker: immer frische Version holen (beim Start und wenn die App wieder in den Vordergrund kommt).
if ('serviceWorker' in navigator) {
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController || reloaded) return;
        reloaded = true;
        const hub = document.getElementById('hubView');
        if (hub && !hub.classList.contains('hidden') && document.getElementById('arcadeView').style.display !== 'flex') location.reload();
        else window.__reloadOnHub = true; // mitten im Spiel: erst beim Zurück zum Hub neu laden
    });
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
        reg.update().catch(() => {});
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    }).catch(() => {}));
}
