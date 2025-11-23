
import { SOUNDS } from '../constants';

class SoundManager {
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private volume: number = 1.0;
  private isUnlocked: boolean = false;

  constructor() {
    try {
      // Initialize AudioContext if supported
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.context = new AudioContextClass();
      }
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  // Preload all sounds
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

  // Must be called on first user interaction (click/touch)
  unlockAudio() {
    if (!this.context || this.isUnlocked) return;

    // Resume context if suspended (Chrome/iOS policy)
    if (this.context.state === 'suspended') {
      this.context.resume().then(() => {
        this.isUnlocked = true;
      });
    } else {
        this.isUnlocked = true;
    }
    
    // Play a silent buffer to fully unlock iOS
    const buffer = this.context.createBuffer(1, 1, 22050);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.start(0);
  }

  play(key: keyof typeof SOUNDS) {
    if (!this.context || !this.buffers.has(key)) return;

    try {
        const source = this.context.createBufferSource();
        source.buffer = this.buffers.get(key)!;
        
        // Create gain node for volume
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
