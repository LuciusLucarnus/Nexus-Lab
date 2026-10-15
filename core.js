// --- Application State ---
const state = {
    mode: 'color',
    playMode: 'solo', // 'solo', 'duel', 'coop'
    activePlayer: 1,
    filter: 'all',
    proMode: false,
    round: 1,
    maxRounds: 5,
    totalScore: 0,
    p1TotalScore: 0,
    p2TotalScore: 0,
    p1Wins: 0,
    p2Wins: 0,
    p1Guess: null,
    p2Guess: null,
    roundScores: [],
    phase: 'idle', // 'idle', 'reveal', 'recall', 'result'
    target: null,
    guess: null,
    timerInterval: null,
    animFrame: null,
    tapTimes: [],
    timePressStart: 0,
    gridSelected: [],
    highScores: (() => { try { return JSON.parse(localStorage.getItem('nexus_lab_hs') || localStorage.getItem('dialed_nexus_hs_v5') || '{}'); } catch (e) { return {}; } })()
};

// DOM References
const hubView = document.getElementById('hubView');
const arenaView = document.getElementById('arenaView');
const gamesGrid = document.getElementById('gamesGrid');
const startOverlay = document.getElementById('startOverlay');
const stageReveal = document.getElementById('stageReveal');
const stageRecall = document.getElementById('stageRecall');
const stageResult = document.getElementById('stageResult');
const gameCanvas = document.getElementById('gameCanvas');
const recallCanvas = document.getElementById('recallCanvas');
const controlsContainer = document.getElementById('controlsContainer');
const revealTimerBar = document.getElementById('revealTimerBar');
const revealSubtitle = document.getElementById('revealSubtitle');
const roundDisplay = document.getElementById('roundDisplay');
const roundDots = document.getElementById('roundDots');
const totalScoreDisplay = document.getElementById('totalScoreDisplay');
const playerTurnBanner = document.getElementById('playerTurnBanner');
const playerTurnText = document.getElementById('playerTurnText');
const submitGuessBtn = document.getElementById('submitGuessBtn');
const submitGuessBtnText = document.getElementById('submitGuessBtnText');
const scoreBoardLabel = document.getElementById('scoreBoardLabel');
const comparisonContainer = document.getElementById('comparisonContainer');
const resultPhaseTitle = document.getElementById('resultPhaseTitle');
const summaryModal = document.getElementById('summaryModal');
const statsModal = document.getElementById('statsModal');
const proModeBtn = document.getElementById('proModeBtn');
const proModeIcon = document.getElementById('proModeIcon');
const proModeBadge = document.getElementById('proModeBadge');

// Header Playmode selectors
document.querySelectorAll('.mode-select-btn').forEach(btn => {
    btn.addEventListener('click', () => setPlayMode(btn.dataset.mode));
});
document.querySelectorAll('.overlay-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setPlayMode(btn.dataset.overlayMode));
});

function setPlayMode(mode) {
    state.playMode = mode;
    document.querySelectorAll('.mode-select-btn').forEach(b => {
        b.className = b.dataset.mode === mode 
            ? 'mode-select-btn px-2.5 py-1 rounded-lg text-white bg-purple-600 transition flex items-center gap-1'
            : 'mode-select-btn px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-1';
    });
    document.querySelectorAll('.overlay-mode-btn').forEach(b => {
        b.className = b.dataset.overlayMode === mode 
            ? 'overlay-mode-btn text-xs font-mono px-3 py-1.5 rounded-lg text-white bg-purple-600'
            : 'overlay-mode-btn text-xs font-mono px-3 py-1.5 rounded-lg text-slate-400 hover:text-white';
    });
    updateRoundUI();
}

// Pro Mode
proModeBtn.addEventListener('click', () => {
    state.proMode = !state.proMode;
    proModeBtn.classList.toggle('pro-mode-active', state.proMode);
    proModeIcon.style.color = state.proMode ? '#f43f5e' : '';
    proModeBadge.classList.toggle('hidden', !state.proMode);
    audio.playClick(state.proMode ? 900 : 400);
});

