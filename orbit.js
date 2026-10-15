// --- ORBIT (Planeten-Sprünge) ---
ARCADE.orbit = { id: 'orbit', name: 'ORBIT', icon: '🪐', color: 'indigo', tag: 'Timing', desc: 'Du kreist um einen Planeten. Tippen löst dich, und du fliegst geradeaus zum nächsten. Verpasst du ihn, bist du weg.', make: () => makeOrbit() };

function makeOrbit() {
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    let cam = 0, planets = [], cur, dir = 1, a = -Math.PI / 2, rad = 56, flying = false, vx = 0, vy = 0, from = null, cool = 0, trail = [], t = 0;
    const stars = Array.from({ length: 40 }, () => ({ x: Math.random() * AW, y: Math.random() * AH, s: Math.random() * 1.5 + 0.4 }));
    const mk = y => ({ x: 55 + Math.random() * (AW - 110), y, r: 20 + Math.random() * 10, orb: 50 + Math.random() * 14, hue: Math.floor(Math.random() * 360), seen: false });
    planets.push(Object.assign(mk(AH * 0.7), { x: AW / 2, r: 24, orb: 56, seen: true }));
    cur = planets[0]; let lastY = cur.y;
    const fill = () => { while (lastY > cam - 220) { lastY -= 115 + Math.random() * 75; planets.push(mk(lastY)); } };
    let bx = 0, by = 0;
    const place = () => { bx = cur.x + Math.cos(a) * rad; by = cur.y + Math.sin(a) * rad; };
    fill(); place();
    const release = () => {
        if (flying) return;
        const sp = 270; vx = -Math.sin(a) * dir * sp; vy = Math.cos(a) * dir * sp;
        flying = true; from = cur; cool = 0.3; audio.playClick(900);
    };
    return {
        dbg: () => ({ planets, cur, bx, by, a, dir, flying }),
        pointer(x, y2, type) { if (type === 'down') release(); },
        key(k) { if (k === ' ' || k === 'ArrowUp') release(); },
        update(dt) {
            t += dt;
            const spin = Math.min(5.8, 3.1 + arc.score * 0.0035);
            if (!flying) {
                a += dir * spin * dt; rad += (cur.orb - rad) * Math.min(1, dt * 6); place();
            } else {
                cool -= dt; bx += vx * dt; by += vy * dt;
                for (const p of planets) {
                    if (p === from && cool > 0) continue;
                    const d = Math.hypot(bx - p.x, by - p.y);
                    if (d <= p.r + 2) return arcEnd();
                    if (d < p.orb + 10) {
                        cur = p; a = Math.atan2(by - p.y, bx - p.x); rad = d; flying = false;
                        dir = (-Math.sin(a) * vx + Math.cos(a) * vy) >= 0 ? 1 : -1;
                        if (!p.seen) { p.seen = true; arc.score += 10; audio.playSuccess(); }
                        break;
                    }
                }
                if (bx < -60 || bx > AW + 60 || by - cam > AH + 40) return arcEnd();
            }
            trail.push({ x: bx, y: by }); if (trail.length > 14) trail.shift();
            cam += (Math.min(cam, cur.y - AH * 0.68) - cam) * Math.min(1, dt * 4);
            fill(); planets = planets.filter(p => p.y - cam < AH + 140);
        },
        draw(c) {
            arcClear(c);
            stars.forEach(s => { c.fillStyle = 'rgba(200,210,255,0.5)'; c.fillRect(s.x, (s.y - cam * 0.2 * s.s + AH * 50) % AH, s.s, s.s); });
            planets.forEach(p => {
                const y = p.y - cam;
                c.strokeStyle = p === cur ? 'rgba(6,182,212,0.6)' : 'rgba(148,163,184,0.2)'; c.setLineDash([4, 6]);
                c.beginPath(); c.arc(p.x, y, p.orb, 0, 7); c.stroke(); c.setLineDash([]);
                c.fillStyle = `hsl(${p.hue},65%,55%)`; c.beginPath(); c.arc(p.x, y, p.r, 0, 7); c.fill();
            });
            trail.forEach((p, i) => { c.fillStyle = `rgba(255,255,255,${i / 30})`; c.beginPath(); c.arc(p.x, p.y - cam, 2 + i / 6, 0, 7); c.fill(); });
            c.fillStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 10; c.beginPath(); c.arc(bx, by - cam, 5, 0, 7); c.fill(); c.shadowBlur = 0;
            if (t < 4) { c.fillStyle = '#94a3b8'; c.font = '12px monospace'; c.textAlign = 'center'; c.fillText('Tippen = loslassen', AW / 2, AH - 20); }
        }
    };
}
