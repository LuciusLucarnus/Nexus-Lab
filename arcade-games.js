function makeSnake() {
    const C = 18, R = 24, S = 20;
    let body = [{ x: 9, y: 12 }, { x: 8, y: 12 }, { x: 7, y: 12 }], dir = { x: 1, y: 0 }, nd = { x: 1, y: 0 }, food, acc = 0, step = 0.13, sx = 0, sy = 0;
    const place = () => { do { food = { x: Math.floor(Math.random() * C), y: Math.floor(Math.random() * R) }; } while (body.some(b => b.x === food.x && b.y === food.y)); };
    const setDir = (x, y) => { if (x === -dir.x && y === -dir.y) return; nd = { x, y }; };
    place();
    return {
        key(k) { const m = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] }[k]; if (m) setDir(...m); },
        pointer(x, y, t) {
            if (t === 'down') { sx = x; sy = y; return; }
            const dx = x - sx, dy = y - sy;
            if (Math.max(Math.abs(dx), Math.abs(dy)) > 22) { Math.abs(dx) > Math.abs(dy) ? setDir(Math.sign(dx), 0) : setDir(0, Math.sign(dy)); sx = x; sy = y; }
        },
        update(dt) {
            acc += dt;
            while (acc >= step) {
                acc -= step; dir = nd;
                const h = { x: body[0].x + dir.x, y: body[0].y + dir.y };
                if (h.x < 0 || h.y < 0 || h.x >= C || h.y >= R || body.some(b => b.x === h.x && b.y === h.y)) return arcEnd();
                body.unshift(h);
                if (h.x === food.x && h.y === food.y) { arc.score += 10; step = Math.max(0.06, step - 0.003); place(); } else body.pop();
            }
        },
        draw(c) {
            arcClear(c);
            c.fillStyle = '#f43f5e'; c.beginPath(); c.arc(food.x * S + 10, food.y * S + 10, 7, 0, 7); c.fill();
            body.forEach((b, i) => { c.fillStyle = i ? '#10b981' : '#6ee7b7'; c.fillRect(b.x * S + 1, b.y * S + 1, S - 2, S - 2); });
        }
    };
}

function makeBreakout() {
    let px = AW / 2, pw = 70, lives = 3, level = 1, ball, bricks;
    const reset = () => { ball = { x: px, y: AH - 44, vx: 150 * (Math.random() < 0.5 ? -1 : 1), vy: -240 - level * 15, stuck: true }; };
    const build = () => { bricks = []; for (let r = 0; r < 5; r++) for (let k = 0; k < 7; k++) bricks.push({ x: 10 + k * 48, y: 50 + r * 22, w: 44, h: 18, r }); };
    build(); reset();
    return {
        pointer(x, y, t) { px = x; if (t === 'down') ball.stuck = false; },
        key(k) { if (k === ' ' || k === 'ArrowUp') ball.stuck = false; },
        update(dt) {
            if (arcL()) px -= 320 * dt; if (arcR()) px += 320 * dt;
            px = Math.max(pw / 2, Math.min(AW - pw / 2, px));
            if (ball.stuck) { ball.x = px; ball.y = AH - 44; return; }
            ball.x += ball.vx * dt; ball.y += ball.vy * dt;
            if (ball.x < 8) { ball.x = 8; ball.vx = Math.abs(ball.vx); }
            if (ball.x > AW - 8) { ball.x = AW - 8; ball.vx = -Math.abs(ball.vx); }
            if (ball.y < 8) { ball.y = 8; ball.vy = Math.abs(ball.vy); }
            if (ball.vy > 0 && ball.y > AH - 48 && ball.y < AH - 28 && Math.abs(ball.x - px) < pw / 2 + 6) { ball.vy = -Math.abs(ball.vy); ball.vx = (ball.x - px) / (pw / 2) * 260; }
            for (const b of bricks) {
                if (ball.x > b.x - 6 && ball.x < b.x + b.w + 6 && ball.y > b.y - 6 && ball.y < b.y + b.h + 6) { b.dead = true; ball.vy = -ball.vy; arc.score += 10 * (5 - b.r); break; }
            }
            bricks = bricks.filter(b => !b.dead);
            if (!bricks.length) { level++; build(); reset(); }
            if (ball.y > AH + 10) { lives--; if (lives <= 0) return arcEnd(); reset(); }
        },
        draw(c) {
            arcClear(c);
            bricks.forEach(b => { c.fillStyle = `hsl(${340 - b.r * 45},80%,60%)`; c.fillRect(b.x, b.y, b.w, b.h); });
            c.fillStyle = '#06b6d4'; c.fillRect(px - pw / 2, AH - 36, pw, 10);
            c.fillStyle = '#fff'; c.beginPath(); c.arc(ball.x, ball.y, 6, 0, 7); c.fill();
            c.fillStyle = '#94a3b8'; c.font = '12px monospace'; c.textAlign = 'left'; c.fillText('♥'.repeat(lives) + '  Level ' + level, 10, AH - 8);
            if (ball.stuck) { c.textAlign = 'center'; c.fillText('Tippen / Leertaste = Start', AW / 2, AH / 2 + 60); }
        }
    };
}

