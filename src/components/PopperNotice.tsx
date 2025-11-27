type Variant = 'started' | 'paused' | 'stopped'

interface PopperNoticeProps {
  visible: boolean
  message: string
  variant: Variant
  onClose?: () => void
  inContainer?: boolean
}

export function PopperNotice({ visible, message, variant, onClose, inContainer = false }: PopperNoticeProps) {
  const isStarted = variant === 'started'
  const isPaused = variant === 'paused'
  return (
    <div className={`${inContainer ? 'absolute top-2 right-2' : 'fixed top-4 right-4'} z-[60] transition-all duration-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <div className={`relative rounded-lg p-3 shadow-lg border ${isStarted ? 'bg-green-100 border-green-200 text-gray-900' : isPaused ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-gray-700 border-gray-700 text-white'}`}>
        <span className="font-semibold text-sm">{message}</span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-800 hover:text-black"
        >
          ×
        </button>
      </div>
    </div>
  )
}
