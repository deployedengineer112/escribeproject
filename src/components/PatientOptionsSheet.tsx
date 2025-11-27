interface PatientOptionsSheetProps {
  open: boolean
  onClose: () => void
  onCopy?: () => void
  onSavePdf?: () => void
  onTransfer?: () => void
  onResumeRecording?: () => void
  onFinalize?: () => void
}

export function PatientOptionsSheet({ open, onClose, onCopy, onSavePdf, onTransfer, onResumeRecording, onFinalize }: PatientOptionsSheetProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="absolute inset-0 flex items-end justify-center p-4">
        <div className="w-full max-w-sm rounded-t-2xl bg-white shadow-lg p-4">
          <div className="flex justify-end">
            <button type="button" aria-label="Close" onClick={onClose} className="text-gray-600 hover:text-gray-800">×</button>
          </div>
          <div className="space-y-2">
            <button type="button" className="w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 text-gray-900" onClick={onCopy}>Copy to clipboard</button>
            <button type="button" className="w-full text-left px-3 py-3 rounded-md bg-blue-50 text-gray-900" onClick={onSavePdf}>Save PDF</button>
            <button type="button" className="w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 text-gray-900" onClick={onTransfer}>Transfer to EHR</button>
            <button type="button" className="w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 text-gray-900" onClick={onResumeRecording}>Resume Recording</button>
            <button type="button" className="w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 text-gray-900" onClick={onFinalize}>Mark as Finalized</button>
          </div>
        </div>
      </div>
    </div>
  )
}
