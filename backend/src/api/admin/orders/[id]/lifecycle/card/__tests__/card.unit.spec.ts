import {
  cardCompany,
  cardCustomer,
  cardDelivery,
  cardItems,
  cardTotals,
  cardTransitionTargets,
} from "../card"

// Юнит-тесты сборки карточки заказа для drawer'а очереди (макет 1c): проверяем,
// что бэкенд отдаёт готовую к отрисовке карточку — человекочитаемого плательщика
// с юрлицом заказа, позиции с деньгами, СХОДЯЩИЕСЯ итоги и правильно выбранный
// fulfillment под отгрузку/вручение. Выборки ядра здесь не участвуют — только
// правила, которые раньше пришлось бы считать браузеру.

describe("cardCompany", () => {
  it("берёт компанию ЗАКАЗА, а не текущую компанию покупателя", () => {
    const company = cardCompany({
      id: "order_1",
      company: { id: "comp_order", name: "ТОО «Заказ»" },
      customer: {
        employee: { company: { id: "comp_now", name: "ТОО «Сейчас»" } },
      },
    })

    expect(company?.id).toBe("comp_order")
  })

  it("падает на компанию сотрудника, если прямого link'а у заказа нет", () => {
    const company = cardCompany({
      id: "order_1",
      customer: {
        employee: { company: { id: "comp_now", name: "ТОО «Сейчас»" } },
      },
    })

    expect(company?.id).toBe("comp_now")
  })

  it("физлицо — компании нет", () => {
    expect(cardCompany({ id: "order_1", customer: { first_name: "Ерлан" } })).toBe(
      null
    )
  })
})

describe("cardCustomer", () => {
  // Покупателю, вошедшему по телефону, почту выдаёт система (ядру Medusa адрес
  // нужен обязательно). Показывать её сотруднику нельзя — он прочитает её как
  // контакт покупателя и попробует туда написать (найдено на совместном
  // прогоне 2026-09-06).
  it("системную почту телефонного покупателя не отдаёт вовсе", () => {
    const customer = cardCustomer({
      id: "order_phone",
      email: "77756555906@phone.invalid",
      customer: {
        first_name: "Алишер",
        last_name: "Акимжанов",
        phone: "+7 775 555 59 06",
      },
    })

    expect(customer.email).toBeNull()
    expect(customer.name).toBe("Алишер Акимжанов")
    expect(customer.phone).toBe("+7 775 555 59 06")
  })

  it("настоящую почту отдаёт как есть", () => {
    expect(
      cardCustomer({
        id: "order_mail",
        email: "erlan@mail.kz",
        customer: { first_name: "Ерлан", last_name: "С." },
      }).email
    ).toBe("erlan@mail.kz")
  })

  it("для юрлица отдаёт название, БИН и признак компании", () => {
    expect(
      cardCustomer({
        id: "order_1",
        email: "bekzat@astanastroy.kz",
        company: {
          id: "comp_1",
          name: "ТОО «АстанаСтрой»",
          bin: "180340012345",
        },
        customer: {
          first_name: "Бекзат",
          last_name: "О.",
          phone: "+7 701 000 00 00",
        },
      })
    ).toEqual({
      name: "ТОО «АстанаСтрой»",
      email: "bekzat@astanastroy.kz",
      phone: "+7 701 000 00 00",
      is_company: true,
      company_id: "comp_1",
      company_name: "ТОО «АстанаСтрой»",
      company_bin: "180340012345",
    })
  })

  it("физлицу подставляет ФИО, а без него — телефон", () => {
    expect(
      cardCustomer({
        id: "order_1",
        email: "erlan@mail.kz",
        customer: { first_name: "Ерлан", last_name: "С." },
      }).name
    ).toBe("Ерлан С.")

    // Вход на MVP — по телефону, почту система заводит сама: плательщик
    // «77775550314@phone.invalid» дублировал строку «Почта» и не был именем
    // (T4.13, находка Ф-прогона Асель).
    expect(
      cardCustomer({
        id: "order_1",
        email: "77775550314@phone.invalid",
        customer: { phone: "+7 777 555 03 14" },
      }).name
    ).toBe("+7 777 555 03 14")

    expect(cardCustomer({ id: "order_1", email: "erlan@mail.kz" }).name).toBe(
      "erlan@mail.kz"
    )
  })
})

describe("cardItems", () => {
  it("приводит BigNumber-количества и цены к числам", () => {
    expect(
      cardItems([
        {
          id: "li_1",
          title: "Цемент М400, 50 кг",
          variant_title: "мешок",
          quantity: { numeric: 20 },
          unit_price: { numeric: 2400 },
          total: { numeric: 48000 },
        },
      ])
    ).toEqual([
      {
        id: "li_1",
        title: "Цемент М400, 50 кг",
        variant_title: "мешок",
        quantity: 20,
        unit_price: 2400,
        total: 48000,
      },
    ])
  })

  it("без total считает сумму строки из цены и количества", () => {
    expect(
      cardItems([
        {
          id: "li_1",
          title: null,
          product_title: "Щебень фр. 5–20",
          variant_title: null,
          quantity: 3,
          unit_price: 9500,
        },
      ])
    ).toEqual([
      {
        id: "li_1",
        title: "Щебень фр. 5–20",
        variant_title: null,
        quantity: 3,
        unit_price: 9500,
        total: 28500,
      },
    ])
  })
})

