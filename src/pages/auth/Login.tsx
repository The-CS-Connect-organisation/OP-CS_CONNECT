import { useState, useEffect, useCallback } from 'react'
import { useAuthStore, type UserRole } from '@/lib/store'
import { SignInPage } from '@/components/ui/sign-in'
import { cn } from '@/lib/utils'
import {
  BookOpen, Users, Shield, MapPin, Bus,
  Globe, GraduationCap
} from 'lucide-react'

const roles: Array<{
  role: UserRole
  label: string
  icon: React.ElementType
  gradient: string
  description: string
  email: string
}> = [
  { role: 'student', label: 'Student', icon: BookOpen, gradient: 'from-orange-500 to-amber-500', description: 'Grades, assignments & AI study tools', email: 'aarav@eduvault.ai' },
  { role: 'student', label: 'Student 2', icon: BookOpen, gradient: 'from-orange-400 to-yellow-500', description: 'Priya Patel - 10-A', email: 'priya@eduvault.ai' },
  { role: 'teacher', label: 'Teacher', icon: Users, gradient: 'from-amber-600 to-orange-600', description: 'Math, Physics, CS', email: 'rajesh@eduvault.ai' },
  { role: 'teacher', label: 'Teacher 2', icon: Users, gradient: 'from-yellow-600 to-amber-600', description: 'Chemistry, Biology, English', email: 'sunita@eduvault.ai' },
  { role: 'admin', label: 'Admin', icon: Shield, gradient: 'from-orange-700 to-red-600', description: 'Full school administration', email: 'meera@eduvault.ai' },
  { role: 'coordinator', label: 'Coordinator', icon: Globe, gradient: 'from-amber-500 to-orange-500', description: 'Multi-school oversight', email: 'vikram@eduvault.ai' },
  { role: 'driver', label: 'Driver', icon: Bus, gradient: 'from-orange-600 to-yellow-600', description: 'Route management', email: 'raju@eduvault.ai' },
  { role: 'manager', label: 'Manager', icon: Shield, gradient: 'from-orange-600 to-amber-600', description: 'Full operations control', email: 'manager@eduvault.ai' },
]

const farewellImages = [
  `${import.meta.env.BASE_URL}farewell/IMG_3890.JPG`,
  `${import.meta.env.BASE_URL}farewell/IMG_3900.JPG`,
  `${import.meta.env.BASE_URL}farewell/IMG_3910.JPG`,
  `${import.meta.env.BASE_URL}farewell/IMG_3920.JPG`,
  `${import.meta.env.BASE_URL}farewell/IMG_3930.JPG`,
  `${import.meta.env.BASE_URL}farewell/IMG_3940.JPG`,
  `${import.meta.env.BASE_URL}farewell/IMG_3950.JPG`,
  `${import.meta.env.BASE_URL}farewell/IMG_3960.JPG`,
  `${import.meta.env.BASE_URL}farewell/IMG_3970.JPG`,
  `${import.meta.env.BASE_URL}farewell/IMG_3980.JPG`,
  `${import.meta.env.BASE_URL}farewell/IMG_4010.JPG`,
  `${import.meta.env.BASE_URL}farewell/G-10-at-ICRISAT.png`,
]

export default function Login() {
  const { loginWithCredentials } = useAuthStore()
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [password] = useState('demo1234')
  const [error, setError] = useState('')
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex(i => (i + 1) % farewellImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleRoleSelect = (idx: number) => {
    setSelectedRole(idx)
    setEmail(roles[idx].email)
    setError('')
  }

  const handleSignIn = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedRole === null) return
    const formData = new FormData(e.currentTarget)
    const em = formData.get('email') as string
    const pw = formData.get('password') as string
    setError('')
    try {
      await loginWithCredentials(em, pw)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }, [selectedRole, loginWithCredentials])

  return (
    <div className="bg-background text-foreground relative min-h-screen">
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2.5">
        <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="CS Connect" className="w-8 h-8" />
        <span className="text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hidden sm:inline">
          Cornerstone
        </span>
      </div>
      <SignInPage
        key={selectedRole}
        heroImageSrc={farewellImages[slideIndex % farewellImages.length]}
        defaultEmail={email}
        defaultPassword={password}
        onSignIn={handleSignIn}
        title={
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Cornerstone
          </span>
        }
        description="Access your account and continue your journey with us"
        extraTop={
          <>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-element animate-delay-100">
                {error}
              </div>
            )}
            <div className="animate-element animate-delay-100">
              <p className="text-xs font-medium text-muted-foreground mb-2">Select a role to preview</p>
              <div className="flex flex-wrap gap-1.5">
                {roles.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleRoleSelect(i)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                      selectedRole === i
                        ? `bg-gradient-to-r ${r.gradient} text-white border-transparent shadow-sm`
                        : "bg-foreground/5 border-border hover:bg-foreground/10 text-foreground/70"
                    )}
                  >
                    <r.icon className="w-3 h-3" />
                    {r.label}
                  </button>
                ))}
              </div>
              {selectedRole !== null && (
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Signed in as <span className="text-foreground/80 font-medium">{roles[selectedRole].label}</span> &middot; Password: demo1234
                </p>
              )}
            </div>
          </>
        }
        onResetPassword={() => alert('Reset password flow')}
        onCreateAccount={() => alert('Create account flow')}
      />
    </div>
  )
}
