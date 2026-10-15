// --- GRAVITY SWITCH (Schwerkraft umdrehen) ---
ARCADE.gravity = { id: 'gravity', name: 'GRAVITY SWITCH', icon: '🔀', color: 'purple', tag: 'Reaktion', desc: 'Du rennst automatisch. Tippen (oder Leertaste) dreht die Schwerkraft: Boden oder Decke. Weiche den Blöcken aus.', make: () => makeGravity() };

function makeGravity() {
    const TOP = 70, BOT = AH - 70, S = 22, PX = 80, G = 2300;
    let y = BOT - S, vy = 0, g = 1, t = 0, dist = 0, speed = 190, obs = [], nextX = AW + 60, trail = [];
    const flip = () => { g = -g; audio.playClick(g > 0 ? 500 : 750); };
    const addObs = () => {
        const w = 26 + Math.random() * 26, h = 48 + Math.random() * 62;
        obs.push({ x: nextX, w, h, ceil: Math.random() < 0.5 });
        nextX += w + 170 + Math.random() * 130 + speed * 0.3;
    };
    return {
        pointer(x, y2, type) { if (type === 'down') flip(); },
        key(k) { if (k === ' ' || k === 'ArrowUp' || k === 'ArrowDown') flip(); },
        update(dt) {
            t += dt; speed = Math.min(430, 190 + t * 4.5); dist += speed * dt; arc.score = Math.floor(dist / 10);
            vy += g * G * dt; y += vy * dt;
            if (y >= BOT - S) { y = BOT - S; vy = 0; }
            if (y <= TOP) { y = TOP; vy = 0; }
            trail.push({ x: PX + S / 2, y: y + S / 2 }); if (trail.length > 10) trail.shift();
            trail.forEach(p => p.x -= speed * dt);
            while (nextX < AW + 200) addObs();
            for (const o of obs) {
                o.x -= speed * dt;
                const oy = o.ceil ? TOP : BOT - o.h;
                if (PX + S - 3 > o.x && PX + 3 < o.x + o.w && y + S - 3 > oy && y + 3 < oy + o.h) return arcEnd();
            }
            nextX -= speed * dt;
            obs = obs.filter(o => o.x + o.w > -10);
        },
        draw(c) {
            arcClear(c);
            c.strokeStyle = '#1b2438'; c.lineWidth = 1;
            for (let x = -(dist % 40); x < AW; x += 40) { c.beginPath(); c.moveTo(x, TOP); c.lineTo(x, BOT); c.stroke(); }
            c.strokeStyle = '#a855f7'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, TOP); c.lineTo(AW, TOP); c.moveTo(0, BOT); c.lineTo(AW, BOT); c.stroke(); c.lineWidth = 1;
            obs.forEach(o => { c.fillStyle = '#f43f5e'; c.fillRect(o.x, o.ceil ? TOP : BOT - o.h, o.w, o.h); });
            trail.forEach((p, i) => { c.fillStyle = `rgba(6,182,212,${i / 25})`; c.fillRect(p.x - 5, p.y - 5, 10, 10); });
            c.fillStyle = '#06b6d4'; c.shadowColor = '#06b6d4'; c.shadowBlur = 12; c.fillRect(PX, y, S, S); c.shadowBlur = 0;
            c.fillStyle = '#94a3b8'; c.font = '12px monospace'; c.textAlign = 'center';
            if (t < 3) c.fillText('Tippen = Schwerkraft drehen', AW / 2, AH / 2);
        }
    };
}
