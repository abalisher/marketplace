import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar } from "@medusajs/icons"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import DashboardKpiCard from "../../components/dashboard-kpi-card"
import {
  AdminDashboardMoney,
  AdminDashboardResponse,
  AdminDashboardStageRow,
} from "../../lib/dashboard"
import { formatDayMonth } from "../../lib/date"
import { formatAmount, formatTenge } from "../../lib/money"
import { orderStatusMeta } from "../../lib/order"
import { RECEIPT_STATUS_META } from "../../lib/procurement"
import { routeLabel } from "../../lib/route-label"
import { sdk } from "../../lib/sdk"
import { durationUnit, waitingUnit } from "../../lib/waiting"
import "../../lib/shell-mode"
import "../../styles/brand.css"
import "../../styles/core-noise.css"
import "../../styles/dashboard.css"
import "../../styles/shell.css"

// Дашборд продавца — «что требует внимания сегодня» (макет 1a). Экран ничего не
// считает сам: сводку целиком собирает GET /admin/dashboard (пороги остатка и
// набор «открытых» статусов — на бэкенде). Отсюда ведут переходы в разделы:
// очередь заказов, модерация карточек, остатки ядра, приходы закупа.
//
// Здесь же — единственная точка подключения оболочки панели на всю админку
// (расширения попадают в общий входной чанк, поэтому импорты действуют на любой
// странице, включая ядровые): стили бренда `styles/brand.css`, режим продавца
// `lib/shell-mode.ts` + его слой обрезки `styles/shell.css`. Подробности — в
// комментариях самих файлов; повторно подключать не нужно.
const DashboardPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => sdk.client.fetch<AdminDashboardResponse>("/admin/dashboard"),
  })

  const today = formatDayMonth(new Date())

  // Ожидание на плитках — в человеческих единицах: «самая старая ждёт 443 ч»
  // никто не переводит в дни в голове (гейт U по T4.11, lib/waiting).
  const disputesWaiting = waitingUnit(data?.disputes.oldest_waiting_hours ?? 0)
  const moderationWaiting = waitingUnit(
    data?.moderation.oldest_waiting_hours ?? 0
  )

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between gap-x-4 px-6 py-4">
        <div>
          <Heading level="h1">{t("dashboard.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("dashboard.today", { date: today })}
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          onClick={() => refetch()}
          isLoading={isFetching}
        >
          {t("dashboard.refresh")}
        </Button>
      </div>

      <div className="px-6 py-4">
        {isLoading && <DashboardSkeleton />}

        {isError && (
          <div className="flex flex-col items-start gap-y-3 py-6">
            <Text size="small" className="text-ui-fg-subtle">
              {t("dashboard.error")}
            </Text>
            <Button size="small" variant="secondary" onClick={() => refetch()}>
              {t("dashboard.retry")}
            </Button>
          </div>
        )}

        {data && (
          <div className="sm-dash">
            <div className="sm-kpi-grid">
              {/* Просрочка в подписи и красная точка: панель — единственный
                  канал, которым продавец узнаёт, что заказ вышел за срок
                  стадии (уведомлений система не рассылает, T4.12). */}
              <DashboardKpiCard
                title={t("dashboard.orders.title")}
                value={data.orders.open_count}
                hint={t(
                  data.orders.overdue_count > 0
                    ? "dashboard.orders.hintOverdue"
                    : "dashboard.orders.hint",
                  {
                    new: data.orders.counts.new ?? 0,
                    assembling:
                      (data.orders.counts.assembling ?? 0) +
                      (data.orders.counts.partially_assembled ?? 0),
                    overdue: data.orders.overdue_count,
                  }
                )}
                linkLabel={t("dashboard.orders.link")}
                to="/order-queue"
                accent={data.orders.overdue_count > 0 ? "error" : "accent"}
              />
              {/* Претензии — плитка оператора претензий: без неё утром не
                  видно ни очереди, ни просрочки (T4.11). */}
              <DashboardKpiCard
                title={t("dashboard.disputes.title")}
                value={data.disputes.open_count}
                hint={
                  data.disputes.open_count === 0
                    ? t("dashboard.disputes.hintEmpty")
                    : disputesWaiting.unit === "days"
                      ? t("dashboard.disputes.hintDays", {
                          overdue: data.disputes.overdue_count,
                          count: disputesWaiting.value,
                        })
                      : t("dashboard.disputes.hint", {
                          overdue: data.disputes.overdue_count,
                          count: disputesWaiting.value,
                        })
                }
                linkLabel={t("dashboard.disputes.link")}
                to="/disputes"
                accent={data.disputes.overdue_count > 0 ? "error" : "warning"}
              />
              <DashboardKpiCard
                title={t("dashboard.moderation.title")}
                value={data.moderation.pending_count}
                hint={
                  data.moderation.oldest_waiting_hours === null
                    ? t("dashboard.moderation.hintEmpty")
                    : moderationWaiting.unit === "days"
                      ? t("dashboard.moderation.hintDays", {
                          count: moderationWaiting.value,
                        })
                      : t("dashboard.moderation.hint", {
                          count: moderationWaiting.value,
                        })
                }
                linkLabel={t("dashboard.moderation.link")}
                to="/product-moderation"
                accent="warning"
              />
              {/* «Низкие остатки» ведут на «Цены и остатки» с чипом «на
                  исходе», а не в ядровый «Склад»: там таблица без названий
                  товаров, и кладовщик по плитке искал ноль и не находил
                  (Ф-прогон Данияра 2026-09-02). Плитка и экран считают один и
                  тот же срез — расходиться их числам больше нечем. */}
              <DashboardKpiCard
                title={t("dashboard.stock.title")}
                value={data.stock.low_count}
                hint={t("dashboard.stock.hint", {
                  zero: data.stock.zero_count,
                  threshold: data.stock.threshold,
                })}
                linkLabel={t("dashboard.stock.link")}
                to="/price-stock?stock=low"
                accent="error"
              />
              <DashboardKpiCard
                title={t("dashboard.receipts.title")}
                value={data.receipts.open_count}
                hint={t("dashboard.receipts.hint", {
                  drafts: data.receipts.draft_count,
                  ai: data.receipts.ai_count,
                })}
                linkLabel={t("dashboard.receipts.link")}
                to="/procurement"
                accent="success"
              />
            </div>

            <MoneyStrip money={data.money} />

            <div className="sm-panels">
              <div className="sm-panel">
                <div className="sm-panel-head">
                  <span className="sm-panel-title">
                    {t("dashboard.queue.title")}
                  </span>
                  <Link className="sm-panel-link" to="/order-queue">
                    {t("dashboard.queue.all")} →
                  </Link>
                </div>
                <div className="sm-panel-body">
                  {data.orders.queue.length === 0 ? (
                    <div className="sm-empty">{t("dashboard.queue.empty")}</div>
                  ) : (
                    <>
                      <div className="sm-row sm-row-head">
                        <span>{t("dashboard.queue.colNumber")}</span>
                        <span>{t("dashboard.queue.colCustomer")}</span>
                        <span className="sm-row-hide-sm">
                          {t("dashboard.queue.colItems")}
                        </span>
                        <span className="sm-num">
                          {t("dashboard.queue.colTotal")}
                        </span>
                        <span>{t("dashboard.queue.colWaiting")}</span>
                        <span>{t("common.status")}</span>
                      </div>
                      {data.orders.queue.map((row) => {
                        const meta = orderStatusMeta(row.status)
                        return (
                          <div
                            key={row.order_id}
                            role="button"
                            tabIndex={0}
                            className="sm-row sm-row-link cursor-pointer"
                            onClick={() => navigate(`/orders/${row.order_id}`)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                navigate(`/orders/${row.order_id}`)
                              }
                            }}
                          >
                            <span className="sm-num">
                              {row.display_id === null
                                ? "—"
                                : `№ ${row.display_id}`}
                            </span>
                            <span className="sm-line-title">
                              {row.customer ?? t("dashboard.queue.noCustomer")}
                            </span>
                            <span className="sm-muted sm-row-hide-sm">
                              {t("dashboard.queue.items", {
                                count: row.item_count,
                              })}
                            </span>
                            <span className="sm-num">
                              {row.total === null
                                ? "—"
                                : formatAmount(row.total, row.currency_code)}
                            </span>
                            {/* Сколько заказ стоит в этом статусе: три заказа
                                шестой день в «В доставке» в панели раньше
                                выглядели как вчерашние (T4.12). Вне срока —
                                красным (подпись «вне срока» несут плитка выше
                                и колонка экрана «Заказы»; в узкой колонке
                                предпросмотра она ломала число на две строки). */}
                            <QueueWaiting
                              hours={row.status_hours}
                              overdue={row.overdue}
                            />
                            <span className="flex items-center gap-x-2">
                              <span
                                className={`size-2 rounded-full ${meta.dotClass}`}
                              />
                              <span>{t(meta.label)}</span>
                            </span>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              </div>

              <div className="sm-side">
                <div className="sm-panel">
                  <div className="sm-panel-head">
                    <span className="sm-panel-title">
                      {t("dashboard.stock.panel")}
                    </span>
                    <Link className="sm-panel-link" to="/price-stock?stock=low">
                      {t("dashboard.all")} →
                    </Link>
                  </div>
                  <div className="sm-panel-body">
                    {data.stock.items.length === 0 ? (
                      <div className="sm-empty">
                        {t("dashboard.stock.empty")}
                      </div>
                    ) : (
                      data.stock.items.map((item) => (
                        <div key={item.id} className="sm-line">
                          <div className="sm-line-main">
                            <div className="sm-line-title">
                              {item.title ?? item.sku ?? "—"}
                            </div>
                            {item.sku && item.title && (
                              <div className="sm-line-sub">{item.sku}</div>
                            )}
                          </div>
                          <div
                            className="sm-num"
                            style={{
                              color:
                                item.available <= 0
                                  ? "rgb(var(--sm-error))"
                                  : undefined,
                            }}
                          >
                            {t("dashboard.stock.units", {
                              count: item.available,
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="sm-panel">
                  <div className="sm-panel-head">
                    <span className="sm-panel-title">
                      {t("dashboard.receipts.panel")}
                    </span>
                    <Link className="sm-panel-link" to="/procurement">
                      {t("dashboard.all")} →
                    </Link>
                  </div>
                  <div className="sm-panel-body">
                    {data.receipts.items.length === 0 ? (
                      <div className="sm-empty">
                        {t("dashboard.receipts.empty")}
                      </div>
                    ) : (
                      data.receipts.items.map((receipt) => {
                        const meta =
                          RECEIPT_STATUS_META[
                            receipt.status as keyof typeof RECEIPT_STATUS_META
                          ]
                        return (
                          <div key={receipt.id} className="sm-line">
                            <div className="sm-line-main">
                              <div className="sm-line-title">
                                {receipt.reference ??
                                  t("dashboard.receipts.noReference")}
                                {receipt.supplier ? ` · ${receipt.supplier}` : ""}
                              </div>
                              <div className="sm-line-sub">
                                {formatTenge(receipt.total_cost)}
                              </div>
                            </div>
                            {meta && (
                              <span className="flex items-center gap-x-2">
                                <span
                                  className={`size-2 rounded-full ${meta.dotClass}`}
                                />
                                <span className="sm-muted">{t(meta.label)}</span>
                              </span>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <StagesPanel stages={data.stages} />
          </div>
        )}
      </div>
    </Container>
  )
}

// Время в статусе одной подписью: часы, пока они что-то значат, дальше сутки
// (lib/waiting — тот же порог, что у очереди претензий).
const QueueWaiting = ({
  hours,
  overdue,
}: {
  hours: number
  overdue: boolean
}) => {
  const { t } = useTranslation()
  const waiting = waitingUnit(hours)
  return (
    <span
      className={
        overdue
          ? "sm-row-waiting sm-row-waiting-overdue"
          : "sm-row-waiting sm-muted"
      }
    >
      {waiting.unit === "days"
        ? t("dashboard.queue.waitingDays", { count: waiting.value })
        : t("dashboard.queue.waitingHours", { count: waiting.value })}
    </span>
  )
}

// Полоса денег дня (T4.12): выручка за день и за неделю, деньги в незакрытых
// заказах и долг юрлиц. Ссылок с неё нет намеренно — это сводка, а не очередь
// задач; действия живут на плитках выше.
const MoneyStrip = ({ money }: { money: AdminDashboardMoney }) => {
  const { t } = useTranslation()
  const amount = (value: number) => formatAmount(value, money.currency_code)

  return (
    <div className="sm-money">
      <div className="sm-money-cell">
        <div className="sm-money-label">{t("dashboard.money.revenueToday")}</div>
        <div className="sm-money-value">{amount(money.revenue_today)}</div>
        <div className="sm-money-sub">
          {money.revenue_today_orders === 0
            ? t("dashboard.money.revenueTodayEmpty")
            : t("dashboard.money.revenueTodayHint", {
                count: money.revenue_today_orders,
              })}
        </div>
      </div>
      <div className="sm-money-cell">
        <div className="sm-money-label">
          {t("dashboard.money.revenueWeek", { days: money.week_days })}
        </div>
        <div className="sm-money-value">{amount(money.revenue_week)}</div>
        <div className="sm-money-sub">
          {t("dashboard.money.revenueWeekHint", {
            count: money.revenue_week_orders,
          })}
          {/* Заказ в другой валюте в суммы не попал — молчать об этом нельзя,
              иначе сводка выглядит неполной без объяснения. */}
          {money.other_currency_orders > 0 &&
            ` · ${t("dashboard.money.otherCurrency", {
              count: money.other_currency_orders,
            })}`}
        </div>
      </div>
      <div className="sm-money-cell">
        <div className="sm-money-label">{t("dashboard.money.inProgress")}</div>
        <div className="sm-money-value">{amount(money.in_progress)}</div>
        <div className="sm-money-sub">
          {money.in_progress_orders === 0
            ? t("dashboard.money.inProgressEmpty")
            : money.awaiting_payment > 0
              ? t("dashboard.money.inProgressAwaiting", {
                  amount: amount(money.awaiting_payment),
                })
              : t("dashboard.money.inProgressHint", {
                  count: money.in_progress_orders,
                })}
        </div>
      </div>
      {/* Долг юрлиц — только когда юрлица включены флагом: на MVP магазин
          работает с физлицами, и пустая плитка «₸ 0» врала бы. */}
      {money.receivables && (
        <div className="sm-money-cell">
          <div className="sm-money-label">
            {t("dashboard.money.receivables")}
          </div>
          <div className="sm-money-value">
            {amount(money.receivables.total)}
          </div>
          <div
            className={
              money.receivables.overdue > 0
                ? "sm-money-sub sm-money-alarm"
                : "sm-money-sub"
            }
          >
            {money.receivables.overdue > 0
              ? t("dashboard.money.receivablesOverdue", {
                  amount: amount(money.receivables.overdue),
                })
              : t("dashboard.money.receivablesHint", {
                  count: money.receivables.companies,
                  days: money.receivables.term_days,
                })}
          </div>
        </div>
      )}
    </div>
  )
}

// Отчёт по стадиям: где магазин тормозит. Среднее и худшее время по каждой
// стадии считает бэкенд (api/admin/dashboard/stages.ts) — экран выбирает
// только человеческую единицу (минуты/часы/сутки).
const StagesPanel = ({
  stages,
}: {
  stages: AdminDashboardResponse["stages"]
}) => {
  const { t } = useTranslation()
  const measured = stages.stages.some((stage) => stage.orders > 0)

  return (
    <div className="sm-panel">
      <div className="sm-panel-head">
        <span className="sm-panel-title">{t("dashboard.stages.title")}</span>
        <span className="sm-muted">
          {t("dashboard.stages.window", {
            count: stages.window_days,
            orders: stages.orders_total,
          })}
        </span>
      </div>
      <div className="sm-panel-body">
        {!measured ? (
          <div className="sm-empty">{t("dashboard.stages.empty")}</div>
        ) : (
          <>
            <div className="sm-stage-row sm-stage-head">
              <span>{t("dashboard.stages.colStage")}</span>
              <span className="sm-num">{t("dashboard.stages.colAvg")}</span>
              <span className="sm-num">{t("dashboard.stages.colMax")}</span>
              <span className="sm-num">{t("dashboard.stages.colOrders")}</span>
            </div>
            {stages.stages.map((stage) => (
              <div key={stage.key} className="sm-stage-row">
                <span className="sm-line-title">
                  {t(`dashboard.stages.${stage.key}`)}
                </span>
                <span className="sm-num">
                  <StageDuration minutes={stage.avg_minutes} />
                </span>
                <span className="sm-num sm-muted">
                  <StageDuration minutes={stage.max_minutes} />
                </span>
                <span className="sm-num sm-muted">{stage.orders}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

// Длительность стадии. Стадию, которую в окне никто не прошёл, подписываем
// прочерком: «0 мин» читалось бы как «мгновенно».
const StageDuration = ({
  minutes,
}: {
  minutes: AdminDashboardStageRow["avg_minutes"]
}) => {
  const { t } = useTranslation()
  if (minutes === null) {
    return <span>—</span>
  }
  // Стадия, пройденная быстрее минуты, это «меньше минуты», а не «0 мин»:
  // ноль читается как «мгновенно/нет данных» (гейт U — на стенде демо-заказы
  // проходят сборку и отгрузку одним скриптом, и весь столбец был в нулях).
  if (minutes === 0) {
    return <span>{t("dashboard.duration.underMinute")}</span>
  }
  const duration = durationUnit(minutes)
  return <span>{t(`dashboard.duration.${duration.unit}`, { count: duration.value })}</span>
}

// Скелет первой загрузки: та же сетка, чтобы раскладка не прыгала.
const DashboardSkeleton = () => (
  <div className="sm-dash">
    <div className="sm-kpi-grid">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="sm-kpi">
          <div className="sm-skeleton" style={{ height: 14, width: "60%" }} />
          <div
            className="sm-skeleton"
            style={{ height: 30, width: 64, margin: "10px 0 6px" }}
          />
          <div className="sm-skeleton" style={{ height: 12, width: "80%" }} />
        </div>
      ))}
    </div>
    <div className="sm-panels">
      <div className="sm-panel" style={{ height: 280 }} />
      <div className="sm-panel" style={{ height: 280 }} />
    </div>
  </div>
)

export const config = defineRouteConfig({
  label: routeLabel({ en: "Dashboard", ru: "Дашборд" }),
  icon: ChartBar,
})

export default DashboardPage
