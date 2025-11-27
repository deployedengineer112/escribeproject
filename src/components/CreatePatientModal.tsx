import { useEffect, useState } from 'react'
import { X, Calendar, Check } from 'lucide-react'

interface CreatePatientModalProps {
  open: boolean
  onClose: () => void
  onSaved?: (patient: { id: string, name: string, dob: string, age: number, provider: string }) => void
}

export function CreatePatientModal({ open, onClose, onSaved }: CreatePatientModalProps) {
  const API_BASE = import.meta.env.VITE_API_URL
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('Female')
  const [providers, setProviders] = useState<string[]>([])
  const [provider, setProvider] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch(`${API_BASE}/api/providers`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('escribe.token') || ''}` }
    })
      .then(r => r.json())
      .then((list) => {
        const arr = list as string[]
        const filtered = arr.filter(x => x !== 'All Providers')
        setProviders(filtered)
        setProvider(filtered[0] ?? '')
      })
      .catch(() => {
        const fallback = ['Dr. Sarah Johnson', 'Dr. Robert Lee', 'Dr. Priya Kaur']
        setProviders(fallback)
        setProvider(fallback[0])
      })
  }, [open, API_BASE])

  async function save() {
    if (!firstName.trim() || !lastName.trim() || !dob) return
    setSaving(true)
    const [yyyy, mm, dd] = dob.split('-')
    const mmddyyyy = `${mm}/${dd}/${yyyy}`
    try {
      const res = await fetch(`${API_BASE}/api/patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('escribe.token') || ''}` },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), dob: mmddyyyy, provider })
      })
      if (res.ok) {
        const p = await res.json()
        setSaved(true)
        setTimeout(() => {
          onSaved?.(p)
          onClose()
          setSaved(false)
        }, 1200)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="px-6 pt-10 pb-6">
            <div className="text-center text-lg font-semibold">Create Patient</div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Patient First Name *</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Patient Last Name *</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Patient DOB *</label>
                <div className="relative flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2">
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700"
                >
                  {providers.map((pr) => (
                    <option key={pr} value={pr}>{pr}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="mt-6 w-full rounded-lg bg-black py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-60"
            >
              Save Patient
            </button>

            {saved && (
              <>
                <style>{`
                  @keyframes tick-pop { 0% { transform: scale(0.6); opacity: 0.2 } 60% { transform: scale(1.15); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
                  @keyframes ring-spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
                `}</style>
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-white px-4 py-3 shadow-md">
                    <div className="relative h-8 w-8">
                      <div className="absolute inset-0 rounded-full border-2 border-green-500" style={{ animation: 'ring-spin 0.8s ease-out' }}></div>
                      <div className="absolute inset-0 flex items-center justify-center text-green-600" style={{ animation: 'tick-pop 0.8s ease-out' }}>
                        <Check className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-green-700">Patient saved successfully</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
