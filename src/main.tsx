
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { useThemeStore } from './lib/store'

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
  <React.StrictMode>
    <HashRouter>
      <ThemeInitializer />
      <App />
    </HashRouter>
  </React.StrictMode>
)
