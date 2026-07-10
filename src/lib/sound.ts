const base = import.meta.env.BASE_URL || '/'

function play(file: string, volume = 0.4) {
  try {
    const audio = new Audio(`${base}audio/${file}`)
    audio.volume = volume
    audio.play().catch(() => {})
  } catch {}
}

export function playNavSound() { play('navbar-soundcom.wav', 0.3) }
export function playButtonSound() { play('button click.mp3', 0.3) }
export function playLoginSound() { play('log in.wav', 0.5) }
export function playSuccessSound() { play('chime-aproved-sucess.wav', 0.5) }
