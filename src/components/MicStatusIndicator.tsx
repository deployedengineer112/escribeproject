import { Mic } from 'lucide-react'

type MicState = 'complete' | 'start' | 'paused' | 'none'

export function MicStatusIndicator({ state }: { state: MicState }) {
  const text = state === 'complete' ? 'text-blue-600'
    : state === 'start' ? 'text-green-600'
    : state === 'paused' ? 'text-orange-500'
    : 'text-black'
  const bg = state === 'complete' ? 'bg-blue-100'
    : state === 'start' ? 'bg-green-100'
    : state === 'paused' ? 'bg-amber-100'
    : 'bg-gray-200'
  return (
    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${bg} ${text}`}>
      <Mic className={`w-4 h-4`} />
    </span>
  )
}
