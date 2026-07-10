import { lazy } from 'react'

export function retryLazy<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3,
  delay = 1500
) {
  return lazy(() =>
    (function attempt(n: number): Promise<{ default: T }> {
      return importFn().catch((err) => {
        if (n <= 0) throw err
        console.warn(`[retryLazy] chunk load failed, retrying (${retries - n + 1}/${retries})...`, err.message)
        return new Promise<{ default: T }>((resolve) => setTimeout(resolve, delay))
          .then(() => attempt(n - 1))
      })
    })(retries)
  )
}