"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"
import { useMessages } from "@lib/i18n/i18n-context"

// Пункты бокового меню. Каталога здесь нет: путь покупателя — чат (решение
// владельца 2026-08-03), классические каталожные адреса на него же и ведут.
// Корзины тоже нет (T3.10): состав заказа держит диалог с ассистентом, а
// cookie-корзина стартера всегда была пуста.
// «Заказы» — по находке прогона 2026-08-13: покупатель искал свои заказы в
// меню и не находил (пункт был только внутри «Аккаунта»). С T10.6 пункт ведёт
// в кабинет клиента.
const SIDE_MENU_ITEMS = {
  chat: "/chat",
  orders: "/cabinet/orders",
  account: "/account",
} as const

type SideMenuKey = keyof typeof SIDE_MENU_ITEMS

type SideMenuProps = {
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({ locales, currentLocale }: SideMenuProps) => {
  const m = useMessages()

  // Подписи пунктов: чат берёт строку ассистента, остальные — из `nav`.
  const itemLabel = (key: SideMenuKey) =>
    key === "chat" ? m.assistant.navLink : m.nav[key]
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base"
                >
                  {m.nav.menu}
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-transparent pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-[51] inset-x-0 text-sm text-ink m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-surface/95 border border-line rounded-card justify-between p-6"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        aria-label={m.common.close}
                        className="flex min-h-[48px] min-w-[48px] items-center justify-center"
                      >
                        <XMark />
                      </button>
                    </div>
                    <ul className="flex flex-col gap-6 items-start justify-start">
                      {Object.entries(SIDE_MENU_ITEMS).map(([key, href]) => {
                        return (
                          <li key={key}>
                            <LocalizedClientLink
                              href={href}
                              className="flex min-h-[48px] items-center text-3xl leading-10 hover:text-accent"
                              onClick={close}
                              data-testid={`${key}-link`}
                            >
                              {itemLabel(key as SideMenuKey)}
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex flex-col gap-y-6">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      {/* Выбора страны доставки здесь больше нет: регион один
                          (Казахстан), магазин работает по Астане, а стартерная
                          строка висела по-английски — «Shipping to: Kazakhstan»
                          в русском меню (прогон 2026-08-13). */}
                      <Text className="flex justify-between txt-compact-small">
                        © {new Date().getFullYear()} СтройМаркет
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
