// --- PITCH MATCH (Relative Tonhöhe, Wertung in Cent) ---
MODES.pitch = { id: 'pitch', name: 'PITCH MATCH (Cent-Genauigkeit)', category: 'nexus', axis: 'Auditiv', icon: '🎼', color: 'emerald',
    desc: 'Du hörst einen Referenzton und danach einen Zielton. Stelle den Zielton nur nach Gehör nach, gewertet wird auf den Cent genau.' };
MUSIC_QUIET_MODES.push('pitch');
{
    const hz = (ref, cents) => ref * Math.pow(2, cents / 1200);
    let timers = [];
    EXT.pitch = {
        target: () => ({ ref: [262, 294, 330, 349, 392, 440][Math.floor(Math.random() * 6)], cents: 100 + Math.floor(Math.random() * 1000) }),
        revealMs: () => 4200,
        onReveal(t) {
            timers.forEach(clearTimeout); timers = [];
            audio.playFreq(t.ref, 'sine', 1.1);
            timers.push(setTimeout(() => audio.playFreq(hz(t.ref, t.cents), 'sine', 1.5), 1700));
        },
        reveal(ctx, el, t, w, h) {
            const first = el < 1700, k = first ? 1 - Math.abs(((el % 1100) / 1100) - 0.5) * 1.2 : 0.6 + 0.4 * Math.sin(el / 120);
            ctx.textAlign = 'center'; ctx.fillStyle = '#94a3b8'; ctx.font = '12px monospace';
            ctx.fillText(first ? 'REFERENZTON' : 'ZIELTON – merken!', w / 2, h * 0.18);
            ctx.fillStyle = first ? '#a855f7' : '#10b981'; ctx.font = 'bold 22px monospace';
            ctx.fillText(first ? Math.round(t.ref) + ' Hz' : '? Hz', w / 2, h * 0.3);
            for (let i = 0; i < 3; i++) { ctx.strokeStyle = (first ? 'rgba(168,85,247,' : 'rgba(16,185,129,') + (0.7 - i * 0.2) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(w / 2, h * 0.62, 20 + i * 22 * k + 6, 0, 7); ctx.stroke(); }
        },
        recall(ctx) {
            state.guess = { cents: 600 };
            controlsContainer.innerHTML = `
                <div class="flex flex-col gap-2 font-mono text-xs">
                    <div class="flex justify-between text-slate-300"><span>Abstand zur Referenz</span><span id="pitchVal" class="text-emerald-400">+600 Cent</span></div>
                    <input type="range" id="pitchSlider" min="0" max="1200" step="1" value="600">
                    <div class="flex gap-2">
                        <button id="pitchRef" class="flex-1 py-2 bg-slate-800 rounded-xl text-purple-300 border border-purple-500/30">▶ Referenz</button>
                        <button id="pitchMine" class="flex-1 py-2 bg-slate-800 rounded-xl text-emerald-300 border border-emerald-500/30">▶ Mein Ton</button>
                    </div>
                </div>`;
            const ref = state.target.ref, draw = () => {
                const W = recallCanvas.width, H = recallCanvas.height;
                ctx.clearRect(0, 0, W, H); ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.fillStyle = '#64748b'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
                for (let i = 0; i <= 12; i++) { const x = 20 + (W - 40) * i / 12; ctx.beginPath(); ctx.moveTo(x, H * 0.42); ctx.lineTo(x, H * 0.58 + (i % 12 === 0 ? 8 : 0)); ctx.stroke(); }
                ctx.fillText('Referenz', 20, H * 0.75); ctx.fillText('+1 Oktave', W - 20, H * 0.75);
                const gx = 20 + (W - 40) * state.guess.cents / 1200;
                ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(gx, H * 0.5, 11, 0, 7); ctx.fill();
                ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(20, H * 0.5, 7, 0, 7); ctx.fill();
            };
            draw();
            document.getElementById('pitchSlider').oninput = e => {
                state.guess.cents = +e.target.value; draw();
                if (!state.proMode) document.getElementById('pitchVal').textContent = '+' + state.guess.cents + ' Cent';
            };
            document.getElementById('pitchRef').onclick = () => audio.playFreq(ref, 'sine', 0.9);
            document.getElementById('pitchMine').onclick = () => audio.playFreq(hz(ref, state.guess.cents), 'sine', 0.9);
        },
        score: (t, g) => 10 * Math.exp(-Math.abs(t.cents - g.cents) / 130),
        avg: (a, b) => ({ cents: Math.round((a.cents + b.cents) / 2) }),
        fmt: v => '+' + Math.round(v.cents) + ' ct'
    };
}
