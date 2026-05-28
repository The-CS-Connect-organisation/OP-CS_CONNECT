
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
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

  React.useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7648/ingest/9083a094-cb0a-4860-b6f2-236bb876b0d0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6a311b'},body:JSON.stringify({sessionId:'6a311b',runId:'pre-fix',hypothesisId:'H8',location:'src/main.tsx:theme-init',message:'frontend boot route info',data:{pathname:window.location.pathname,href:window.location.href,baseUrl:import.meta.env.BASE_URL,router:'BrowserRouter'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [])

  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeInitializer />
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