function makeDodge() {
    let px = AW / 2, rocks = [], t = 0, spawn = 0;
    return {
        pointer(x) { px = x; },
        update(dt) {
            t += dt; arc.score = Math.floor(t * 10);
            if (arcL()) px -= 300 * dt; if (arcR()) px += 300 * dt;
            px = Math.max(14, Math.min(AW - 14, px));
            spawn -= dt;
            if (spawn <= 0) { spawn = Math.max(0.18, 0.7 - t * 0.01); rocks.push({ x: Math.random() * AW, y: -20, r: 10 + Math.random() * 14, v: 120 + Math.random() * 90 + t * 4 }); }
            for (const r of rocks) { r.y += r.v * dt; if (Math.hypot(r.x - px, r.y - (AH - 50)) < r.r + 10) return arcEnd(); }
            rocks = rocks.filter(r => r.y < AH + 30);
        },
        draw(c) {
            arcClear(c);
            rocks.forEach(r => { c.fillStyle = '#94a3b8'; c.beginPath(); c.arc(r.x, r.y, r.r, 0, 7); c.fill(); c.fillStyle = '#64748b'; c.beginPath(); c.arc(r.x - r.r / 3, r.y - r.r / 3, r.r / 3, 0, 7); c.fill(); });
            c.fillStyle = '#06b6d4'; c.beginPath(); c.moveTo(px, AH - 66); c.lineTo(px - 13, AH - 38); c.lineTo(px + 13, AH - 38); c.closePath(); c.fill();
        }
    };
}

function makeFlap() {
    let y = AH / 2, v = 0, started = false, pipes = [];
    const flap = () => { v = -300; started = true; };
    const mk = x => ({ x, gap: 150, top: 80 + Math.random() * (AH - 310), passed: false });
    pipes = [mk(AW + 60), mk(AW + 250)];
    return {
        pointer(x, yy, t) { if (t === 'down') flap(); },
        key(k) { if (k === ' ' || k === 'ArrowUp' || k === 'w') flap(); },
        update(dt) {
            if (!started) return;
            v += 900 * dt; y += v * dt;
            for (const p of pipes) {
                p.x -= 120 * dt;
                if (!p.passed && p.x + 50 < 68) { p.passed = true; arc.score++; }
                if (92 > p.x && 68 < p.x + 50 && (y - 12 < p.top || y + 12 > p.top + p.gap)) return arcEnd();
            }
            if (pipes[0].x < -60) { pipes.shift(); pipes.push(mk(pipes[pipes.length - 1].x + 190)); }
            if (y > AH - 12 || y < -20) arcEnd();
        },
        draw(c) {
            arcClear(c);
            pipes.forEach(p => { c.fillStyle = '#10b981'; c.fillRect(p.x, 0, 50, p.top); c.fillRect(p.x, p.top + p.gap, 50, AH); });
            c.fillStyle = '#facc15'; c.beginPath(); c.arc(80, y, 12, 0, 7); c.fill();
            c.fillStyle = '#0b1020'; c.beginPath(); c.arc(84, y - 3, 2.5, 0, 7); c.fill();
            if (!started) { c.fillStyle = '#94a3b8'; c.font = '14px monospace'; c.textAlign = 'center'; c.fillText('Tippen zum Start', AW / 2, AH / 2 + 50); }
        }
    };
}


