export default function KaspiLogo({
  size = 24,
  className = "",
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 select-none overflow-hidden rounded-full shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/kaspi-logo.png"
        alt="Kaspi"
        width={size}
        height={size}
        className="w-full h-full object-contain block"
      />
    </span>
  )
}
