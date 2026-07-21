import { model } from "@medusajs/framework/utils"

// Карточка рейтинга компании: вычисленный балл и лимит отсрочки + использованная
// часть. company_id — опазная ссылка-колонка (не FK/link, модуль company не
// импортируем): сервису он нужен сам для upsert по компании и выборки (идиома
// documents.order_id). Одна карточка на компанию. manual_limit — ручная
// корректировка продавца (перекрывает вычисленный credit_limit; ТЗ: изменения
// лимитов логируются — note). reserved — занятая постоплатой часть (движение —
// подзадача 2, когда постоплата в чекауте будет включена).
const ScoreCard = model.define("score_card", {
  id: model.id({ prefix: "scorecard" }).primaryKey(),
  company_id: model.text(),
  score: model.number().default(0),
  // Вычисленный по баллу лимит отсрочки.
  credit_limit: model.bigNumber().default(0),
  // Ручной лимит продавца (если задан — эффективный лимит = он).
  manual_limit: model.bigNumber().nullable(),
  // Занятая (одобренная в постоплату, не погашенная) часть лимита.
  reserved: model.bigNumber().default(0),
  // Разбивка компонентов балла на момент расчёта (для карточки продавцу).
  components: model.json().nullable(),
  // Аудит последнего изменения (ручная корректировка/пересчёт).
  note: model.text().nullable(),
})

export default ScoreCard
