// --- ODD ONE OUT (Sinnes-Test: Farbunterschied erkennen) ---
ARCADE.odd = { id: 'odd', name: 'ODD ONE OUT', icon: '🔍', color: 'amber', tag: 'Sinnes-Test', sense: true, par: 200,
    desc: 'Ein Kreis hat einen minimal anderen Farbton. Finde ihn. 45 Sekunden, Fehler kosten 4 Sekunden, das Feld wird größer und der Unterschied kleiner.', make: () => makeOdd() };

function makeOdd() {
    let level = 0, time = 45, cells = [], size = 2, hue = 0, flash = 0, flashOk = true;
    const build = () => {
        size = Math.min(7, 2 + Math.floor((level + 1) / 2)); hue = Math.floor(Math.random() * 360);
        const diff = Math.max(2.2, 20 * Math.pow(0.9, level)), l = 50 + Math.random() * 10, odd = Math.floor(Math.random() * size * size), sgn = Math.random() < 0.5 ? 1 : -1;
        cells = Array.from({ length: size * size }, (_, i) => ({ col: `hsl(${hue},62%,${i === odd ? l + sgn * diff : l}%)`, odd: i === odd }));
    };
    build();
    const geom = i => { const gap = 8, pad = 24, s = (AW - pad * 2 - gap * (size - 1)) / size; return { x: pad + (i % size) * (s + gap), y: 90 + Math.floor(i / size) * (s + gap), s }; };
    return {
        pointer(px, py, type) {
            if (type !== 'down') return;
            for (let i = 0; i < cells.length; i++) {
                const g = geom(i);
                if (px >= g.x && px < g.x + g.s && py >= g.y && py < g.y + g.s) {
                    if (cells[i].odd) { level++; arc.score += 10; audio.playClick(900); flashOk = true; flash = 0.15; build(); }
                    else { time -= 4; audio.playClick(250); flashOk = false; flash = 0.3; }
                    return;
                }
            }
        },
        update(dt) { time -= dt; flash = Math.max(0, flash - dt); if (time <= 0) { time = 0; arcEnd(); } },
        draw(c) {
            arcClear(c);
            cells.forEach((cell, i) => { const g = geom(i); c.fillStyle = cell.col; c.beginPath(); c.arc(g.x + g.s / 2, g.y + g.s / 2, g.s / 2, 0, 7); c.fill(); });
            c.fillStyle = '#334155'; c.fillRect(24, 50, AW - 48, 8); c.fillStyle = time < 10 ? '#f43f5e' : '#f59e0b'; c.fillRect(24, 50, (AW - 48) * Math.max(0, time) / 45, 8);
            c.textAlign = 'center'; c.fillStyle = '#94a3b8'; c.font = '12px monospace'; c.fillText(Math.ceil(time) + ' s · Level ' + (level + 1), AW / 2, 36);
            if (flash > 0) { c.fillStyle = flashOk ? `rgba(16,185,129,${flash})` : `rgba(244,63,94,${flash * 1.5})`; c.fillRect(0, 0, AW, AH); }
        }
    };
}
