import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface SoapNotesModalProps {
  open: boolean
  onClose: () => void
}

export function SoapNotesModal({ open, onClose }: SoapNotesModalProps) {
  const intervalRef = useRef<number | null>(null)
  const [progress, setProgress] = useState(0)

  // Close on ESC
  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Animate progress
  useEffect(() => {
    if (!open) return

    setTimeout(() => setProgress(0), 0)

    const id = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 4, 100)
        if (next === 100) {
          clearInterval(id)
          intervalRef.current = null
          setTimeout(() => {
            onClose()
          }, 200)
        }
        return next
      })
    }, 120)

    intervalRef.current = id

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [open, onClose])

  // SVG parameters
  const size = 88
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl px-6 pt-8 pb-6 w-full max-w-sm">

          {/* X BUTTON */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
              }
              onClose()
            }}
            className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full w-8 h-8 text-gray-700 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="relative" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="rotate-[-90deg]">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#fde2ef"
                  strokeWidth={stroke}
                  fill="none"
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#7c3aed"
                  strokeWidth={stroke}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="mt-3 text-xl font-semibold text-gray-900">{progress}%</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">Generating SOAP Notes</div>
            <div className="mt-1 text-sm text-gray-600">
              It will take a couple of seconds to generate SOAP Notes.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
