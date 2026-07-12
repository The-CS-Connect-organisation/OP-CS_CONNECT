import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { AuthFormSplitScreen } from '@/components/ui/login'
import { AlertCircle } from 'lucide-react'

const placeholderImages = [
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1932&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1786&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?q=80&w=1770&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1772&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1832&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1770&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1974&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?q=80&w=1770&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1770&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1577896851231-70ac1887ce3e?q=80&w=1770&auto=format&fit=crop',
]

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
              src="https://res.cloudinary.com/iextksqn/image/upload/v1783831100/LOGO-PNG-1_zftbqk.png"
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