function makeShooter() {
    let px = AW / 2, bullets = [], foes = [], parts = [], t = 0, fire = 0, spawn = 0.5, lives = 3, inv = 0;
    return {
        pointer(x) { px = x; },
        update(dt) {
            t += dt; inv -= dt;
            if (arcL()) px -= 320 * dt; if (arcR()) px += 320 * dt;
            px = Math.max(16, Math.min(AW - 16, px));
            fire -= dt; if (fire <= 0) { fire = 0.26; bullets.push({ x: px, y: AH - 62 }); }
            spawn -= dt;
            if (spawn <= 0) { spawn = Math.max(0.35, 1 - t * 0.012); foes.push({ x: 20 + Math.random() * (AW - 40), y: -20, v: 60 + Math.random() * 50 + t * 1.5, ph: Math.random() * 6 }); }
            bullets.forEach(b => b.y -= 480 * dt);
            for (const f of foes) {
                f.y += f.v * dt; f.x += Math.sin(t * 2 + f.ph) * 40 * dt;
                if (f.y > AH) { f.dead = true; lives--; }
                else if (inv <= 0 && Math.hypot(f.x - px, f.y - (AH - 50)) < 24) { f.dead = true; lives--; inv = 1; }
                else for (const b of bullets) if (!b.dead && Math.abs(b.x - f.x) < 16 && Math.abs(b.y - f.y) < 16) {
                    b.dead = f.dead = true; arc.score += 10;
                    for (let i = 0; i < 8; i++) parts.push({ x: f.x, y: f.y, vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.5) * 220, l: 0.5 });
                    break;
                }
            }
            foes = foes.filter(f => !f.dead); bullets = bullets.filter(b => !b.dead && b.y > -10);
            parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; }); parts = parts.filter(p => p.l > 0);
            if (lives <= 0) arcEnd();
        },
        draw(c) {
            arcClear(c);
            foes.forEach(f => { c.fillStyle = '#f43f5e'; c.beginPath(); c.moveTo(f.x, f.y + 14); c.lineTo(f.x - 14, f.y - 10); c.lineTo(f.x + 14, f.y - 10); c.closePath(); c.fill(); });
            c.fillStyle = '#fde047'; bullets.forEach(b => c.fillRect(b.x - 2, b.y - 8, 4, 12));
            parts.forEach(p => { c.fillStyle = `rgba(251,191,36,${p.l * 2})`; c.fillRect(p.x, p.y, 3, 3); });
            if (inv <= 0 || Math.floor(t * 12) % 2) { c.fillStyle = '#06b6d4'; c.beginPath(); c.moveTo(px, AH - 72); c.lineTo(px - 14, AH - 42); c.lineTo(px + 14, AH - 42); c.closePath(); c.fill(); }
            c.fillStyle = '#94a3b8'; c.font = '12px monospace'; c.textAlign = 'left'; c.fillText('♥'.repeat(Math.max(0, lives)), 10, 18);
        }
    };
}

