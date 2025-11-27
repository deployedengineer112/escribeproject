import { ArrowRight, Check } from 'lucide-react'

interface ActionButtonsProps {
  buttons: string[]
  className?: string
}

export function ActionButtons({ buttons, className }: ActionButtonsProps) {
  return (
    <div className={`flex gap-3 mt-4 ${className ?? ''}`}>
      {buttons.map((b) => (
        <button
          key={b}
          type="button"
          onClick={() => alert(b)}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-500 text-white text-sm hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-1"
        >
          <span>{b}</span>
          {b.toLowerCase() === 'transfer' ? <ArrowRight className="w-5 h-5" /> : <Check className="w-5 h-5" />}
        </button>
      ))}
    </div>
  )
}