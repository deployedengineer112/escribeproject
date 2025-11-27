interface TranscriptItem {
  speaker: string
  text: string
}

interface LiveTranscriptionProps {
  status: string
  transcript: TranscriptItem[]
  className?: string
}

export function LiveTranscription({ status, transcript, className }: LiveTranscriptionProps) {
  return (
    <div className={`bg-gray-100 p-4 rounded shadow-sm border border-gray-200 mt-4 text-sm ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-900">Live Transcription</div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${status === 'Live' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
          <span className="text-sm text-gray-800">{status}</span>
        </div>
      </div>
      <div className="space-y-2 text-left">
        {transcript.map((line, idx) => (
          <div key={idx} className="text-gray-900">
            <span className="mr-2 font-semibold text-gray-800">{line.speaker}:</span>
            <span className="text-gray-800">{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}