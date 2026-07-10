const audioCache: HTMLAudioElement | null = null

export function playNavSound() {
  try {
    const audio = new Audio('/audio/mixkit-cool-interface-click-tone-2568.wav')
    audio.volume = 0.4
    audio.play().catch(() => {})
  } catch {}
}
