// Декоративные иконки лендинга: смысл несёт соседний текст, поэтому все
// скрыты от скринридеров (aria-hidden) и не получают фокус в IE/Edge (focusable).

export function IconBot({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="3" />
      <circle cx="8.5" cy="16" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="16" r="1.5" fill="currentColor" />
      <path d="M12 7v4" />
      <line x1="8" y1="2" x2="10" y2="7" />
      <line x1="16" y1="2" x2="14" y2="7" />
      <path d="M2 15h1" />
      <path d="M21 15h1" />
    </svg>
  )
}

export function IconSparkles({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2z" fill="currentColor" fillOpacity={0.15} />
      <path d="M19 16l1.2 2.8L23 20l-2.8 1.2L19 24l-1.2-2.8L15 20l2.8-1.2L19 16z" />
    </svg>
  )
}

export function IconTruck({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
      <line x1="8" y1="18.5" x2="16" y2="18.5" />
    </svg>
  )
}

export function IconCrane({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22V4l16-2v2" />
      <path d="M4 8l16-2" />
      <path d="M4 14l16-2" />
      <path d="M20 4v10" />
      <circle cx="20" cy="16" r="2" />
      <line x1="2" y1="22" x2="10" y2="22" />
    </svg>
  )
}

export function IconCalculator({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="3" />
      <line x1="8" y1="6" x2="16" y2="6" strokeWidth={2} />
      <circle cx="8.5" cy="11.5" r="1" fill="currentColor" />
      <circle cx="12" cy="11.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="11.5" r="1" fill="currentColor" />
      <circle cx="8.5" cy="15.5" r="1" fill="currentColor" />
      <circle cx="12" cy="15.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
      <line x1="8" y1="19" x2="16" y2="19" />
    </svg>
  )
}

export function IconShieldCheck({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity={0.1} />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

export function IconReturn({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 8v4l3 3" />
    </svg>
  )
}

export function IconSack({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10a6 6 0 0 1 12 0c0 7-1.5 11-6 11s-6-4-6-11z" fill="currentColor" fillOpacity={0.1} />
      <path d="M9 3h6l-1 4H10z" />
      <path d="M9 13h6" />
      <path d="M12 10v6" />
    </svg>
  )
}

export function IconBlocks({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="9" height="7" rx="1.5" />
      <rect x="13" y="3" width="9" height="7" rx="1.5" />
      <rect x="7" y="14" width="10" height="7" rx="1.5" />
      <path d="M2 14h3" />
      <path d="M19 14h3" />
      <path d="M2 21h3" />
      <path d="M19 21h3" />
    </svg>
  )
}

export function IconDrywall({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <line x1="8" y1="2" x2="8" y2="22" strokeDasharray="2 2" />
      <line x1="16" y1="2" x2="16" y2="22" strokeDasharray="2 2" />
      <path d="M4 8h16" />
      <path d="M4 16h16" />
    </svg>
  )
}

export function IconMicrophone({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" fillOpacity={0.15} />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  )
}

export function IconWaveform({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="3" y1="12" x2="3" y2="12.01" />
      <line x1="7" y1="8" x2="7" y2="16" />
      <line x1="11" y1="5" x2="11" y2="19" />
      <line x1="15" y1="9" x2="15" y2="15" />
      <line x1="19" y1="11" x2="19" y2="13" />
    </svg>
  )
}

export function IconCheckCircle({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity={0.1} />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

export function IconMapPin({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="currentColor" fillOpacity={0.1} />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function IconWhatsApp({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.301-.15-1.782-.879-2.057-.98-.276-.1-.476-.15-.676.15-.2.3-.776.98-.952 1.18-.175.201-.35.226-.651.076-.3-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.675-2.084-.176-.3-.019-.462.131-.612.136-.135.301-.35.451-.525.15-.175.2-.3.301-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.63-.926-2.232-.244-.585-.493-.506-.676-.515-.175-.01-.376-.01-.576-.01s-.525.075-.801.375c-.275.3-1.051 1.026-1.051 2.503 0 1.477 1.076 2.903 1.226 3.103.151.2 2.119 3.235 5.132 4.538.717.31 1.277.495 1.713.633.72.228 1.375.196 1.893.118.577-.087 1.782-.727 2.032-1.43.25-.702.25-1.303.175-1.43-.075-.126-.275-.201-.576-.351z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 22l4.914-1.354A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.16 8.16 0 01-4.162-1.134l-.298-.177-3.097.853.83-3.018-.194-.31A8.156 8.156 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2z" />
    </svg>
  )
}

export function IconDocument({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

export function IconClock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function IconChevronDown({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function IconZap({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity={0.15} />
    </svg>
  )
}

export function IconWarehouse({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V9l9-5 9 5v12" />
      <path d="M9 21V12h6v9" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </svg>
  )
}

export function IconDumpTruck({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 13V8l11-3v8" />
      <path d="M13 9h5l3 3v4h-8V9z" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="17.5" cy="18" r="2.5" />
      <line x1="8.5" y1="18" x2="15" y2="18" />
      <path d="M2 16h1.5" />
    </svg>
  )
}

export function IconCheckSmall({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function IconCart({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

export function IconLocation({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function IconChart({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
