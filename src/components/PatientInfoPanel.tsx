interface PatientInfoPanelProps {
  patientName: string
  dob: string
  age: number
  id: string
  provider: string
  className?: string
  onMenuClick?: () => void
}

import { MoreVertical } from 'lucide-react'

export function PatientInfoPanel({ patientName, dob, age, id, provider, className, onMenuClick }: PatientInfoPanelProps) {
  return (
    <div className={`bg-gray-200 p-4 rounded-xl shadow-sm text-sm ${className ?? ''}`}>
      <div className="flex items-start justify-between">
        <div className="text-lg font-semibold text-gray-900">{patientName}</div>
        <button
          type="button"
          aria-label="Menu"
          onClick={onMenuClick}
          className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white border border-gray-800 text-gray-900 hover:bg-gray-50 shadow-sm"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-2 flex items-center text-sm">
        <span className="text-gray-500">DOB:</span>
        <span className="ml-2 text-gray-900 font-medium">{dob}</span>
        <span className="ml-2 text-gray-900">({age})</span>
      </div>
      <div className="mt-1 flex items-center text-sm">
        <span className="text-gray-500">ID:</span>
        <span className="ml-2 text-gray-900 font-medium">{id}</span>
        <span className="mx-2 text-gray-400">|</span>
        <span className="text-gray-500">Provider:</span>
        <span className="ml-2 text-gray-900">{provider}</span>
      </div>
    </div>
  )
}