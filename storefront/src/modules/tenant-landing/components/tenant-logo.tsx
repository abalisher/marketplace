// Знак компании: её логотип (tenant.logo_url) или первая буква названия на
// акцентной плашке, если логотипа нет. Один компонент на шапку, подвал,
// баннер и карточку чата — размер задаёт место.
const TenantLogo = ({
  name,
  logoUrl,
  className = "w-10 h-10 rounded-xl text-lg",
}: {
  name: string
  logoUrl: string | null
  className?: string
}) =>
  logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt=""
      className={`${className} object-contain bg-surface border border-line shrink-0`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`${className} bg-accent text-on-accent flex items-center justify-center font-black shrink-0`}
    >
      {name.replace(/^(ТОО|ИП|АО)\s*«?/i, "").charAt(0)}
    </span>
  )

export default TenantLogo
