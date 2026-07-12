import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { AuthFormSplitScreen } from '@/components/ui/login'
import { AlertCircle } from 'lucide-react'

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
          <div className="flex items-center gap-3">
            <img
              src="https://www.cornerstoneschool.edu.in/wp-content/uploads/2020/02/LOGO-PNG-1.png"
              alt="Cornerstone"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              SchoolSync
            </span>
          </div>
        }
        title="Welcome Back"
        description={
          error ? (
            <span className="flex items-center gap-2 text-red-500 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </span>
          ) : (
            'Sign in to your account to continue'
          )
        }
        imageSrc="https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1932&auto=format&fit=crop"
        imageAlt="School campus with modern buildings and a clear sky"
        onSubmit={handleLogin}
        forgotPasswordHref="#"
        createAccountHref="#/signup"
      />
    </div>
  )
}
