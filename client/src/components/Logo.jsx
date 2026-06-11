// App wordmark: a gradient calendar-with-check tile + "DayTracking".
export default function Logo({ showText = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
          <path d="M3 9.5h18M8 2.5v4M16 2.5v4M8.5 14.5l2.5 2.5 4.5-5" />
        </svg>
      </span>
      {showText && <span className="font-bold tracking-tight text-lg">DayTracking</span>}
    </span>
  )
}
