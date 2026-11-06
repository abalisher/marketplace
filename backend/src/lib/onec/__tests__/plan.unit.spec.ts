import { OnecItem } from "../parse-items"
import {
  desiredProduct,
  diffProduct,
  normalizeUnit,
  OnecExistingProduct,
  onecHandle,
  onecSku,
  planOnecSync,
  slugify,
} from "../plan"

const item = (patch: Partial<OnecItem> = {}): OnecItem => ({
  key: "k1",
  code: "00-001",
  article: null,
  name: "Цемент М500",
  description: null,
  unit: "шт",
  price: 2500,
  stock: 10,
  cost: null,
  barcode: null,
  group: null,
  ...patch,
})

const existingFor = (
  source: OnecItem,
  patch: Partial<OnecExistingProduct> = {}
): OnecExistingProduct => {
  const desired = desiredProduct("orgstroy", source)
  return {
    onec_item_id: `oi_${source.key}`,
    key: source.key,
    present: true,
    product_id: `prod_${source.key}`,
    variant_id: `var_${source.key}`,
    title: desired.title,
    description: desired.description,
    status: desired.published ? "published" : "draft",
    unit: desired.unit,
    product_card_id: `pcard_${source.key}`,
    category: desired.category,
    price: desired.price,
    stock: desired.stock,
    onec_fields: desired.onec_fields,
    cost: desired.cost,
    ...patch,
  }
}

