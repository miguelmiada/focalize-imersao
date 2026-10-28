/**
 * @file src/utils/audio.ts
 * Sintetizador de áudio via Web Audio API.
 * Emite alertas sonoros sem depender de arquivos .mp3 externos ou rede.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('[Focalize Audio] Falha ao inicializar AudioContext', e);
    return null;
  }
}

/**
 * Toca um acorde suave para indicar fim de sessão (foco ou pausa).
 */
export function playChime(type: 'focus_completed' | 'break_completed' = 'focus_completed'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Frequências agradáveis (escalas pentatônicas / harmônicos suaves)
    const notes =
      type === 'focus_completed'
        ? [523.25, 659.25, 783.99, 1046.5] // Dó maior: C5, E5, G5, C6
        : [440.0, 554.37, 659.25]; // Lá maior suave para término de pausa

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.0);
    });
  } catch (err) {
    console.warn('[Focalize Audio] Erro ao reproduzir som sintetizado', err);
  }
}

/**
 * Vibra o dispositivo móvel se a API Vibration estiver disponível.
 */
export function triggerHaptic(): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([150, 80, 150]);
    } catch {
      // Ignora erro em plataformas que não suportam vibração
    }
  }
}
