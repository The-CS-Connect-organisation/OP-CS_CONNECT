import { useState } from "react"
import { Checkbox } from "@/components/ui/Checkbox"
import { Label } from "@/components/ui/Label"
import { Button } from "@/components/ui/Button"

const TERMS_KEY = "cs-connect-tc-accepted"

const terms = [
  {
    id: "terms",
    label: "I have read and agree to the Terms of Service",
    description: "Including user account responsibilities, content usage restrictions, and conduct guidelines.",
  },
  {
    id: "privacy",
    label: "I have read and agree to the Privacy Policy",
    description: "Including how your data is collected, stored, and processed.",
  },
  {
    id: "cookies",
    label: "I agree to the use of cookies and tracking",
    description: "Essential cookies for authentication and analytics to improve your experience.",
  },
]

interface TocDialogProps {
  onAccept: () => void
}

export default function TermsConditions({ onAccept }: TocDialogProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    terms: false,
    privacy: false,
    cookies: false,
  })

  const allChecked = Object.values(checked).every(Boolean)

  const handleCheck = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAccept = () => {
    localStorage.setItem(TERMS_KEY, "true")
    onAccept()
  }

  const isAlreadyAccepted = localStorage.getItem(TERMS_KEY) === "true"

  if (isAlreadyAccepted) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white text-lg font-bold">
            CS
          </div>
          <h2 className="text-xl font-bold text-gray-900">Welcome to CS Connect</h2>
          <p className="mt-1 text-sm text-gray-500">
            Please review and accept before continuing
          </p>
        </div>

        <div className="mb-6 space-y-4">
          {terms.map((t) => (
            <label
              key={t.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-orange-200 hover:bg-orange-50/50 has-[[data-state=checked]]:border-orange-300 has-[[data-state=checked]]:bg-orange-50"
            >
              <Checkbox
                checked={checked[t.id]}
                onCheckedChange={() => handleCheck(t.id)}
                className="mt-0.5 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">{t.label}</span>
                <p className="text-xs text-gray-400">{t.description}</p>
              </div>
            </label>
          ))}
        </div>

        <Button
          disabled={!allChecked}
          onClick={handleAccept}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          Accept & Continue
        </Button>

        <p className="mt-3 text-center text-xs text-gray-400">
          By accepting, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
