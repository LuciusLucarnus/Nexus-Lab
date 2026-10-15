// --- ARCADE MINIGAMES ---
const AW = 360, AH = 480;
const ARCADE = {
    snake: { id: 'snake', name: 'NEON SNAKE', icon: '🐍', color: 'emerald', desc: 'Fress Punkte, wachse, berühre dich nicht selbst. Pfeiltasten/WASD oder wischen.', make: () => makeSnake() },
    breakout: { id: 'breakout', name: 'BRICK BREAKER', icon: '🧱', color: 'rose', desc: 'Zerstöre alle Steine. Maus/Finger bewegt den Schläger, Tippen startet den Ball.', make: () => makeBreakout() },
    dodge: { id: 'dodge', name: 'METEOR DODGE', icon: '☄️', color: 'amber', desc: 'Weiche den Meteoren aus. Je länger du überlebst, desto mehr Punkte.', make: () => makeDodge() },
    flap: { id: 'flap', name: 'FLAPPY NEXUS', icon: '🐦', color: 'cyan', desc: 'Tippe oder Leertaste zum Flattern. Fliege durch die Lücken.', make: () => makeFlap() },
    atom: { id: 'atom', name: 'ATOM LAB', icon: '⚛️', color: 'purple', desc: 'Greife und wirf Atome, spanne Netze, baue Kristalle. Mit Tempo, Kraft, Schwerkraft und Anzahl zum Einstellen.', custom: true, open: () => openAtom() },
    star: { id: 'star', name: 'STAR DEFENDER', icon: '🚀', color: 'indigo', tag: 'Shooter', desc: 'Fliege, schieße automatisch und halte die Gegner auf. Maus oder Finger bewegt das Schiff.', make: () => makeShooter() },
    stack: { id: 'stack', name: 'NEON STACK', icon: '🏗️', color: 'purple', tag: 'Timing', desc: 'Tippe im richtigen Moment und stapele den Turm so hoch wie möglich. Perfekte Treffer geben Bonus.', make: () => makeStack() },
    lanes: { id: 'lanes', name: 'LANE RUNNER', icon: '🏎️', color: 'amber', tag: 'Reaktion', desc: 'Wechsle die Spur, weiche Hindernissen aus und sammle Münzen. Tippe links oder rechts.', make: () => makeLanes() },
    echo: { id: 'echo', name: 'ECHO PADS', icon: '🎹', color: 'rose', tag: 'Gedächtnis', desc: 'Merke dir Farben und Töne und spiele die Reihenfolge nach. Jede Runde wird sie länger.', make: () => makeEcho() },
    reflex: { id: 'reflex', name: 'NEON TAP', icon: '⚡', color: 'cyan', tag: 'Reflex', desc: 'Triff die Kreise, bevor der Ring sie erreicht. Es wird immer schneller.', make: () => makeReflex() }
};
const arc = { g: null, id: null, raf: 0, last: 0, score: 0, over: false, best: {} };
try { arc.best = JSON.parse(localStorage.getItem('dn_arcade') || '{}'); } catch (e) {}
const arcKeys = new Set();
const arView = document.getElementById('arcadeView'), arCv = document.getElementById('arCanvas'), arCtx = arCv.getContext('2d');
const arcClear = c => { c.fillStyle = '#0b1020'; c.fillRect(0, 0, AW, AH); };
const arcL = () => arcKeys.has('ArrowLeft') || arcKeys.has('a'), arcR = () => arcKeys.has('ArrowRight') || arcKeys.has('d');
function arcEnd() {
    arc.over = true;
    setTimeout(() => { try { Rank.render(); } catch (e) {} }, 0);
    if (arc.score > (arc.best[arc.id] || 0)) { arc.best[arc.id] = arc.score; try { localStorage.setItem('dn_arcade', JSON.stringify(arc.best)); } catch (e) {} }
}
function launchArcade(id) {
    if (ARCADE[id].custom) return ARCADE[id].open();
    arc.id = id; arc.g = ARCADE[id].make(); arc.score = 0; arc.over = false; arc.last = performance.now();
    document.getElementById('arTitle').textContent = ARCADE[id].icon + ' ' + ARCADE[id].name;
    arView.style.display = 'flex';
    if (!music.started) music.start();
    cancelAnimationFrame(arc.raf); arc.raf = requestAnimationFrame(arcLoop);
}
function closeArcade() { cancelAnimationFrame(arc.raf); arView.style.display = 'none'; renderHub(); }
function arcLoop(now) {
    const dt = Math.min(0.05, (now - arc.last) / 1000); arc.last = now;
    if (!arc.over) arc.g.update(dt);
    arc.g.draw(arCtx);
    if (arc.over) {
        arCtx.fillStyle = 'rgba(5,7,13,0.75)'; arCtx.fillRect(0, 0, AW, AH);
        arCtx.fillStyle = '#fff'; arCtx.textAlign = 'center'; arCtx.font = 'bold 30px monospace';
        arCtx.fillText('GAME OVER', AW / 2, AH / 2 - 20);
        arCtx.font = '16px monospace'; arCtx.fillStyle = '#10b981'; arCtx.fillText('Score ' + arc.score, AW / 2, AH / 2 + 10);
        arCtx.fillStyle = '#94a3b8'; arCtx.fillText('Tippen / Enter = Neustart', AW / 2, AH / 2 + 45);
    }
    document.getElementById('arScore').textContent = arc.score;
    document.getElementById('arBest').textContent = Math.max(arc.score, arc.best[arc.id] || 0);
    arc.raf = requestAnimationFrame(arcLoop);
}
const arcPt = e => { const r = arCv.getBoundingClientRect(); return [(e.clientX - r.left) * AW / r.width, (e.clientY - r.top) * AH / r.height]; };
arCv.addEventListener('pointerdown', e => { e.preventDefault(); if (arc.over) return launchArcade(arc.id); arc.g.pointer && arc.g.pointer(...arcPt(e), 'down'); });
arCv.addEventListener('pointermove', e => { if (!arc.over && e.buttons && arc.g.pointer) arc.g.pointer(...arcPt(e), 'move'); });
document.getElementById('arClose').onclick = closeArcade;
document.addEventListener('keyup', e => arcKeys.delete(e.key));
document.addEventListener('keydown', e => {
    if (arView.style.display !== 'flex') return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    if (e.key === 'Escape') return closeArcade();
    arcKeys.add(e.key);
    if (arc.over) { if (e.key === 'Enter' || e.key === ' ') launchArcade(arc.id); return; }
    arc.g.key && arc.g.key(e.key);
});
function renderArcadeCards(only) {
    Object.values(ARCADE).filter(a => !only || (only === 'sense') === !!a.sense).forEach(a => {
        const card = document.createElement('div');
        card.className = 'glass-card p-5 rounded-2xl flex flex-col justify-between cursor-pointer group relative overflow-hidden';
        card.onclick = () => launchArcade(a.id);
        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-${a.color}-500/20 border border-${a.color}-500/30 flex items-center justify-center text-lg">${a.icon}</div>
                    <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border ${a.sense ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}">${a.sense ? '🧪' : '🕹️'} ${a.tag || 'Arcade'}</span>
                </div>
                <h3 class="font-mono font-bold text-base text-white mb-1 group-hover:text-purple-400 transition">${a.name}</h3>
                <p class="text-xs text-slate-400 leading-relaxed mb-4">${a.desc}</p>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono">
                <span class="text-slate-500">${a.custom ? (a.tag || 'Sandbox') : 'Best: <b class="text-emerald-400">' + (arc.best[a.id] || 0) + '</b>'}</span>
                <span class="text-purple-400">Spielen →</span>
            </div>`;
        gamesGrid.appendChild(card);
    });
}
