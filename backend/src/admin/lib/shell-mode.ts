import {
  FeatureFlags,
  cachedFeatureFlags,
  fetchFeatureFlags,
  rememberFeatureFlags,
} from "./feature-flags"
import { redirectFor } from "./shell-redirect"
import { coreLabel, isNoiseRowTitle } from "./shell-text"
import {
  ShellRole,
  cachedShellRole,
  fetchShellRole,
  rememberShellRole,
} from "./shell-role"

// Режим оболочки панели: ставит на <html> атрибут `data-sm-shell="seller|owner"`,
// по которому styles/shell.css обрезает сайдбар и настройки, и уводит с ядровых
// домашних адресов (`/app`, `/app/orders`) на наши экраны — «Дашборд» и
// «Заказы» (правило — `shell-redirect.ts`).
//
// ПОЧЕМУ ТАК. Оболочку (порядок пунктов сайдбара, разделы настроек, страницу
// после входа) ядро `@medusajs/dashboard` не отдаёт расширениям: ни admin-SDK, ни
// конфиг это не настраивают (проверено в T4.1). Форк дашборда ради обрезки —
// несоразмерная цена, поэтому режим задаётся снаружи: один атрибут на корне
// документа + слой CSS. Это НЕ разграничение доступа: продавец по-прежнему может
// открыть скрытый адрес руками, а API-права ядра одинаковы для всех
// admin-пользователей. Задача слоя — прод-вид панели, а не безопасность.
//
// Модуль подключается ОДНИМ импортом из routes/dashboard/page.tsx (рядом с
// brand.css). Расширения статически попадают в входной чанк админки (проверено
// на сборке: код экрана дашборда лежит в `index-*.js`, а не в ленивом чанке),
// поэтому код ниже выполняется на любой странице панели, включая ядровые.

const ROLE_ATTRIBUTE = "smShell"
// Атрибут замороженных доменов: `data-sm-companies="on|off"` на <html>, по нему
// styles/shell.css убирает из сайдбара «Компании» и «Правила скоринга» (T10.9).
const COMPANIES_ATTRIBUTE = "smCompanies"

// Роль нужна не только CSS, но и правилу редиректа (у сборщика в панели ровно
// один адрес), поэтому держим её здесь же.
let currentRole: ShellRole | null = null

const applyRole = (role: ShellRole) => {
  currentRole = role
  document.documentElement.dataset[ROLE_ATTRIBUTE] = role
  // Роль приходит с сервера уже ПОСЛЕ первой отрисовки: если это сборщик,
  // повторяем правило редиректа — иначе он останется на экране, который
  // открылся до ответа.
  followRedirectOnLoad()
}

const applyFeatureFlags = (flags: FeatureFlags) => {
  document.documentElement.dataset[COMPANIES_ATTRIBUTE] = flags.companies
    ? "on"
    : "off"
}

// Роль: сначала из кэша (первый кадр), затем сверяем с сервером. На экране входа
// запрос ожидаемо отдаёт 401 — режим тогда не меняем.
const resolveRole = () => {
  const cached = cachedShellRole()
  if (cached) {
    applyRole(cached)
  }

  void fetchShellRole()
    .then((role) => {
      rememberShellRole(role)
      applyRole(role)
    })
    .catch(() => {
      // Не залогинен или сеть недоступна — оставляем то, что уже применено.
    })
}

// Фича-флаги: как и роль — сначала из кэша (первый кадр), затем с сервера.
// До первого ответа считаем юрлица выключенными: так честнее показать раздел
// на кадр позже, чем мигнуть разделом, которого в продукте нет.
const resolveFeatureFlags = () => {
  applyFeatureFlags(cachedFeatureFlags() ?? { companies: false })

  void fetchFeatureFlags()
    .then((flags) => {
      rememberFeatureFlags(flags)
      applyFeatureFlags(flags)
    })
    .catch(() => {
      // Не залогинен или сеть недоступна — оставляем применённое.
    })
}

// Прямой заход по адресу: закладка, ввод руками, ссылка извне.
const followRedirectOnLoad = () => {
  const target = redirectFor(location.pathname, location.pathname, currentRole)
  if (target) {
    location.replace(target)
  }
}

// Переходы внутри панели. Роутер ядра меняет адрес через history: вход после
// авторизации — replaceState('/app/orders'), клик по хлебной крошке и поиск ⌘K —
// pushState. Перехватываем оба и уводим ПОЛНОЙ загрузкой: подменить адрес на
// лету нельзя — роутер ядра уже посчитал свой переход по СВОЕМУ аргументу и
// отрисовал бы ядровый экран под нашим адресом.
const followRedirectOnNavigation = () => {
  const originals = {
    pushState: history.pushState.bind(history),
    replaceState: history.replaceState.bind(history),
  }

  const patch = (method: "pushState" | "replaceState") => {
    const original = originals[method]

    history[method] = (data, unused, url) => {
      const path =
        url == null ? null : new URL(String(url), location.origin).pathname
      const target = path
        ? redirectFor(path, location.pathname, currentRole)
        : null

      if (target) {
        history[method] = original
        location.replace(target)
        return
      }

      original(data, unused, url)
    }
  }

  patch("pushState")
  patch("replaceState")
}

// Подписи ядра, которых нет в i18n (правило — `shell-text.ts`): «Total
// pending», статусы платежа, идентификаторы провайдеров. Ядро печатает их
// строкой в коде, поэтому подменяем уже отрисованный текст.
//
// ОБЛАСТЬ. Идём по текстовым узлам и сравниваем узел ЦЕЛИКОМ: подмена
// срабатывает на той самой надписи или не срабатывает вовсе. Обратной реакции
// нет — русский текст в словаре не значится, и повторный проход его не трогает.
const SECTION_ROW = "div.grid.w-full.items-center.px-6.py-4"

const applyToTextNode = (node: Node) => {
  const text = node.nodeValue ?? ""
  const label = coreLabel(text)

  if (label) {
    node.nodeValue = label
    return
  }

  // Таможенные поля карточки товара: убираем строку целиком. Ограничиваем
  // разметкой строки-поля ядра (`SectionRow`) — та же подпись в списке
  // фильтров склада живёт в другой разметке и остаётся на месте.
  if (isNoiseRowTitle(text)) {
    node.parentElement
      ?.closest<HTMLElement>(SECTION_ROW)
      ?.setAttribute("data-sm-noise", "row")
  }
}

const applyCoreLabels = (root: Node) => {
  if (root.nodeType === Node.TEXT_NODE) {
    applyToTextNode(root)
    return
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    applyToTextNode(node)
  }
}

// Панель — SPA: страницы приходят и уходят без перезагрузки, а текст узла ядро
// иногда меняет на месте (статус платежа после списания). Поэтому смотрим и на
// добавление узлов, и на правку текста.
const followCoreLabels = () => {
  const start = () => {
    applyCoreLabels(document.body)

    new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "characterData") {
          applyCoreLabels(record.target)
          continue
        }

        record.addedNodes.forEach(applyCoreLabels)
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }

  if (document.body) {
    start()
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true })
  }
}

resolveRole()
resolveFeatureFlags()
followRedirectOnLoad()
followRedirectOnNavigation()
followCoreLabels()
