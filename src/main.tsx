
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { useThemeStore } from './lib/store'

// Global handlers to prevent blank white screen from chunk load failures
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.name === 'ChunkLoadError' ||
    /Loading chunk .* failed/.test(event.reason?.message) ||
    /Failed to fetch dynamically/.test(event.reason?.message)
  ) {
    event.preventDefault()
    console.warn('[ChunkLoadError] Caught globally — user can retry via ErrorBoundary')
  }
})

window.addEventListener('error', (event) => {
  if (
    event.error?.name === 'ChunkLoadError' ||
    /Loading chunk .* failed/.test(event.error?.message) ||
    /Failed to fetch dynamically/.test(event.error?.message)
  ) {
    event.preventDefault()
    console.warn('[ChunkLoadError] Caught globally — user can retry via ErrorBoundary')
  }
})

function ThemeInitializer() {
  const isDark = useThemeStore((s) => s.isDark)
  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <ThemeInitializer />
    <App />
  </HashRouter>
)
