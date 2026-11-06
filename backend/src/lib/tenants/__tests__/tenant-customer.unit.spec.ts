import { planTenantCustomer } from "../tenant-customer"

const input = {
  tenant_id: "ten_1",
  phone: "+77011234567",
  first_name: "Асет",
  last_name: "Нуров",
  address_1: "ул. Отырар 18",
}

describe("planTenantCustomer — клиент компании по номеру", () => {
  it("новый номер — создаём, ставим адрес и связь", () => {
    expect(planTenantCustomer(input, null)).toEqual({
      customer_id: null,
      update: null,
      add_address: true,
      link: true,
    })
  })

  it("без адреса — адрес не заводим", () => {
    expect(
      planTenantCustomer({ ...input, address_1: "  " }, null).add_address
    ).toBe(false)
  })

  it("номер уже на площадке — имя покупателя не перезаписываем", () => {
    expect(
      planTenantCustomer(input, {
        id: "cus_1",
        first_name: "Aset",
        last_name: "Nurov",
        address_count: 2,
        linked: false,
      })
    ).toEqual({ customer_id: "cus_1", update: null, add_address: false, link: true })
  })

  it("учётка «только телефон» — дописываем пустые ФИО и адрес", () => {
    expect(
      planTenantCustomer(input, {
        id: "cus_2",
        first_name: null,
        last_name: "",
        address_count: 0,
        linked: false,
      })
    ).toEqual({
      customer_id: "cus_2",
      update: { first_name: "Асет", last_name: "Нуров" },
      add_address: true,
      link: true,
    })
  })

  it("уже клиент компании — повторная связь не создаётся", () => {
    expect(
      planTenantCustomer(input, {
        id: "cus_3",
        first_name: "Асет",
        last_name: "Нуров",
        address_count: 1,
        linked: true,
      }).link
    ).toBe(false)
  })
})
