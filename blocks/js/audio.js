// Simple Web Audio API Synthesizer

export const AudioSystem = {
    ctx: null,
    ambientOsc: null,
    ambientGain: null,

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    startAmbient() {
        if (!this.ctx) return;
        this.stopAmbient();

        this.ambientOsc = this.ctx.createOscillator();
        this.ambientGain = this.ctx.createGain();
        
        this.ambientOsc.type = 'sine';
        this.ambientOsc.frequency.value = 50; // Low drone
        
        this.ambientGain.gain.value = 0.05;
        
        this.ambientOsc.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);
        
        this.ambientOsc.start();
    },

    stopAmbient() {
        if (this.ambientOsc) {
            this.ambientOsc.stop();
            this.ambientOsc.disconnect();
            this.ambientGain.disconnect();
            this.ambientOsc = null;
        }
    },

    playDiscovery() {
        if (!this.ctx) return;
        this.playTone(440, 'sine', 0.1, 0.1);
        setTimeout(() => this.playTone(554, 'sine', 0.1, 0.1), 100);
        setTimeout(() => this.playTone(659, 'sine', 0.4, 0.1), 200);
    },

    playChestOpen() {
        if (!this.ctx) return;
        // Simulating creak with low saw wave sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    },

    playCorrect() {
        if (!this.ctx) return;
        this.playTone(880, 'square', 0.1, 0.05);
        setTimeout(() => this.playTone(1760, 'square', 0.3, 0.05), 100);
    },

    playWrong() {
        if (!this.ctx) return;
        this.playTone(150, 'sawtooth', 0.3, 0.1);
    },

    playFanfare() {
        if (!this.ctx) return;
        this.playTone(523.25, 'square', 0.2, 0.05); // C5
        setTimeout(() => this.playTone(659.25, 'square', 0.2, 0.05), 200); // E5
        setTimeout(() => this.playTone(783.99, 'square', 0.2, 0.05), 400); // G5
        setTimeout(() => this.playTone(1046.50, 'square', 0.6, 0.05), 600); // C6
    },

    playJumpScare() {
        if (!this.ctx) return;
        // Low frequency horror drone
        this.playTone(60, 'sawtooth', 0.5, 0.2);
        this.playTone(70, 'sawtooth', 0.5, 0.2);
        this.playTone(80, 'sawtooth', 0.5, 0.2);
    },

    playPew() {
        if (!this.ctx) return;
        // High pitch explosive saw noise sweeping down quickly
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    },

    playMonsterScream() {
        if (!this.ctx) return;
        // Scary high-pitch screech
        this.playTone(880, 'sawtooth', 0.3, 0.15);
        setTimeout(() => this.playTone(660, 'sawtooth', 0.3, 0.15), 100);
        setTimeout(() => this.playTone(440, 'sawtooth', 0.4, 0.15), 200);
    },

    playHeartbeat() {
        if (!this.ctx) return;
        // Low double thud
        this.playTone(70, 'sine', 0.1, 0.3);
        setTimeout(() => this.playTone(65, 'sine', 0.15, 0.3), 150);
    }
};