describe("нормализация", () => {
  it("единицы 1С сводятся к принятым на площадке", () => {
    expect(normalizeUnit("шт.")).toBe("шт")
    expect(normalizeUnit("Штука")).toBe("шт")
    expect(normalizeUnit("м2")).toBe("м²")
    expect(normalizeUnit("меш")).toBe("мешок")
    expect(normalizeUnit(null)).toBe("шт")
    expect(normalizeUnit("бухта")).toBe("бухта")
  })

  it("транслит для адреса товара", () => {
    expect(slugify("Цемент М500, 50 кг")).toBe("tsement-m500-50-kg")
    expect(slugify("Қабырға")).toBe("kabyrga")
  })

  it("артикул и адрес уникальны на площадке: впереди slug компании", () => {
    expect(onecSku("orgstroy", item({ article: "M 500" }))).toBe("ORGSTROY-M-500")
    expect(onecSku("orgstroy", item())).toBe("ORGSTROY-00-001")
    expect(onecHandle("orgstroy", item())).toBe("orgstroy-tsement-m500-00-001")
    // Excel без кода: ключ — наименование. Длинные названия, что различаются
    // хвостом, дают разные и допустимые адреса.
    const long = (name: string) =>
      onecHandle("nurstroi", item({ key: name, code: null, article: null, name }))
    const white = long("Ceresit CE 33 Comfort затирка для узких швов до 6 мм, цвет белый")
    const grey = long("Ceresit CE 33 Comfort затирка для узких швов до 6 мм, цвет серый")
    expect(white).not.toEqual(grey)
    expect(long("Отвертка ударные DUHENG MAX 6(+) 22см")).not.toEqual(
      long("Отвертка ударные DUHENG MAX 6(-) 22см")
    )
    const sku = (name: string) =>
      onecSku("nurstroi", item({ key: name, code: null, article: null, name }))
    expect(sku(`${"Ceresit CE 33 Comfort затирка для узких швов до 6 мм ".repeat(2)}белый`)).not.toEqual(
      sku(`${"Ceresit CE 33 Comfort затирка для узких швов до 6 мм ".repeat(2)}серый`)
    )
    for (const handle of [white, grey, long("Набор коронок по дереву DUHENG MAX 16рс 19мм-127мм")]) {
      expect(handle).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })
})

describe("desiredProduct", () => {
  it("категория по названию; остаток — как в 1С, дробный, не отрицательный", () => {
    const desired = desiredProduct("orgstroy", item({ name: "Кабель ВВГ 3×2,5", stock: 12.7 }))
    expect(desired.category).toBe("electrical")
    expect(desired.category_guessed).toBe(false)
    expect(desired.stock).toBe(12.7)
    expect(desiredProduct("orgstroy", item({ stock: 34.95 })).stock).toBe(34.95)
    expect(desiredProduct("orgstroy", item({ stock: 9.6450000001 })).stock).toBe(9.645)
    expect(desiredProduct("orgstroy", item({ stock: -3 })).stock).toBe(0)
  })

  it("дробный остаток меняется — правка, совпадает до тысячных — нет", () => {
    const source = item({ stock: 34.95 })
    expect(
      diffProduct(existingFor(source, { stock: 34 }), desiredProduct("orgstroy", source))?.stock
    ).toEqual({ old: 34, new: 34.95 })
    expect(
      diffProduct(existingFor(source, { stock: 34.9500001 }), desiredProduct("orgstroy", source))
    ).toBeNull()
  })

  it("категория по группе 1С, если название молчит; иначе — по умолчанию", () => {
    expect(
      desiredProduct("orgstroy", item({ name: "Ariston 50", group: "Краны и смесители" })).category
    ).toBe("plumbing")
    const unknown = desiredProduct("orgstroy", item({ name: "Изделие №5" }))
    expect(unknown.category).toBe("finishing")
    expect(unknown.category_guessed).toBe(true)
  })

  it("без цены — черновик, не продаётся", () => {
    expect(desiredProduct("orgstroy", item({ price: null })).published).toBe(false)
    expect(desiredProduct("orgstroy", item({ price: 0 })).published).toBe(false)
    expect(desiredProduct("orgstroy", item()).published).toBe(true)
  })
})

describe("diffProduct", () => {
  it("совпадает с 1С — правки нет", () => {
    const source = item()
    expect(diffProduct(existingFor(source), desiredProduct("orgstroy", source))).toBeNull()
  })

  it("только отличающиеся поля", () => {
    const source = item({ name: "Цемент М500 Д0", price: 2600, stock: 4 })
    const update = diffProduct(
      existingFor(item()),
      desiredProduct("orgstroy", source)
    )
    expect(update?.product).toEqual({ title: "Цемент М500 Д0" })
    expect(update?.price).toEqual({ old: 2500, new: 2600 })
    expect(update?.stock).toEqual({ old: 10, new: 4 })
    expect(update?.unit).toBeUndefined()
  })

  it("правку руками мимо 1С возвращает к данным 1С", () => {
    const source = item()
    const update = diffProduct(
      existingFor(source, { price: 9999, status: "draft" }),
      desiredProduct("orgstroy", source)
    )
    expect(update?.price).toEqual({ old: 9999, new: 2500 })
    expect(update?.product.status).toBe("published")
  })

  it("пропавшая в 1С цена не обнуляет цену площадки, но снимает с продажи", () => {
    const update = diffProduct(
      existingFor(item()),
      desiredProduct("orgstroy", item({ price: null }))
    )
    expect(update?.price).toBeUndefined()
    expect(update?.product.status).toBe("draft")
  })

  it("остаток без уровня на складе — правка остатка", () => {
    const source = item()
    const update = diffProduct(
      existingFor(source, { stock: null }),
      desiredProduct("orgstroy", source)
    )
    expect(update?.stock).toEqual({ old: null, new: 10 })
  })
})

describe("planOnecSync", () => {
  it("новые, изменённые, неизменные и пропавшие", () => {
    const kept = item({ key: "a", code: "a" })
    const changed = item({ key: "b", code: "b" })
    const gone = item({ key: "c", code: "c" })
    const plan = planOnecSync(
      "orgstroy",
      [kept, { ...changed, price: 3000 }, item({ key: "d", code: "d" })],
      [existingFor(kept), existingFor(changed), existingFor(gone)]
    )
    expect(plan.creates.map((p) => p.key)).toEqual(["d"])
    expect(plan.updates.map((u) => u.existing.key)).toEqual(["b"])
    expect(plan.unchanged.map((p) => p.key)).toEqual(["a"])
    expect(plan.hides.map((p) => p.key)).toEqual(["c"])
    expect(plan.hide_suppressed).toBe(0)
  })

  it("уже снятую позицию второй раз не снимаем", () => {
    const gone = item({ key: "c" })
    const plan = planOnecSync("orgstroy", [item({ key: "x" })], [
      existingFor(gone, { present: false, status: "draft" }),
    ])
    expect(plan.hides).toEqual([])
  })

  it("вернувшаяся позиция — обновление со статусом «опубликован»", () => {
    const back = item({ key: "r" })
    const plan = planOnecSync("orgstroy", [back], [
      existingFor(back, { present: false, status: "draft" }),
    ])
    expect(plan.updates[0].product.status).toBe("published")
    expect(plan.updates[0].existing.present).toBe(false)
  })

  it("пропала бо́льшая часть каталога — скрытие отменено предохранителем", () => {
    const existing = Array.from({ length: 20 }, (_, i) =>
      existingFor(item({ key: `k${i}`, code: `c${i}` }))
    )
    const plan = planOnecSync(
      "orgstroy",
      [item({ key: "k0", code: "c0" })],
      existing
    )
    expect(plan.hides).toEqual([])
    expect(plan.hide_suppressed).toBe(19)
  })

  it("пропало немного — снимаем", () => {
    const existing = Array.from({ length: 20 }, (_, i) =>
      existingFor(item({ key: `k${i}`, code: `c${i}` }))
    )
    const feed = Array.from({ length: 15 }, (_, i) => item({ key: `k${i}`, code: `c${i}` }))
    const plan = planOnecSync("orgstroy", feed, existing)
    expect(plan.hides).toHaveLength(5)
    expect(plan.hide_suppressed).toBe(0)
  })
})

describe("выгрузка без цен и остатков (ведёт продавец)", () => {
  const bare = item({ price: null, stock: null })

  it("единицы ORGSTROY", () => {
    expect(normalizeUnit("пог,м")).toBe("м")
    expect(normalizeUnit("рул")).toBe("рулон")
    expect(normalizeUnit("Пачка")).toBe("пачка")
  })

  it("новый товар — черновик без цены, поля цены и остатка за продавцом", () => {
    const desired = desiredProduct("orgstroy", bare, [])
    expect(desired.published).toBe(false)
    expect(desired.onec_fields).toEqual([])
  })

  it("цену поставил продавец — синхронизация её не трогает и держит товар на витрине", () => {
    const desired = desiredProduct("orgstroy", bare, [])
    const existing = existingFor(bare, {
      price: 3100,
      stock: 15,
      status: "published",
      onec_fields: [],
    })
    expect(diffProduct(existing, desired)).toBeNull()
  })

  it("цены нет ни в 1С, ни у продавца — черновик", () => {
    const desired = desiredProduct("orgstroy", bare, [])
    const update = diffProduct(
      existingFor(bare, { price: null, status: "published", onec_fields: [] }),
      desired
    )
    expect(update?.product.status).toBe("draft")
  })

  it("1С начала присылать цену — забирает поле себе", () => {
    const priced = item({ price: 2500, stock: null })
    const update = diffProduct(
      existingFor(priced, { price: 3100, onec_fields: [] }),
      desiredProduct("orgstroy", priced, ["price"])
    )
    expect(update?.price).toEqual({ old: 3100, new: 2500 })
    expect(update?.product.onec_fields).toEqual(["price"])
    expect(update?.stock).toBeUndefined()
  })
})

describe("себестоимость из 1С", () => {
  it("1С присылает себестоимость — меняется, только если отличается", () => {
    const source = item({ cost: 5172.41 })
    const desired = desiredProduct("orgstroy", source, ["stock"], true)
    expect(desired.cost).toBe(5172.41)
    const base = { onec_fields: ["stock" as const] }
    expect(diffProduct(existingFor(source, { ...base, cost: 5172.41 }), desired)).toBeNull()
    expect(
      diffProduct(existingFor(source, { ...base, cost: 5000 }), desired)?.cost
    ).toEqual({ old: 5000, new: 5172.41 })
  })

  it("позиция распродана и пропала из остатков — себестоимость остаётся последней известной", () => {
    const source = item({ cost: null, stock: 0 })
    const desired = desiredProduct("orgstroy", source, ["stock"], true)
    expect(
      diffProduct(existingFor(source, { onec_fields: ["stock"], cost: 5000 }), desired)
    ).toBeNull()
  })

  it("1С себестоимость не присылает — сохранённую не трогаем", () => {
    const source = item({ cost: null })
    const desired = desiredProduct("orgstroy", source, ["stock"], false)
    expect(
      diffProduct(
        existingFor(source, { onec_fields: ["stock"], cost: 5000 }),
        desired
      )
    ).toBeNull()
  })
})
