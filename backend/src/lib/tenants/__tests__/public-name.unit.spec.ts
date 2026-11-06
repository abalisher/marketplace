import { publicTenantName } from "../public-name"

// Unit: покупатель видит компанию без организационно-правовой формы, документы —
// с ней (requisites.ts берёт tenant.name как есть).
describe("publicTenantName", () => {
  it("drops the legal form in front of the name", () => {
    expect(publicTenantName("ИП ORGSTROY")).toEqual("ORGSTROY")
    expect(publicTenantName("ТОО «Компания Б»")).toEqual("Компания Б")
    expect(publicTenantName("АО «Kaspi Bank»")).toEqual("Kaspi Bank")
  })

  it("drops it inside derived names and keeps the quotes there", () => {
    expect(publicTenantName("Склад ИП ORGSTROY")).toEqual("Склад ORGSTROY")
    expect(publicTenantName("Склад ТОО «Компания Б»")).toEqual("Склад «Компания Б»")
  })

  it("leaves words that only start like a legal form", () => {
    expect(publicTenantName("ИПОТЕКА Строй")).toEqual("ИПОТЕКА Строй")
    expect(publicTenantName("Склад на Сарыарке")).toEqual("Склад на Сарыарке")
  })

  it("keeps the original when nothing is left", () => {
    expect(publicTenantName("ИП")).toEqual("ИП")
  })
})
