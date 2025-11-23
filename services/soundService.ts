import { SOUNDS } from '../constants';

class SoundManager {
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private volume: number = 1.0;
  private isUnlocked: boolean = false;

  constructor() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.context = new AudioContextClass();
      }
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  async loadAll() {
    if (!this.context) return;
    const promises = Object.entries(SOUNDS).map(async ([key, url]) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context!.decodeAudioData(arrayBuffer);
        this.buffers.set(key, audioBuffer);
      } catch (e) {
        console.warn(`Failed to load sound ${key}:`, e);
      }
    });
    await Promise.all(promises);
  }

  unlockAudio() {
    if (!this.context) return;
    // Always try to resume if suspended (common in Telegram WebApp)
    if (this.context.state === 'suspended') {
      this.context.resume().then(() => {
        this.isUnlocked = true;
      });
    }
    if (this.isUnlocked) return;
    
    // Play silent buffer
    const buffer = this.context.createBuffer(1, 1, 22050);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.start(0);
    this.isUnlocked = true;
  }

  play(key: keyof typeof SOUNDS) {
    if (!this.context || !this.buffers.has(key)) return;
    
    // Ensure context is running before playing
    if (this.context.state === 'suspended') {
        this.context.resume();
    }

    try {
        const source = this.context.createBufferSource();
        source.buffer = this.buffers.get(key)!;
        const gainNode = this.context.createGain();
        gainNode.gain.value = this.volume;
        source.connect(gainNode);
        gainNode.connect(this.context.destination);
        source.start(0);
    } catch(e) {
        console.warn("Error playing sound", e);
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

export const soundManager = new SoundManager();
