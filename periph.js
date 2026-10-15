// --- PERIPHERAL VISION (Sinnes-Test: Randsehen) ---
ARCADE.periph = { id: 'periph', name: 'PERIPHERAL VISION', icon: '👁️', color: 'cyan', tag: 'Sinnes-Test', sense: true, par: 900,
    desc: 'Schau auf das Kreuz in der Mitte. Am Rand blitzt kurz ein Punkt auf. Tippe danach dorthin, wo du ihn gesehen hast. 12 Versuche.', make: () => makePeriph() };

function makePeriph() {
    const TRIALS = 12, CX = AW / 2, CY = AH / 2;
    let n = 0, phase = 'intro', timer = 1.4, dot = null, tap = null, flashT = 0, msg = '';
    const start = () => {
        const ang = Math.random() * Math.PI * 2, r = 70 + Math.random() * 100;
        dot = { x: CX + Math.cos(ang) * r, y: CY + Math.sin(ang) * r * 1.15 };
        phase = 'flash'; flashT = Math.max(0.08, 0.26 - n * 0.014); tap = null;
    };
    return {
        pointer(x, y, type) {
            if (type !== 'down' || phase !== 'ask') return;
            const d = Math.hypot(x - dot.x, y - dot.y), pts = Math.round(100 * Math.exp(-d / 60));
            tap = { x, y }; arc.score += pts; msg = '+' + pts + ' (' + Math.round(d) + ' px daneben)'; phase = 'show'; timer = 1.1; n++;
            audio.playClick(pts > 60 ? 900 : 400);
        },
        update(dt) {
            timer -= dt;
            if (phase === 'intro' && timer <= 0) { phase = 'fix'; timer = 0.8 + Math.random() * 0.8; }
            else if (phase === 'fix' && timer <= 0) start();
            else if (phase === 'flash') { flashT -= dt; if (flashT <= 0) phase = 'ask'; }
            else if (phase === 'show' && timer <= 0) { if (n >= TRIALS) return arcEnd(); phase = 'fix'; timer = 0.8 + Math.random() * 0.8; }
        },
        draw(c) {
            arcClear(c);
            c.strokeStyle = '#e2e8f0'; c.lineWidth = 2; c.beginPath(); c.moveTo(CX - 10, CY); c.lineTo(CX + 10, CY); c.moveTo(CX, CY - 10); c.lineTo(CX, CY + 10); c.stroke(); c.lineWidth = 1;
            if (phase === 'flash') { c.fillStyle = '#facc15'; c.shadowColor = '#facc15'; c.shadowBlur = 14; c.beginPath(); c.arc(dot.x, dot.y, 9, 0, 7); c.fill(); c.shadowBlur = 0; }
            if (phase === 'show') {
                c.strokeStyle = '#64748b'; c.beginPath(); c.moveTo(dot.x, dot.y); c.lineTo(tap.x, tap.y); c.stroke();
                c.fillStyle = '#facc15'; c.beginPath(); c.arc(dot.x, dot.y, 7, 0, 7); c.fill(); c.fillStyle = '#06b6d4'; c.beginPath(); c.arc(tap.x, tap.y, 6, 0, 7); c.fill();
            }
            c.textAlign = 'center'; c.fillStyle = '#94a3b8'; c.font = '12px monospace';
            c.fillText(phase === 'intro' ? 'Blick auf das Kreuz halten!' : phase === 'ask' ? 'Wo war der Punkt? Tippen!' : msg, CX, AH - 28);
            c.fillText('Versuch ' + Math.min(n + (phase === 'show' ? 0 : 1), TRIALS) + '/' + TRIALS, CX, 24);
        }
    };
}
