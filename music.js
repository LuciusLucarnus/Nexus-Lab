// --- Leise Arcade-Hintergrundmusik (synthetisch, keine Dateien) ---
const MUSIC_QUIET_MODES = ['sound', 'harmony', 'echo_gap', 'tempo'];
const music = {
    on: true, started: false, step: 0, next: 0, master: null, noise: null, SD: 60 / 132 / 2,
    chords: [
        { b: 110.0, pad: [220.0, 261.63, 329.63] }, { b: 87.31, pad: [174.61, 220.0, 261.63] },
        { b: 130.81, pad: [261.63, 329.63, 392.0] }, { b: 98.0, pad: [196.0, 246.94, 293.66] }
    ],
    mel: [[0, 659.25, 2], [2, 523.25, 1], [3, 587.33, 1], [4, 659.25, 2], [6, 880, 2],
          [8, 698.46, 2], [10, 880, 1], [11, 698.46, 1], [12, 523.25, 2], [14, 440, 2],
          [16, 659.25, 2], [18, 783.99, 1], [19, 659.25, 1], [20, 523.25, 2], [22, 659.25, 2],
          [24, 587.33, 2], [26, 493.88, 1], [27, 587.33, 1], [28, 783.99, 3]],
    start() {
        if (this.started) return;
        audio.init();
        const c = audio.ctx;
        if (!c) return;
        this.master = c.createGain();
        this.master.gain.value = 0.05;
        this.master.connect(c.destination);
        this.noise = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
        const d = this.noise.getChannelData(0);
        for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
        this.started = true;
        this.next = c.currentTime + 0.1;
        setInterval(() => this.tick(), 100);
    },
    quiet() {
        const inArena = hubView.classList.contains('hidden');
        return !this.on || !audio.enabled || (inArena && MUSIC_QUIET_MODES.includes(state.mode));
    },
    tick() {
        const c = audio.ctx;
        if (!c || !this.started) return;
        if (this.next < c.currentTime - 0.1) this.next = c.currentTime;
        const q = this.quiet();
        while (this.next < c.currentTime + 0.3) {
            if (!q) this.note(this.step % 32, this.next);
            this.step++;
            this.next += this.SD;
        }
    },
    tone(type, freq, t, dur, vol, att = 0.01, vib = false) {
        const c = audio.ctx, o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(vol, t + att);
        g.gain.setValueAtTime(vol, t + Math.max(att, dur - 0.07));
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        if (vib) {
            const l = c.createOscillator(), lg = c.createGain();
            l.frequency.value = 5.5; lg.gain.value = freq * 0.008;
            l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.02);
        }
        o.connect(g); g.connect(this.master);
        o.start(t); o.stop(t + dur + 0.02);
    },
    hit(t, dur, vol, hp) {
        const c = audio.ctx, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
        src.buffer = this.noise; f.type = 'highpass'; f.frequency.value = hp;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(f); f.connect(g); g.connect(this.master);
        src.start(t); src.stop(t + dur);
    },
    note(i, t) {
        const sd = this.SD, ch = this.chords[Math.floor(i / 8)], p = i % 8;
        if (p === 0) ch.pad.forEach(f => this.tone('triangle', f, t, sd * 8, 0.12, 0.15));
        this.tone('triangle', p % 2 ? ch.b * 2 : ch.b, t, sd * 0.95, 0.55);
        this.mel.forEach(([st, f, d]) => { if (st === i) this.tone('square', f, t, d * sd, 0.2, 0.02, true); });
        if (p === 0 || p === 4) {
            const c = audio.ctx, o = c.createOscillator(), g = c.createGain();
            o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
            g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
            o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.16);
        }
        if (p === 2 || p === 6) this.hit(t, 0.1, 0.3, 1500);
        if (p % 2) this.hit(t, 0.04, 0.08, 7000);
    }
};
let musicPref = true;
try { musicPref = localStorage.getItem('dn_music') !== 'off'; } catch (e) {}
music.on = musicPref;
const syncMusicIcon = () => { document.getElementById('musicIcon').textContent = music.on ? '🎵' : '🔇'; };
syncMusicIcon();
document.addEventListener('pointerdown', () => { if (!music.started) music.start(); }, { once: false });
document.getElementById('musicToggleBtn').onclick = () => {
    music.on = !music.on;
    try { localStorage.setItem('dn_music', music.on ? 'on' : 'off'); } catch (e) {}
    syncMusicIcon();
    if (music.on) music.start();
};
