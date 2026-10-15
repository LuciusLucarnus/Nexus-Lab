function resetGame() {
    state.round = 1;
    state.totalScore = 0;
    state.p1TotalScore = 0;
    state.p2TotalScore = 0;
    state.p1Wins = 0;
    state.p2Wins = 0;
    state.activePlayer = 1;
    state.p1Guess = null;
    state.p2Guess = null;
    state.roundScores = [];
    state.phase = 'idle';
    updateRoundUI();
}

function updateRoundUI() {
    roundDisplay.textContent = `${state.round} / ${state.maxRounds}`;

    if (state.playMode === 'solo') {
        scoreBoardLabel.textContent = 'Gesamtpunkte';
        totalScoreDisplay.innerHTML = `${state.totalScore.toFixed(2)} <span class="text-xs text-slate-500">/ 50</span>`;
    } else if (state.playMode === 'duel') {
        scoreBoardLabel.textContent = 'Duell-Stand (1v1)';
        totalScoreDisplay.innerHTML = `<span class="text-cyan-400">P1: ${state.p1Wins}</span> <span class="text-slate-500">vs</span> <span class="text-rose-400">P2: ${state.p2Wins}</span>`;
    } else if (state.playMode === 'coop') {
        scoreBoardLabel.textContent = 'Team-Punkte (Mittelwert)';
        totalScoreDisplay.innerHTML = `${state.totalScore.toFixed(2)} <span class="text-xs text-slate-500">/ 50</span>`;
    }

    roundDots.innerHTML = '';
    for (let i = 1; i <= state.maxRounds; i++) {
        const dot = document.createElement('div');
        if (i < state.round) dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400';
        else if (i === state.round) dot.className = 'w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse';
        else dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-800';
        roundDots.appendChild(dot);
    }
}

document.getElementById('startGameBtn').onclick = () => {
    startOverlay.classList.add('hidden');
    startRound();
};

function startRound() {
    state.phase = 'reveal';
    stageReveal.classList.remove('hidden');
    stageRecall.classList.add('hidden');
    stageResult.classList.add('hidden');
    state.tapTimes = [];
    state.gridSelected = [];
    stopRecallAnim();

    generateTarget();
    runRevealPhase();
}

function generateTarget() {
    const mode = state.mode;
    if (EXT[mode]) { state.target = EXT[mode].target(); return; }
    if (mode === 'harmony') {
        state.target = { f1: 261 + Math.floor(Math.random() * 200), f2: 440 + Math.floor(Math.random() * 200) };
    } else if (mode === 'split_radar') {
        state.target = { x1: 0.2 + Math.random() * 0.25, y1: 0.2 + Math.random() * 0.25, x2: 0.55 + Math.random() * 0.3, y2: 0.55 + Math.random() * 0.3 };
    } else if (mode === 'duo_balance') {
        state.target = { weight: 20 + Math.floor(Math.random() * 60) };
    } else if (mode === 'color') {
        state.target = { h: Math.floor(Math.random() * 360), s: 40 + Math.floor(Math.random() * 50), l: 35 + Math.floor(Math.random() * 40) };
    } else if (mode === 'sound') {
        state.target = { freq: 220 + Math.floor(Math.random() * 580) };
    } else if (mode === 'time') {
        state.target = { duration: 1000 + Math.floor(Math.random() * 2500) };
    } else if (mode === 'shape') {
        state.target = { scale: 0.3 + Math.random() * 0.5, rotation: Math.floor(Math.random() * 360), rounded: Math.floor(Math.random() * 50) };
    } else if (mode === 'tempo') {
        state.target = { bpm: 70 + Math.floor(Math.random() * 90) };
    } else if (mode === 'vector') {
        state.target = { x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.6 };
    } else if (mode === 'angle') {
        state.target = { angle: Math.floor(Math.random() * 360) };
    } else if (mode === 'velocity') {
        state.target = { speed: 2 + Math.random() * 6 };
    } else if (mode === 'quantity') {
        state.target = { count: 12 + Math.floor(Math.random() * 28) };
    } else if (mode === 'strobe') {
        state.target = { hz: 3 + Math.floor(Math.random() * 10) };
    } else if (mode === 'grid') {
        const cells = [];
        while (cells.length < 4) {
            const r = Math.floor(Math.random() * 9);
            if (!cells.includes(r)) cells.push(r);
        }
        state.target = { cells };
    } else if (mode === 'echo_gap') {
        state.target = { gap: 60 + Math.floor(Math.random() * 440) };
    } else if (mode === 'micro_gap') {
        state.target = { gap: 2 + Math.round(Math.random() * 56) / 2 };
    } else if (mode === 'spin') {
        state.target = { rpm: 30 + Math.floor(Math.random() * 210) };
    } else if (mode === 'tunnel') {
        state.target = { t: 800 + Math.floor(Math.random() * 1700) };
    } else if (mode === 'chroma') {
        state.target = { c: 2 + Math.round(Math.random() * 36) / 2 };
    } else if (mode === 'duo_radar') {
        state.target = { a1: Math.floor(Math.random() * 360), a2: Math.floor(Math.random() * 360) };
    }
}

function runRevealPhase() {
    let revealTime = state.proMode ? 1800 : 3000;
    if (state.mode === 'sound' || state.mode === 'harmony') revealTime = 2200;
    if (state.mode === 'echo_gap') revealTime = 2600;
    if (state.mode === 'tunnel') revealTime = Math.round(state.target.t * 1.6) + 600;
    if (state.mode === 'time') revealTime = state.target.duration + 400;
    if (EXT[state.mode]) revealTime = EXT[state.mode].revealMs(state.target);

    let startTime = performance.now();
    revealTimerBar.style.width = '100%';

    gameCanvas.width = gameCanvas.offsetWidth;
    gameCanvas.height = gameCanvas.offsetHeight;
    const ctx = gameCanvas.getContext('2d');
    if (EXT[state.mode] && EXT[state.mode].onReveal) EXT[state.mode].onReveal(state.target, revealTime);

    if (state.mode === 'echo_gap') {
        audio.clickPair(state.target.gap, 0.25);
        audio.clickPair(state.target.gap, 1.45);
    } else if (state.mode === 'tempo') {
        const beat = 60 / state.target.bpm;
        for (let k = 0; k * beat < revealTime / 1000; k++) audio.clickAt(k * beat + 0.05, 700);
    }

    if (state.mode === 'sound') {
        audio.playFreq(state.target.freq, 'sine', revealTime / 1000);
    } else if (state.mode === 'harmony') {
        audio.playChord(state.target.f1, state.target.f2, revealTime / 1000);
    }

    function animateReveal(now) {
        let elapsed = now - startTime;
        let remaining = Math.max(0, 1 - elapsed / revealTime);
        revealTimerBar.style.width = `${remaining * 100}%`;

        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        renderRevealCanvas(ctx, elapsed);

        if (elapsed < revealTime) {
            state.animFrame = requestAnimationFrame(animateReveal);
        } else {
            switchToRecallStage();
        }
    }

    state.animFrame = requestAnimationFrame(animateReveal);
}

