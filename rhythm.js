// --- RHYTHM MEMORY (Rhythmus anhören, nachklopfen) ---
MODES.rhythm = { id: 'rhythm', name: 'RHYTHM MEMORY (Klopf-Rhythmus)', category: 'nexus', axis: 'Zeitgefühl', icon: '🪘', color: 'amber',
    desc: 'Du hörst 5 Schläge in einem unregelmäßigen Rhythmus. Klopfe ihn danach aus dem Gedächtnis nach, gewertet werden die Abstände.' };
MUSIC_QUIET_MODES.push('rhythm');
EXT.rhythm = {
    target() { const gaps = Array.from({ length: 4 }, () => 200 + Math.round(Math.random() * 40) * 10); return { gaps }; },
    revealMs: t => 400 + t.gaps.reduce((a, b) => a + b, 0) + 900,
    onReveal(t) { let off = 0.3; audio.clickAt(off, 900); t.gaps.forEach(g => { off += g / 1000; audio.clickAt(off, 900); }); },
    reveal(ctx, el, t, w, h) {
        let at = 300; const hits = [at]; t.gaps.forEach(g => { at += g; hits.push(at); });
        let flash = 0; hits.forEach(x => { if (el >= x && el - x < 260) flash = Math.max(flash, 1 - (el - x) / 260); });
        ctx.fillStyle = `rgba(245,158,11,${0.15 + flash * 0.7})`; ctx.beginPath(); ctx.arc(w / 2, h / 2, 40 + flash * 22, 0, 7); ctx.fill();
        hits.forEach((x, i) => { ctx.fillStyle = el >= x ? '#f59e0b' : '#334155'; ctx.beginPath(); ctx.arc(w / 2 - 80 + i * 40, h * 0.82, 7, 0, 7); ctx.fill(); });
        ctx.fillStyle = '#94a3b8'; ctx.font = '12px monospace'; ctx.textAlign = 'center'; ctx.fillText('Rhythmus merken', w / 2, h * 0.14);
    },
    recall(ctx) {
        const N = 5; let taps = [], pulse = 0, raf;
        state.guess = { gaps: [] };
        const info = () => { document.getElementById('rhyInfo').textContent = `Schläge ${taps.length}/${N}`; };
        controlsContainer.innerHTML = `<div class="flex items-center justify-between font-mono text-xs text-slate-300"><span id="rhyInfo"></span><button id="rhyReset" class="px-3 py-1.5 bg-slate-800 rounded-lg text-amber-300 border border-amber-500/30">↺ Neu</button></div>`;
        info();
        const draw = () => {
            const W = recallCanvas.width, H = recallCanvas.height; ctx.clearRect(0, 0, W, H);
            pulse = Math.max(0, pulse - 0.06);
            ctx.fillStyle = `rgba(245,158,11,${0.15 + pulse * 0.6})`; ctx.beginPath(); ctx.arc(W / 2, H / 2, 46 + pulse * 20, 0, 7); ctx.fill();
            ctx.fillStyle = '#94a3b8'; ctx.font = '12px monospace'; ctx.textAlign = 'center'; ctx.fillText('Tippe den Rhythmus (Pad antippen)', W / 2, H * 0.14);
            for (let i = 0; i < N; i++) { ctx.fillStyle = i < taps.length ? '#f59e0b' : '#334155'; ctx.beginPath(); ctx.arc(W / 2 - 80 + i * 40, H * 0.84, 7, 0, 7); ctx.fill(); }
            raf = requestAnimationFrame(draw); state.recallAnim = raf;
        };
        draw();
        recallCanvas.onpointerdown = e => {
            e.preventDefault();
            if (taps.length >= N) return;
            taps.push(performance.now()); pulse = 1; audio.playClick(900);
            state.guess.gaps = taps.slice(1).map((t, i) => Math.round(t - taps[i])); info();
        };
        document.getElementById('rhyReset').onclick = () => { taps = []; state.guess.gaps = []; info(); };
    },
    score(t, g) {
        const err = t.gaps.map((x, i) => g.gaps[i] === undefined ? x : Math.abs(g.gaps[i] - x));
        return 10 * Math.exp(-(err.reduce((a, b) => a + b, 0) / err.length) / 160);
    },
    avg: (a, b) => ({ gaps: a.gaps.map((x, i) => b.gaps[i] === undefined ? x : Math.round((x + b.gaps[i]) / 2)) }),
    fmt: v => v.gaps && v.gaps.length ? v.gaps.join('·') + ' ms' : '–'
};
