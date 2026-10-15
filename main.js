function stopRecallAnim() { cancelAnimationFrame(state.recallAnim); }
function startPreview() {
    stopRecallAnim();
    const t0 = performance.now();
    const ctx = recallCanvas.getContext('2d');
    const loop = (now) => {
        ctx.clearRect(0, 0, recallCanvas.width, recallCanvas.height);
        if (state.guess && PREVIEW[state.mode]) renderRevealCanvas(ctx, now - t0, PREVIEW[state.mode](state.guess), recallCanvas.width, recallCanvas.height);
        state.recallAnim = requestAnimationFrame(loop);
    };
    state.recallAnim = requestAnimationFrame(loop);
}
document.getElementById('soundToggleBtn').onclick = () => { audio.enabled = !audio.enabled; document.getElementById('soundIcon').textContent = audio.enabled ? '🔊' : '🔇'; };
document.getElementById('dailyChallengeBtn').onclick = () => { const keys = Object.keys(MODES); launchGame(keys[Math.floor(Date.now() / 86400000) % keys.length]); };

// Initialize application on startup
window.onload = () => {
    renderHub();
};