function makeStack() {
    const bh = 22; let blocks = [{ x: 80, w: 200 }], cur, cam = 0, sp = 130;
    const spawnCur = () => { const top = blocks[blocks.length - 1], left = blocks.length % 2 === 1; cur = { x: left ? 0 : AW - top.w, w: top.w, dir: left ? 1 : -1 }; };
    const drop = () => {
        const top = blocks[blocks.length - 1], l = Math.max(cur.x, top.x), r = Math.min(cur.x + cur.w, top.x + top.w);
        if (r - l <= 2) return arcEnd();
        const perfect = Math.abs(cur.x - top.x) < 5;
        blocks.push(perfect ? { x: top.x, w: top.w } : { x: l, w: r - l });
        arc.score += perfect ? 3 : 1; sp = Math.min(380, 130 + blocks.length * 6); spawnCur();
    };
    spawnCur();
    return {
        pointer(x, y, t) { if (t === 'down') drop(); },
        key(k) { if (k === ' ' || k === 'ArrowDown' || k === 'Enter') drop(); },
        update(dt) {
            cur.x += cur.dir * sp * dt;
            if (cur.x < 0) { cur.x = 0; cur.dir = 1; } if (cur.x + cur.w > AW) { cur.x = AW - cur.w; cur.dir = -1; }
            cam += (Math.max(0, (blocks.length - 10) * bh) - cam) * Math.min(1, dt * 5);
        },
        draw(c) {
            arcClear(c);
            blocks.forEach((b, i) => { c.fillStyle = `hsl(${(i * 14 + 190) % 360},80%,60%)`; c.fillRect(b.x, AH - 40 - i * bh + cam, b.w, bh - 2); });
            c.fillStyle = `hsl(${(blocks.length * 14 + 190) % 360},90%,70%)`; c.fillRect(cur.x, AH - 40 - blocks.length * bh + cam, cur.w, bh - 2);
        }
    };
}

function makeLanes() {
    const LX = [90, 180, 270]; let lane = 1, px = 180, obs = [], coins = [], t = 0, spawn = 0.5, sp = 200, off = 0, bonus = 0;
    const move = d => { lane = Math.max(0, Math.min(2, lane + d)); };
    return {
        pointer(x, y, tp) { if (tp === 'down') move(x < AW / 2 ? -1 : 1); },
        key(k) { if (k === 'ArrowLeft' || k === 'a') move(-1); if (k === 'ArrowRight' || k === 'd') move(1); },
        update(dt) {
            t += dt; sp = 200 + t * 6; off = (off + sp * dt) % 40; px += (LX[lane] - px) * Math.min(1, dt * 14);
            arc.score = Math.floor(t * 5) + bonus * 10; spawn -= dt;
            if (spawn <= 0) {
                spawn = Math.max(0.35, 0.9 - t * 0.01); const free = Math.floor(Math.random() * 3);
                for (let i = 0; i < 3; i++) if (i !== free && Math.random() < 0.65) obs.push({ l: i, y: -30 });
                if (Math.random() < 0.6) coins.push({ l: free, y: -70 });
            }
            obs.forEach(o => o.y += sp * dt); coins.forEach(c => c.y += sp * dt);
            for (const o of obs) if (o.l === lane && Math.abs(o.y - (AH - 70)) < 30) return arcEnd();
            for (const c of coins) if (c.l === lane && Math.abs(c.y - (AH - 70)) < 28) { c.got = true; bonus++; }
            obs = obs.filter(o => o.y < AH + 40); coins = coins.filter(c => !c.got && c.y < AH + 40);
        },
        draw(c) {
            arcClear(c);
            c.strokeStyle = '#334155'; c.lineWidth = 3; c.setLineDash([20, 20]); c.lineDashOffset = -off;
            [135, 225].forEach(x => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, AH); c.stroke(); }); c.setLineDash([]);
            obs.forEach(o => { c.fillStyle = '#f43f5e'; c.fillRect(LX[o.l] - 26, o.y - 22, 52, 44); });
            coins.forEach(k => { c.fillStyle = '#facc15'; c.beginPath(); c.arc(LX[k.l], k.y, 10, 0, 7); c.fill(); });
            c.fillStyle = '#06b6d4'; c.fillRect(px - 22, AH - 92, 44, 44);
        }
    };
}

