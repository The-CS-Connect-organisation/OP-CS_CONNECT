import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { AuthFormSplitScreen } from '@/components/ui/login'
import { AlertCircle } from 'lucide-react'

const farewellImages = [
  '/farewell/WhatsApp-Image-2023-12-11-at-9.42.20-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-11-at-9.34.26-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-11-at-9.34.26-PM-3.jpeg',
  '/farewell/WhatsApp-Image-2023-12-11-at-9.34.26-PM-2.jpeg',
  '/farewell/WhatsApp-Image-2023-12-11-at-9.34.26-PM-1.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-7.22.54-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-7.22.54-PM-1536x1023.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-7.08.47-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-5.31.16-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-5.15.52-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-5.15.52-PM-1-473x1024.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-4.39.33-PM-1.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-4.33.00-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-4.33.00-PM-1536x1023.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-4.32.40-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-08-07-at-00.47.33-1.jpeg',
  '/farewell/visual-arts.jpg.jpeg',
  '/farewell/visual-arts-1536x953.jpg.jpeg',
  '/farewell/slider-1.jpg.jpeg',
  '/farewell/Screenshot-13-1.png',
  '/farewell/RPB03257.jpg.jpeg',
  '/farewell/RPB02687.jpg.jpeg',
  '/farewell/RPB02324-1024x683.jpg.jpeg',
  '/farewell/IMG_3912.JPG',
  '/farewell/IMG_3911.JPG',
  '/farewell/G-10-at-ICRISAT.png',
  '/farewell/G-10-at-ICRISAT-1024x683.png',
  '/farewell/DSC07473.jpg.jpeg',
  '/farewell/DSC07473-300x200.jpg.jpeg',
  '/farewell/DSC06844.jpg.jpeg',
  '/farewell/DSC06271.jpg.jpeg',
  '/farewell/DSC06091.jpg.jpeg',
  '/farewell/DSC05820.jpg.jpeg',
  '/farewell/a547a7_76479b509f3d4e6f87b294bd44ee36famv2_d_2297_1557_s_2.jpg.jpeg',
  '/farewell/a547a7_0800b1353b834b3fb9e6c3f47c553b6bmv2_d_3000_2000_s_2.jpg.jpeg',
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
        images={farewellImages}
        imageAlt="Farewell photos from Cornerstone School"
        onSubmit={handleLogin}
        forgotPasswordHref="#"
        createAccountHref="#/signup"
      />
    </div>
  )
}
