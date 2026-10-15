// --- NEON PONG (gegen KI, hochkant) ---
ARCADE.pong = { id: 'pong', name: 'NEON PONG', icon: '🏓', color: 'cyan', tag: 'Duell', desc: 'Schlage die KI. Je länger der Ballwechsel, desto schneller wird der Ball. Maus/Finger oder Pfeiltasten bewegen den Schläger.', make: () => makePong() };

function makePong() {
    const PW = 64, PH = 8, YP = AH - 34, YA = 34, R = 6;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    let px = AW / 2, ax = AW / 2, lives = 3, rally = 0, aiSpeed = 125, serveT = 0.9, t = 0, ball;
    const serve = dir => { ball = { x: AW / 2, y: AH / 2, vx: (Math.random() * 2 - 1) * 110, vy: 190 * dir }; serveT = 0.9; };
    serve(1);
    return {
        pointer(x) { px = x; },
        update(dt) {
            t += dt;
            if (arcL()) px -= 340 * dt; if (arcR()) px += 340 * dt;
            px = clamp(px, PW / 2, AW - PW / 2);
            if (serveT > 0) { serveT -= dt; ax += (AW / 2 - ax) * Math.min(1, dt * 4); return; }
            const aim = ball.vy < 0 ? ball.x + Math.sin(t * 1.7) * 18 : AW / 2;
            ax = clamp(ax + clamp(aim - ax, -aiSpeed * dt, aiSpeed * dt), PW / 2, AW - PW / 2);
            ball.x += ball.vx * dt; ball.y += ball.vy * dt;
            if (ball.x < R) { ball.x = R; ball.vx = Math.abs(ball.vx); }
            if (ball.x > AW - R) { ball.x = AW - R; ball.vx = -Math.abs(ball.vx); }
            if (ball.vy > 0 && ball.y + R >= YP && ball.y + R <= YP + PH + 12 && Math.abs(ball.x - px) < PW / 2 + R) {
                ball.vy = -Math.min(520, Math.abs(ball.vy) * 1.05); ball.vx = (ball.x - px) / (PW / 2) * 240;
                rally++; arc.score += 10; audio.playFreq(380 + Math.min(rally, 12) * 25, 'triangle', 0.08);
            }
            if (ball.vy < 0 && ball.y - R <= YA + PH && ball.y - R >= YA - 12 && Math.abs(ball.x - ax) < PW / 2 + R) {
                ball.vy = Math.min(520, Math.abs(ball.vy) * 1.03); ball.vx = (ball.x - ax) / (PW / 2) * 240;
                audio.playFreq(300, 'triangle', 0.06);
            }
            if (ball.y < -12) { arc.score += 50 + rally * 5; aiSpeed = Math.min(310, aiSpeed + 14); rally = 0; audio.playSuccess(); serve(1); }
            else if (ball.y > AH + 12) { lives--; rally = 0; if (lives <= 0) return arcEnd(); serve(-1); }
        },
        draw(c) {
            arcClear(c);
            c.strokeStyle = '#1b2438'; c.setLineDash([8, 8]); c.beginPath(); c.moveTo(0, AH / 2); c.lineTo(AW, AH / 2); c.stroke(); c.setLineDash([]);
            c.fillStyle = '#f43f5e'; c.fillRect(ax - PW / 2, YA, PW, PH);
            c.fillStyle = '#06b6d4'; c.fillRect(px - PW / 2, YP, PW, PH);
            c.fillStyle = '#fff'; c.beginPath(); c.arc(ball.x, ball.y, R, 0, 7); c.fill();
            c.fillStyle = '#94a3b8'; c.font = '12px monospace'; c.textAlign = 'left'; c.fillText('♥'.repeat(Math.max(0, lives)), 10, AH - 8);
            c.textAlign = 'right'; c.fillText('Wechsel ' + rally, AW - 10, AH - 8);
        }
    };
}
