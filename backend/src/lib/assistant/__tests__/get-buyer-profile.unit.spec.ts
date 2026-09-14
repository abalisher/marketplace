import { MedusaContainer } from "@medusajs/framework/types"
import { getBuyerProfileTool } from "../tools/get-buyer-profile"
import { AssistantContext } from "../types"

// Unit: guard-путь профиля покупателя (срез 4 + гейт входа T10.8). Гость (нет
// customerId) получает просьбу войти и карточку входа в ленте БЕЗ обращения к
// контейнеру/БД. Путь авторизованного (профиль + customer→employee→company) —
// подставленный query.graph ниже, живой — http-тест + live-smoke.

// Контейнер-ловушка: любой доступ падает. Доказывает, что гостевой путь не
// резолвит query.
const trapContainer = new Proxy(
  {},
  {
    get() {
      throw new Error("container must not be used for a guest buyer")
    },
  }
) as unknown as MedusaContainer

describe("getBuyerProfileTool guest guard", () => {
  it("просит гостя войти и кладёт карточку входа, не трогая контейнер", async () => {
    const context: AssistantContext = { attachments: [] }
    const out = await getBuyerProfileTool.execute(trapContainer, {}, context)

    expect(out.authenticated).toEqual(false)
    expect(out.entity_options).toEqual(["individual"])
    expect(out.login_required).toEqual(true)
    expect(context.attachments).toEqual([
      { type: "auth_prompt", reason: "checkout" },
    ])
  })

  it("ignores an empty-string customerId as a guest", async () => {
    const out = await getBuyerProfileTool.execute(trapContainer, {}, {
      customerId: "",
      attachments: [],
    })
    expect(out.authenticated).toEqual(false)
    expect(out.login_required).toEqual(true)
  })
})

// Контейнер с подставленным query.graph: проверяем, что инструмент рапортует
// покупателю ПУТЬ к разделу заявки (блокер Б2 прогона 2026-08-13 — ассистент
// отправлял в несуществующий «личный кабинет») и не теряет причину отказа.
const containerWithCompany = (
  company: Record<string, unknown> | null
): MedusaContainer =>
  ({
    resolve: () => ({
      graph: async () => ({
        data: [company ? { id: "cus_1", employee: { company } } : { id: "cus_1" }],
      }),
    }),
  }) as unknown as MedusaContainer

// Юрлица (T10.9) живут за флагом FEATURE_COMPANIES. Ниже — путь ВКЛЮЧЁННОГО
// домена: инструмент читает компанию покупателя и рапортует её статус.
describe("getBuyerProfileTool company paths", () => {
  const previousFlag = process.env.FEATURE_COMPANIES

  beforeAll(() => {
    process.env.FEATURE_COMPANIES = "true"
  })

  afterAll(() => {
    process.env.FEATURE_COMPANIES = previousFlag
  })

  it("tells where to register when the buyer has no company", async () => {
    const out = await getBuyerProfileTool.execute(
      containerWithCompany(null),
      {},
      { customerId: "cus_1" }
    )
    expect(out.entity_options).toEqual(["individual"])
    expect(out.hint).toContain("«Компания»")
  })

  it("reports a pending company with the section to check the status in", async () => {
    const out = await getBuyerProfileTool.execute(
      containerWithCompany({
        id: "comp_1",
        name: "ТОО Құрылыс",
        status: "pending",
      }),
      {},
      { customerId: "cus_1" }
    )
    expect(out.entity_options).toEqual(["individual"])
    expect(out.company).toEqual({
      name: "ТОО Құрылыс",
      status: "pending",
      rejection_reason: null,
    })
    expect(out.hint).toContain("«Компания»")
  })

  it("passes the rejection reason through for a rejected company", async () => {
    const out = await getBuyerProfileTool.execute(
      containerWithCompany({
        id: "comp_1",
        name: "ТОО Құрылыс",
        status: "rejected",
        rejection_reason: "БИН не совпадает с уставом",
      }),
      {},
      { customerId: "cus_1" }
    )
    expect(out.company).toEqual({
      name: "ТОО Құрылыс",
      status: "rejected",
      rejection_reason: "БИН не совпадает с уставом",
    })
  })

  // T10.8: то, что уже есть в профиле, ассистент не переспрашивает —
  // инструмент отдаёт данные и список недостающего.
  it("отдаёт профиль и перечисляет недостающие поля", async () => {
    const container = {
      resolve: () => ({
        graph: async () => ({
          data: [
            {
              id: "cus_1",
              phone: "+77011234567",
              first_name: "Ерлан",
              addresses: [],
            },
          ],
        }),
      }),
    } as unknown as MedusaContainer

    const out = await getBuyerProfileTool.execute(container, {}, {
      customerId: "cus_1",
      attachments: [],
    })

    expect(out.authenticated).toEqual(true)
    expect(out.profile).toEqual({
      phone: "+77011234567",
      first_name: "Ерлан",
      last_name: null,
      address: null,
    })
    expect(out.missing_fields).toEqual(["last_name", "address_1"])
  })

  it("opens the company option only for an approved company", async () => {
    const out = await getBuyerProfileTool.execute(
      containerWithCompany({
        id: "comp_1",
        name: "ТОО Құрылыс",
        status: "approved",
      }),
      {},
      { customerId: "cus_1" }
    )
    expect(out.entity_options).toEqual(["individual", "company"])
  })
})

// Домен заморожен (флаг выключен — состояние MVP): про компанию инструмент не
// отвечает вовсе, чтобы модели не с чего было заговорить о юрлице.
describe("getBuyerProfileTool with companies frozen", () => {
  const previousFlag = process.env.FEATURE_COMPANIES

  beforeAll(() => {
    delete process.env.FEATURE_COMPANIES
  })

  afterAll(() => {
    process.env.FEATURE_COMPANIES = previousFlag
  })

  it("отдаёт профиль без компании и подсказок про юрлицо", async () => {
    const container = {
      resolve: () => ({
        graph: async () => ({
          data: [
            {
              id: "cus_1",
              phone: "+77011234567",
              first_name: "Ерлан",
              last_name: "Сериков",
              addresses: [
                { address_1: "Туран 55", city: "Астана", is_default_shipping: true },
              ],
            },
          ],
        }),
      }),
    } as unknown as MedusaContainer

    const out = await getBuyerProfileTool.execute(container, {}, {
      customerId: "cus_1",
      attachments: [],
    })

    expect(out.authenticated).toEqual(true)
    expect(out.entity_options).toEqual(["individual"])
    expect(out.company).toBeUndefined()
    expect(out.hint).toBeUndefined()
    expect(out.missing_fields).toEqual([])
  })
})
