import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, X } from 'lucide-react'

interface PlaybackControlsProps {
  url: string
  className?: string
  autoPlay?: boolean
  onClose?: () => void
}

export function PlaybackControls({ url, className, autoPlay, onClose }: PlaybackControlsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onLoaded = () => setDuration(a.duration || 0)
    const onTime = () => setCurrent(a.currentTime || 0)
    const onEnded = () => {
      setIsPlaying(false)
      if (import.meta.env.DEV) console.log('[Playback] Ended')
    }
    const onError = () => {
      if (import.meta.env.DEV) console.log('[PlaybackControls] audio error')
      setIsPlaying(false)
    }
    a.addEventListener('loadedmetadata', onLoaded)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('ended', onEnded)
    a.addEventListener('error', onError)
    return () => {
      a.removeEventListener('loadedmetadata', onLoaded)
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('error', onError)
    }
  }, [url])

  useEffect(() => {
    if (!autoPlay) return
    const a = audioRef.current
    if (!a) return
    if (import.meta.env.DEV) console.log('[Playback] AutoPlay attempt', { url })
    const playPromise = a.play()
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => {
        setIsPlaying(true)
        if (import.meta.env.DEV) console.log('[Playback] AutoPlay started')
      }).catch(() => {})
    }
  }, [url, autoPlay])

  const timeLabel = useMemo(() => {
    const t = Math.floor(current)
    const m = Math.floor(t / 60).toString().padStart(2, '0')
    const s = (t % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }, [current])

  const durationLabel = useMemo(() => {
    const d = Math.floor(duration)
    const m = Math.floor(d / 60).toString().padStart(2, '0')
    const s = (d % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }, [duration])

  function toggle() {
    const a = audioRef.current
    if (!a) return
    if (isPlaying) {
      a.pause()
      setIsPlaying(false)
      if (import.meta.env.DEV) console.log('[Playback] Paused')
    } else {
      a.play()
      setIsPlaying(true)
      if (import.meta.env.DEV) console.log('[Playback] Playing')
    }
  }

  function onSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const a = audioRef.current
    if (!a) return
    const value = parseFloat(e.target.value)
    a.currentTime = value
    setCurrent(value)
      if (import.meta.env.DEV) console.log('[Playback] Seek', { to: value })
  }

  function handleClose() {
    const a = audioRef.current
    if (a) a.pause()
    setIsPlaying(false)
    onClose?.()
  }

  return (
    <div className={`mt-4 ${className ?? ''}`}>
      <div className="rounded-2xl bg-white shadow-md px-5 py-4 border border-gray-200" style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-between">
          <div className="text-[1rem] font-semibold text-gray-800">Playback</div>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 flex flex-col items-center">
          <div className="font-mono text-[1.25rem] text-gray-900">{timeLabel}</div>
          <div className="text-xs text-gray-500">/ {durationLabel}</div>
        </div>

        <div className="mt-4">
          <div className="relative w-full h-4">
            <div className="absolute inset-y-0 w-full rounded-full" style={{ height: '4px', backgroundColor: '#e5e7eb' }}></div>
            <div className="absolute inset-y-0 rounded-full" style={{ height: '4px', width: `${Math.max(0, Math.min(100, duration ? (current / duration) * 100 : 0))}%`, backgroundColor: '#2563eb' }}></div>
            <div
              role="slider"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={current}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  const v = String(Math.min(current + 1, duration))
                  onSeek({ target: { value: v } } as unknown as React.ChangeEvent<HTMLInputElement>)
                }
                if (e.key === 'ArrowLeft') {
                  const v = String(Math.max(current - 1, 0))
                  onSeek({ target: { value: v } } as unknown as React.ChangeEvent<HTMLInputElement>)
                }
              }}
              onMouseDown={(e) => {
                const el = e.currentTarget.parentElement as HTMLElement
                const rect = el.getBoundingClientRect()
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                const t = (duration || 0) * pct
                onSeek({ target: { value: String(t) } } as unknown as React.ChangeEvent<HTMLInputElement>)
              }}
              className="absolute -top-[5px]" 
              style={{ left: `calc(${Math.max(0, Math.min(100, duration ? (current / duration) * 100 : 0))}% - 7px)`, width: '14px', height: '14px', borderRadius: '9999px', backgroundColor: '#2563eb', boxShadow: '0 2px 6px rgba(124,58,237,0.25)' }}
            ></div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center">
          <button
            type="button"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={toggle}
            className="inline-flex items-center justify-center rounded-full text-white focus:outline-none focus:ring-2"
            style={{ width: '56px', height: '56px', backgroundColor: '#2563eb', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <audio ref={audioRef} src={url} preload="auto" className="hidden" />
    </div>
  )
}
