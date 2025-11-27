import { Mic, FilePlus } from 'lucide-react'

interface TabNavigationProps {
  tabs: string[]
  activeTab: string
  onTabChange?: (tab: string) => void
  disabledTabs?: string[]
  isRecording?: boolean
  className?: string
  onExpandTop?: () => void
  onCollapseBottom?: () => void
  onHandleClick?: () => void
  onFillExpand?: () => void
  onFillCollapse?: () => void
}

export function TabNavigation({ tabs, activeTab, onTabChange, disabledTabs = [], isRecording = false, className, onExpandTop, onCollapseBottom, onHandleClick, onFillExpand, onFillCollapse }: TabNavigationProps) {
  return (
    <div className={`mt-4 ${className ?? ''}`}>
      <div className="flex justify-center py-2">
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100 cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => {
            const start = e.clientY
            const onMove = (ev: PointerEvent) => {
              const dy = ev.clientY - start
              if (dy < -40) onExpandTop?.()
              if (dy > 40) onCollapseBottom?.()
              if (dy > 20) onFillExpand?.()
              if (dy < -20) onFillCollapse?.()
            }
            const onUp = () => {
              window.removeEventListener('pointermove', onMove)
              window.removeEventListener('pointerup', onUp)
            }
            window.addEventListener('pointermove', onMove)
            window.addEventListener('pointerup', onUp)
          }}
          onClick={onHandleClick}
        >
          <span className="w-1 h-1 rounded-full bg-pink-400"></span>
          <span className="w-1 h-1 rounded-full bg-pink-400"></span>
          <span className="w-1 h-1 rounded-full bg-pink-400"></span>
        </div>
      </div>
      <nav className="flex justify-center gap-8 w-full">
        {tabs.map((tab) => {
          const isActive = tab === activeTab
          const isDisabled = disabledTabs.includes(tab)
          const isDictation = tab.toLowerCase() === 'dictation'
          return (
            <button
              key={tab}
              type="button"
              onClick={() => !isDisabled && onTabChange?.(tab)}
              disabled={isDisabled}
              className={`py-2 text-sm text-center flex items-center justify-center gap-2 ${
                isDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : isDictation && isRecording
                    ? 'text-black font-bold'
                    : isActive
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-600'
              }`}
            >
              {isDictation ? (
                <Mic className={`${isDisabled ? 'text-gray-400' : isDictation && isRecording ? 'text-black' : isActive ? 'text-gray-900' : 'text-gray-500'} w-4 h-4`} strokeWidth={isDictation && isRecording ? 3 : 2} />
              ) : (
                <FilePlus className={`${isDisabled ? 'text-gray-400' : isActive ? 'text-gray-900' : 'text-gray-500'} w-4 h-4`} />
              )}
              <span>{tab}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
