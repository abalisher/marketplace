import { MedusaContainer } from "@medusajs/framework/types"
import {
  BuyerIdentity,
  checkoutEmail,
  missingProfileFields,
  readBuyerIdentity,
  requireLogin,
} from "../tools/buyer-identity"
import { AssistantContext } from "../types"

// Unit: личность покупателя на шаге оформления (T10.8) — чтение профиля,
// служебный email из номера (хвост T10.7: ядру нужен cart.email, а в профиле
// входа по номеру почты нет) и просьба войти. Живое сохранение профиля
// (updateCustomers + адресная книга) — ядровые workflow'ы, покрыты live-smoke.

// Профиль-заготовка: учётка «только телефон» (так её заводит вход по номеру),
// поля перекрываются в конкретном тесте.
const BuyerIdentityFixture = (
  over: Partial<BuyerIdentity>
): BuyerIdentity => ({
  customer_id: "cus_1",
  phone: "+77011234567",
  first_name: "",
  last_name: "",
  email: "",
  address: null,
  address_id: null,
  ...over,
})

const containerWithCustomer = (
  customer: Record<string, unknown> | null
): MedusaContainer =>
  ({
    resolve: () => ({
      graph: async () => ({ data: customer ? [customer] : [] }),
    }),
  }) as unknown as MedusaContainer

describe("readBuyerIdentity", () => {
  it("собирает профиль и берёт адрес по умолчанию", async () => {
    const identity = await readBuyerIdentity(
      containerWithCustomer({
        id: "cus_1",
        phone: "+77011234567",
        first_name: "Ерлан",
        last_name: null,
        email: null,
        addresses: [
          { id: "addr_old", address_1: "ул. Старая 1", is_default_shipping: false },
          {
            id: "addr_1",
            first_name: "Ерлан",
            last_name: "Сериков",
            phone: "+77011234567",
            address_1: "пр. Туран 55, кв. 12",
            city: "Астана",
            postal_code: "",
            is_default_shipping: true,
          },
        ],
      }),
      "cus_1"
    )

    expect(identity?.phone).toEqual("+77011234567")
    expect(identity?.address_id).toEqual("addr_1")
    expect(identity?.address?.address_1).toEqual("пр. Туран 55, кв. 12")
    // Фамилия есть только в адресе — оформление возьмёт её оттуда.
    expect(identity?.last_name).toEqual("")
    expect(identity?.address?.last_name).toEqual("Сериков")
  })

  it("возвращает null, если учётки нет", async () => {
    expect(await readBuyerIdentity(containerWithCustomer(null), "cus_x")).toBeNull()
  })
})

describe("checkoutEmail", () => {
  it("собирает служебный адрес из номера — покупателя про email не спрашиваем", () => {
    const email = checkoutEmail(BuyerIdentityFixture({ phone: "+7 701 123-45-67" }))
    // Только цифры номера + зарезервированный RFC 2606 домен: письмо по такому
    // адресу заведомо никуда не уйдёт, и за настоящую почту его не примут.
    expect(email).toEqual("77011234567@phone.invalid")
  })

  it("сохраняет настоящую почту учётки email-эпохи", () => {
    const email = checkoutEmail(
      BuyerIdentityFixture({ phone: "+77011234567", email: "erlan@mail.ru" })
    )
    expect(email).toEqual("erlan@mail.ru")
  })
})

describe("missingProfileFields", () => {
  it("не просит того, что уже есть в профиле", () => {
    const missing = missingProfileFields(
      BuyerIdentityFixture({
        first_name: "Ерлан",
        last_name: "Сериков",
        address: {
          first_name: "Ерлан",
          last_name: "Сериков",
          phone: "+77011234567",
          address_1: "пр. Туран 55",
          city: "Астана",
          postal_code: "",
        },
      })
    )
    expect(missing).toEqual([])
  })

  it("перечисляет ровно недостающее у новой учётки «только телефон»", () => {
    const missing = missingProfileFields(BuyerIdentityFixture({}))
    expect(missing).toEqual(["first_name", "last_name", "address_1"])
  })
})

describe("requireLogin", () => {
  it("кладёт в ленту одну карточку входа и говорит модели login_required", () => {
    const context: AssistantContext = { attachments: [] }
    const out = requireLogin(context, "нужен вход")

    expect(out.login_required).toEqual(true)
    expect(out.error).toEqual("нужен вход")
    expect(context.attachments).toEqual([
      { type: "auth_prompt", reason: "checkout" },
    ])
  })
})
