export type SoundEffectType =
	| "reward"
	| "levelUp"
	| "achievement"
	| "error"
	| "click"
	| "success";

interface SoundEffectConfig {
	frequency: number;
	duration: number;
	volume: number;
	type: OscillatorType;
}

const soundConfigs: Record<SoundEffectType, SoundEffectConfig[]> = {
	reward: [
		{ frequency: 523.25, duration: 100, volume: 0.3, type: "sine" },
		{ frequency: 659.25, duration: 100, volume: 0.3, type: "sine" },
		{ frequency: 783.99, duration: 200, volume: 0.3, type: "sine" },
	],
	levelUp: [
		{ frequency: 261.63, duration: 150, volume: 0.3, type: "sine" },
		{ frequency: 329.63, duration: 150, volume: 0.3, type: "sine" },
		{ frequency: 392.0, duration: 150, volume: 0.3, type: "sine" },
		{ frequency: 523.25, duration: 300, volume: 0.4, type: "sine" },
	],
	achievement: [
		{ frequency: 440.0, duration: 100, volume: 0.3, type: "square" },
		{ frequency: 554.37, duration: 100, volume: 0.3, type: "square" },
		{ frequency: 659.25, duration: 100, volume: 0.3, type: "square" },
		{ frequency: 880.0, duration: 200, volume: 0.4, type: "square" },
	],
	error: [{ frequency: 200.0, duration: 300, volume: 0.2, type: "sawtooth" }],
	click: [{ frequency: 1000.0, duration: 50, volume: 0.1, type: "sine" }],
	success: [
		{ frequency: 523.25, duration: 100, volume: 0.2, type: "sine" },
		{ frequency: 659.25, duration: 150, volume: 0.2, type: "sine" },
	],
};

class SoundEffectService {
	private audioContext: AudioContext | null = null;
	private enabled = true;

	constructor() {
		if (typeof window !== "undefined" && window.AudioContext) {
			this.audioContext = new AudioContext();
		}
	}

	private async ensureAudioContext() {
		if (!this.audioContext && typeof window !== "undefined") {
			this.audioContext = new AudioContext();
		}

		if (this.audioContext?.state === "suspended") {
			await this.audioContext.resume();
		}
	}

	async play(effect: SoundEffectType) {
		if (!this.enabled) return;

		try {
			await this.ensureAudioContext();
			if (!this.audioContext) return;

			const configs = soundConfigs[effect];
			const startTime = this.audioContext.currentTime;

			configs.forEach((config, index) => {
				if (!this.audioContext) return;

				const oscillator = this.audioContext.createOscillator();
				const gainNode = this.audioContext.createGain();

				oscillator.connect(gainNode);
				gainNode.connect(this.audioContext.destination);

				oscillator.type = config.type;
				oscillator.frequency.setValueAtTime(
					config.frequency,
					startTime + index * 0.1,
				);

				gainNode.gain.setValueAtTime(config.volume, startTime + index * 0.1);
				gainNode.gain.exponentialRampToValueAtTime(
					0.01,
					startTime + index * 0.1 + config.duration / 1000,
				);

				oscillator.start(startTime + index * 0.1);
				oscillator.stop(startTime + index * 0.1 + config.duration / 1000);
			});
		} catch (error) {
			console.warn("音響効果の再生に失敗しました:", error);
		}
	}

	setEnabled(enabled: boolean) {
		this.enabled = enabled;
		if (typeof window !== "undefined") {
			localStorage.setItem("soundEffectsEnabled", String(enabled));
		}
	}

	isEnabled() {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem("soundEffectsEnabled");
			if (stored !== null) {
				this.enabled = stored === "true";
			}
		}
		return this.enabled;
	}
}

export const soundEffects = new SoundEffectService();
