import { dataTableRow } from "../data-table-row"
import { DISPUTE_STATUS_META } from "../reviews"

// Ядровый `useDataTable` отдаёт в `onRowClick` обёртку TanStack (`{ original }`),
// а не строку данных. Класс дефекта стоил двух рабочих экранов: очередь заказов
// молчала на клик (T4.2b), а «Споры» падали при клике по претензии (T4.11a,
// блокер Ф-прогона 2026-08-18). Тест закрепляет распаковку и главную ловушку:
// когда `getRowId` возвращает id сущности, обёртка МАСКИРУЕТСЯ под строку —
// `row.id` совпадает, и дефект не виден до обращения к любому другому полю.

type Dispute = { id: string; status: "open" | "resolved"; order_id: string }

const dispute: Dispute = {
  id: "disp_1",
  status: "open",
  order_id: "order_1",
}

// Ровно то, что делает ядро: типы колбэка обещают строку, а приходит обёртка.
const wrapped = { id: dispute.id, original: dispute } as unknown as Dispute

describe("dataTableRow", () => {
  it("распаковывает обёртку TanStack", () => {
    expect(dataTableRow(wrapped)).toBe(dispute)
  })

  it("пропускает саму строку, если ядро отдало данные", () => {
    expect(dataTableRow(dispute)).toBe(dispute)
  })

  it("возвращает поля строки, а не обёртки (обёртка маскируется по id)", () => {
    // Совпадающий id — ровно то, из-за чего дефект жил незамеченным на экранах,
    // где клик только навигирует по `${row.id}`.
    expect(wrapped.id).toBe(dispute.id)
    expect(dataTableRow(wrapped).order_id).toBe("order_1")
  })

  it("даёт статус претензии, по которому drawer берёт цвет бейджа", () => {
    // Без распаковки здесь было DISPUTE_STATUS_META[undefined] и падение
    // рендера на `.color` — белый экран вместо раздела «Споры».
    expect(DISPUTE_STATUS_META[dataTableRow(wrapped).status].color).toBe(
      "orange"
    )
  })
})
