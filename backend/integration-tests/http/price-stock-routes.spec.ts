import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ensureCatalogCategories } from "../../src/lib/catalog/ensure-catalog-categories"
import { PRICE_STOCK_CURRENCY } from "../../src/api/admin/price-stock/rows"

jest.setTimeout(300000)

// Экран «Цены и остатки» (T10.14a): один ресурс на цену и остаток. Арифметика
// строки и правила правки покрыты юнитами (api/admin/price-stock/__tests__);
// здесь — живой путь: срез из ядра, запись цены и остатка партией, атомарность
// негодной партии и журнал «было → стало».
// Нужен docker-postgres; временная БД — backend/.env.test.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let adminHeaders: Record<string, string>

    let mainLocationId: string
    let spareLocationId: string
    // variant по артикулу — правки адресуются вариантом.
    const variants: Record<string, string> = {}
    const inventoryItems: Record<string, string> = {}

    const query = () => container.resolve(ContainerRegistrationKeys.QUERY)

    // 4xx-ответы приходят как исключения axios — возвращаем response.
    const call = async (promise: Promise<any>) =>
      promise.then(
        (res) => res,
        (err) => {
          if (!err.response) {
            throw err
          }
          return err.response
        }
      )

    const board = (params: Record<string, unknown> = {}) =>
      call(api.get(`/admin/price-stock`, { headers: adminHeaders, params }))

    const apply = (changes: unknown[], source?: string) =>
      call(
        api.post(
          "/admin/price-stock",
          { changes, ...(source ? { source } : {}) },
          { headers: adminHeaders }
        )
      )

    // Выгрузку читаем БАЙТАМИ: файл проверяется таким, каким его получит Excel
    // (декодер http-клиента съедает BOM молча, и проверка BOM была бы пустой).
    const exportFile = (params: Record<string, unknown> = {}) =>
      call(
        api.get(`/admin/price-stock/export`, {
          headers: adminHeaders,
          params,
          responseType: "arraybuffer",
        })
      )

    const exportText = (response: any) =>
      Buffer.from(response.data).toString("utf-8")

    const importFile = (csv: string, body: Record<string, unknown> = {}) =>
      call(
        api.post(
          "/admin/price-stock/import",
          {
            content_base64: Buffer.from(csv, "utf-8").toString("base64"),
            file_name: "price-stock.csv",
            ...body,
          },
          { headers: adminHeaders }
        )
      )

    const rowBySku = (rows: any[], sku: string) =>
      rows.find((row) => row.sku === sku)

    // Остаток уровня ядра — проверяем запись, а не только ответ роута.
    const levelStock = async (sku: string, locationId: string) => {
      const inventory = container.resolve(Modules.INVENTORY)
      const [level] = await inventory.listInventoryLevels({
        inventory_item_id: inventoryItems[sku],
        location_id: locationId,
      })
      return level ? Number(level.stocked_quantity) : null
    }

    beforeAll(async () => {
      container = getContainer()

      const { result: locations } = await createStockLocationsWorkflow(
        container
      ).run({
        input: {
          locations: [
            {
              name: "Главный склад",
              address: { city: "Astana", country_code: "kz", address_1: "1" },
            },
            {
              name: "Второй склад",
              address: { city: "Astana", country_code: "kz", address_1: "2" },
            },
          ],
        },
      })
      mainLocationId = locations[0].id
      spareLocationId = locations[1].id

      const categoryIds = await ensureCatalogCategories(container)

      // Четыре позиции: отделка с остатком, электрика без остатка (чип «нет»),
      // позиция без учёта остатка (её остаток править нельзя) и позиция БЕЗ
      // категории — она попадает в чип «вне ассортимента» (T10.14e).
      const catalog: {
        handle: "finishing" | "electrical" | "fasteners" | null
        title: string
        sku: string
        price: number
        stock: number
        manage: boolean
      }[] = [
        {
          handle: "finishing",
          title: "Пескобетон М300",
          sku: "PB-300",
          price: 2400,
          stock: 40,
          manage: true,
        },
        {
          handle: "electrical",
          title: "Кабель ВВГнг 3x2.5",
          sku: "KBL-25",
          price: 620,
          stock: 0,
          manage: true,
        },
        {
          handle: "fasteners",
          title: "Саморез по гипсокартону",
          sku: "SMR-35",
          price: 12,
          stock: 0,
          manage: false,
        },
        {
          // Категорию не назначили — позиция всё равно на экране, но её место
          // в мешке «вне ассортимента».
          handle: null,
          title: "Песок мытый, биг-бэг 1 т",
          sku: "SAND-BB",
          price: 9000,
          stock: 3,
          manage: true,
        },
      ]

      for (const item of catalog) {
        const { result: products } = await createProductsWorkflow(
          container
        ).run({
          input: {
            products: [
              {
                title: item.title,
                status: ProductStatus.PUBLISHED,
                ...(item.handle
                  ? { category_ids: [categoryIds[item.handle]] }
                  : {}),
                options: [{ title: "Size", values: ["one"] }],
                variants: [
                  {
                    title: "one",
                    sku: item.sku,
                    manage_inventory: item.manage,
                    options: { Size: "one" },
                    prices: [
                      { amount: item.price, currency_code: PRICE_STOCK_CURRENCY },
                    ],
                  },
                ],
              },
            ],
          },
        })
        variants[item.sku] = products[0].variants[0].id

        if (!item.manage) {
          continue
        }
        const { data: withInventory } = await query().graph({
          entity: "product",
          fields: ["variants.inventory_items.inventory.id"],
          filters: { id: products[0].id },
        })
        const inventoryItemId = withInventory[0]?.variants?.[0]
          ?.inventory_items?.[0]?.inventory?.id as string
        inventoryItems[item.sku] = inventoryItemId
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: [
              {
                inventory_item_id: inventoryItemId,
                location_id: mainLocationId,
                stocked_quantity: item.stock,
              },
            ],
          },
        })
      }

      // Admin-пользователь: имя уходит в журнал правок («кто»).
      const email = "admin@example.com"
      const password = "supersecret"
      const authService = container.resolve(Modules.AUTH)
      const { authIdentity } = await authService.register("emailpass", {
        body: { email, password },
      })
      const user = await container.resolve(Modules.USER).createUsers({
        email,
        first_name: "Данияр",
        last_name: "Кладовщик",
      })
      await authService.updateAuthIdentities({
        id: authIdentity!.id,
        app_metadata: { user_id: user.id },
      })
      const { data: login } = await api.post("/auth/user/emailpass", {
        email,
        password,
      })
      adminHeaders = { authorization: `Bearer ${login.token}` }
    })

    describe("GET /admin/price-stock", () => {
      it("отдаёт цену, остаток и категорию одной строкой", async () => {
        const response = await board()

        expect(response.status).toEqual(200)
        const row = rowBySku(response.data.price_rows, "PB-300")
        expect(row).toMatchObject({
          title: "Пескобетон М300",
          category_handle: "finishing",
          category_name: "Отделочные материалы",
          price: 2400,
          currency_code: PRICE_STOCK_CURRENCY,
          stocked: 40,
          reserved: 0,
          available: 40,
          location_name: "Главный склад",
          locations_count: 1,
          price_editable: true,
          stock_editable: true,
        })
        // Позиция без учёта остатка видна, но её остаток не правится.
        expect(rowBySku(response.data.price_rows, "SMR-35")).toMatchObject({
          stock_editable: false,
          price_editable: true,
        })
      })

      it("фильтрует по категории, ищет по названию и по артикулу", async () => {
        const byCategory = await board({ category: "electrical" })
        expect(byCategory.data.price_rows.map((row: any) => row.sku)).toEqual([
          "KBL-25",
        ])

        const bySku = await board({ q: "PB-300" })
        expect(bySku.data.price_rows.map((row: any) => row.sku)).toEqual([
          "PB-300",
        ])

        const byTitle = await board({ q: "саморез" })
        expect(byTitle.data.price_rows.map((row: any) => row.sku)).toEqual([
          "SMR-35",
        ])
      })

      it("в разрезе склада показывает и правит остаток этого склада", async () => {
        // Кладём часть остатка на второй склад — теперь «остаток» без разреза
        // двусмыслен, и экран выбирает склад сверху.
        await apply([
          {
            variant_id: variants["PB-300"],
            stock: 7,
            location_id: spareLocationId,
          },
        ])

        const all = await board({ q: "PB-300" })
        expect(all.data.location_id).toBeNull()
        expect(all.data.locations).toHaveLength(2)
        expect(rowBySku(all.data.price_rows, "PB-300")).toMatchObject({
          stocked: 47,
          stocked_total: 47,
          location_id: null,
        })

        const spare = await board({ q: "PB-300", location_id: spareLocationId })
        expect(spare.data.location_id).toEqual(spareLocationId)
        expect(rowBySku(spare.data.price_rows, "PB-300")).toMatchObject({
          stocked: 7,
          stocked_total: 47,
          location_id: spareLocationId,
          location_name: "Второй склад",
        })

        // Правка в разрезе склада уходит на него, главный склад не двигается.
        const response = await apply([
          {
            variant_id: variants["PB-300"],
            stock: 9,
            location_id: spareLocationId,
          },
        ])
        expect(rowBySku(response.data.price_rows, "PB-300")).toMatchObject({
          stocked: 9,
          stocked_total: 49,
        })
        expect(await levelStock("PB-300", mainLocationId)).toEqual(40)
      })

      it("чужой склад в разрезе — 400", async () => {
        const response = await board({ location_id: "sloc_несуществующий" })

        expect(response.status).toEqual(400)
      })

      it("чипы категорий считает ресурс, «вне ассортимента» ловит позицию без категории", async () => {
        const response = await board()

        expect(response.data.category_counts).toMatchObject({
          finishing: 1,
          electrical: 1,
          plumbing: 0,
          fasteners: 1,
          other: 1,
        })

        // По чипу «вне ассортимента» видно ровно ту позицию, которой нет ни в
        // одном отделе: до T10.14e она висела в таблице без фильтра.
        const other = await board({ category: "other" })
        expect(other.data.price_rows.map((row: any) => row.sku)).toEqual([
          "SAND-BB",
        ])
        expect(other.data.count).toEqual(1)
      })

      it("чип «нет в наличии» считается по свободному остатку", async () => {
        const response = await board({ stock: "zero" })

        const skus = response.data.price_rows.map((row: any) => row.sku)
        expect(skus).toContain("KBL-25")
        expect(skus).not.toContain("PB-300")
        expect(response.data.counts.total).toBeGreaterThanOrEqual(3)
        expect(response.data.counts.zero).toBeGreaterThanOrEqual(2)
      })
    })

    // Раннер откатывает БД к состоянию после beforeAll перед каждым тестом,
    // поэтому каждый тест ниже — самодостаточный: правит и сам же проверяет
    // и ядро, и журнал. Исходное состояние фикстуры: PB-300 — 2400 ₸ и 40 шт
    // на главном складе, KBL-25 — 620 ₸ и 0 шт, SMR-35 — 12 ₸ без учёта остатка.
    describe("POST /admin/price-stock", () => {
      it("пишет цену и остаток одной правкой и возвращает свежую строку", async () => {
        const response = await apply([
          { variant_id: variants["PB-300"], price: 2600, stock: 55 },
        ])

        expect(response.status).toEqual(200)
        expect(response.data.applied).toEqual(1)
        expect(rowBySku(response.data.price_rows, "PB-300")).toMatchObject({
          price: 2600,
          stocked: 55,
          available: 55,
        })
        // Записалось в ядро, а не только в ответ.
        expect(await levelStock("PB-300", mainLocationId)).toEqual(55)
        const fresh = await board({ q: "PB-300" })
        expect(rowBySku(fresh.data.price_rows, "PB-300")).toMatchObject({
          price: 2600,
          stocked: 55,
        })

        // Журнал той же правки: кто, «было → стало» по цене и по остатку.
        const history = await call(
          api.get("/admin/price-stock/history", {
            headers: adminHeaders,
            params: { variant_id: variants["PB-300"] },
          })
        )
        expect(history.data.count).toEqual(1)
        expect(history.data.price_changes[0]).toMatchObject({
          variant_id: variants["PB-300"],
          product_title: "Пескобетон М300",
          sku: "PB-300",
          currency_code: PRICE_STOCK_CURRENCY,
          old_price: 2400,
          new_price: 2600,
          old_stock: 40,
          new_stock: 55,
          changed_by_name: "Данияр Кладовщик",
          source: "manual",
        })
      })

      it("правит выделенные позиции партией", async () => {
        const response = await apply([
          { variant_id: variants["PB-300"], price: 2700 },
          { variant_id: variants["KBL-25"], price: 650, stock: 300 },
        ])

        expect(response.data.applied).toEqual(2)
        const fresh = await board()
        expect(rowBySku(fresh.data.price_rows, "PB-300")).toMatchObject({
          price: 2700,
          // Правка одной цены остаток не тронула.
          stocked: 40,
        })
        expect(rowBySku(fresh.data.price_rows, "KBL-25")).toMatchObject({
          price: 650,
          stocked: 300,
        })

        // В журнале две записи: у ценовой пара остатка пустая.
        const history = await call(
          api.get("/admin/price-stock/history", { headers: adminHeaders })
        )
        expect(history.data.count).toEqual(2)
        const priceOnly = history.data.price_changes.find(
          (entry: any) => entry.variant_id === variants["PB-300"]
        )
        expect(priceOnly).toMatchObject({
          old_price: 2400,
          new_price: 2700,
          old_stock: null,
          new_stock: null,
        })
      })

      it("первый завоз на второй склад заводит уровень остатка", async () => {
        const response = await apply([
          {
            variant_id: variants["PB-300"],
            stock: 12,
            location_id: spareLocationId,
          },
        ])

        expect(response.data.applied).toEqual(1)
        expect(await levelStock("PB-300", spareLocationId)).toEqual(12)
        // Главный склад не тронут; позиция стала многоскладской, и экран
        // обязан спрашивать склад.
        expect(await levelStock("PB-300", mainLocationId)).toEqual(40)
        const fresh = await board({ q: "PB-300" })
        expect(rowBySku(fresh.data.price_rows, "PB-300")).toMatchObject({
          stocked: 52,
          locations_count: 2,
          location_id: null,
        })

        // ...и правка без склада теперь отклоняется.
        const blind = await apply([
          { variant_id: variants["PB-300"], stock: 5 },
        ])
        expect(blind.status).toEqual(400)
        expect(blind.data.issues[0].code).toEqual("location_required")
      })

      it("негодная позиция не даёт записаться всей партии", async () => {
        const response = await apply([
          { variant_id: variants["KBL-25"], price: 999 },
          { variant_id: variants["SMR-35"], stock: 500 },
          { variant_id: "variant_нет_такого", price: 100 },
        ])

        expect(response.status).toEqual(400)
        expect(
          response.data.issues.map((issue: any) => issue.code).sort()
        ).toEqual(["stock_not_managed", "unknown_variant"])

        // Годная позиция партии тоже не записалась — ни в ядро, ни в журнал.
        const after = await board({ q: "KBL-25" })
        expect(rowBySku(after.data.price_rows, "KBL-25").price).toEqual(620)
        const history = await call(
          api.get("/admin/price-stock/history", { headers: adminHeaders })
        )
        expect(history.data.count).toEqual(0)
      })

      it("позиция дважды в одной партии — отказ", async () => {
        const response = await apply([
          { variant_id: variants["PB-300"], stock: 50 },
          { variant_id: variants["PB-300"], stock: 60 },
        ])

        expect(response.status).toEqual(400)
        expect(response.data.issues[0]).toMatchObject({
          code: "duplicate_change",
          title: "Пескобетон М300",
        })
        // Ни одна из двух не записалась: сложение дельт дало бы 70.
        expect(await levelStock("PB-300", mainLocationId)).toEqual(40)
      })

      it("в журнал идёт только то, что менялось", async () => {
        // Цена та же, остаток другой — пара цены в журнале остаётся пустой.
        await apply([
          { variant_id: variants["PB-300"], price: 2400, stock: 44 },
        ])

        const history = await call(
          api.get("/admin/price-stock/history", {
            headers: adminHeaders,
            params: { variant_id: variants["PB-300"] },
          })
        )
        expect(history.data.count).toEqual(1)
        expect(history.data.price_changes[0]).toMatchObject({
          old_price: null,
          new_price: null,
          currency_code: null,
          old_stock: 40,
          new_stock: 44,
        })
      })

      it("журнал называет склад правки остатка", async () => {
        await apply([
          {
            variant_id: variants["PB-300"],
            stock: 37,
            location_id: mainLocationId,
          },
          // Правка одной цены — склада у неё нет: цена в магазине одна.
          { variant_id: variants["KBL-25"], price: 700 },
        ])

        const history = await call(
          api.get("/admin/price-stock/history", { headers: adminHeaders })
        )
        const stockRow = history.data.price_changes.find(
          (row: any) => row.new_stock != null
        )
        expect(stockRow).toMatchObject({
          old_stock: 40,
          new_stock: 37,
          location_id: mainLocationId,
          location_name: "Главный склад",
        })
        const priceRow = history.data.price_changes.find(
          (row: any) => row.new_price != null
        )
        expect(priceRow.location_id).toBeNull()
        expect(priceRow.location_name).toBeNull()
      })

      it("правка чужим складом отклоняется", async () => {
        const response = await apply([
          {
            variant_id: variants["KBL-25"],
            stock: 5,
            location_id: "sloc_несуществующий",
          },
        ])

        expect(response.status).toEqual(400)
        expect(response.data.issues[0].code).toEqual("unknown_location")
      })

      it("правка «в то же число» ничего не пишет", async () => {
        const response = await apply([
          { variant_id: variants["PB-300"], price: 2400, stock: 40 },
        ])

        expect(response.status).toEqual(200)
        expect(response.data.applied).toEqual(0)
        expect(response.data.skipped).toEqual(1)
        const history = await call(
          api.get("/admin/price-stock/history", { headers: adminHeaders })
        )
        expect(history.data.count).toEqual(0)
      })

      it("журнал по позиции не мешается с журналом других", async () => {
        await apply([
          { variant_id: variants["PB-300"], price: 2650 },
          { variant_id: variants["KBL-25"], price: 700 },
        ])

        const mine = await call(
          api.get("/admin/price-stock/history", {
            headers: adminHeaders,
            params: { variant_id: variants["KBL-25"] },
          })
        )
        expect(mine.data.count).toEqual(1)
        expect(mine.data.price_changes[0]).toMatchObject({
          product_title: "Кабель ВВГнг 3x2.5",
          old_price: 620,
          new_price: 700,
        })
      })
    })

    // Обмен файлом (T10.14c): выгрузка — тот же срез, что на экране, только
    // целиком; загрузка НИЧЕГО не пишет сама — она показывает предпросмотр и
    // отдаёт партию, которую применяет тот же POST /admin/price-stock.
    describe("GET /admin/price-stock/export", () => {
      it("отдаёт CSV с BOM: шапка, артикул, цена и остаток", async () => {
        const response = await exportFile()

        expect(response.status).toEqual(200)
        expect(response.headers["content-type"]).toContain("text/csv")
        expect(response.headers["content-disposition"]).toContain(".csv")
        // BOM первыми байтами: без него русский Excel читает UTF-8 как ANSI.
        expect([...Buffer.from(response.data).subarray(0, 3)]).toEqual([
          0xef, 0xbb, 0xbf,
        ])
        const text = exportText(response)
        const lines = text.replace(/^\ufeff/, "").trim().split("\r\n")
        expect(lines[0]).toEqual(
          "Артикул;Товар;Категория;Единица;Цена, ₸;Остаток;Свободно;Склад"
        )
        const row = lines.find((line) => line.startsWith("PB-300;"))
        expect(row).toContain("Пескобетон М300")
        expect(row).toContain(";2400;40;40;")
      })

      it("выгружает то, что видно: поиск и разрез склада", async () => {
        const found = await exportFile({ q: "KBL" })
        const lines = exportText(found).trim().split("\r\n")
        expect(lines).toHaveLength(2)
        expect(lines[1]).toContain("KBL-25")

        const spare = await exportFile({ location_id: spareLocationId })
        const spareRow = exportText(spare)
          .split("\r\n")
          .find((line) => line.startsWith("PB-300;"))
        // На втором складе позиции пока нет — ноль, и склад назван в строке.
        expect(spareRow).toContain(";2400;0;0;Второй склад")
      })
    })

    describe("POST /admin/price-stock/import", () => {
      it("показывает «было → станет» и не пишет ничего сам", async () => {
        const response = await importFile(
          "Артикул;Цена, ₸;Остаток\r\n" +
            "PB-300;2950;38\r\n" +
            // Те же числа, что в каталоге, — не правка.
            "KBL-25;620;0\r\n"
        )

        expect(response.status).toEqual(200)
        expect(response.data.summary).toMatchObject({
          rows: 2,
          changes: 1,
          unchanged: 1,
          issues: 0,
        })
        expect(response.data.rows).toHaveLength(1)
        expect(response.data.rows[0]).toMatchObject({
          line: 2,
          sku: "PB-300",
          old_price: 2400,
          new_price: 2950,
          old_stock: 40,
          new_stock: 38,
          issue: null,
        })
        // Каталог не тронут: предпросмотр — это разговор, а не запись.
        const fresh = await board({ q: "PB-300" })
        expect(rowBySku(fresh.data.price_rows, "PB-300")).toMatchObject({
          price: 2400,
          stocked: 40,
        })
      })

      it("называет строку файла, которую принять нельзя", async () => {
        const response = await importFile(
          "Артикул;Цена;Остаток\r\n" +
            "НЕТ-ТАКОГО;100;1\r\n" +
            "SMR-35;;500\r\n" +
            "PB-300;две тысячи;\r\n"
        )

        expect(response.status).toEqual(200)
        expect(
          response.data.rows.map((row: any) => [row.line, row.issue])
        ).toEqual([
          [2, "unknown_sku"],
          [3, "stock_not_managed"],
          [4, "bad_price"],
        ])
        expect(response.data.changes).toHaveLength(0)
      })

      it("файл без нужных колонок не принимается целиком", async () => {
        const response = await importFile("Товар;Сколько\r\nПескобетон;5\r\n")

        expect(response.status).toEqual(400)
        expect(response.data.file_error).toEqual("no_columns")
      })

      it("склад из файла обязан совпадать с разрезом экрана", async () => {
        const response = await importFile(
          "Артикул;Остаток;Склад\r\nPB-300;38;Второй склад\r\n",
          { location_id: mainLocationId }
        )

        expect(response.status).toEqual(400)
        expect(response.data.file_error).toEqual("location_mismatch")
      })

      it("выгрузили, поправили, загрузили — правка доходит до каталога", async () => {
        const exported = await exportFile({ q: "PB-300" })
        const edited = exportText(exported)
          .replace(/^\ufeff/, "")
          .replace(";2400;40;40;", ";2950;38;38;")

        const preview = await importFile(edited)
        expect(preview.data.summary).toMatchObject({ changes: 1, issues: 0 })
        // Склад экран не называл: в файле он свой, и предпросмотр его нашёл.
        expect(preview.data.location_name).toEqual("Главный склад")

        // Пишет ту же партию тот же ресурс — путь записи один.
        const applied = await apply(preview.data.changes, "import")
        expect(applied.status).toEqual(200)
        expect(applied.data.applied).toEqual(1)
        expect(await levelStock("PB-300", mainLocationId)).toEqual(38)

        const history = await call(
          api.get("/admin/price-stock/history", {
            headers: adminHeaders,
            params: { variant_id: variants["PB-300"] },
          })
        )
        expect(history.data.price_changes[0]).toMatchObject({
          old_price: 2400,
          new_price: 2950,
          old_stock: 40,
          new_stock: 38,
          source: "import",
        })
      })
    })
  },
})
