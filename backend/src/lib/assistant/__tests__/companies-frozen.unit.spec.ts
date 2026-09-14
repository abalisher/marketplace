import { buildAssistantSystemPrompt } from "../system-prompt"
import { findAssistantTool, getAssistantTools } from "../tools/registry"

// Заморозка юрлиц (T10.9). Проверяем ровно то, что обещает DoD таска: с
// выключенным FEATURE_COMPANIES ассистент не может ни назвать инструмент юрлиц,
// ни прочитать в инструкции путь регистрации компании — а с включённым флагом
// всё возвращается на место.
const withFlag = <T>(value: string | undefined, run: () => T): T => {
  const previous = process.env.FEATURE_COMPANIES
  if (value === undefined) {
    delete process.env.FEATURE_COMPANIES
  } else {
    process.env.FEATURE_COMPANIES = value
  }
  try {
    return run()
  } finally {
    process.env.FEATURE_COMPANIES = previous
  }
}

const toolNames = () => getAssistantTools().map((tool) => tool.declaration.name)

describe("реестр инструментов при замороженных юрлицах", () => {
  it("не объявляет внутренний акт и не находит его по имени", () => {
    withFlag(undefined, () => {
      expect(toolNames()).not.toContain("request_avr")
      expect(findAssistantTool("request_avr")).toBeUndefined()
      // Остальной путь покупателя не пострадал.
      expect(toolNames()).toEqual(
        expect.arrayContaining(["search_products", "place_order"])
      )
    })
  })

  it("возвращает инструмент вместе с флагом", () => {
    withFlag("true", () => {
      expect(toolNames()).toContain("request_avr")
      expect(findAssistantTool("request_avr")).toBeDefined()
    })
  })
})

describe("системная инструкция при замороженных юрлицах", () => {
  const frozen = buildAssistantSystemPrompt({ companiesEnabled: false })
  const enabled = buildAssistantSystemPrompt({ companiesEnabled: true })

  // Слова, по которым модель воспроизводит несуществующий путь: реквизиты
  // заявки, раздел регистрации, закрывающие документы юрлица. Само слово «БИН»
  // в замороженной инструкции остаётся — но только в правиле «не спрашивай его».
  it.each([
    "БИН (12 цифр)",
    "АВР",
    "внутренний акт",
    "Внутренний акт",
    "«Компания»",
    "модерац",
  ])("не содержит «%s»", (word) => {
    expect(frozen).not.toContain(word)
    // Контроль: с включённым доменом слово в инструкции есть — значит проверка
    // ловит именно заморозку, а не опечатку в самом тесте.
    expect(enabled).toContain(word)
  })

  it("даёт честный ответ про физлиц", () => {
    expect(frozen).toContain("ТОЛЬКО на физлицо")
  })
})
