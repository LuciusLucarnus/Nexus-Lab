// --- SHARE-KARTE (Bild per Canvas, ohne Server) ---
const Share = {
    toast(msg) {
        const d = document.createElement('div'); d.textContent = msg;
        d.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#0e1320;color:#fff;border:1px solid #334155;padding:10px 16px;border-radius:12px;font:12px monospace;z-index:99';
        document.body.appendChild(d); setTimeout(() => d.remove(), 2600);
    },
    base(title) {
        const cv = document.createElement('canvas'); cv.width = cv.height = 1080; const c = cv.getContext('2d');
        const bg = c.createLinearGradient(0, 0, 1080, 1080); bg.addColorStop(0, '#05070d'); bg.addColorStop(1, '#1a1033'); c.fillStyle = bg; c.fillRect(0, 0, 1080, 1080);
        [[160, 180, '#06b6d4'], [940, 220, '#a855f7'], [880, 960, '#f43f5e']].forEach(([x, y, col]) => { const g = c.createRadialGradient(x, y, 0, x, y, 420); g.addColorStop(0, col + '55'); g.addColorStop(1, col + '00'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1080); });
        const lg = c.createLinearGradient(70, 70, 150, 150); lg.addColorStop(0, '#06b6d4'); lg.addColorStop(0.5, '#a855f7'); lg.addColorStop(1, '#f43f5e');
        c.fillStyle = lg; c.beginPath(); c.roundRect(70, 70, 84, 84, 20); c.fill();
        c.fillStyle = '#fff'; c.font = 'bold 40px monospace'; c.textAlign = 'center'; c.fillText('NL', 112, 125);
        c.textAlign = 'left'; c.font = 'bold 34px monospace'; c.fillText('NEXUS LAB', 176, 125);
        c.fillStyle = '#94a3b8'; c.font = '26px monospace'; c.textAlign = 'center'; c.fillText(title, 540, 330);
        return [cv, c];
    },
    footer(c) {
        const r = Rank.info();
        c.fillStyle = '#e2e8f0'; c.font = 'bold 36px monospace'; c.textAlign = 'center'; c.fillText('Level ' + r.level + ' · ' + r.title, 540, 900);
        c.fillStyle = '#1b2438'; c.beginPath(); c.roundRect(240, 930, 600, 18, 9); c.fill();
        const g = c.createLinearGradient(240, 0, 840, 0); g.addColorStop(0, '#06b6d4'); g.addColorStop(1, '#a855f7'); c.fillStyle = g; c.beginPath(); c.roundRect(240, 930, Math.max(18, 600 * r.progress), 18, 9); c.fill();
        c.fillStyle = '#64748b'; c.font = '24px monospace'; c.fillText(new Date().toLocaleDateString('de-DE') + (location.hostname ? ' · ' + location.hostname : ''), 540, 1010);
    },
    fit(c, text, max, start) { let s = start; do { c.font = 'bold ' + s + 'px monospace'; s -= 2; } while (c.measureText(text).width > max && s > 20); },
    async out(cv, text, name) {
        const blob = await new Promise(r => cv.toBlob(r, 'image/png')); if (!blob) return this.toast('Bild konnte nicht erstellt werden');
        const file = new File([blob], name + '.png', { type: 'image/png' });
        try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text, title: 'Nexus Lab' }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.png'; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        try { navigator.clipboard.writeText(text).catch(() => {}); } catch (e) {}
        this.toast('Karte gespeichert, Text kopiert');
    },
    scoreCard(title, big, sub, text, name) {
        const [cv, c] = this.base('SPIEL-ERGEBNIS');
        c.fillStyle = '#fff'; c.textAlign = 'center'; this.fit(c, title, 900, 76); c.fillText(title, 540, 450);
        const g = c.createLinearGradient(300, 0, 780, 0); g.addColorStop(0, '#22d3ee'); g.addColorStop(1, '#c084fc'); c.fillStyle = g; this.fit(c, String(big), 860, 260); c.fillText(String(big), 540, 700);
        c.fillStyle = '#94a3b8'; c.font = '34px monospace'; c.fillText(sub, 540, 780);
        this.footer(c); return this.out(cv, text, name);
    },
    engineCard() {
        const m = MODES[state.mode];
        if (state.playMode === 'duel') return this.scoreCard(m.name.split(' (')[0], state.p1Wins + ' : ' + state.p2Wins, 'Duell, Spieler 1 gegen Spieler 2', 'NEXUS LAB - ' + m.name + ' Duell ' + state.p1Wins + ':' + state.p2Wins, 'nexus-lab-duell');
        const t = state.totalScore.toFixed(1);
        return this.scoreCard(m.name.split(' (')[0], t, 'von 50 Punkten', 'NEXUS LAB - ' + m.name + ': ' + t + ' / 50', 'nexus-lab-' + m.id);
    },
    arcadeCard() {
        const a = ARCADE[arc.id]; if (!a) return;
        const best = Math.max(arc.score, arc.best[arc.id] || 0);
        return this.scoreCard(a.name, arc.score, 'Punkte · Bestwert ' + best, 'NEXUS LAB - ' + a.name + ': ' + arc.score + ' Punkte (Best ' + best + ')', 'nexus-lab-' + a.id);
    },
    profileCard() {
        const r = Rank.info(), [cv, c] = this.base('MEIN NEXUS-PROFIL');
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = 'bold 120px monospace'; c.fillText('Level ' + r.level, 540, 470);
        c.fillStyle = '#94a3b8'; c.font = '30px monospace'; c.fillText(r.pts + ' von ' + r.max + ' Punkten · ' + r.played + '/' + r.total + ' Spiele', 540, 530);
        const cx = 540, cy = 700, R = 130, vals = Rank.axisValues(), ang = AXES.map((_, i) => i * 2 * Math.PI / AXES.length - Math.PI / 2);
        c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 2;
        [0.5, 1].forEach(k => { c.beginPath(); ang.forEach((a, i) => { const x = cx + Math.cos(a) * R * k, y = cy + Math.sin(a) * R * k; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.stroke(); });
        c.fillStyle = '#94a3b8'; c.font = '22px monospace'; ang.forEach((a, i) => c.fillText(AXES[i], cx + Math.cos(a) * (R + 46), cy + Math.sin(a) * (R + 40) + 8));
        c.beginPath(); vals.forEach((v, i) => { const x = cx + Math.cos(ang[i]) * R * Math.max(0.04, v), y = cy + Math.sin(ang[i]) * R * Math.max(0.04, v); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath();
        c.fillStyle = 'rgba(168,85,247,0.4)'; c.fill(); c.strokeStyle = '#a855f7'; c.lineWidth = 4; c.stroke();
        this.footer(c); return this.out(cv, 'NEXUS LAB - Level ' + r.level + ' · ' + r.title + ' (' + r.pts + ' Punkte)', 'nexus-lab-profil');
    }
};
document.getElementById('cardShareBtn').onclick = () => Share.engineCard();
document.getElementById('arShare').onclick = () => Share.arcadeCard();
