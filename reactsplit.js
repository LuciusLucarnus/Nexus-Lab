// --- REACTION SPLIT (Sinnes-Test: Reaktion mit Ablenkung) ---
ARCADE.reactsplit = { id: 'reactsplit', name: 'REACTION SPLIT', icon: '🎛️', color: 'rose', tag: 'Sinnes-Test', sense: true, par: 800,
    desc: 'Der Bildschirm ist geteilt. Tippe die Seite mit dem grünen Signal, so schnell du kannst. Die rote Seite ist eine Falle. 10 Versuche.', make: () => makeReactSplit() };

function makeReactSplit() {
    const TRIALS = 10;
    let n = 0, phase = 'wait', timer = 0, side = 0, t0 = 0, msg = '', rts = [], clock = 0;
    const next = () => { phase = 'wait'; timer = 0.9 + Math.random() * 1.8; msg = ''; };
    next();
    const finishTrial = (pts, text) => { arc.score += pts; msg = text; phase = 'show'; timer = 0.9; n++; };
    return {
        pointer(x, y, type) {
            if (type !== 'down') return;
            if (phase === 'wait') return finishTrial(0, 'Zu früh!');
            if (phase !== 'go') return;
            const rt = Math.round(clock - t0), tapped = x < AW / 2 ? 0 : 1;
            if (tapped !== side) return finishTrial(0, 'Falsche Seite!');
            rts.push(rt); audio.playClick(900);
            finishTrial(Math.max(0, Math.min(100, Math.round((600 - rt) / 4))), rt + ' ms');
        },
        key(k) { if (k === 'ArrowLeft' || k === 'a') this.pointer(10, 0, 'down'); if (k === 'ArrowRight' || k === 'd') this.pointer(AW - 10, 0, 'down'); },
        update(dt) {
            clock += dt * 1000; timer -= dt;
            if (phase === 'wait' && timer <= 0) { phase = 'go'; side = Math.random() < 0.5 ? 0 : 1; t0 = clock; timer = 1.6; }
            else if (phase === 'go' && timer <= 0) finishTrial(0, 'Zu langsam!');
            else if (phase === 'show' && timer <= 0) { if (n >= TRIALS) return arcEnd(); next(); }
        },
        draw(c) {
            arcClear(c);
            c.strokeStyle = '#334155'; c.beginPath(); c.moveTo(AW / 2, 0); c.lineTo(AW / 2, AH); c.stroke();
            if (phase === 'go') {
                [0, 1].forEach(s => { c.fillStyle = s === side ? '#10b981' : '#f43f5e'; c.shadowColor = c.fillStyle; c.shadowBlur = 18; c.beginPath(); c.arc(AW / 4 + s * AW / 2, AH / 2, 42, 0, 7); c.fill(); c.shadowBlur = 0; });
            }
            c.textAlign = 'center'; c.fillStyle = '#e2e8f0'; c.font = 'bold 22px monospace'; c.fillText(msg, AW / 2, AH / 2 + 90);
            c.fillStyle = '#94a3b8'; c.font = '12px monospace';
            c.fillText(phase === 'wait' ? 'Warte auf das Signal …' : phase === 'go' ? '' : '', AW / 2, AH / 2 - 90);
            c.fillText('Versuch ' + Math.min(n + (phase === 'show' ? 0 : 1), TRIALS) + '/' + TRIALS, AW / 2, 24);
            if (rts.length) c.fillText('Ø ' + Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) + ' ms', AW / 2, AH - 16);
        }
    };
}
