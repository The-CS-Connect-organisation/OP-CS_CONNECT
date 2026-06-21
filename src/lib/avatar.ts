const gradients = [
  ['#667eea', '#764ba2'], ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140'], ['#a18cd1', '#fbc2eb'],
  ['#fccb90', '#d57eeb'], ['#e0c3fc', '#8ec5fc'], ['#f5576c', '#ff6f91'],
  ['#30cfd0', '#330867'], ['#667db6', '#0082c8'], ['#11998e', '#38ef7d'],
  ['#fc5c7d', '#6a82fb'], ['#fcb045', '#fd1d1d'], ['#00b4db', '#0083b0'],
  ['#c471f5', '#fa71cd'], ['#12c2e9', '#c471ed'], ['#f7797d', '#FBD786'],
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

export function getAvatarGradient(name: string): string {
  const index = hashString(name || 'user') % gradients.length
  const [c1, c2] = gradients[index]
  return `linear-gradient(135deg, ${c1}, ${c2})`
}

export function generateAvatarSvg(name: string, size = 40): string {
  const initials = getInitials(name)
  const index = hashString(name || 'user') % gradients.length
  const [c1, c2] = gradients[index]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>
    <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#g)"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="${size * 0.4}" font-weight="600" font-family="sans-serif">${initials}</text>
  </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export function getAvatarUrl(user: { name?: string; avatar?: string | null }, size = 40): string {
  if (user?.avatar) return user.avatar
  return generateAvatarSvg(user?.name || '?', size)
}
