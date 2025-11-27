import { useEffect, useMemo, useRef, useState } from 'react'
import { Mic, Pause, Square } from 'lucide-react'

interface RecordingControlsProps {
  status: string
  timer: string
  className?: string
  onStarted?: () => void
  onStopped?: () => void
  onPaused?: () => void
  onAudioReady?: (url: string) => void
}

export function RecordingControls({
  status,
  timer,
  className,
  onStarted,
  onStopped,
  onPaused,
  onAudioReady
}: RecordingControlsProps) {

  const initialSeconds = useMemo(() => {
    const parts = timer.split(':')
    const m = parseInt(parts[0] || '0', 10)
    const s = parseInt(parts[1] || '0', 10)
    return m * 60 + s
  }, [timer])

  const initialState = (() => {
    const v = status.toLowerCase()
    if (v === 'recording') return 'recording'
    if (v === 'paused') return 'paused'
    if (v === 'stopped') return 'stopped'
    return 'stopped'
  })() as 'recording' | 'paused' | 'stopped'

  const [recState, setRecState] = useState<'recording' | 'paused' | 'stopped'>(initialState)
  const [seconds, setSeconds] = useState(initialSeconds)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const [chunks, setChunks] = useState<Blob[]>([])
  const chunksRef = useRef<Blob[]>([])

  const lastStateRef = useRef(recState)

  const isRecording = recState === 'recording'

  useEffect(() => {
    let id: number | undefined
    if (isRecording) {
      id = window.setInterval(() => {
        setSeconds((v) => v + 1)
      }, 1000)
    }
    return () => {
      if (id) window.clearInterval(id)
    }
  }, [isRecording])

  const display = useMemo(() => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }, [seconds])

  async function toggle() {
    if (import.meta.env.DEV) console.log('[Recording] Toggle pressed', { state: recState })
    if (recState === 'recording') {
      if (recorder?.state === 'recording') recorder.pause()
      if (import.meta.env.DEV) console.log('[Recording] Paused')
      setRecState('paused')
      setHasInteracted(true)
      return
    }

    if (!recorder) {
      try {
        if (import.meta.env.DEV) console.log('[Recording] Requesting microphone access')
        const s = await navigator.mediaDevices.getUserMedia({ audio: true })
        const supportsOpus = typeof MediaRecorder !== 'undefined' && 'isTypeSupported' in MediaRecorder && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        const supportsWebm = typeof MediaRecorder !== 'undefined' && 'isTypeSupported' in MediaRecorder && MediaRecorder.isTypeSupported('audio/webm')
        const supportsMp4 = typeof MediaRecorder !== 'undefined' && 'isTypeSupported' in MediaRecorder && MediaRecorder.isTypeSupported('audio/mp4')
        const mime: string | undefined = supportsMp4 ? 'audio/mp4' : (supportsOpus ? 'audio/webm;codecs=opus' : (supportsWebm ? 'audio/webm' : undefined))
        const r = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s)

        r.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current = [...chunksRef.current, e.data]
            setChunks((prev) => [...prev, e.data])
          }
          if (import.meta.env.DEV) console.log('[Recording] dataavailable', { size: e.data.size })
        }

        r.start()
        if (import.meta.env.DEV) console.log('[Recording] Started', { mime: r.mimeType })
        setStream(s)
        setRecorder(r)
        chunksRef.current = []
        setChunks([])
        setRecState('recording')
        setHasInteracted(true)
        return
      } catch {
        if (import.meta.env.DEV) console.warn('[Recording] Microphone access failed')
        return
      }
    }

    if (recorder.state === 'paused') recorder.resume()
    if (import.meta.env.DEV) console.log('[Recording] Resumed')
    setRecState('recording')
    setHasInteracted(true)
  }

  function stop() {
    if (import.meta.env.DEV) console.log('[Recording] Stop pressed')
    setRecState('stopped')
    setSeconds(0)
    setHasInteracted(true)

    if (recorder && recorder.state !== 'inactive') {
      try { recorder.requestData() } catch { void 0 }
      recorder.stop()
    }
    if (import.meta.env.DEV) console.log('[Recording] Stopping recorder')

    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      setStream(null)
    }
  }

  // 🔥 FIX: trigger callbacks ONLY on ACTUAL STATE CHANGE
  useEffect(() => {
    if (!hasInteracted) return

    if (lastStateRef.current === recState) return
    lastStateRef.current = recState

    if (recState === 'recording') onStarted?.()
    else if (recState === 'paused') onPaused?.()
    else if (recState === 'stopped') onStopped?.()

  }, [recState, hasInteracted, onStarted, onPaused, onStopped])

  useEffect(() => {
    if (!recorder) return
    const onStop = () => {
      const pieces = chunksRef.current
      if (pieces.length > 0) {
        const type: string = (recorder && (recorder as unknown as { mimeType?: string }).mimeType) || 'audio/webm'
        const blob = new Blob(pieces, { type })
        const reader = new FileReader()
        reader.onloadend = () => {
          const dataUrl = String(reader.result || '')
          try { sessionStorage.setItem('escribe.audio', dataUrl) } catch { void 0 }
          onAudioReady?.(dataUrl)
        }
        reader.readAsDataURL(blob)
        chunksRef.current = []
        setChunks([])
        setRecorder(null)
      }
    }

    recorder.addEventListener('stop', onStop)
    return () => recorder.removeEventListener('stop', onStop)

  }, [recorder, chunks, onAudioReady])

  return (
    <div className={`mt-4 ${className ?? ''}`}>
      <div className="flex flex-col items-center">
        <div className="font-mono text-4xl text-gray-900">{display}</div>

        <div className="mt-1 flex items-center">
          <span
            className={`
              inline-block w-2.5 h-2.5 rounded-full mr-2
              ${recState === 'recording' ? 'bg-green-600'
                : recState === 'paused' ? 'bg-gray-400'
                : 'bg-red-600'}
            `}
          />

          <span className="text-sm text-gray-800">
            {recState === 'recording'
              ? 'Recording'
              : recState === 'paused'
              ? 'Paused'
              : 'Stopped'}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">

        {/* RECORD / PAUSE */}
        <div
          className={`p-1 rounded-full border-2 border-dashed ${
            isRecording
              ? 'border-green-600'
              : hasInteracted
              ? 'border-gray-300'
              : 'border-green-600'
          }`}
        >
          <button
            type="button"
            onClick={toggle}
            className={`
              inline-flex items-center justify-center rounded-full w-12 h-12
              ${isRecording
                ? 'bg-green-600 text-white'
                : hasInteracted
                ? 'bg-gray-400 text-white'
                : 'bg-green-600 text-white'}
            `}
          >
            {isRecording ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* STOP BUTTON */}
        <div className="p-1 rounded-full border-2 border-dashed border-gray-300">
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center justify-center rounded-full w-11 h-11 bg-red-600 text-white"
          >
            <Square className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
