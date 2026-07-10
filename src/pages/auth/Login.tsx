import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { SignInPage } from '@/components/ui/sign-in'

const farewellImages = [
  'a547a7_0800b1353b834b3fb9e6c3f47c553b6bmv2_d_3000_2000_s_2.jpg.jpeg',
  'a547a7_76479b509f3d4e6f87b294bd44ee36famv2_d_2297_1557_s_2.jpg.jpeg',
  'DSC05820.jpg.jpeg',
  'DSC06091.jpg.jpeg',
  'DSC06271.jpg.jpeg',
  'DSC06844.jpg.jpeg',
  'DSC07473.jpg.jpeg',
  'G-10-at-ICRISAT.png',
  'IMG_3911.JPG',
  'IMG_3912.JPG',
  'RPB02324-1024x683.jpg.jpeg',
  'RPB02687.jpg.jpeg',
  'RPB03257.jpg.jpeg',
  'Screenshot-13-1.png',
  'slider-1.jpg.jpeg',
  'visual-arts-1536x953.jpg.jpeg',
  'visual-arts.jpg.jpeg',
  'WhatsApp-Image-2023-08-07-at-00.47.33-1.jpeg',
  'WhatsApp-Image-2023-12-08-at-4.32.40-PM.jpeg',
  'WhatsApp-Image-2023-12-08-at-4.33.00-PM.jpeg',
  'WhatsApp-Image-2023-12-08-at-4.39.33-PM-1.jpeg',
  'WhatsApp-Image-2023-12-08-at-5.15.52-PM.jpeg',
  'WhatsApp-Image-2023-12-08-at-5.31.16-PM.jpeg',
  'WhatsApp-Image-2023-12-08-at-7.08.47-PM.jpeg',
  'WhatsApp-Image-2023-12-08-at-7.22.54-PM.jpeg',
  'WhatsApp-Image-2023-12-11-at-9.34.26-PM.jpeg',
  'WhatsApp-Image-2023-12-11-at-9.34.26-PM-1.jpeg',
  'WhatsApp-Image-2023-12-11-at-9.34.26-PM-2.jpeg',
  'WhatsApp-Image-2023-12-11-at-9.34.26-PM-3.jpeg',
  'WhatsApp-Image-2023-12-11-at-9.42.20-PM.jpeg',
].map(f => `${import.meta.env.BASE_URL}farewell/${f}`)

export default function Login() {
  const { loginWithCredentials } = useAuthStore()
  const [error, setError] = useState('')
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex(i => (i + 1) % farewellImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const em = formData.get('email') as string
    const pw = formData.get('password') as string
    setError('')
    try {
      await loginWithCredentials(em, pw)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="bg-background text-foreground relative min-h-screen">
      <div className="absolute top-4 left-4 z-50">
        <img
          src="https://www.cornerstoneschool.edu.in/wp-content/uploads/2020/02/LOGO-PNG-1.png"
          alt="Cornerstone"
          className="h-12 w-auto"
        />
      </div>
      <SignInPage
        heroImageSrc={farewellImages[slideIndex]}
        onSignIn={handleSignIn}
        extraTop={
          error ? (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          ) : undefined
        }
        onResetPassword={() => alert('Reset password flow')}
        onCreateAccount={() => alert('Create account flow')}
      />
    </div>
  )
}