describe("cardTotals", () => {
  it("берёт итоги из выборки сервиса", () => {
    expect(
      cardTotals(
        {
          total: 266000,
          item_total: 264000,
          shipping_total: 2000,
          discount_total: 0,
        },
        [{ id: "li_1", title: "x", variant_title: null, quantity: 1, unit_price: 264000, total: 264000 }],
        [{ total: 2000 }],
        "kzt"
      )
    ).toEqual({
      item_total: 264000,
      shipping_total: 2000,
      discount_total: 0,
      total: 266000,
      currency_code: "kzt",
    })
  })

  // Деньги на экране должны сходиться: «Товары» + «Доставка» = «Итого».
  // Если выборка не дала разбивку, добираем её из позиций и доставки, а не
  // оставляем прочерк рядом с итогом (грабля T3.11).
  it("добирает разбивку из позиций и способов доставки", () => {
    expect(
      cardTotals(
        { total: 266000 },
        [
          { id: "li_1", title: "x", variant_title: null, quantity: 2, unit_price: 132000, total: 264000 },
        ],
        [{ amount: 2000 }],
        "kzt"
      )
    ).toEqual({
      item_total: 264000,
      shipping_total: 2000,
      discount_total: null,
      total: 266000,
      currency_code: "kzt",
    })
  })

  it("пустой заказ без выборки итогов не рисует нулей", () => {
    expect(cardTotals(null, [], [], null)).toEqual({
      item_total: null,
      shipping_total: null,
      discount_total: null,
      total: null,
      currency_code: null,
    })
  })
})

describe("cardDelivery", () => {
  it("собирает получателя, адрес и телефон адреса", () => {
    expect(
      cardDelivery(
        {
          first_name: "Ерлан",
          last_name: "С.",
          address_1: "Кабанбай батыра 53",
          city: "Астана",
          postal_code: null,
          phone: "+7 702 111 22 33",
        },
        [{ name: "Доставка по Астане" }],
        "+7 701 000 00 00",
        { date: "2026-09-06", window: "day" }
      )
    ).toEqual({
      recipient: "Ерлан С.",
      address: "Кабанбай батыра 53",
      city: "Астана",
      postal_code: null,
      phone: "+7 702 111 22 33",
      shipping_method: "Доставка по Астане",
      slot_date: "2026-09-06",
      slot_window: "day",
    })
  })

  it("без телефона в адресе берёт телефон покупателя", () => {
    expect(cardDelivery(null, [], "+7 701 000 00 00").phone).toBe(
      "+7 701 000 00 00"
    )
  })

  // Заказ, оформленный до появления слотов (T5.6): полей нет, но карточка
  // собирается — иначе старые заказы перестали бы открываться.
  it("без слота отдаёт прочерки, а не падает", () => {
    const delivery = cardDelivery(null, [], null)
    expect(delivery.slot_date).toBeNull()
    expect(delivery.slot_window).toBeNull()
  })
})

describe("cardTransitionTargets", () => {
  const items = [
    { id: "li_1", title: "x", variant_title: null, quantity: 4, unit_price: 100, total: 400 },
  ]

  it("к отгрузке — ещё не отгруженный fulfillment, к вручению — отгруженный", () => {
    expect(
      cardTransitionTargets(items, [
        { id: "ful_shipped", shipped_at: "2026-08-16T09:00:00.000Z" },
        { id: "ful_new" },
      ])
    ).toEqual({
      items: [{ id: "li_1", quantity: 4 }],
      ship_fulfillment_id: "ful_new",
      deliver_fulfillment_id: "ful_shipped",
    })
  })

  it("отменённые fulfillment'ы в цели не берутся", () => {
    expect(
      cardTransitionTargets(items, [
        { id: "ful_canceled", canceled_at: "2026-08-16T09:00:00.000Z" },
      ])
    ).toEqual({
      items: [{ id: "li_1", quantity: 4 }],
      ship_fulfillment_id: null,
      deliver_fulfillment_id: null,
    })
  })

  it("доставленный заказ новых целей не предлагает", () => {
    expect(
      cardTransitionTargets(items, [
        {
          id: "ful_1",
          shipped_at: "2026-08-16T09:00:00.000Z",
          delivered_at: "2026-08-17T09:00:00.000Z",
        },
      ]).deliver_fulfillment_id
    ).toBe(null)
  })
})
