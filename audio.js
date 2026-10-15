// --- Web Audio API Engine ---
class NexusAudio {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playFreq(freq, type = 'sine', duration = 0.5) {
        if (!this.enabled) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playChord(f1, f2, duration = 0.6) {
        if (!this.enabled) return;
        this.playFreq(f1, 'sine', duration);
        this.playFreq(f2, 'triangle', duration);
    }

    playClick(pitch = 800) {
        if (!this.enabled) return;
        this.playFreq(pitch, 'triangle', 0.05);
    }

    clickAt(off, pitch = 1500) {
        if (!this.enabled) return;
        this.init();
        const t0 = this.ctx.currentTime + off;
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'square'; o.frequency.value = pitch;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.002);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.03);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(t0); o.stop(t0 + 0.04);
    }

    clickPair(gapMs, off) { this.clickAt(off); this.clickAt(off + gapMs / 1000); }

    playSuccess() {
        if (!this.enabled) return;
        this.playFreq(523.25, 'sine', 0.15); // C5
        setTimeout(() => this.playFreq(659.25, 'sine', 0.15), 100); // E5
        setTimeout(() => this.playFreq(783.99, 'sine', 0.3), 200); // G5
    }
}

const audio = new NexusAudio();
