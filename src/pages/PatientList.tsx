import { useEffect, useState } from 'react'
import { ArrowLeft, Menu, Search, Calendar, MoreVertical, ArrowLeftRight, CircleDot } from 'lucide-react'
import { MicStatusIndicator } from '../components/MicStatusIndicator'
import { PatientOptionsSheet } from '../components/PatientOptionsSheet'
import { FindPatientModal } from '../components/FindPatientModal'
import { CreatePatientModal } from '../components/CreatePatientModal'

type RecordingState = 'complete' | 'start' | 'paused' | 'none'
type TransferState = 'pending' | 'done' | 'none'
type PatientItem = { id: string, name: string, time: string, dob: string, age: number, provider: string, recording: RecordingState, transfer: TransferState, showTick: boolean, finalized: boolean }
type OnSelectPatient = (p: { id: string, name: string, dob: string, age: number, provider: string }) => void

export default function PatientList({ onSelect }: { onSelect?: OnSelectPatient }) {
  const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
  const [patientList, setPatientList] = useState<PatientItem[]>([])
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [listQuery, setListQuery] = useState('')
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [selected, setSelected] = useState<PatientItem | null>(null)
  const [findOpen, setFindOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/patients`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('escribe.token') || ''}` }
    })
      .then(r => r.json())
      .then((list: PatientItem[]) => setPatientList(list))
      .catch(() => {})
  }, [API_BASE])

  return (
    <div className="max-w-sm mx-auto p-4 relative">
      <div className="flex items-center justify-between">
        <button type="button" className="inline-flex items-center justify-center rounded-full w-9 h-9 text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-lg font-bold text-blue-600">eScribe</div>
        <button type="button" className="inline-flex items-center justify-center rounded-full w-9 h-9 text-gray-600 hover:text-gray-800">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            fetch(`${API_BASE}/api/patients`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('escribe.token') || ''}` }
            })
              .then(r => r.json())
              .then((list: PatientItem[]) => setPatientList(list))
              .catch(() => {})
            setFindOpen(true)
          }}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-black py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-900"
        >
          <Search className="w-4 h-4" />
          <span>Find Patient</span>
        </button>
      </div>

      <div className="mt-3 flex items-center">
        <div className="relative flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2">
          <span className="text-sm text-gray-700">Today</span>
          <Calendar className="w-4 h-4 text-gray-600" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ml-auto"
        >
          <option>All Statuses</option>
          <option>Checked In</option>
          <option>Ready</option>
          <option>Completed</option>
          <option>Dictation</option>
        </select>
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2">
        <Search className="w-4 h-4 text-gray-600" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 placeholder:opacity-70"
          placeholder="Search by Name, DOB, Age, or ID"
          value={listQuery}
          onChange={(e) => setListQuery(e.target.value)}
        />
      </div>

      <div className="mt-3 space-y-3">
        {patientList
          .filter((p) => {
            const q = listQuery.trim().toLowerCase()
            if (!q) return true
            const ageStr = String(p.age)
            return (
              p.name.toLowerCase().includes(q) ||
              p.id.toLowerCase().includes(q) ||
              p.dob.toLowerCase().includes(q) ||
              ageStr.includes(q)
            )
          })
          .map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 cursor-pointer"
              onClick={() => onSelect?.({ id: p.id, name: p.name, dob: p.dob, age: p.age, provider: p.provider })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-gray-900 truncate">{p.name} <span className="font-normal text-gray-500">| {p.time}</span></div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full w-7 h-7 text-gray-600 hover:text-gray-900"
                  onClick={(e) => { e.stopPropagation(); setSelected(p); setOptionsOpen(true) }}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">DOB: {p.dob} ({p.age}y)</div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.showTick && (
                    <>
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${p.finalized ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        <ArrowLeftRight className="w-4 h-4" />
                      </span>
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${p.finalized ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        <CircleDot className="w-4 h-4" />
                      </span>
                    </>
                  )}
                  <MicStatusIndicator state={p.recording} />
                </div>
              </div>
            </div>
          ))}
      </div>
      <PatientOptionsSheet
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        onCopy={() => {
          if (selected) {
            navigator.clipboard.writeText(
              `Patient: ${selected.name}, ID: ${selected.id}, Provider: ${selected.provider}`
            )
          }
          setOptionsOpen(false)
        }}
        onSavePdf={() => {
          setOptionsOpen(false)
          alert('Save PDF')
        }}
        onTransfer={() => {
          setOptionsOpen(false)
          alert('Transfer to EHR')
        }}
      />

      <FindPatientModal
        open={findOpen}
        onClose={() => setFindOpen(false)}
        onCreateNew={() => {
          setFindOpen(false)
          setCreateOpen(true)
        }}
      />

      <CreatePatientModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={(p) => {
          setPatientList((prev) => [p as unknown as PatientItem, ...prev])
          setCreateOpen(false)
        }}
      />
    </div>
  )
}
