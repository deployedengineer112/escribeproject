import { useEffect, useMemo, useState } from 'react'
import { X, Search, Accessibility } from 'lucide-react'

interface FindPatientModalProps {
  open: boolean
  onClose: () => void
  onCreateNew?: () => void
}

type Patient = { id: string, name: string, dob: string, provider: string, recording: 'complete' | 'start' | 'paused' | 'none' }

export function FindPatientModal({ open, onClose, onCreateNew }: FindPatientModalProps) {
  const API_BASE = import.meta.env.VITE_API_URL
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [providers, setProviders] = useState<string[]>([])
  const [provider, setProvider] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/patients`)
      .then(r => r.json())
      .then((list) => {
        const arr = list as { id: string, name: string, dob: string, provider: string, recording: 'complete' | 'start' | 'paused' | 'none' }[]
        const mapped = arr.map(x => ({ id: x.id, name: x.name, dob: x.dob, provider: x.provider, recording: x.recording }))
        setAllPatients(mapped)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!open || !selectedId) return
    fetch(`${API_BASE}/api/providers`)
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
  }, [open, selectedId])

  

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = allPatients.filter(p => {
      const matchText = q ? (p.name.toLowerCase().startsWith(q) || p.id.toLowerCase().startsWith(q)) : true
      return matchText
    })
    return q ? list : []
  }, [query, allPatients])

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
            <div className="text-center text-lg font-semibold text-gray-900">Find Patient</div>
            <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2">
                <Search className="w-4 h-4 text-gray-600" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 placeholder:opacity-70 truncate"
                  placeholder="Search by Name, DOB, Age, or ID"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            

            {filtered.length === 0 ? (
              <div className="mt-10 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Accessibility className="w-8 h-8 text-gray-700" />
                </div>
                <div className="mt-3 text-sm text-gray-600">Start Typing to search for patients.</div>
              </div>
            ) : (
              <div>
                <div className="mt-4 space-y-3">
                  {filtered.map((p) => {
                    const sel = selectedId === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedId(p.id)}
                        className={`w-full rounded-lg border px-4 py-3 text-left transition-all duration-150 ${sel ? 'border-purple-600 ring-2 ring-purple-200 bg-white' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                        style={{ boxShadow: sel ? '0 0 0 2px #a78bfa' : undefined }}
                      >
                        <div className="text-base font-semibold text-gray-900">{p.name}</div>
                        <div className="mt-1 text-sm text-gray-600">DOB: {p.dob} | ID: {p.id}</div>
                      </button>
                    )
                  })}
                </div>
                
              </div>
            )}
            {selectedId && (
              <div className="mt-6">
                <label className="mb-1 block text-sm font-medium text-gray-700">Select Provider for this visit<span className="text-red-500">*</span></label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700"
                  disabled={providers.length === 0}
                >
                  {providers.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
            {query.trim() !== '' && (
              <div className="mt-8">
                <button
                  type="button"
                  disabled={!selectedId || !provider}
                  onClick={() => {
                    if (!selectedId || !provider) return
                    alert('Visit scheduled')
                    onClose()
                  }}
                  className={`w-full rounded-lg bg-black py-3 text-base font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${(selectedId && provider) ? 'hover:bg-gray-900' : 'bg-gray-400 cursor-not-allowed'}`}
                  style={{ minHeight: 56 }}
                >
                  Start New Visit
                </button>
              </div>
            )}
            <div className="mt-8">
              {query.trim() === '' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onCreateNew?.()
                  }}
                  className="mt-3 w-full rounded-lg bg-black py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Create New Patient
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
