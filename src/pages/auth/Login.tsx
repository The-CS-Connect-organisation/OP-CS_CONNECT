import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { AuthFormSplitScreen } from '@/components/ui/login'
import { AlertCircle } from 'lucide-react'

const placeholderImages = Array.from(
  { length: 10 },
  (_, i) => `https://placehold.co/800x600/1a1a2e/eaeaea?text=Photo+${i + 1}`
)

export default function Login() {
  const { loginWithCredentials } = useAuthStore()
  const [error, setError] = useState('')

  const handleLogin = async (data: { email: string; password: string }) => {
    setError('')
    try {
      await loginWithCredentials(data.email, data.password)
    } catch (err: any) {
      const msg = err.message || 'Login failed'
      setError(msg)
      throw err
    }
  }

  return (
    <div className="bg-background text-foreground relative min-h-screen">
      <AuthFormSplitScreen
        logo={
          <div className="inline-flex items-center gap-4 rounded-2xl border border-white/20 bg-white/40 px-5 py-3 shadow-lg backdrop-blur-2xl">
            <img
              src="https://www.cornerstoneschool.edu.in/wp-content/uploads/2020/02/LOGO-PNG-1.png"
              alt="Cornerstone"
              className="h-10 w-auto"
            />
            <div className="h-8 w-px bg-white/40" />
            <span className="font-zentry text-2xl font-bold tracking-tight text-gray-900">
              SchoolSync
            </span>
          </div>
        }
        title="Welcome Back"
        description={
          error ? (
            <span className="flex items-center gap-2 font-medium text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </span>
          ) : (
            'Sign in to your account to continue'
          )
        }
        images={placeholderImages}
        imageAlt="Farewell photos from Cornerstone School"
        onSubmit={handleLogin}
        forgotPasswordHref="#"
        createAccountHref="#/signup"
      />
    </div>
  )
}
