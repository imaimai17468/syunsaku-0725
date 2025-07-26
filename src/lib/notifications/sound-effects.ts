export type SoundEffectType =
	| "reward"
	| "levelUp"
	| "achievement"
	| "error"
	| "click"
	| "success"
	| "button"
	| "toggle";

const soundFiles: Record<SoundEffectType, string> = {
	reward: "/SND01_sine/notification.wav",
	levelUp: "/SND01_sine/celebration.wav",
	achievement: "/SND01_sine/celebration.wav",
	error: "/SND01_sine/caution.wav",
	click: "/SND01_sine/tap_01.wav",
	success: "/SND01_sine/select.wav",
	button: "/SND01_sine/button.wav",
	toggle: "/SND01_sine/toggle_on.wav",
};

class SoundEffectService {
	private audioContext: AudioContext | null = null;
	private audioBuffers: Map<string, AudioBuffer> = new Map();
	private enabled = true;

	constructor() {
		if (typeof window !== "undefined" && window.AudioContext) {
			this.audioContext = new AudioContext();
			this.preloadSounds();
		}
	}

	private async preloadSounds() {
		if (!this.audioContext) return;

		const loadPromises = Object.entries(soundFiles).map(async ([key, path]) => {
			try {
				const response = await fetch(path);
				const arrayBuffer = await response.arrayBuffer();
				const audioBuffer =
					await this.audioContext?.decodeAudioData(arrayBuffer);
				if (audioBuffer) {
					this.audioBuffers.set(key, audioBuffer);
				}
			} catch (error) {
				console.warn(`音声ファイルの読み込みに失敗: ${path}`, error);
			}
		});

		await Promise.all(loadPromises);
	}

	private async ensureAudioContext() {
		if (!this.audioContext && typeof window !== "undefined") {
			this.audioContext = new AudioContext();
			await this.preloadSounds();
		}

		if (this.audioContext?.state === "suspended") {
			await this.audioContext.resume();
		}
	}

	async play(effect: SoundEffectType, volume = 0.5) {
		if (!this.enabled) return;

		try {
			await this.ensureAudioContext();
			if (!this.audioContext) return;

			const buffer = this.audioBuffers.get(effect);
			if (!buffer) {
				console.warn(`音声バッファが見つかりません: ${effect}`);
				return;
			}

			const source = this.audioContext.createBufferSource();
			const gainNode = this.audioContext.createGain();

			source.buffer = buffer;
			source.connect(gainNode);
			gainNode.connect(this.audioContext.destination);

			gainNode.gain.value = volume;

			source.start(0);
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
