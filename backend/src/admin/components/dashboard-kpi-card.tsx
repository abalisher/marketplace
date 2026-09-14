import { useNavigate } from "react-router-dom"
import { DASHBOARD_DOT_COLOR, DashboardAccent } from "../lib/dashboard"

type Props = {
  title: string
  value: number
  hint: string
  linkLabel: string
  to: string
  accent: DashboardAccent
}

// KPI-карточка дашборда «что требует внимания» (макет 1a): подпись + цветная
// точка этапа, крупное число tabular-nums, пояснение и переход в свой раздел.
// Карточка кликабельна целиком — оператору не надо целиться в ссылку.
const DashboardKpiCard = ({
  title,
  value,
  hint,
  linkLabel,
  to,
  accent,
}: Props) => {
  const navigate = useNavigate()

  return (
    <button type="button" className="sm-kpi" onClick={() => navigate(to)}>
      <span className="sm-kpi-head">
        <span className="sm-kpi-title">{title}</span>
        <span
          className="sm-kpi-dot"
          style={{ background: DASHBOARD_DOT_COLOR[accent] }}
        />
      </span>
      <div className="sm-kpi-value">{value}</div>
      <div className="sm-kpi-hint">{hint}</div>
      <div className="sm-kpi-link">{linkLabel} →</div>
    </button>
  )
}

export default DashboardKpiCard
