import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { AuthFormSplitScreen } from '@/components/ui/login'
import { AlertCircle } from 'lucide-react'

const placeholderImages = [
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831170/WhatsApp-Image-2023-08-07-at-00.47.33-1_iutox2.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831170/visual-arts-1536x953.jpg_rn1uxx.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831167/Screenshot-13-1_e78kzk.png',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831166/RPB03257.jpg_q0sz9b.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831165/RPB02687.jpg_i5epvp.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831164/RPB02324-1024x683.jpg_cgcrfx.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831163/DSC07473.jpg_kwp0ks.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831162/DSC06844.jpg_p0uwjd.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831161/DSC06271.jpg_xc8xug.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831160/DSC06091.jpg_b2do8f.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831158/a547a7_76479b509f3d4e6f87b294bd44ee36famv2_d_2297_1557_s_2.jpg_b90pxe.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831157/a547a7_0800b1353b834b3fb9e6c3f47c553b6bmv2_d_3000_2000_s_2.jpg_rwfimo.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831156/WhatsApp-Image-2023-12-11-at-9.42.20-PM_fnfejj.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831156/WhatsApp-Image-2023-12-11-at-9.34.26-PM-2_fvpcwj.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831154/WhatsApp-Image-2023-12-11-at-9.34.26-PM-1_pqcny6.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831154/WhatsApp-Image-2023-12-08-at-7.08.47-PM_nnusrz.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831154/WhatsApp-Image-2023-12-11-at-9.34.26-PM_ulhwgl.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831153/WhatsApp-Image-2023-12-08-at-7.22.54-PM_j3od9r.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831180/G-10-at-ICRISAT_qc6aru.png',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831180/IMG_3911_ga9rvf.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831176/G-10-at-ICRISAT-1024x683_xkiyci.png',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831174/WhatsApp-Image-2023-12-08-at-4.39.33-PM-1_wp6lwz.jpg',
  'https://res.cloudinary.com/iextksqn/image/upload/v1783831173/WhatsApp-Image-2023-12-08-at-4.33.00-PM_ccaiku.jpg',
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
          <div className="flex flex-col items-start gap-3">
            <div className="inline-flex items-center rounded-2xl border border-white/20 bg-white/40 px-5 py-3 shadow-lg backdrop-blur-2xl">
              <img
                src="https://res.cloudinary.com/iextksqn/image/upload/v1783831100/LOGO-PNG-1_zftbqk.png"
                alt="Cornerstone"
                className="h-10 w-auto"
              />
            </div>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/30 px-3 py-1 text-[11px] font-light tracking-wide text-gray-400 backdrop-blur-md">
              in partnership with SchoolSync
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
