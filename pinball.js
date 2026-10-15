// --- NEON PINBALL ---
ARCADE.pinball = { id: 'pinball', name: 'NEON PINBALL', icon: '📍', color: 'rose', tag: 'Physik', desc: 'Halte den Ball mit den Flippern im Spiel. Links/rechts auf den Bildschirm tippen (oder Pfeiltasten/A/D). Bumper geben Punkte.', make: () => makePinball() };

function makePinball() {
    const R = 7, GRAV = 620, E = 0.55;
    const pointers = new Map();
    const fl = [
        { px: 108, py: 430, len: 60, rest: 0.5, up: -0.5, a: 0.5, w: 0, dirn: 1 },
        { px: 252, py: 430, len: 60, rest: Math.PI - 0.5, up: Math.PI + 0.5, a: Math.PI - 0.5, w: 0, dirn: -1 }
    ];
    const bumpers = [{ x: 130, y: 160, r: 19, f: 0 }, { x: 230, y: 160, r: 19, f: 0 }, { x: 180, y: 240, r: 19, f: 0 }, { x: 80, y: 250, r: 13, f: 0 }, { x: 280, y: 250, r: 13, f: 0 }];
    const walls = [[10, 10, 350, 10], [10, 10, 10, 372], [350, 10, 350, 372], [10, 372, 90, 420], [350, 372, 270, 420], [10, 90, 60, 40], [350, 90, 300, 40]];
    let ball, balls = 3, combo = 0, comboT = 0, serveT = 0.8;
    const serve = () => { ball = { x: 150 + Math.random() * 60, y: 50, vx: (Math.random() * 2 - 1) * 80, vy: 60 }; serveT = 0.8; };
    serve();
    const setSide = (id, x) => pointers.set(id, x < AW / 2 ? 0 : 1);
    const onDown = e => { if (arc.id !== 'pinball' || arc.over) return; const r = arCv.getBoundingClientRect(); setSide(e.pointerId, (e.clientX - r.left) * AW / r.width); };
    const onUp = e => pointers.delete(e.pointerId);
    if (!window.__pinballBound) { window.__pinballBound = true; arCv.addEventListener('pointerdown', e => window.__pinDown && window.__pinDown(e)); ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => arCv.addEventListener(n, e => window.__pinUp && window.__pinUp(e))); }
    window.__pinDown = onDown; window.__pinUp = onUp;
    // Kollision Ball <-> Kapsel (Strecke a-b), vf = Oberflächengeschwindigkeit des Hindernisses
    function hitSeg(ax, ay, bx, by, cr, vfx, vfy, rest) {
        const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
        const u = Math.max(0, Math.min(1, ((ball.x - ax) * dx + (ball.y - ay) * dy) / l2));
        const cx = ax + dx * u, cy = ay + dy * u;
        let nx = ball.x - cx, ny = ball.y - cy, d = Math.hypot(nx, ny);
        if (d >= R + cr || d === 0) return false;
        nx /= d; ny /= d;
        ball.x = cx + nx * (R + cr); ball.y = cy + ny * (R + cr);
        const rvx = ball.vx - vfx, rvy = ball.vy - vfy, vn = rvx * nx + rvy * ny;
        if (vn < 0) { ball.vx -= (1 + rest) * vn * nx; ball.vy -= (1 + rest) * vn * ny; }
        return true;
    }
    return {
        update(dt) {
            const want = [arcL() || arcKeys.has(' ') || [...pointers.values()].includes(0), arcR() || arcKeys.has(' ') || [...pointers.values()].includes(1)];
            fl.forEach((f, i) => {
                const target = want[i] ? f.up : f.rest, old = f.a, step = 20 * dt;
                f.a += Math.max(-step, Math.min(step, target - f.a));
                f.w = (f.a - old) / dt;
                if (want[i] && old === f.rest && f.a !== old) audio.playClick(320);
            });
            comboT -= dt; if (comboT <= 0) combo = 0;
            bumpers.forEach(b => b.f = Math.max(0, b.f - dt * 4));
            if (serveT > 0) { serveT -= dt; return; }
            const N = 6, h = dt / N;
            for (let s = 0; s < N; s++) {
                ball.vy += GRAV * h; ball.x += ball.vx * h; ball.y += ball.vy * h;
                const sp = Math.hypot(ball.vx, ball.vy); if (sp > 900) { ball.vx *= 900 / sp; ball.vy *= 900 / sp; }
                walls.forEach(w => hitSeg(w[0], w[1], w[2], w[3], 2, 0, 0, E));
                fl.forEach(f => {
                    const tx = f.px + Math.cos(f.a) * f.len, ty = f.py + Math.sin(f.a) * f.len;
                    // Oberflächengeschwindigkeit am Auftreffpunkt: omega x r (r vom Drehpunkt)
                    const rx = ball.x - f.px, ry = ball.y - f.py;
                    hitSeg(f.px, f.py, tx, ty, 6, -f.w * ry, f.w * rx, 0.35);
                });
                for (const b of bumpers) {
                    const dx = ball.x - b.x, dy = ball.y - b.y, d = Math.hypot(dx, dy);
                    if (d < R + b.r && d > 0) {
                        const nx = dx / d, ny = dy / d; ball.x = b.x + nx * (R + b.r); ball.y = b.y + ny * (R + b.r);
                        const vn = ball.vx * nx + ball.vy * ny; if (vn < 0) { ball.vx -= 2 * vn * nx; ball.vy -= 2 * vn * ny; }
                        const kick = Math.hypot(ball.vx, ball.vy); if (kick < 330) { ball.vx = nx * 330; ball.vy = ny * 330; }
                        b.f = 1; combo++; comboT = 2.5; arc.score += 50 * Math.min(combo, 5); audio.playFreq(500 + combo * 40, 'square', 0.07);
                    }
                }
            }
            if (ball.y > AH + 12) { balls--; combo = 0; if (balls <= 0) return arcEnd(); serve(); }
        },
        draw(c) {
            arcClear(c);
            c.strokeStyle = '#a855f7'; c.lineWidth = 3; c.beginPath(); walls.forEach(w => { c.moveTo(w[0], w[1]); c.lineTo(w[2], w[3]); }); c.stroke();
            bumpers.forEach(b => {
                c.fillStyle = b.f > 0 ? '#fff' : '#f43f5e'; c.shadowColor = '#f43f5e'; c.shadowBlur = 8 + b.f * 16;
                c.beginPath(); c.arc(b.x, b.y, b.r, 0, 7); c.fill(); c.shadowBlur = 0;
                c.strokeStyle = '#0b1020'; c.lineWidth = 3; c.beginPath(); c.arc(b.x, b.y, b.r * 0.55, 0, 7); c.stroke();
            });
            c.lineCap = 'round'; c.strokeStyle = '#06b6d4'; c.lineWidth = 12;
            fl.forEach(f => { c.beginPath(); c.moveTo(f.px, f.py); c.lineTo(f.px + Math.cos(f.a) * f.len, f.py + Math.sin(f.a) * f.len); c.stroke(); });
            c.lineCap = 'butt'; c.lineWidth = 1;
            c.fillStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 8; c.beginPath(); c.arc(ball.x, ball.y, R, 0, 7); c.fill(); c.shadowBlur = 0;
            c.fillStyle = '#94a3b8'; c.font = '12px monospace'; c.textAlign = 'left'; c.fillText('● '.repeat(Math.max(0, balls)), 16, AH - 8);
            c.textAlign = 'right'; c.fillText(combo > 1 ? 'Combo x' + Math.min(combo, 5) : '', AW - 16, AH - 8);
        }
    };
}