function makeEcho() {
    const F = [261.63, 329.63, 392, 523.25], COL = ['#ef4444', '#22c55e', '#3b82f6', '#facc15'];
    let seq = [], mode = 'wait', idx = 0, timer = 0.8, lit = -1, litT = 0, pi = 0;
    const beep = i => {
        audio.init(); const c = audio.ctx; if (!c) return;
        const o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime;
        o.type = 'square'; o.frequency.value = F[i];
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
        o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + 0.32);
    };
    const light = i => { lit = i; litT = 0.3; beep(i); };
    const next = () => { seq.push(Math.floor(Math.random() * 4)); mode = 'show'; idx = 0; timer = 0.7; pi = 0; };
    const press = i => {
        if (mode !== 'input') return;
        light(i);
        if (i !== seq[pi]) return arcEnd();
        pi++;
        if (pi >= seq.length) { arc.score = seq.length; mode = 'wait'; timer = 0.8; }
    };
    next();
    return {
        pointer(x, y, tp) {
            if (tp !== 'down') return;
            const c = Math.floor((x - 30) / 160), r = Math.floor((y - 100) / 160);
            if (c < 0 || c > 1 || r < 0 || r > 1 || (x - 30) % 160 > 150 || (y - 100) % 160 > 150) return;
            press(r * 2 + c);
        },
        key(k) { if (k >= '1' && k <= '4') press(parseInt(k) - 1); },
        update(dt) {
            if (litT > 0) { litT -= dt; if (litT <= 0) lit = -1; }
            timer -= dt;
            if (mode === 'wait' && timer <= 0) next();
            else if (mode === 'show' && timer <= 0) {
                if (idx < seq.length) { light(seq[idx]); idx++; timer = Math.max(0.28, 0.55 - seq.length * 0.02); } else { mode = 'input'; pi = 0; }
            }
        },
        draw(c) {
            arcClear(c);
            for (let i = 0; i < 4; i++) { c.globalAlpha = lit === i ? 1 : 0.3; c.fillStyle = COL[i]; c.fillRect(30 + (i % 2) * 160, 100 + (i >> 1) * 160, 150, 150); }
            c.globalAlpha = 1; c.fillStyle = '#94a3b8'; c.font = '14px monospace'; c.textAlign = 'center';
            c.fillText(mode === 'input' ? 'Du bist dran!' : mode === 'show' ? 'Merk dir die Reihenfolge…' : 'Richtig!', AW / 2, 70);
            c.fillText('Runde ' + seq.length, AW / 2, AH - 40);
        }
    };
}

function makeReflex() {
    let ts = [], parts = [], spawn = 0.4, lives = 3;
    const life = () => Math.max(0.6, 1.5 - arc.score / 400);
    return {
        pointer(x, y, tp) {
            if (tp !== 'down') return;
            for (const o of ts) if (Math.hypot(o.x - x, o.y - y) < 36) {
                o.dead = true; arc.score += 10 + Math.round((1 - o.t / o.life) * 10);
                for (let i = 0; i < 8; i++) parts.push({ x: o.x, y: o.y, vx: (Math.random() - 0.5) * 240, vy: (Math.random() - 0.5) * 240, l: 0.4 });
                break;
            }
        },
        update(dt) {
            spawn -= dt;
            if (spawn <= 0 && ts.length < 3) { spawn = Math.max(0.35, 0.9 - arc.score / 800); ts.push({ x: 40 + Math.random() * (AW - 80), y: 60 + Math.random() * (AH - 120), t: 0, life: life() }); }
            for (const o of ts) { o.t += dt; if (o.t >= o.life && !o.dead) { o.dead = true; lives--; } }
            ts = ts.filter(o => !o.dead);
            parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; }); parts = parts.filter(p => p.l > 0);
            if (lives <= 0) arcEnd();
        },
        draw(c) {
            arcClear(c);
            ts.forEach(o => { const k = 1 - o.t / o.life; c.fillStyle = '#06b6d4'; c.beginPath(); c.arc(o.x, o.y, 26, 0, 7); c.fill(); c.strokeStyle = '#f0abfc'; c.lineWidth = 3; c.beginPath(); c.arc(o.x, o.y, 26 + k * 40, 0, 7); c.stroke(); });
            parts.forEach(p => { c.fillStyle = `rgba(103,232,249,${p.l * 2.5})`; c.fillRect(p.x, p.y, 3, 3); });
            c.fillStyle = '#94a3b8'; c.font = '12px monospace'; c.textAlign = 'left'; c.fillText('♥'.repeat(Math.max(0, lives)), 10, 18);
        }
    };
}
