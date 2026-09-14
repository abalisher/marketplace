import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { ASSEMBLY_MODULE } from ".."
import AssemblyModuleService from "../service"
import AssemblyTask from "../models/assembly-task"
import AssemblyTaskItem from "../models/assembly-task-item"
import { splitOrderLinesByCategory } from "../split"

jest.setTimeout(120000)

// Интеграционный тест модуля: сценарии сервиса на временной БД (.env.test) —
// распад заказа на задания, взятие в работу, отметки позиций и закрытие
// задания. Инварианты-чистые функции проверяет assembly-rules.unit.spec.ts.
moduleIntegrationTestRunner<AssemblyModuleService>({
  moduleName: ASSEMBLY_MODULE,
  moduleModels: [AssemblyTask, AssemblyTaskItem],
  resolve: "./src/modules/assembly",
  testSuite: ({ service }) => {
    let seq = 0
    const orderId = () => `order_test_${++seq}`

    const drafts = () =>
      splitOrderLinesByCategory([
        {
          order_item_id: "ordli_1",
          title: "Кабель ВВГнг 3×2.5",
          sku: "CAB",
          quantity: 100,
          category_handle: "electrical",
          category_name: "Электрика",
        },
        {
          order_item_id: "ordli_2",
          title: "Саморез по гипсокартону",
          quantity: 500,
          category_handle: "fasteners",
          category_name: "Крепёж (метизы)",
        },
      ])

    describe("AssemblyModuleService", () => {
      it("создаёт по заданию на категорию заказа", async () => {
        const order_id = orderId()
        const tasks = await service.createOrderTasks(order_id, drafts())

        expect(tasks).toHaveLength(2)
        expect(tasks[0].id).toMatch(/^astsk_/)
        expect(tasks.every((t) => t.status === "pending")).toBe(true)

        const stored = await service.listOrderTasks(order_id)
        expect(stored.map((t) => t.category_handle).sort()).toEqual([
          "electrical",
          "fasteners",
        ])
        expect(stored.flatMap((t) => t.items ?? [])).toHaveLength(2)
      })

      it("повторный распад того же заказа заданий не удваивает", async () => {
        const order_id = orderId()
        await service.createOrderTasks(order_id, drafts())
        const again = await service.createOrderTasks(order_id, drafts())

        expect(again).toHaveLength(2)
        expect(await service.listOrderTasks(order_id)).toHaveLength(2)
      })

      it("проводит задание от взятия до «собрано»", async () => {
        const order_id = orderId()
        const [task] = await service.createOrderTasks(order_id, drafts())

        const started = await service.startTask({
          task_id: task.id,
          actor_id: "user_picker",
        })
        expect(started.status).toEqual("picking")
        expect(started.assignee_id).toEqual("user_picker")
        expect(started.started_at).toBeTruthy()

        const [item] = await service.listAssemblyTaskItems({ task_id: task.id })
        await service.markItem({
          task_id: task.id,
          item_id: item.id,
          status: "picked",
          actor_id: "user_picker",
        })

        const completed = await service.completeTask({
          task_id: task.id,
          actor_id: "user_picker",
        })
        expect(completed.status).toEqual("assembled")
        expect(completed.completed_by).toEqual("user_picker")
        expect(completed.completed_at).toBeTruthy()
      })

      it("частичная отметка закрывает задание нехваткой", async () => {
        const order_id = orderId()
        const [task] = await service.createOrderTasks(order_id, drafts())
        await service.startTask({ task_id: task.id })

        const [item] = await service.listAssemblyTaskItems({ task_id: task.id })
        const marked = await service.markItem({
          task_id: task.id,
          item_id: item.id,
          status: "partial",
          picked_quantity: 60,
          note: "На складе только 60",
        })
        expect(marked.picked_quantity).toEqual(60)

        const completed = await service.completeTask({ task_id: task.id })
        expect(completed.status).toEqual("shortage")
      })

      it("не даёт отмечать позиции у задания, которое никто не взял", async () => {
        const order_id = orderId()
        const [task] = await service.createOrderTasks(order_id, drafts())
        const [item] = await service.listAssemblyTaskItems({ task_id: task.id })

        await expect(
          service.markItem({
            task_id: task.id,
            item_id: item.id,
            status: "picked",
          })
        ).rejects.toThrow()
      })

      it("не даёт закрыть задание с неотмеченными позициями", async () => {
        const order_id = orderId()
        const tasks = await service.createOrderTasks(
          order_id,
          splitOrderLinesByCategory([
            {
              order_item_id: "ordli_1",
              title: "Кабель",
              quantity: 10,
              category_handle: "electrical",
              category_name: "Электрика",
            },
            {
              order_item_id: "ordli_2",
              title: "Гофра",
              quantity: 20,
              category_handle: "electrical",
              category_name: "Электрика",
            },
          ])
        )
        const task = tasks[0]
        await service.startTask({ task_id: task.id })

        const items = await service.listAssemblyTaskItems({ task_id: task.id })
        await service.markItem({
          task_id: task.id,
          item_id: items[0].id,
          status: "picked",
        })

        await expect(
          service.completeTask({ task_id: task.id })
        ).rejects.toThrow()
      })
    })
  },
})
