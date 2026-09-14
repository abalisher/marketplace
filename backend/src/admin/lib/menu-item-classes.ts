// Классы пункта поповера-меню — дословно из внутреннего DataTableFilter ядра.
// Держим отдельно: их используют и чип фильтра, и меню «Добавить фильтр» на
// страницах списков, а дублировать строку классов в двух местах значит однажды
// поправить только одно.
export const MENU_ITEM_CLASSES =
  "bg-ui-bg-base hover:bg-ui-bg-base-hover focus-visible:bg-ui-bg-base-pressed text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors"
