// --- FLASH (Farb-Muster merken) ---
MODES.flash = { id: 'flash', name: 'FLASH (Farb-Muster)', category: 'nexus', axis: 'Kognitiv', icon: '✨', color: 'cyan',
    desc: 'Ein 4x4-Feld blitzt kurz in drei Farben auf. Baue das Muster nach: Feld antippen wechselt die Farbe.' };
{
    const COL = ['#06b6d4', '#f43f5e', '#facc15'], LET = ['C', 'R', 'Y'], G = 4;
    const gridPos = (w, h, i) => { const s = Math.min(w, h) - 12, c = s / G, ox = (w - s) / 2, oy = (h - s) / 2; return [ox + (i % G) * c, oy + Math.floor(i / G) * c, c]; };
    EXT.flash = {
        target() { const idx = []; while (idx.length < 5) { const r = Math.floor(Math.random() * 16); if (!idx.includes(r)) idx.push(r); } return { cells: idx.map(i => [i, 1 + Math.floor(Math.random() * 3)]) }; },
        revealMs: () => state.proMode ? 1200 : 2000,
        reveal(ctx, el, t, w, h) {
            const lit = new Map(t.cells);
            for (let i = 0; i < 16; i++) { const [x, y, c] = gridPos(w, h, i); ctx.fillStyle = lit.has(i) ? COL[lit.get(i) - 1] : '#0e1320'; ctx.strokeStyle = '#1b2438'; ctx.fillRect(x + 3, y + 3, c - 6, c - 6); ctx.strokeRect(x + 3, y + 3, c - 6, c - 6); }
        },
        recall(ctx) {
            const cells = new Array(16).fill(0);
            const sync = () => { state.guess = { cells: cells.map((c, i) => [i, c]).filter(x => x[1] > 0) }; };
            sync();
            controlsContainer.innerHTML = '<div class="text-center font-mono text-xs text-cyan-400">Antippen = Farbe wechseln (Cyan, Rot, Gelb, leer). 5 Felder wurden gezeigt.</div>';
            const draw = () => {
                const w = recallCanvas.width, h = recallCanvas.height; ctx.clearRect(0, 0, w, h);
                for (let i = 0; i < 16; i++) { const [x, y, c] = gridPos(w, h, i); ctx.fillStyle = cells[i] ? COL[cells[i] - 1] : '#0e1320'; ctx.strokeStyle = '#1b2438'; ctx.fillRect(x + 3, y + 3, c - 6, c - 6); ctx.strokeRect(x + 3, y + 3, c - 6, c - 6); }
            };
            draw();
            recallCanvas.onclick = e => {
                const r = recallCanvas.getBoundingClientRect(), w = recallCanvas.width, h = recallCanvas.height;
                const px = (e.clientX - r.left) * w / r.width, py = (e.clientY - r.top) * h / r.height;
                for (let i = 0; i < 16; i++) { const [x, y, c] = gridPos(w, h, i); if (px >= x && px < x + c && py >= y && py < y + c) { cells[i] = (cells[i] + 1) % 4; break; } }
                sync(); draw(); audio.playClick(600);
            };
        },
        score(t, g) {
            const mine = new Map(g.cells); let pts = 0, extra = 0;
            t.cells.forEach(([i, c]) => { if (mine.get(i) === c) pts += 1; else if (mine.has(i)) pts += 0.4; });
            const tset = new Map(t.cells); g.cells.forEach(([i]) => { if (!tset.has(i)) extra++; });
            return Math.max(0, (pts - extra * 0.5) / t.cells.length) * 10;
        },
        avg(a, b) { const m = new Map(a.cells); b.cells.forEach(([i, c]) => { if (!m.has(i)) m.set(i, c); }); return { cells: [...m.entries()] }; },
        fmt: v => v.cells && v.cells.length ? v.cells.slice().sort((a, b) => a[0] - b[0]).map(([i, c]) => (i + 1) + LET[c - 1]).join(' ') : '–'
    };
}
