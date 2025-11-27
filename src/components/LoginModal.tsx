import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSubmit?: (email: string, password: string) => void | Promise<void>
  onForgotPassword?: () => void
}

export function LoginModal({ open, onClose, onSubmit, onForgotPassword }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      setEmail('')
      setPassword('')
      dialogRef.current?.focus()
    }, 0)
    return () => clearTimeout(id)
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div ref={dialogRef} tabIndex={-1} className="relative w-full max-w-sm rounded-xl bg-[#f3f0ea] shadow-xl">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#4c2b36] hover:bg-[#e7e2da] focus:outline-none focus:ring-2 focus:ring-[#4c2b36] focus:ring-offset-2"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="px-6 pt-10 pb-6">
            <div className="text-center">
              <div className="text-2xl font-semibold tracking-tight text-[#4c2b36]">Welcome Back</div>
              <div className="mt-1 text-sm text-[#4c2b36]/70">Sign in to your EVAA AI portal</div>
            </div>
            <form
              className="mt-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                await onSubmit?.(email, password)
              }}
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4c2b36]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-[#d7d1c8] bg-white px-3 py-2 text-sm text-[#4c2b36] placeholder-[#4c2b36]/40 focus:border-[#4c2b36] focus:outline-none focus:ring-2 focus:ring-[#4c2b36]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4c2b36]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-md border border-[#d7d1c8] bg-white px-3 py-2 text-sm text-[#4c2b36] placeholder-[#4c2b36]/40 focus:border-[#4c2b36] focus:outline-none focus:ring-2 focus:ring-[#4c2b36]"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-2 w-full rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Sign In
              </button>
            </form>
            <button
              type="button"
              onClick={onForgotPassword}
              className="mt-4 w-full text-center text-sm font-medium text-[#4c2b36] hover:underline"
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}