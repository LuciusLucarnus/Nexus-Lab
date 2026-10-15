// --- GESAMTRANG (Nexus-Level aus allen Highscores) ---
// Jedes Spiel gibt 0-100 Rangpunkte. Engine-Spiele: Score/50. Arcade: Bestwert im Verhältnis zum "par"-Wert (= 100 Punkte).
const PAR = { snake: 300, breakout: 1500, dodge: 600, flap: 30, star: 500, stack: 40, lanes: 400, echo: 15, reflex: 600, pong: 800, gravity: 1500, orbit: 200, pinball: 3000 };
const RANK_TITLES = [[0, 'Neuling 🐣'], [0.05, 'Beobachter 👀'], [0.15, 'Scharfes Auge 🎯'], [0.3, 'Adlerauge 🦅'], [0.5, 'Quanten-Sinn 🧠'], [0.7, 'Nexus-Meister 👑']];
const AXES = ['Visuell', 'Auditiv', 'Zeitgefühl', 'Räumlich', 'Kognitiv'];
const Rank = {
    scored() { return Object.values(ARCADE).filter(a => !a.custom); },
    gamePoints(id, isArcade) {
        if (!isArcade) return Math.min(100, (state.highScores[id] || 0) / 50 * 100);
        const a = ARCADE[id]; return Math.min(100, (arc.best[id] || 0) / (a.par || PAR[id] || 300) * 100);
    },
    info() {
        let pts = 0, max = 0, played = 0, total = 0;
        Object.values(MODES).forEach(m => { const p = this.gamePoints(m.id, false); pts += p; max += 100; total++; if (p > 0) played++; });
        this.scored().forEach(a => { const p = this.gamePoints(a.id, true); pts += p; max += 100; total++; if (p > 0) played++; });
        pts = Math.round(pts);
        const level = 1 + Math.floor(Math.sqrt(pts / 8)), from = 8 * (level - 1) * (level - 1), to = 8 * level * level;
        let title = RANK_TITLES[0][1]; RANK_TITLES.forEach(([th, t]) => { if (pts / max >= th) title = t; });
        return { pts, max, level, title, progress: (pts - from) / (to - from), toNext: to - pts, played, total };
    },
    axisValues() {
        return AXES.map(ax => { const ms = Object.values(MODES).filter(m => m.axis === ax); return ms.length ? Math.min(1, ms.reduce((s, m) => s + (state.highScores[m.id] || 0), 0) / (ms.length * 50)) : 0; });
    },
    render() {
        const el = document.getElementById('rankCard'); if (!el) return;
        const r = this.info();
        el.innerHTML = `
            <div class="glass-panel rounded-2xl border border-slate-800 p-4 flex items-center gap-4">
                <div class="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-600 to-rose-500 flex flex-col items-center justify-center font-mono text-white leading-none">
                    <span class="text-[9px] opacity-80">LVL</span><span class="text-xl font-black">${r.level}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2 text-xs font-mono">
                        <span class="font-bold text-white truncate">${r.title}</span>
                        <span class="text-slate-400 shrink-0">${r.pts} / ${r.max} Pkt.</span>
                    </div>
                    <div class="h-2 rounded-full bg-slate-800 mt-2 overflow-hidden"><div class="h-full bg-gradient-to-r from-cyan-500 to-purple-500" style="width:${Math.round(r.progress * 100)}%"></div></div>
                    <div class="text-[10px] font-mono text-slate-500 mt-1.5">${r.played}/${r.total} Spiele gespielt · noch ${r.toNext} Pkt. bis Level ${r.level + 1}</div>
                </div>
                <button id="rankShareBtn" class="shrink-0 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white border border-slate-700" title="Profil-Karte teilen">🖼️</button>
            </div>`;
        document.getElementById('rankShareBtn').onclick = () => Share.profileCard();
        const hc = document.getElementById('heroCount'); if (hc) hc.textContent = Object.keys(MODES).length + this.scored().filter(a => a.sense).length;
    }
};
