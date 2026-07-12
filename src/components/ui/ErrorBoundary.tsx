import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  isChunkError: boolean
  countdown: number
}

export default class ErrorBoundary extends Component<Props, State> {
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, isChunkError: false, countdown: 5 }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isChunkError =
      error.name === 'ChunkLoadError' ||
      /Loading chunk .* failed/.test(error.message) ||
      /dynamically imported module/.test(error.message) ||
      /Failed to fetch dynamically imported module/.test(error.message)
    return { hasError: true, error, isChunkError, countdown: 5 }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
    this.props.onError?.(error, errorInfo)
    if (this.state.isChunkError) {
      this.timer = setInterval(() => {
        this.setState((prev) => {
          if (prev.countdown <= 1) {
            this.timer && clearInterval(this.timer)
            window.location.reload()
            return { countdown: 0 }
          }
          return { countdown: prev.countdown - 1 }
        })
      }, 1000)
    }
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer)
  }

  handleRetry = () => {
    if (this.timer) clearInterval(this.timer)
    if (this.state.isChunkError) {
      window.location.reload()
    } else {
      this.setState({ hasError: false, error: null, isChunkError: false, countdown: 5 })
    }
  }

  handleGoHome = () => {
    if (this.timer) clearInterval(this.timer)
    window.location.hash = '#/'
    this.setState({ hasError: false, error: null, isChunkError: false, countdown: 5 })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return React.createElement(
        'div',
        { className: 'flex h-full w-full items-center justify-center p-8' },
        React.createElement(
          'div',
          { className: 'flex flex-col items-center text-center max-w-md' },
          React.createElement(
            'div',
            { className: 'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30' },
            React.createElement(AlertTriangle, { className: 'h-8 w-8 text-red-500' })
          ),
          React.createElement('h2', { className: 'mb-2 text-xl font-bold' }, 'Something went wrong'),
          React.createElement(
            'p',
            { className: 'mb-6 text-sm text-muted-foreground' },
            this.state.isChunkError
              ? 'A page module failed to load. This can happen due to a network issue or a new deployment.'
              : 'An unexpected error occurred while rendering this page.'
          ),
          this.state.isChunkError &&
            React.createElement(
              'p',
              { className: 'mb-4 text-sm font-medium text-orange-600' },
              'Auto-reloading in ', this.state.countdown, 's\u2026'
            ),
          this.state.error &&
            React.createElement(
              'p',
              { className: 'mb-6 max-w-full truncate rounded-lg bg-accent/50 px-3 py-2 text-xs text-muted-foreground font-mono' },
              this.state.error.message
            ),
          React.createElement(
            'div',
            { className: 'flex items-center gap-3' },
            React.createElement(
              'button',
              {
                onClick: this.handleRetry,
                className: 'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl active:scale-95'
              },
              React.createElement(RefreshCw, { className: 'h-4 w-4' }),
              this.state.isChunkError ? 'Reload Now' : 'Try Again'
            ),
            React.createElement(
              'button',
              {
                onClick: this.handleGoHome,
                className: 'inline-flex items-center gap-2 rounded-xl border border-border/50 px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent active:scale-95'
              },
              React.createElement(Home, { className: 'h-4 w-4' }),
              'Go Home'
            )
          )
        )
      )
    }

    return this.props.children
  }
}
