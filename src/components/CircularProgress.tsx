interface CircularProgressProps {
  value: number
  size?: number
  stroke?: number
  trackColor?: string
  progressColor?: string
  className?: string
}

export function CircularProgress({ value, size = 80, stroke = 8, trackColor = '#e5e7eb', progressColor = '#c084fc' }: CircularProgressProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const offset = clamped === 100 ? 0 : circumference - (clamped / 100) * circumference
  return (
    <div className={`relative`} style={{ width: size, height: size }} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={progressColor} strokeWidth={stroke} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-sm font-semibold text-gray-900">{clamped}%</div>
      </div>
    </div>
  )
}