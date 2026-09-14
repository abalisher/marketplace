import { loadOrderAssignees } from "../assignees"

// Ответственный в строке очереди (T4.12): на стадиях сборки — сборщики,
// взявшие задания, иначе — сотрудник, последним переведший статус. Заказ, к
// которому из сотрудников никто не прикасался, ответственного не имеет: это и
// есть «не взят».

const USERS = [
  { id: "usr_operator", first_name: "Тимур", last_name: "Ахметов", email: "t@x.kz" },
  { id: "usr_picker_1", first_name: "Данияр", last_name: null, email: "d@x.kz" },
  { id: "usr_picker_2", first_name: null, last_name: null, email: "picker.wet@x.kz" },
  { id: "usr_picker_3", first_name: "Асель", last_name: null, email: "a@x.kz" },
]

const makeServices = (
  tasks: { order_id: string; assignee_id: string | null }[],
  events: Record<string, unknown>[]
) =>
  ({
    assembly: { listAssemblyTasks: async () => tasks } as never,
    lifecycle: { listOrderLifecycleEvents: async () => events } as never,
    users: {
      listUsers: async (filters: { id: string[] }) =>
        USERS.filter((user) => filters.id.includes(user.id)),
    } as never,
  })

const event = (
  lifecycleId: string,
  actorType: string,
  actorId: string | null,
  iso: string
) => ({
  actor_type: actorType,
  actor_id: actorId,
  created_at: iso,
  order_lifecycle_id: lifecycleId,
})

describe("loadOrderAssignees", () => {
  it("на сборке показывает сборщиков, взявших задания", async () => {
    const assignees = await loadOrderAssignees(
      makeServices(
        [
          { order_id: "order_1", assignee_id: "usr_picker_1" },
          { order_id: "order_1", assignee_id: null },
        ],
        [event("ordlc_1", "seller", "usr_operator", "2026-09-01T07:00:00.000Z")]
      ),
      [{ lifecycle_id: "ordlc_1", order_id: "order_1", status: "assembling" }]
    )

    expect(assignees.get("order_1")).toEqual({
      name: "Данияр",
      role: "picker",
    })
  })

  it("учётку без имени подписывает логином из почты", async () => {
    const assignees = await loadOrderAssignees(
      makeServices([{ order_id: "order_1", assignee_id: "usr_picker_2" }], []),
      [{ lifecycle_id: "ordlc_1", order_id: "order_1", status: "assembling" }]
    )

    expect(assignees.get("order_1")?.name).toBe("picker.wet")
  })

  it("третьего сборщика сворачивает в «+N»: строка очереди 44 px", async () => {
    const assignees = await loadOrderAssignees(
      makeServices(
        [
          { order_id: "order_1", assignee_id: "usr_picker_1" },
          { order_id: "order_1", assignee_id: "usr_picker_2" },
          { order_id: "order_1", assignee_id: "usr_picker_3" },
        ],
        []
      ),
      [{ lifecycle_id: "ordlc_1", order_id: "order_1", status: "assembling" }]
    )

    expect(assignees.get("order_1")?.name).toBe("Данияр, picker.wet +1")
  })

  it("вне сборки отвечает тот, кто последним перевёл статус", async () => {
    const assignees = await loadOrderAssignees(
      makeServices(
        [],
        [
          event("ordlc_1", "buyer", "cus_1", "2026-09-01T06:00:00.000Z"),
          event("ordlc_1", "seller", "usr_operator", "2026-09-01T07:00:00.000Z"),
        ]
      ),
      [{ lifecycle_id: "ordlc_1", order_id: "order_1", status: "assembled" }]
    )

    expect(assignees.get("order_1")).toEqual({
      name: "Тимур Ахметов",
      role: "operator",
    })
  })

  it("переходы покупателя и системы ответственного не назначают", async () => {
    const assignees = await loadOrderAssignees(
      makeServices(
        [],
        [
          event("ordlc_1", "buyer", "cus_1", "2026-09-01T06:00:00.000Z"),
          event("ordlc_1", "system", null, "2026-09-01T07:00:00.000Z"),
        ]
      ),
      [{ lifecycle_id: "ordlc_1", order_id: "order_1", status: "new" }]
    )

    expect(assignees.has("order_1")).toBe(false)
  })

  it("пустую страницу не считает вовсе", async () => {
    const assignees = await loadOrderAssignees(
      makeServices([], [{ actor_type: "seller", actor_id: "usr_operator" }]),
      []
    )

    expect(assignees.size).toBe(0)
  })
})