function renderRevealCanvas(ctx, elapsed, tOv, wOv, hOv) {
    const w = wOv || gameCanvas.width;
    const h = hOv || gameCanvas.height;
    const t = tOv || state.target;
    if (EXT[state.mode]) return EXT[state.mode].reveal(ctx, elapsed, t, w, h);

    if (state.mode === 'harmony') {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            let y = h / 2 + Math.sin((x + elapsed * 0.2) * (t.f1 / 1000)) * 25 + Math.sin((x + elapsed * 0.3) * (t.f2 / 1000)) * 25;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    } else if (state.mode === 'split_radar') {
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath(); ctx.arc(t.x1 * w, t.y1 * h, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath(); ctx.arc(t.x2 * w, t.y2 * h, 9, 0, Math.PI * 2); ctx.fill();
    } else if (state.mode === 'duo_balance') {
        // Waage: links das gesuchte Gewicht, rechts ein festes Referenzgewicht (50).
        // Bei 50 hängt der Balken waagerecht, schwerer = Neigung nach links.
        ctx.save();
        const cx = w / 2, py = h * 0.3, L = w * 0.36, rope = h * 0.23, pw = w * 0.12;
        const wt = Math.max(0, Math.min(100, t.weight));
        const tilt = ((wt - 50) / 50) * (22 * Math.PI / 180);
        const e = elapsed || 0;
        const ang = tilt * (1 - Math.exp(-e / 160) * Math.cos(e / 80));
        const lx = cx - Math.cos(ang) * L, ly = py + Math.sin(ang) * L;
        const rx = cx + Math.cos(ang) * L, ry = py - Math.sin(ang) * L;
        const blockSize = v => 14 + v * 0.3;
        ctx.lineCap = 'round';
        // Ständer
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(cx, h * 0.88); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - w * 0.16, h * 0.9); ctx.lineTo(cx + w * 0.16, h * 0.9); ctx.stroke();
        // Balken
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();
        // Waagschalen mit Gewicht
        const pan = (x, y, color, size) => {
            const by = y + rope;
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - pw, by); ctx.lineTo(x, y); ctx.lineTo(x + pw, by);
            ctx.stroke();
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(x - pw - 4, by); ctx.lineTo(x + pw + 4, by); ctx.stroke();
            ctx.fillStyle = color;
            ctx.fillRect(x - size / 2, by - 3 - size, size, size);
        };
        pan(lx, ly, '#f59e0b', blockSize(wt));
        pan(rx, ry, '#64748b', blockSize(50));
        // Drehpunkt
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath(); ctx.arc(cx, py, 6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    } else if (state.mode === 'color') {
        ctx.fillStyle = `hsl(${t.h}, ${t.s}%, ${t.l}%)`;
        ctx.fillRect(0, 0, w, h);
    } else if (state.mode === 'sound') {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            let y = h / 2 + Math.sin((x + elapsed * 0.2) * (t.freq / 1500)) * 40;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    } else if (state.mode === 'time') {
        let active = elapsed < t.duration;
        ctx.fillStyle = active ? '#f59e0b' : '#1e293b';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, active ? 60 : 30, 0, Math.PI * 2);
        ctx.fill();
    } else if (state.mode === 'shape') {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((t.rotation * Math.PI) / 180);
        ctx.fillStyle = '#f43f5e';
        let sz = w * t.scale;
        ctx.beginPath();
        ctx.roundRect(-sz / 2, -sz / 2, sz, sz, t.rounded);
        ctx.fill();
        ctx.restore();
    } else if (state.mode === 'tempo') {
        let beatMs = 60000 / t.bpm;
        let pulse = (elapsed % beatMs) < 120;
        ctx.fillStyle = pulse ? '#10b981' : '#0e1320';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, pulse ? 70 : 40, 0, Math.PI * 2);
        ctx.fill();
    } else if (state.mode === 'vector') {
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(t.x * w, t.y * h, 10, 0, Math.PI * 2);
        ctx.fill();
    } else if (state.mode === 'angle') {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((t.angle * Math.PI) / 180);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -w * 0.38);
        ctx.stroke();
        ctx.restore();
    } else if (state.mode === 'velocity') {
        let pos = (elapsed * t.speed * 0.1) % w;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(pos, h / 2, 12, 0, Math.PI * 2);
        ctx.fill();
    } else if (state.mode === 'quantity') {
        ctx.fillStyle = '#a855f7';
        for (let i = 0; i < t.count; i++) {
            let rx = (Math.sin(i * 99 + 1) * 0.5 + 0.5) * (w - 40) + 20;
            let ry = (Math.cos(i * 33 + 1) * 0.5 + 0.5) * (h - 40) + 20;
            ctx.beginPath();
            ctx.arc(rx, ry, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (state.mode === 'strobe') {
        let blinkMs = 1000 / t.hz;
        let on = (elapsed % blinkMs) < (blinkMs / 2);
        ctx.fillStyle = on ? '#ffffff' : '#05070d';
        ctx.fillRect(0, 0, w, h);
    } else if (state.mode === 'grid') {
        let sz = w / 3;
        for (let i = 0; i < 9; i++) {
            let gx = (i % 3) * sz;
            let gy = Math.floor(i / 3) * sz;
            let active = t.cells.includes(i);
            ctx.fillStyle = active ? '#10b981' : '#0e1320';
            ctx.strokeStyle = '#1b2438';
            ctx.fillRect(gx + 4, gy + 4, sz - 8, sz - 8);
            ctx.strokeRect(gx + 4, gy + 4, sz - 8, sz - 8);
        }
    } else if (state.mode === 'echo_gap') {
        const ph = (elapsed / 700) % 1;
        ctx.strokeStyle = 'rgba(6,182,212,' + (0.6 - ph * 0.5) + ')'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(w / 2, h / 2, 30 + ph * 60, 0, Math.PI * 2); ctx.stroke();
        ctx.font = '44px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🎧', w / 2, h / 2);
    } else if (state.mode === 'micro_gap') {
        ctx.fillStyle = '#e2e8f0';
        const pw = w * 0.3, ph = h * 0.5;
        ctx.fillRect(w / 2 - t.gap / 2 - pw, h / 2 - ph / 2, pw, ph);
        ctx.fillRect(w / 2 + t.gap / 2, h / 2 - ph / 2, pw, ph);
    } else if (state.mode === 'spin') {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((elapsed * t.rpm / 60000) * Math.PI * 2);
        ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(70, 0); ctx.stroke();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath(); ctx.arc(70, 0, 9, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    } else if (state.mode === 'tunnel') {
        ctx.fillStyle = 'rgba(30,41,59,0.55)'; ctx.fillRect(w * 0.35, h / 2 - 32, w * 0.5, 64);
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.strokeRect(w * 0.35, h / 2 - 32, w * 0.5, 64);
        const p = Math.min(1, elapsed / (t.t * 1.6));
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc((0.05 + 0.8 * p) * w, h / 2, 10, 0, Math.PI * 2); ctx.fill();
    } else if (state.mode === 'chroma') {
        ctx.fillStyle = 'hsl(220,10%,38%)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'hsl(220,10%,' + (38 + t.c) + '%)';
        ctx.beginPath(); ctx.arc(w / 2, h / 2, 70, 0, Math.PI * 2); ctx.fill();
    } else if (state.mode === 'duo_radar') {
        ctx.lineWidth = 5; ctx.lineCap = 'round';
        [[t.a1, '#06b6d4'], [t.a2, '#f43f5e']].forEach(([a, col]) => {
            ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate((a * Math.PI) / 180);
            ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -w * 0.4); ctx.stroke();
            ctx.restore();
        });
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(w / 2, h / 2, 6, 0, Math.PI * 2); ctx.fill();
    }
}

function switchToRecallStage() {
    state.phase = 'recall';
    stageReveal.classList.add('hidden');
    stageRecall.classList.remove('hidden');

    if (state.playMode === 'solo') {
        playerTurnBanner.className = 'w-full text-center py-2 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center justify-center gap-2';
        playerTurnText.textContent = 'Aus dem Gedächtnis nachbauen';
        submitGuessBtnText.textContent = 'Bestätigen & Werten';
    } else if (state.playMode === 'duel') {
        state.activePlayer = 1;
        playerTurnBanner.className = 'w-full text-center py-2 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-2 animate-pulse';
        playerTurnText.textContent = '⚔️ Spieler 1: Stelle deinen Versuch ein!';
        submitGuessBtnText.textContent = 'Spieler 1 Bestätigen';
    } else if (state.playMode === 'coop') {
        state.activePlayer = 1;
        playerTurnBanner.className = 'w-full text-center py-2 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center gap-2 animate-pulse';
        playerTurnText.textContent = '🤝 Spieler 1: Stelle deinen Wert ein (1/2)';
        submitGuessBtnText.textContent = 'Spieler 1 Eingabe Bestätigen';
    }

    renderRecallControls();
}

function renderRecallControls() {
    stopRecallAnim();
    recallCanvas.onclick = null;
    recallCanvas.onpointerdown = null;
    state.tapTimes = [];
    controlsContainer.innerHTML = '';
    recallCanvas.width = recallCanvas.offsetWidth;
    recallCanvas.height = recallCanvas.offsetHeight;
    const ctx = recallCanvas.getContext('2d');
    const m = state.mode;
    if (EXT[m]) return EXT[m].recall(ctx);

    if (m === 'harmony') {
        state.guess = { f1: 300, f2: 500 };
        controlsContainer.innerHTML = `
            <div class="flex flex-col gap-2 font-mono text-xs">
                <div class="flex justify-between text-slate-300"><span>Akkord-Frequenz 1</span><span id="f1Val" class="text-purple-400">300 Hz</span></div>
                <input type="range" id="f1Slider" min="200" max="500" value="300">
                <div class="flex justify-between text-slate-300"><span>Akkord-Frequenz 2</span><span id="f2Val" class="text-cyan-400">500 Hz</span></div>
                <input type="range" id="f2Slider" min="400" max="700" value="500">
                <button id="listenChordBtn" class="py-2 bg-slate-800 rounded-xl text-amber-300 border border-amber-500/30 flex items-center justify-center gap-2 mt-1"><span class="">🎵</span> Akkord Anhören</button>
            </div>
        `;
        document.getElementById('f1Slider').oninput = e => { state.guess.f1 = parseInt(e.target.value); if (!state.proMode) document.getElementById('f1Val').textContent = `${state.guess.f1} Hz`; };
        document.getElementById('f2Slider').oninput = e => { state.guess.f2 = parseInt(e.target.value); if (!state.proMode) document.getElementById('f2Val').textContent = `${state.guess.f2} Hz`; };
        document.getElementById('listenChordBtn').onclick = () => audio.playChord(state.guess.f1, state.guess.f2, 0.6);
        startPreview();

    } else if (m === 'split_radar') {
        state.guess = { x: 0.5, y: 0.5 };
        controlsContainer.innerHTML = `<div class="text-center font-mono text-xs text-cyan-400">Klicke im oberen Feld auf deinen Zielpunkt!</div>`;
        const drawRadarGuess = () => {
            ctx.clearRect(0, 0, recallCanvas.width, recallCanvas.height);
            ctx.fillStyle = state.activePlayer === 1 ? '#06b6d4' : '#f43f5e';
            ctx.beginPath();
            ctx.arc(state.guess.x * recallCanvas.width, state.guess.y * recallCanvas.height, 9, 0, Math.PI * 2);
            ctx.fill();
        };
        drawRadarGuess();
        recallCanvas.onclick = (e) => {
            const rect = recallCanvas.getBoundingClientRect();
            state.guess.x = (e.clientX - rect.left) / rect.width;
            state.guess.y = (e.clientY - rect.top) / rect.height;
            drawRadarGuess();
        };

    } else if (m === 'duo_balance') {
        state.guess = { val: 50 };
        controlsContainer.innerHTML = `
            <div class="flex flex-col gap-2 font-mono text-xs">
                <div class="flex justify-between text-slate-300"><span>Gewicht (linke Schale)</span><span id="balVal" class="text-amber-400">50%</span></div>
                <input type="range" id="balSlider" min="0" max="100" value="50">
            </div>
        `;
        document.getElementById('balSlider').oninput = e => {
            state.guess.val = parseFloat(e.target.value);
            if (!state.proMode) document.getElementById('balVal').textContent = `${state.guess.val}%`;
        };
        startPreview();

    } else if (m === 'color') {
        state.guess = { h: 180, s: 50, l: 50 };
        controlsContainer.innerHTML = `
            <div class="flex flex-col gap-2 font-mono text-xs">
                <div class="flex justify-between text-slate-300"><span>Farbton (Hue)</span><span id="hVal" class="text-purple-400">180°</span></div>
                <input type="range" id="hSlider" min="0" max="360" value="180">
                <div class="flex justify-between text-slate-300"><span>Sättigung (Sat)</span><span id="sVal" class="text-purple-400">50%</span></div>
                <input type="range" id="sSlider" min="0" max="100" value="50">
                <div class="flex justify-between text-slate-300"><span>Helligkeit (Light)</span><span id="lVal" class="text-purple-400">50%</span></div>
                <input type="range" id="lSlider" min="0" max="100" value="50">
            </div>
        `;
        const updateColor = () => {
            ctx.fillStyle = `hsl(${state.guess.h}, ${state.guess.s}%, ${state.guess.l}%)`;
            ctx.fillRect(0, 0, recallCanvas.width, recallCanvas.height);
        };
        updateColor();
        document.getElementById('hSlider').oninput = e => { state.guess.h = parseInt(e.target.value); if (!state.proMode) document.getElementById('hVal').textContent = `${state.guess.h}°`; updateColor(); };
        document.getElementById('sSlider').oninput = e => { state.guess.s = parseInt(e.target.value); if (!state.proMode) document.getElementById('sVal').textContent = `${state.guess.s}%`; updateColor(); };
        document.getElementById('lSlider').oninput = e => { state.guess.l = parseInt(e.target.value); if (!state.proMode) document.getElementById('lVal').textContent = `${state.guess.l}%`; updateColor(); };

    } else if (m === 'sound') {
        state.guess = { freq: 440 };
        controlsContainer.innerHTML = `
            <div class="flex flex-col gap-2 font-mono text-xs">
                <div class="flex justify-between text-slate-300"><span>Ton-Frequenz</span><span id="freqVal" class="text-cyan-400">440 Hz</span></div>
                <input type="range" id="freqSlider" min="200" max="800" value="440">
                <button id="listenBtn" class="py-2 bg-slate-800 rounded-xl text-cyan-400 border border-cyan-500/30 flex items-center justify-center gap-2 mt-1"><span class="">🔊</span> Ton Anhören</button>
            </div>
        `;
        document.getElementById('freqSlider').oninput = e => {
            state.guess.freq = parseInt(e.target.value);
            if (!state.proMode) document.getElementById('freqVal').textContent = `${state.guess.freq} Hz`;
        };
        document.getElementById('listenBtn').onclick = () => audio.playFreq(state.guess.freq, 'sine', 0.6);
        startPreview();

    } else if (m === 'time') {
        state.guess = { duration: 0 };
        controlsContainer.innerHTML = `
            <button id="timeHoldBtn" class="py-5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-sm tracking-wider flex items-center justify-center gap-2">
                <span class="text-xl">👆</span> DRÜCKEN & HALTEN
            </button>
            <div id="timeResultText" class="text-center font-mono text-xs text-slate-400 mt-1">Halte den Button so lange gedrückt wie die Phase vorhin!</div>
        `;
        const btn = document.getElementById('timeHoldBtn');
        const startHold = (e) => { e.preventDefault(); state.timePressStart = performance.now(); btn.classList.add('bg-amber-500', 'text-slate-950'); };
        const endHold = (e) => {
            e.preventDefault();
            if (state.timePressStart) {
                state.guess.duration = performance.now() - state.timePressStart;
                state.timePressStart = 0;
                btn.classList.remove('bg-amber-500', 'text-slate-950');
                document.getElementById('timeResultText').textContent = `Erfasste Dauer: ${(state.guess.duration / 1000).toFixed(2)}s`;
            }
        };
        btn.style.touchAction = 'none';
        btn.addEventListener('pointerdown', startHold);
        btn.addEventListener('pointerup', endHold);
        btn.addEventListener('pointercancel', endHold);

    } else if (m === 'vector') {
        state.guess = { x: 0.5, y: 0.5 };
        controlsContainer.innerHTML = `<div class="text-center font-mono text-xs text-cyan-400">Klicke im oberen Radar-Feld auf die gemerkte Position!</div>`;
        const drawRecallVector = () => {
            ctx.clearRect(0, 0, recallCanvas.width, recallCanvas.height);
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(state.guess.x * recallCanvas.width, state.guess.y * recallCanvas.height, 8, 0, Math.PI * 2);
            ctx.fill();
        };
        drawRecallVector();
        recallCanvas.onclick = (e) => {
            const rect = recallCanvas.getBoundingClientRect();
            state.guess.x = (e.clientX - rect.left) / rect.width;
            state.guess.y = (e.clientY - rect.top) / rect.height;
            drawRecallVector();
        };

    } else if (m === 'tempo') {
        state.guess = { bpm: 120 };
        controlsContainer.innerHTML = `
            <button id="tempoTapBtn" class="py-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs tracking-wider flex items-center justify-center gap-2">
                <span class="">👆</span> BEAT 4-MAL TAPPEN
            </button>
            <div id="tempoDisplay" class="text-center font-mono text-xs text-slate-400 mt-1">Verbleibende Taps: 4</div>
        `;
        document.getElementById('tempoTapBtn').onclick = () => {
            audio.playClick(1000);
            state.tapTimes.push(performance.now());
            let rem = 4 - state.tapTimes.length;
            document.getElementById('tempoDisplay').textContent = rem > 0 ? `Verbleibende Taps: ${rem}` : 'Takt erfasst!';
            if (state.tapTimes.length >= 4) {
                let intervals = [];
                for (let i = 1; i < 4; i++) intervals.push(state.tapTimes[i] - state.tapTimes[i - 1]);
                let avgMs = intervals.reduce((a, b) => a + b) / intervals.length;
                state.guess.bpm = Math.round(60000 / avgMs);
            }
        };

    } else if (m === 'grid') {
        state.guess = { cells: [] };
        controlsContainer.innerHTML = `<div class="text-center font-mono text-xs text-emerald-400">Klicke im oberen Grid auf die 4 gemerkten Felder!</div>`;
        const drawRecallGrid = () => {
            ctx.clearRect(0, 0, recallCanvas.width, recallCanvas.height);
            let sz = recallCanvas.width / 3;
            for (let i = 0; i < 9; i++) {
                let gx = (i % 3) * sz;
                let gy = Math.floor(i / 3) * sz;
                let active = state.guess.cells.includes(i);
                ctx.fillStyle = active ? '#10b981' : '#0e1320';
                ctx.strokeStyle = '#1b2438';
                ctx.fillRect(gx + 4, gy + 4, sz - 8, sz - 8);
                ctx.strokeRect(gx + 4, gy + 4, sz - 8, sz - 8);
            }
        };
        drawRecallGrid();
        recallCanvas.onclick = (e) => {
            const rect = recallCanvas.getBoundingClientRect();
            let gx = Math.floor((e.clientX - rect.left) / (rect.width / 3));
            let gy = Math.floor((e.clientY - rect.top) / (rect.height / 3));
            let idx = gy * 3 + gx;
            if (state.guess.cells.includes(idx)) {
                state.guess.cells = state.guess.cells.filter(c => c !== idx);
            } else {
                state.guess.cells.push(idx);
            }
            drawRecallGrid();
        };

    } else if (m === 'shape') {
        state.guess = { scale: 0.5, rotation: 0, rounded: 10 };
        controlsContainer.innerHTML = `
            <div class="flex flex-col gap-1.5 font-mono text-xs">
                <div class="flex justify-between text-slate-300"><span>Größe</span><span id="shScaleVal" class="text-rose-400">50%</span></div>
                <input type="range" id="shScale" min="20" max="90" value="50">
                <div class="flex justify-between text-slate-300"><span>Drehung</span><span id="shRotVal" class="text-rose-400">0°</span></div>
                <input type="range" id="shRot" min="0" max="359" value="0">
                <div class="flex justify-between text-slate-300"><span>Ecken-Rundung</span><span id="shRoundVal" class="text-rose-400">10</span></div>
                <input type="range" id="shRound" min="0" max="50" value="10">
            </div>`;
        const sh = (id, key, fmt, conv) => { document.getElementById(id).oninput = e => { const v = parseFloat(e.target.value); state.guess[key] = conv(v); if (!state.proMode) document.getElementById(id + 'Val').textContent = fmt(v); }; };
        sh('shScale', 'scale', v => v + '%', v => v / 100);
        sh('shRot', 'rotation', v => v + '°', v => v);
        sh('shRound', 'rounded', v => v, v => v);
        startPreview();

    } else if (m === 'duo_radar') {
        state.guess = { a1: 90, a2: 270 };
        controlsContainer.innerHTML = `
            <div class="flex flex-col gap-1.5 font-mono text-xs">
                <div class="flex justify-between text-slate-300"><span>Laser A (cyan)</span><span id="a1V" class="text-cyan-400">90°</span></div>
                <input type="range" id="a1S" min="0" max="359" value="90">
                <div class="flex justify-between text-slate-300"><span>Laser B (rosa)</span><span id="a2V" class="text-rose-400">270°</span></div>
                <input type="range" id="a2S" min="0" max="359" value="270">
            </div>`;
        document.getElementById('a1S').oninput = e => { state.guess.a1 = parseInt(e.target.value); if (!state.proMode) document.getElementById('a1V').textContent = state.guess.a1 + '°'; };
        document.getElementById('a2S').oninput = e => { state.guess.a2 = parseInt(e.target.value); if (!state.proMode) document.getElementById('a2V').textContent = state.guess.a2 + '°'; };
        startPreview();

    } else if (m === 'tunnel') {
        state.guess = { val: 0 };
        controlsContainer.innerHTML = `
            <div class="flex gap-2">
                <button id="tunStart" class="flex-1 py-3 rounded-xl bg-slate-800 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">▶ BALL STARTEN</button>
                <button id="tunHit" class="flex-1 py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">🎯 JETZT!</button>
            </div>
            <div id="tunInfo" class="text-center font-mono text-xs text-slate-400">Starte den Ball. Er verschwindet im Tunnel – drücke, wenn er wieder herauskommt!</div>`;
        const vv = 0.5 / state.target.t;
        let runStart = 0, hit = false;
        const loop = (now) => {
            const W = recallCanvas.width, H = recallCanvas.height;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = 'rgba(30,41,59,0.9)'; ctx.fillRect(W * 0.35, H / 2 - 32, W * 0.5, 64);
            ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.strokeRect(W * 0.35, H / 2 - 32, W * 0.5, 64);
            if (runStart) {
                const p = Math.min(1, 0.05 + vv * (now - runStart));
                if (p < 0.35 || hit) { ctx.fillStyle = hit ? '#10b981' : '#f59e0b'; ctx.beginPath(); ctx.arc(p * W, H / 2, 10, 0, Math.PI * 2); ctx.fill(); }
            }
            state.recallAnim = requestAnimationFrame(loop);
        };
        state.recallAnim = requestAnimationFrame(loop);
        document.getElementById('tunStart').onclick = () => { runStart = performance.now(); hit = false; };
        document.getElementById('tunHit').onclick = () => {
            if (!runStart || hit) return;
            hit = true;
            state.guess.val = Math.max(0, Math.round(performance.now() - runStart - 0.6 * state.target.t));
            document.getElementById('tunInfo').textContent = state.proMode ? 'Erfasst!' : `Erfasst: ${state.guess.val} ms im Tunnel`;
        };

    } else {
        let min = 0, max = 100, val = 50, label = 'Wert', step = 1;
        if (m === 'angle') { min = 0; max = 360; val = 180; label = 'Winkel (Grad)'; }
        else if (m === 'velocity') { min = 1; max = 10; val = 5; label = 'Tempo'; }
        else if (m === 'quantity') { min = 5; max = 50; val = 25; label = 'Anzahl Punkte'; }
        else if (m === 'strobe') { min = 1; max = 15; val = 7; label = 'Frequenz (Hz)'; }
        else if (m === 'echo_gap') { min = 40; max = 600; val = 250; step = 5; label = 'Abstand (ms)'; }
        else if (m === 'micro_gap') { min = 1; max = 40; val = 15; step = 0.5; label = 'Spaltbreite (px)'; }
        else if (m === 'spin') { min = 20; max = 260; val = 120; label = 'Drehzahl (RPM)'; }
        else if (m === 'chroma') { min = 0; max = 30; val = 12; step = 0.5; label = 'Kontrast (%)'; }

        state.guess = { val };
        controlsContainer.innerHTML = `
            <div class="flex flex-col gap-2 font-mono text-xs">
                <div class="flex justify-between text-slate-300"><span>${label}</span><span id="genVal" class="text-purple-400">${val}</span></div>
                <input type="range" id="genSlider" min="${min}" max="${max}" value="${val}" step="${step}">
            </div>
        `;
        document.getElementById('genSlider').oninput = e => {
            state.guess.val = parseFloat(e.target.value);
            if (!state.proMode) document.getElementById('genVal').textContent = state.guess.val;
        };
        if (m === 'echo_gap') {
            const lb = document.createElement('button');
            lb.className = 'py-2 bg-slate-800 rounded-xl text-cyan-400 border border-cyan-500/30 font-mono text-xs flex items-center justify-center gap-2 mt-1';
            lb.textContent = '🎧 Klicks anhören';
            lb.onclick = () => audio.clickPair(state.guess.val, 0.02);
            controlsContainer.appendChild(lb);
        }
        if (PREVIEW[m]) startPreview();
    }
}

submitGuessBtn.onclick = () => {
    if (state.phase !== 'recall') return;

    // Handle 1v1 Duel turn switching
    if (state.playMode === 'duel' && state.activePlayer === 1) {
        state.p1Guess = JSON.parse(JSON.stringify(state.guess));
        state.activePlayer = 2;
        playerTurnBanner.className = 'w-full text-center py-2 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center gap-2 animate-pulse';
        playerTurnText.textContent = '⚔️ Spieler 2: Stelle deinen Versuch ein!';
        submitGuessBtnText.textContent = 'Spieler 2 Bestätigen & Werten';
        renderRecallControls();
        audio.playClick(600);
        return;
    }

    if (state.playMode === 'duel' && state.activePlayer === 2) {
        state.p2Guess = JSON.parse(JSON.stringify(state.guess));
    }

    // Handle Koop turn switching & Mittelwert Calculation
    if (state.playMode === 'coop' && state.activePlayer === 1) {
        state.p1Guess = JSON.parse(JSON.stringify(state.guess));
        state.activePlayer = 2;
        playerTurnBanner.className = 'w-full text-center py-2 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center gap-2 animate-pulse';
        playerTurnText.textContent = '🤝 Spieler 2: Stelle deinen Wert ein (2/2)';
        submitGuessBtnText.textContent = 'Spieler 2 Bestätigen & Mittelwert Berechnen';
        renderRecallControls();
        audio.playClick(600);
        return;
    }

    if (state.playMode === 'coop' && state.activePlayer === 2) {
        state.p2Guess = JSON.parse(JSON.stringify(state.guess));
        // Calculate Team Mittelwert (Average)
        state.teamGuess = calculateAverageGuess(state.p1Guess, state.p2Guess, state.mode);
    }

    let sc1 = 0, sc2 = 0, coopScore = 0;
    if (state.playMode === 'duel') {
        sc1 = evaluateScore(state.target, state.p1Guess, state.mode);
        sc2 = evaluateScore(state.target, state.p2Guess, state.mode);
        if (sc1 > sc2) state.p1Wins++; else if (sc2 > sc1) state.p2Wins++;
        state.p1TotalScore += sc1;
        state.p2TotalScore += sc2;
        state.totalScore += Math.max(sc1, sc2);
        state.roundScores.push(Math.max(sc1, sc2));
    } else if (state.playMode === 'coop') {
        coopScore = evaluateScore(state.target, state.teamGuess, state.mode);
        state.totalScore += coopScore;
        state.roundScores.push(coopScore);
    } else {
        const score = evaluateScore(state.target, state.guess, state.mode);
        state.totalScore += score;
        state.roundScores.push(score);
    }

    showRoundResult(sc1, sc2, coopScore);
};

function calculateAverageGuess(p1, p2, mode) {
    if (!p1 || !p2) return p1 || p2;
    let avg = {};
    if (EXT[mode]) return EXT[mode].avg(p1, p2);
    if (mode === 'color') {
        let h1 = p1.h, h2 = p2.h;
        let diff = Math.abs(h1 - h2);
        let hAvg = diff > 180 ? ((h1 + h2 + 360) / 2) % 360 : (h1 + h2) / 2;
        avg = {
            h: Math.round(hAvg),
            s: Math.round((p1.s + p2.s) / 2),
            l: Math.round((p1.l + p2.l) / 2)
        };
    } else if (mode === 'harmony') {
        avg = {
            f1: Math.round((p1.f1 + p2.f1) / 2),
            f2: Math.round((p1.f2 + p2.f2) / 2)
        };
    } else if (mode === 'vector' || mode === 'split_radar') {
        avg = {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        };
    } else if (mode === 'angle') {
        avg = { val: Math.round(circMean(p1.val, p2.val)) };
    } else if (mode === 'duo_radar') {
        avg = { a1: Math.round(circMean(p1.a1, p2.a1)), a2: Math.round(circMean(p1.a2, p2.a2)) };
    } else if (mode === 'shape') {
        avg = { scale: (p1.scale + p2.scale) / 2, rotation: Math.round(circMean(p1.rotation, p2.rotation)), rounded: (p1.rounded + p2.rounded) / 2 };
    } else if (mode === 'grid') {
        let combined = Array.from(new Set([...(p1.cells || []), ...(p2.cells || [])]));
        avg = { cells: combined };
    } else {
        let v1 = p1.freq || p1.duration || p1.bpm || p1.val || 0;
        let v2 = p2.freq || p2.duration || p2.bpm || p2.val || 0;
        let mean = (v1 + v2) / 2;
        if (p1.freq !== undefined) avg.freq = Math.round(mean);
        else if (p1.duration !== undefined) avg.duration = Math.round(mean);
        else if (p1.bpm !== undefined) avg.bpm = Math.round(mean);
        else avg.val = parseFloat(mean.toFixed(2));
    }
    return avg;
}

function evaluateScore(target, guess, mode) {
    if (!guess) return 0;
    if (EXT[mode]) return parseFloat(Math.max(0, Math.min(10, EXT[mode].score(target, guess))).toFixed(2));
    let score = 0;

    if (mode === 'color') {
        const dh = Math.min(Math.abs(target.h - guess.h), 360 - Math.abs(target.h - guess.h)) / 180;
        const ds = Math.abs(target.s - guess.s) / 100;
        const dl = Math.abs(target.l - guess.l) / 100;
        const dist = Math.sqrt(dh*dh * 0.5 + ds*ds * 0.25 + dl*dl * 0.25);
        score = Math.max(0, 10 * Math.exp(-dist * 4));
    } else if (mode === 'harmony') {
        const r1 = Math.abs(target.f1 - guess.f1) / target.f1;
        const r2 = Math.abs(target.f2 - guess.f2) / target.f2;
        score = Math.max(0, 10 * Math.exp(-(r1 + r2) * 3.5));
    } else if (mode === 'split_radar') {
        const targetX = (target.x1 + target.x2) / 2;
        const targetY = (target.y1 + target.y2) / 2;
        const dx = targetX - (guess.x || 0.5);
        const dy = targetY - (guess.y || 0.5);
        const dist = Math.sqrt(dx*dx + dy*dy);
        score = Math.max(0, 10 * Math.exp(-dist * 5));
    } else if (mode === 'sound') {
        const ratio = Math.abs(target.freq - guess.freq) / target.freq;
        score = Math.max(0, 10 * Math.exp(-ratio * 6.5));
    } else if (mode === 'time') {
        const diffMs = Math.abs(target.duration - (guess.duration || 0));
        score = Math.max(0, 10 * Math.exp(-(diffMs / target.duration) * 3.5));
    } else if (mode === 'vector') {
        const dx = target.x - (guess.x || 0.5);
        const dy = target.y - (guess.y || 0.5);
        const dist = Math.sqrt(dx*dx + dy*dy);
        score = Math.max(0, 10 * Math.exp(-dist * 5));
    } else if (mode === 'grid') {
        let matches = target.cells.filter(c => (guess.cells || []).includes(c)).length;
        const extra = (guess.cells || []).length - matches;
        score = Math.max(0, (matches - extra * 0.5) / target.cells.length) * 10;
    } else if (mode === 'angle') {
        score = 10 * Math.exp(-(cdiff(target.angle, guess.val) / 180) * 5);
    } else if (mode === 'shape') {
        const ds = Math.min(1, Math.abs(target.scale - guess.scale) / 0.5);
        const dr = Math.min(cdiff(target.rotation, guess.rotation) % 90, 90 - (cdiff(target.rotation, guess.rotation) % 90)) / 45;
        const dc = Math.abs(target.rounded - guess.rounded) / 50;
        score = 10 * Math.exp(-Math.sqrt(ds * ds * 0.4 + dr * dr * 0.35 + dc * dc * 0.25) * 3);
    } else if (mode === 'duo_radar') {
        const a = cdiff(target.a1, guess.a1) + cdiff(target.a2, guess.a2);
        const b = cdiff(target.a1, guess.a2) + cdiff(target.a2, guess.a1);
        score = 10 * Math.exp(-(Math.min(a, b) / 2 / 180) * 5);
    } else if (REL[mode]) {
        const [key, k] = REL[mode];
        score = 10 * Math.exp(-(Math.abs(target[key] - (guess.val || 0)) / target[key]) * k);
    } else {
        let targetVal = target.val || target.bpm || target.angle || target.speed || target.count || target.hz || target.weight || 50;
        let guessVal = guess.val || guess.bpm || 50;
        let diff = Math.abs(targetVal - guessVal) / (targetVal || 1);
        score = Math.max(0, 10 * Math.exp(-diff * 3));
    }
    return parseFloat(score.toFixed(2));
}

function showRoundResult(sc1, sc2, coopScore) {
    state.phase = 'result';
    cancelAnimationFrame(state.animFrame);
    stopRecallAnim();
    stageRecall.classList.add('hidden');
    stageResult.classList.remove('hidden');

    const roundScoreBadge = document.getElementById('roundScoreBadge');

    if (state.playMode === 'solo') {
        resultPhaseTitle.textContent = 'RUNDENERGEBNIS';
        const sc = state.roundScores[state.roundScores.length - 1] || 0;
        roundScoreBadge.innerHTML = `+${sc.toFixed(2)} <span class="text-lg text-slate-400">/ 10</span>`;
        if (sc > 8.5) audio.playSuccess(); else audio.playClick(500);

        comparisonContainer.className = 'grid grid-cols-2 gap-3 w-full max-w-sm my-2';
        comparisonContainer.innerHTML = `
            <div class="flex flex-col items-center glass-panel p-3 rounded-2xl border border-slate-800">
                <span class="text-[10px] text-slate-400 uppercase font-mono mb-2">Original</span>
                <div id="targetValBox" class="min-w-[5rem] min-h-[4rem] rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-cyan-400 p-2 text-center overflow-hidden"></div>
            </div>
            <div class="flex flex-col items-center glass-panel p-3 rounded-2xl border border-slate-800">
                <span class="text-[10px] text-slate-400 uppercase font-mono mb-2">Dein Versuch</span>
                <div id="guessValBox" class="min-w-[5rem] min-h-[4rem] rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-purple-400 p-2 text-center overflow-hidden"></div>
            </div>
        `;
    } else if (state.playMode === 'duel') {
        resultPhaseTitle.textContent = 'DUELL RUNDEN-DUELL (1v1)';
        let winnerText = sc1 > sc2 ? '👑 Spieler 1 gewinnt!' : sc2 > sc1 ? '👑 Spieler 2 gewinnt!' : '🤝 Unentschieden!';
        roundScoreBadge.innerHTML = `<span class="text-xl font-mono text-amber-300">${winnerText}</span>`;

        comparisonContainer.className = 'grid grid-cols-3 gap-2 w-full max-w-md my-2';
        comparisonContainer.innerHTML = `
            <div class="flex flex-col items-center glass-panel p-2.5 rounded-2xl border border-cyan-500/30">
                <span class="text-[10px] text-cyan-400 uppercase font-mono font-bold mb-1">Spieler 1</span>
                <div id="p1ValBox" class="w-full min-h-[3.5rem] rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono text-[11px] text-cyan-300 text-center p-1"></div>
                <span class="text-[11px] font-mono text-cyan-400 font-bold mt-1.5">+${sc1.toFixed(2)}</span>
            </div>
            <div class="flex flex-col items-center glass-panel p-2.5 rounded-2xl border border-purple-500/30 bg-purple-950/20">
                <span class="text-[10px] text-purple-300 uppercase font-mono mb-1">Zielwert</span>
                <div id="targetValBox" class="w-full min-h-[3.5rem] rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono text-[11px] text-purple-300 text-center p-1"></div>
            </div>
            <div class="flex flex-col items-center glass-panel p-2.5 rounded-2xl border border-rose-500/30">
                <span class="text-[10px] text-rose-400 uppercase font-mono font-bold mb-1">Spieler 2</span>
                <div id="p2ValBox" class="w-full min-h-[3.5rem] rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono text-[11px] text-rose-300 text-center p-1"></div>
                <span class="text-[11px] font-mono text-rose-400 font-bold mt-1.5">+${sc2.toFixed(2)}</span>
            </div>
        `;
    } else if (state.playMode === 'coop') {
        resultPhaseTitle.textContent = 'KOOP TEAM-MITTELWERT';
        roundScoreBadge.innerHTML = `+${coopScore.toFixed(2)} <span class="text-lg text-slate-400">/ 10</span>`;
        if (coopScore > 8.0) audio.playSuccess(); else audio.playClick(500);

        comparisonContainer.className = 'grid grid-cols-4 gap-1.5 w-full max-w-md my-2';
        comparisonContainer.innerHTML = `
            <div class="flex flex-col items-center glass-panel p-2 rounded-xl border border-amber-500/30">
                <span class="text-[9px] text-amber-300 uppercase font-mono mb-1">P1 Wert</span>
                <div id="p1ValBox" class="w-full min-h-[3rem] rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[10px] text-amber-300 text-center p-1"></div>
            </div>
            <div class="flex flex-col items-center glass-panel p-2 rounded-xl border border-purple-500/30">
                <span class="text-[9px] text-purple-300 uppercase font-mono mb-1">P2 Wert</span>
                <div id="p2ValBox" class="w-full min-h-[3rem] rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[10px] text-purple-300 text-center p-1"></div>
            </div>
            <div class="flex flex-col items-center glass-panel p-2 rounded-xl border border-emerald-500/40 bg-emerald-950/20">
                <span class="text-[9px] text-emerald-400 font-bold uppercase font-mono mb-1">Mittelwert</span>
                <div id="guessValBox" class="w-full min-h-[3rem] rounded-lg bg-slate-950 border border-emerald-500/50 flex items-center justify-center font-mono text-[10px] text-emerald-300 text-center p-1 font-bold"></div>
            </div>
            <div class="flex flex-col items-center glass-panel p-2 rounded-xl border border-cyan-500/30">
                <span class="text-[9px] text-cyan-300 uppercase font-mono mb-1">Zielwert</span>
                <div id="targetValBox" class="w-full min-h-[3rem] rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[10px] text-cyan-300 text-center p-1"></div>
            </div>
        `;
    }

    // Fill visual values
    const targetBox = document.getElementById('targetValBox');
    const guessBox = document.getElementById('guessValBox');
    const p1Box = document.getElementById('p1ValBox');
    const p2Box = document.getElementById('p2ValBox');

    const UNITS = { echo_gap: ' ms', micro_gap: ' px', spin: ' RPM', tunnel: ' ms', chroma: ' %', angle: '°', strobe: ' Hz', duo_balance: ' %', tempo: ' BPM', sound: ' Hz' };
    const fmtVal = (v) => {
        if (!v) return '–';
        if (EXT[state.mode]) return EXT[state.mode].fmt(v);
        if (v.h !== undefined) return `H${v.h}° S${v.s}% L${v.l}%`;
        if (v.f1 !== undefined) return `${v.f1} / ${v.f2} Hz`;
        if (v.a1 !== undefined) return `${Math.round(v.a1)}° / ${Math.round(v.a2)}°`;
        if (v.scale !== undefined) return `${Math.round(v.scale * 100)}% · ${Math.round(v.rotation)}° · R${Math.round(v.rounded)}`;
        if (v.cells) return v.cells.length ? v.cells.map(c => c + 1).sort((a, b) => a - b).join(',') : '–';
        if (v.x1 !== undefined) return `${Math.round((v.x1 + v.x2) / 2 * 100)}|${Math.round((v.y1 + v.y2) / 2 * 100)}`;
        if (v.x !== undefined) return `${Math.round(v.x * 100)}|${Math.round(v.y * 100)}`;
        if (v.duration !== undefined) return `${(v.duration / 1000).toFixed(2)} s`;
        const n = [v.val, v.freq, v.bpm, v.angle, v.speed, v.count, v.hz, v.weight, v.gap, v.rpm, v.c, v.t].find(x => x !== undefined);
        return n === undefined ? '–' : `${Number.isInteger(n) ? n : (+n).toFixed(1)}${UNITS[state.mode] || ''}`;
    };
    if (targetBox) targetBox.textContent = fmtVal(state.target);
    if (guessBox) guessBox.textContent = fmtVal(state.playMode === 'coop' ? state.teamGuess : state.guess);
    if (p1Box) p1Box.textContent = fmtVal(state.p1Guess);
    if (p2Box) p2Box.textContent = fmtVal(state.p2Guess);

    updateRoundUI();
}

document.getElementById('nextRoundBtn').onclick = () => {
    if (state.round < state.maxRounds) {
        state.round++;
        startRound();
    } else {
        finishGame();
    }
};

function finishGame() {
    summaryModal.classList.remove('hidden');
    document.getElementById('summaryScoreDisplay').innerHTML = `${state.totalScore.toFixed(2)} <span class="text-lg text-slate-400">/ 50</span>`;

    let rank = 'Anfänger-Sinn 🐣';
    if (state.totalScore > 45) rank = 'Quanten-Gehirn 🧠⚡';
    else if (state.totalScore > 38) rank = 'Adler-Auge & Perfektes Gehör 🦅';
    else if (state.totalScore > 30) rank = 'Scharfer Beobachter 🎯';
    document.getElementById('summaryRankTitle').textContent = rank;
    if (state.playMode === 'duel') {
        document.getElementById('summaryScoreDisplay').innerHTML = `${state.p1Wins} <span class="text-lg text-slate-400">:</span> ${state.p2Wins}`;
        document.getElementById('summaryRankTitle').textContent = state.p1Wins > state.p2Wins ? '👑 Spieler 1 gewinnt das Duell!' : state.p2Wins > state.p1Wins ? '👑 Spieler 2 gewinnt das Duell!' : '🤝 Unentschieden!';
    }

    const roundsList = document.getElementById('summaryRoundsList');
    roundsList.innerHTML = '';
    state.roundScores.forEach((sc, i) => {
        roundsList.innerHTML += `<div class="flex justify-between py-1 border-b border-slate-900"><span>Runde ${i+1}</span><span class="text-emerald-400 font-bold">+${sc.toFixed(2)}</span></div>`;
    });

    if (!state.highScores[state.mode] || state.totalScore > state.highScores[state.mode]) {
        state.highScores[state.mode] = state.totalScore;
        try { localStorage.setItem('nexus_lab_hs', JSON.stringify(state.highScores)); } catch (e) {}
    }
}

document.getElementById('playAgainBtn').onclick = () => {
    summaryModal.classList.add('hidden');
    resetGame();
    startRound();
};

document.getElementById('copyShareBtn').onclick = () => {
    const text = `NEXUS LAB - ${MODES[state.mode].name}\nScore: ${state.totalScore.toFixed(2)} / 50 Punkte! 🧠⚡`;
    try { navigator.clipboard.writeText(text).catch(() => {}); } catch (e) {}
    document.getElementById('copyShareBtn').innerHTML = `<span class="">✔</span> Kopiert!`;
    setTimeout(() => document.getElementById('copyShareBtn').innerHTML = `<span class="">🔗</span> Teilen`, 2000);
};

document.getElementById('statsModalBtn').onclick = openStatsModal;
document.getElementById('closeStatsBtn').onclick = () => statsModal.classList.add('hidden');

function openStatsModal() {
    statsModal.classList.remove('hidden');
    drawRadarChart();
    const list = document.getElementById('statsList');
    list.innerHTML = '';
    Object.values(MODES).forEach(m => {
        const hs = state.highScores[m.id] ? state.highScores[m.id].toFixed(2) : '0.00';
        list.innerHTML += `
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 text-xs font-mono border border-slate-800">
                <span class="text-slate-300 flex items-center gap-2"><span>${m.icon}</span> ${m.name}</span>
                <span class="text-emerald-400 font-bold">${hs} / 50</span>
            </div>
        `;
    });
}

function drawRadarChart() {
    const canvas = document.getElementById('radarChartCanvas');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 30;

    const axes = ['Visuell', 'Auditiv', 'Zeitgefühl', 'Räumlich', 'Kognitiv'];
    const angles = axes.map((_, i) => (i * 2 * Math.PI) / axes.length - Math.PI / 2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let r = 0.2; r <= 1.0; r += 0.2) {
        ctx.beginPath();
        angles.forEach((angle, i) => {
            let x = cx + Math.cos(angle) * radius * r;
            let y = cy + Math.sin(angle) * radius * r;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Space Grotesk';
    angles.forEach((angle, i) => {
        let x = cx + Math.cos(angle) * radius;
        let y = cy + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();

        let lx = cx + Math.cos(angle) * (radius + 18);
        let ly = cy + Math.sin(angle) * (radius + 18);
        ctx.textAlign = 'center';
        ctx.fillText(axes[i], lx, ly);
    });
    const vals = axes.map(ax => { const ms = Object.values(MODES).filter(m => m.axis === ax); return Math.min(1, ms.reduce((a, m) => a + (state.highScores[m.id] || 0), 0) / (ms.length * 50)); });
    ctx.beginPath();
    vals.forEach((v, i) => { const x = cx + Math.cos(angles[i]) * radius * v, y = cy + Math.sin(angles[i]) * radius * v; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.closePath();
    ctx.fillStyle = 'rgba(168,85,247,0.35)'; ctx.fill();
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2; ctx.stroke();
}


const PREVIEW = {
    angle: g => ({ angle: g.val }), velocity: g => ({ speed: g.val }), quantity: g => ({ count: Math.round(g.val) }),
    strobe: g => ({ hz: g.val }), duo_balance: g => ({ weight: g.val }), shape: g => g, spin: g => ({ rpm: g.val }),
    micro_gap: g => ({ gap: g.val }), chroma: g => ({ c: g.val }), duo_radar: g => g,
    sound: g => ({ freq: g.freq }), harmony: g => ({ f1: g.f1, f2: g.f2 })
};
const REL = { echo_gap: ['gap', 2.5], micro_gap: ['gap', 1.5], spin: ['rpm', 3], chroma: ['c', 1.5], tunnel: ['t', 3.5] };
const cdiff = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const circMean = (a, b) => { const r = Math.PI / 180; const x = Math.cos(a * r) + Math.cos(b * r), y = Math.sin(a * r) + Math.sin(b * r); return ((Math.atan2(y, x) / r) + 360) % 360; };