// Hub Tab Filtering
document.querySelectorAll('.hub-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.hub-tab-btn').forEach(b => b.className = 'hub-tab-btn px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-400 hover:text-white transition');
        btn.className = 'hub-tab-btn active px-4 py-2 rounded-xl text-xs font-mono font-semibold transition bg-purple-600 text-white shadow';
        state.filter = btn.dataset.filter;
        renderHub();
    });
});

document.getElementById('logoBtn').onclick = showHub;
document.getElementById('backToHubBtn').onclick = showHub;

function showHub() {
    cancelAnimationFrame(state.animFrame);
    clearInterval(state.timerInterval);
    stopRecallAnim();
    hubView.classList.remove('hidden');
    arenaView.classList.add('hidden');
    renderHub();
}

function renderHub() {
    if (window.__reloadOnHub) { location.reload(); return; }
    const cnt = { all: 0, duo: 0, dialed: 0, nexus: 0, arcade: 0 };
    Object.values(MODES).forEach(m => { cnt.all++; cnt[m.category]++; });
    const senseN = Object.values(ARCADE).filter(a => a.sense).length;
    cnt.arcade = Object.keys(ARCADE).length - senseN; cnt.nexus += senseN; cnt.all += cnt.arcade + senseN;
    const tabNames = { all: 'Alle Spiele', duo: '⚡ Koop & 1v1 Special', dialed: 'Klassiker', nexus: 'Nexus Lab Originals', arcade: '🕹️ Arcade' };
    document.querySelectorAll('.hub-tab-btn').forEach(b => { b.textContent = `${tabNames[b.dataset.filter]} (${cnt[b.dataset.filter]})`; });
    gamesGrid.innerHTML = '';
    Object.values(MODES).forEach(m => {
        if (state.filter === 'arcade') return;
        if (state.filter === 'duo' && m.category !== 'duo') return;
        if (state.filter === 'dialed' && m.category !== 'dialed') return;
        if (state.filter === 'nexus' && m.category !== 'nexus') return;

        const hs = state.highScores[m.id] ? state.highScores[m.id].toFixed(2) : '0.00';
        const card = document.createElement('div');
        card.className = 'glass-card p-5 rounded-2xl flex flex-col justify-between cursor-pointer group relative overflow-hidden';
        card.onclick = () => launchGame(m.id);
        
        let badgeText = m.category === 'duo' ? '⚡ Koop/1v1 Special' : (m.category === 'dialed' ? 'Classic' : 'Nexus');
        let badgeColor = m.category === 'duo' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700';

        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-${m.color}-500/20 border border-${m.color}-500/30 text-${m.color}-400 flex items-center justify-center text-lg">
                        ${m.icon}
                    </div>
                    <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border ${badgeColor}">
                        ${badgeText}
                    </span>
                </div>
                <h3 class="font-mono font-bold text-base text-white mb-1 group-hover:text-purple-400 transition">${m.name}</h3>
                <p class="text-xs text-slate-400 leading-relaxed mb-4">${m.desc}</p>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono">
                <span class="text-slate-500">Best: <b class="text-emerald-400">${hs}</b>/50</span>
                <span class="text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition">Spielen <span class="text-[10px]">→</span></span>
            </div>
        `;
        gamesGrid.appendChild(card);
    });
    if (state.filter === 'all') renderArcadeCards();
    else if (state.filter === 'arcade') renderArcadeCards('arcade');
    else if (state.filter === 'nexus') renderArcadeCards('sense');
    if (typeof Rank !== 'undefined') Rank.render();
}

function launchGame(key) {
    state.mode = key;
    const modeInfo = MODES[key];
    document.getElementById('modeTitle').textContent = modeInfo.name;
    document.getElementById('modeDescription').textContent = modeInfo.desc;
    document.getElementById('modeIconBadge').innerHTML = `${modeInfo.icon}`;
    document.getElementById('gameTitleBadge').textContent = modeInfo.name;

    hubView.classList.add('hidden');
    arenaView.classList.remove('hidden');
    arenaView.classList.add('flex');
    startOverlay.classList.remove('hidden');
    resetGame();
}
