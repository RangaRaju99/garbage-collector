import { Howl } from 'howler';

// Cinematic mechanical and UI sounds for the JVM City
class SoundEngine {
  private static instance: SoundEngine;
  private muted: boolean = false;

  private uiClick = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], volume: 0.2 });
  private gcAlarm = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3'], volume: 0.3 });
  private allocSound = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'], volume: 0.1 });
  private ambientHum = new Howl({ 
    src: ['https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3'], 
    volume: 0.05, 
    loop: true 
  });

  private constructor() {}

  public static getInstance(): SoundEngine {
    if (!SoundEngine.instance) {
      SoundEngine.instance = new SoundEngine();
    }
    return SoundEngine.instance;
  }

  public playClick() { if (!this.muted) this.uiClick.play(); }
  public playGC() { if (!this.muted) this.gcAlarm.play(); }
  public playAlloc() { if (!this.muted) this.allocSound.play(); }
  
  public startAmbient() {
    if (!this.muted && !this.ambientHum.playing()) {
      this.ambientHum.play();
    }
  }

  public stopAmbient() {
    this.ambientHum.stop();
  }

  public toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopAmbient();
    else this.startAmbient();
  }
}

export const soundEngine = SoundEngine.getInstance();
