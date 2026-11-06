import { useQuery } from "@tanstack/react-query"
import { PanelActor } from "../lib/order"
import { sdk } from "../lib/sdk"
import { fetchShellRole } from "../lib/shell-role"

type TenantResponse = {
  tenant: { id: string; name: string; slug: string; role: "seller" | "picker" | "driver" } | null
}

// Роль пользователя в панели для кнопок заказа (см. PanelActor): компания и
// роль в ней — GET /admin/tenant, сборщик площадки — роль оболочки.
export const usePanelActor = (): PanelActor | undefined => {
  const { data } = useQuery({
    queryKey: ["panel-actor"],
    queryFn: async (): Promise<PanelActor> => {
      const [{ tenant }, role] = await Promise.all([
        sdk.client.fetch<TenantResponse>("/admin/tenant"),
        fetchShellRole(),
      ])
      if (tenant?.role === "picker" || role === "picker") {
        return "picker"
      }
      return tenant ? "tenant_seller" : "staff"
    },
    // Без долгого кэша и со сверкой при возврате во вкладку: сессия общая для
    // вкладок, в соседней могли войти под другой учёткой.
    refetchOnWindowFocus: true,
  })
  return data
}
