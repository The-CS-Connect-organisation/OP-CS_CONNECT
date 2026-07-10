export function playNavSound() {
  try {
    const base = import.meta.env.BASE_URL || '/'
    const url = `${base}audio/mixkit-cool-interface-click-tone-2568.wav`
    const audio = new Audio(url)
    audio.volume = 0.4
    audio.play().catch(() => {})
  } catch {}
}
