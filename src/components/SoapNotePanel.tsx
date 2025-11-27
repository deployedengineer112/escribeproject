import { Mic, Undo2 } from 'lucide-react'

export function SoapNotePanel() {
  return (
    <div className="mt-4">
      <div className="space-y-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">Chief Complaint:</div>
          <div className="mt-1 border rounded-md p-3 text-sm text-gray-800 bg-white">Persistent dry cough for 2 weeks.</div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">History of Present Illness:</div>
            <div className="flex items-center gap-3 text-gray-500">
              <Undo2 className="w-5 h-5" />
              <Mic className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-1 text-sm text-gray-800">
            Patient presents with a 2-week history of persistent dry, non-productive cough. Symptoms are worse at night and in the morning. Patient denies fever, shortness of breath, chest pain, or hemoptysis. No recent travel or known sick contacts.
          </div>
        </div>
      </div>
    </div>
  )
}