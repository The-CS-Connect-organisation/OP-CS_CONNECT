import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const REDIRECT_URL = 'https://campusdesk.example.com'

const messages = [
  'Initializing CampusDesk...',
  'Connecting to secure gateway...',
  'Authenticating your session...',
  'Loading your workspace...',
  'Almost there...',
]

export default function CampusDesk() {
  const [step, setStep] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setStep((prev) => {
          if (prev >= messages.length - 1) {
            clearInterval(interval)
            setTimeout(() => {
              window.location.href = REDIRECT_URL
            }, 800)
            return prev
          }
          return prev + 1
        })
        setFade(true)
      }, 300)
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  return (
    <StyledWrapper>
      <div className="portal-container">
        <div className="ring ring-1" />
        <div className="ring ring-2" />
        <div className="ring ring-3" />
        <div className="ring ring-4" />
        <div className="core">
          <BriefcaseIcon />
        </div>
      </div>

      <div className="status-text">
        <span className={fade ? 'visible' : 'hidden'}>{messages[step]}</span>
      </div>

      <div className="loader-bar">
        <div className="loader-fill" style={{ width: `${((step + 1) / messages.length) * 100}%` }} />
      </div>
    </StyledWrapper>
  )
}

function BriefcaseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #0f0f1a;
  gap: 2rem;
  overflow: hidden;
  position: relative;

  .portal-container {
    position: relative;
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ring {
    position: absolute;
    border-radius: 50%;
    border: 2px solid transparent;
    animation: spin 3s linear infinite;
  }

  .ring-1 {
    width: 200px;
    height: 200px;
    border-top-color: #fbbf24;
    border-right-color: transparent;
    border-bottom-color: transparent;
    border-left-color: #f97316;
    animation-duration: 2s;
  }

  .ring-2 {
    width: 160px;
    height: 160px;
    border-top-color: transparent;
    border-right-color: #f59e0b;
    border-bottom-color: transparent;
    border-left-color: transparent;
    animation-duration: 2.5s;
    animation-direction: reverse;
  }

  .ring-3 {
    width: 120px;
    height: 120px;
    border-top-color: transparent;
    border-right-color: transparent;
    border-bottom-color: #fbbf24;
    border-left-color: #d97706;
    animation-duration: 3s;
  }

  .ring-4 {
    width: 80px;
    height: 80px;
    border: 2px dashed rgba(251, 191, 36, 0.3);
    animation-duration: 4s;
    animation-direction: reverse;
  }

  .core {
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.4));
    }
    50% {
      filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.8));
    }
  }

  .status-text {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status-text span {
    font-family: 'Courier New', monospace;
    font-size: 1rem;
    color: #fbbf24;
    letter-spacing: 2px;
    transition: opacity 0.3s ease;
  }

  .status-text .visible {
    opacity: 1;
  }

  .status-text .hidden {
    opacity: 0;
  }

  .loader-bar {
    width: 300px;
    height: 4px;
    background: rgba(251, 191, 36, 0.15);
    border-radius: 4px;
    overflow: hidden;
  }

  .loader-fill {
    height: 100%;
    background: linear-gradient(90deg, #f97316, #fbbf24);
    border-radius: 4px;
    transition: width 0.5s ease;
    box-shadow: 0 0 12px rgba(251, 191, 36, 0.5);
  }
`
