import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { motion } from 'framer-motion'
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
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, isChunkError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    const isChunkError =
      error.name === 'ChunkLoadError' ||
      /Loading chunk .* failed/.test(error.message) ||
      /dynamically imported module/.test(error.message) ||
      /Failed to fetch dynamically imported module/.test(error.message)
    return { hasError: true, error, isChunkError }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    if (this.state.isChunkError) {
      window.location.reload()
    } else {
      this.setState({ hasError: false, error: null, isChunkError: false })
    }
  }

  handleGoHome = () => {
    window.location.hash = '#/'
    this.setState({ hasError: false, error: null, isChunkError: false })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex h-full w-full items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center max-w-md"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Something went wrong</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {this.state.isChunkError
                ? 'A page module failed to load. This can happen due to a network issue or a new deployment.'
                : 'An unexpected error occurred while rendering this page.'}
            </p>
            {this.state.error && (
              <p className="mb-6 max-w-full truncate rounded-lg bg-accent/50 px-3 py-2 text-xs text-muted-foreground font-mono">
                {this.state.error.message}
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
              >
                <RefreshCw className="h-4 w-4" />
                {this.state.isChunkError ? 'Reload Page' : 'Try Again'}
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 rounded-xl border border-border/50 px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent active:scale-95"
              >
                <Home className="h-4 w-4" />
                Go Home
              </button>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}
