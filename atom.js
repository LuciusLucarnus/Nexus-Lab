// --- ATOM LAB ---
const atomView = document.getElementById('atomView'), atomCv = document.getElementById('atomCanvas'), atomCtx = atomCv.getContext('2d');
const atomS = { atoms: [], rings: [], W: 0, H: 0, raf: 0, last: 0, t: 0, bonds: true, mode: 'gas', grav: false, speed: 1, force: 1, links: [], lastBlip: 0, P: { x: 0, y: 0, vx: 0, vy: 0, in: false, down: false, grab: null, t: 0, mt: 0 } };
function atomMake(x, y) {
    const r = 4 + Math.random() * 5;
    return { x, y, vx: (Math.random() - 0.5) * 80, vy: (Math.random() - 0.5) * 80, r, h: 190 + (r - 4) * 28, e: Math.max(1, Math.round((r - 3) / 2)),
             ph: Math.random() * 6.28, tilt: Math.random() * 3.14, spin: (Math.random() - 0.5) * 1.2, dir: Math.random() < 0.5 ? 1 : -1 };
}
function atomResize() {
    const d = Math.min(2, window.devicePixelRatio || 1);
    atomS.W = window.innerWidth; atomS.H = window.innerHeight;
    atomCv.width = atomS.W * d; atomCv.height = atomS.H * d;
    atomCtx.setTransform(d, 0, 0, d, 0, 0);
    atomCtx.fillStyle = '#05070d'; atomCtx.fillRect(0, 0, atomS.W, atomS.H);
}
function atomSeed(n) { for (let i = 0; i < n; i++) atomS.atoms.push(atomMake(Math.random() * atomS.W, Math.random() * atomS.H)); }
function atomBlip(r) {
    const now = performance.now();
    if (now - atomS.lastBlip < 80 || !audio.enabled || !audio.ctx) return;
    atomS.lastBlip = now;
    const c = audio.ctx, o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime, sc = [0, 2, 4, 7, 9];
    const k = Math.floor(r * 3);
    o.type = 'sine'; o.frequency.value = 261.63 * Math.pow(2, (sc[k % 5] + 12 * (k % 2)) / 12);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.035, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + 0.4);
}
function openAtom() {
    audio.init();
    atomView.style.display = 'block';
    atomResize();
    if (!atomS.atoms.length) atomSeed(atomS.W < 600 ? 50 : 90);
    document.getElementById('atomCount').value = atomS.atoms.length; document.getElementById('atomCountV').textContent = atomS.atoms.length;
    atomS.last = performance.now();
    cancelAnimationFrame(atomS.raf); atomS.raf = requestAnimationFrame(atomLoop);
}
function closeAtom() { cancelAnimationFrame(atomS.raf); atomView.style.display = 'none'; }
function atomLoop(now) {
    const dt = Math.min(0.033, (now - atomS.last) / 1000) * atomS.speed; atomS.last = now; atomS.t += dt;
    atomStep(dt); atomDraw();
    atomS.raf = requestAnimationFrame(atomLoop);
}
function atomStep(dt) {
    const { atoms: A, P, W, H } = atomS, R = 150, F = atomS.force, gas = atomS.mode === 'gas';
    atomS.bondList = [];
    for (let i = 0; i < A.length; i++) {
        const a = A[i];
        if (P.in && !P.grab) {
            const dx = a.x - P.x, dy = a.y - P.y, d = Math.hypot(dx, dy);
            if (d < R && d > 0.1) {
                const k = (1 - d / R) * F;
                if (P.down) { a.vx += (-dx / d * 620 - dy / d * 420) * k * dt; a.vy += (-dy / d * 620 + dx / d * 420) * k * dt; }
                else { a.vx += dx / d * 900 * k * k * dt + P.vx * 2 * k * dt; a.vy += dy / d * 900 * k * k * dt + P.vy * 2 * k * dt; }
            }
        }
        for (let j = i + 1; j < A.length; j++) {
            const b = A[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
            if (d2 > 12100 || d2 < 0.01) continue;
            const d = Math.sqrt(d2), ux = dx / d, uy = dy / d, rest = (gas ? 52 : 26) + (a.r + b.r) * 1.5;
            const f = d < rest ? (rest - d) / rest * 260 : (gas ? -(d - rest) / (110 - rest) * 18 : 0);
            a.vx -= ux * f * dt; a.vy -= uy * f * dt; b.vx += ux * f * dt; b.vy += uy * f * dt;
            if (gas) atomS.bondList.push(a, b, 1 - d / 110);
            if (d < a.r + b.r + 10 && Math.hypot(a.vx - b.vx, a.vy - b.vy) > 150 && atomS.rings.length < 40) {
                atomS.rings.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, r: 6, life: 1, h: a.h });
                atomBlip(a.r);
            }
        }
    }
    if (atomS.mode === 'net') {
        atomS.links = atomS.links.filter(l => {
            const [a, b, rest] = l, dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01;
            if (d > rest * 3.2) { atomS.rings.length < 40 && atomS.rings.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, r: 4, life: 1, h: 330 }); atomBlip(a.r); return false; }
            const f = Math.max(-400, Math.min(400, (d - rest) * 60 * F));
            a.vx += dx / d * f * dt; a.vy += dy / d * f * dt; b.vx -= dx / d * f * dt; b.vy -= dy / d * f * dt;
            return true;
        });
    }
    if (atomS.mode === 'crystal') for (const a of A) { a.vx += (a.hx - a.x) * 40 * F * dt; a.vy += (a.hy - a.y) * 40 * F * dt; }
    if (atomS.grav) for (const a of A) a.vy += 300 * dt;
    if (P.grab) { P.grab.vx = (P.x - P.grab.x) * 14; P.grab.vy = (P.y - P.grab.y) * 14; }
    const damp = Math.pow(atomS.grav ? 0.65 : (gas ? 0.4 : atomS.mode === 'net' ? 0.3 : 0.12), dt), jig = gas ? 30 : 4;
    for (const a of A) {
        a.vx = (a.vx + (Math.random() - 0.5) * jig * dt) * damp; a.vy = (a.vy + (Math.random() - 0.5) * jig * dt) * damp;
        const sp = Math.hypot(a.vx, a.vy); if (sp > 480) { a.vx *= 480 / sp; a.vy *= 480 / sp; }
        a.x += a.vx * dt; a.y += a.vy * dt; a.tilt += a.spin * dt;
        if (a.x < 10) { a.x = 10; a.vx = Math.abs(a.vx) * 0.8; } if (a.x > W - 10) { a.x = W - 10; a.vx = -Math.abs(a.vx) * 0.8; }
        if (a.y < 10) { a.y = 10; a.vy = Math.abs(a.vy) * 0.8; } if (a.y > H - 10) { a.y = H - 10; a.vy = -Math.abs(a.vy) * 0.8; }
    }
    for (const r of atomS.rings) { r.r += 160 * dt; r.life -= dt * 1.6; }
    atomS.rings = atomS.rings.filter(r => r.life > 0);
    P.vx *= 0.85; P.vy *= 0.85;
}
function atomDraw() {
    const c = atomCtx, { atoms: A, W, H, t } = atomS;
    c.globalCompositeOperation = 'source-over'; c.fillStyle = 'rgba(5,7,13,0.2)'; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    if (atomS.bonds) { c.lineWidth = 1; const bl = atomS.bondList; for (let i = 0; i < bl.length; i += 3) { c.strokeStyle = `rgba(120,190,255,${bl[i + 2] * 0.35})`; c.beginPath(); c.moveTo(bl[i].x, bl[i].y); c.lineTo(bl[i + 1].x, bl[i + 1].y); c.stroke(); } }
    if (atomS.mode !== 'gas') for (const l of atomS.links) {
        const d = Math.hypot(l[1].x - l[0].x, l[1].y - l[0].y), st = Math.min(1, Math.abs(d - l[2]) / l[2]);
        c.strokeStyle = `hsla(${190 + st * 140},100%,70%,${0.3 + st * 0.5})`; c.lineWidth = atomS.mode === 'net' ? 1.6 : 1;
        c.beginPath(); c.moveTo(l[0].x, l[0].y); c.lineTo(l[1].x, l[1].y); c.stroke();
    }
    c.lineWidth = 2;
    for (const r of atomS.rings) { c.strokeStyle = `hsla(${r.h},100%,70%,${r.life * 0.5})`; c.beginPath(); c.arc(r.x, r.y, r.r, 0, 6.283); c.stroke(); }
    if (atomS.P.in) { const g = c.createRadialGradient(atomS.P.x, atomS.P.y, 0, atomS.P.x, atomS.P.y, 150); g.addColorStop(0, atomS.P.down ? 'rgba(168,85,247,0.18)' : 'rgba(6,182,212,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(atomS.P.x, atomS.P.y, 150, 0, 6.283); c.fill(); }
    for (const a of A) {
        const g = c.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.r * 3.2);
        g.addColorStop(0, `hsla(${a.h},100%,75%,0.95)`); g.addColorStop(0.35, `hsla(${a.h},100%,60%,0.5)`); g.addColorStop(1, `hsla(${a.h},100%,50%,0)`);
        c.fillStyle = g; c.beginPath(); c.arc(a.x, a.y, a.r * 3.2, 0, 6.283); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.arc(a.x, a.y, a.r * 0.45, 0, 6.283); c.fill();
        c.save(); c.translate(a.x, a.y); c.rotate(a.tilt);
        for (let k = 0; k < a.e; k++) {
            const ro = a.r * 2.4 + k * 8, ang = a.ph + t * (2.2 + k * 0.9) * a.dir;
            c.strokeStyle = `hsla(${a.h},100%,70%,0.18)`; c.lineWidth = 1; c.beginPath(); c.ellipse(0, 0, ro, ro * 0.45, 0, 0, 6.283); c.stroke();
            c.fillStyle = `hsla(${a.h},100%,88%,0.95)`; c.beginPath(); c.arc(Math.cos(ang) * ro, Math.sin(ang) * ro * 0.45, 1.9, 0, 6.283); c.fill();
        }
        c.restore();
    }
    const gb = atomS.P.grab;
    if (gb) { c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1.5; c.beginPath(); c.arc(gb.x, gb.y, gb.r * 3.6, 0, 6.283); c.stroke(); }
}
atomCv.addEventListener('pointermove', e => {
    const P = atomS.P, now = performance.now(), dtm = Math.max(8, now - P.mt) / 1000;
    P.vx = P.vx * 0.6 + ((e.clientX - P.x) / dtm) * 0.4; P.vy = P.vy * 0.6 + ((e.clientY - P.y) / dtm) * 0.4;
    P.x = e.clientX; P.y = e.clientY; P.in = true; P.mt = now;
});
atomCv.addEventListener('pointerdown', e => {
    const P = atomS.P; P.x = e.clientX; P.y = e.clientY; P.in = true; P.down = true; P.t = performance.now(); P.mt = P.t;
    let best = null, bd = 1e9;
    for (const a of atomS.atoms) { const d = Math.hypot(a.x - P.x, a.y - P.y); if (d < a.r * 3 + 16 && d < bd) { best = a; bd = d; } }
    P.grab = best;
});
atomCv.addEventListener('pointerup', e => {
    const P = atomS.P; P.down = false; const hadGrab = P.grab; P.grab = null;
    if (!hadGrab && performance.now() - P.t < 220 && atomS.atoms.length < 300) { const a = atomMake(e.clientX, e.clientY); atomS.atoms.push(a); atomS.rings.push({ x: a.x, y: a.y, r: 6, life: 1, h: a.h }); atomBlip(a.r); }
    if (e.pointerType !== 'mouse') P.in = false;
});
atomCv.addEventListener('pointerleave', () => { atomS.P.in = false; atomS.P.down = false; atomS.P.grab = null; });
document.getElementById('atomClose').onclick = closeAtom;
const $a = id => document.getElementById(id);
function atomUI() { ['gas', 'net', 'crystal'].forEach(m => $a('atomMode' + m).classList.toggle('text-cyan-300', atomS.mode === m)); }
function atomSetMode(m) { atomS.mode = m; atomS.links = []; if (m === 'net') atomBuildNet(); if (m === 'crystal') atomBuildCrystal(); atomUI(); }
function atomBuildNet() {
    const A = atomS.atoms, L = [], seen = new Set();
    A.forEach((a, i) => a._i = i);
    A.forEach(a => {
        A.filter(b => b !== a).map(b => [Math.hypot(a.x - b.x, a.y - b.y), b]).sort((x, y) => x[0] - y[0]).slice(0, 3).forEach(([d, b]) => {
            if (d > 190) return;
            const key = a._i < b._i ? a._i + '|' + b._i : b._i + '|' + a._i;
            if (seen.has(key)) return;
            seen.add(key); L.push([a, b, d * 0.8]);
        });
    });
    atomS.links = L;
}
function atomBuildCrystal() {
    const A = atomS.atoms, n = A.length, W = atomS.W, H = atomS.H;
    const sp = Math.max(34, Math.sqrt((W * (H - 170) * 0.85) / (n * 0.866))), rh = sp * 0.866, homes = [];
    for (let r = 0, y = 70; y < H - 110; y += rh, r++) for (let x = (r % 2 ? sp : sp / 2); x < W - sp / 2; x += sp) homes.push({ x, y });
    homes.sort((p, q) => Math.hypot(p.x - W / 2, p.y - H / 2) - Math.hypot(q.x - W / 2, q.y - H / 2));
    const hs = homes.slice(0, n), cmp = (p, q) => (Math.round(p.y / rh) - Math.round(q.y / rh)) || (p.x - q.x);
    hs.sort(cmp); A.sort(cmp);
    A.forEach((a, i) => { a.hx = hs[i] ? hs[i].x : a.x; a.hy = hs[i] ? hs[i].y : a.y; });
    const L = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.hypot(A[i].hx - A[j].hx, A[i].hy - A[j].hy) < sp * 1.2) L.push([A[i], A[j], sp]);
    atomS.links = L;
}
['gas', 'net', 'crystal'].forEach(m => $a('atomMode' + m).onclick = () => atomSetMode(m));
$a('atomGrav').onclick = e => { atomS.grav = !atomS.grav; e.currentTarget.textContent = atomS.grav ? '🌍 Schwerkraft an' : '🌍 Schwerkraft aus'; };
$a('atomCount').oninput = e => {
    const n = +e.target.value;
    while (atomS.atoms.length < n) atomS.atoms.push(atomMake(Math.random() * atomS.W, Math.random() * atomS.H));
    if (atomS.atoms.length > n) atomS.atoms.length = n;
    $a('atomCountV').textContent = n;
    if (atomS.mode !== 'gas') atomSetMode(atomS.mode);
};
$a('atomSpeed').oninput = e => { atomS.speed = +e.target.value; $a('atomSpeedV').textContent = atomS.speed.toFixed(1) + '×'; };
$a('atomForce').oninput = e => { atomS.force = +e.target.value; $a('atomForceV').textContent = atomS.force.toFixed(1) + '×'; };
atomUI();
document.getElementById('atomReset').onclick = () => { atomS.atoms = []; atomSeed(+document.getElementById('atomCount').value); atomSetMode(atomS.mode); };
document.getElementById('atomBondBtn').onclick = e => { atomS.bonds = !atomS.bonds; e.currentTarget.textContent = atomS.bonds ? '🔗 Bindungen an' : '🔗 Bindungen aus'; };
window.addEventListener('resize', () => { if (atomView.style.display === 'block') atomResize(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && atomView.style.display === 'block') closeAtom(); });
