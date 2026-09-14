import { EllipseMiniSolid, XMarkMini } from "@medusajs/icons"
import { clx, Popover, Text } from "@medusajs/ui"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { MENU_ITEM_CLASSES } from "../lib/menu-item-classes"

// Чип фильтра списка — разметка и поведение внутреннего DataTableFilter ядра
// («Статус» → «is» → значение → крестик). Вынесен из routes/product-moderation,
// когда фильтров на странице стало больше одного (категория товара, T10.10):
// повторять сорок строк разметки на каждый фильтр нельзя.
//
// Чип, который открыли и закрыли, не выбрав значения, убирается — как в ядре.

export type FilterChipOption = {
  value: string
  label: string
}

type Props = {
  // Название фильтра на чипе («Статус», «Категория»).
  label: string
  value: string | null
  options: FilterChipOption[]
  // Открыть поповер сразу после добавления фильтра.
  autoOpen?: boolean
  onChange: (value: string | null) => void
  onRemove: () => void
}

const DataTableFilterChip = ({
  label,
  value,
  options,
  autoOpen = false,
  onChange,
  onRemove,
}: Props) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(autoOpen)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    // Как в ядре: чип, закрытый без выбранного значения, убирается.
    if (!next && !value) {
      onRemove()
    }
  }

  const valueLabel = options.find((o) => o.value === value)?.label ?? null

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {/* `sm-filter-chip` — не оформление, а точка опоры: генератор кадров
          гейта U открывает и снимает чип по этому классу, а классы ядра тут
          состоят из произвольных значений Tailwind и меняются с версией. */}
      <div className="sm-filter-chip bg-ui-bg-field transition-fg shadow-borders-base text-ui-fg-subtle flex cursor-default select-none items-stretch overflow-hidden rounded-md">
        {!value && <Popover.Anchor />}
        <div
          className={clx(
            "flex items-center justify-center whitespace-nowrap px-2 py-1",
            { "border-r": !!value }
          )}
        >
          <Text size="small" weight="plus" leading="compact">
            {label}
          </Text>
        </div>
        {value && (
          <div className="flex w-full items-center overflow-hidden">
            <div className="border-r p-1 px-2">
              <Text
                size="small"
                weight="plus"
                leading="compact"
                className="text-ui-fg-muted"
              >
                {t("common.filterIs")}
              </Text>
            </div>
            <Popover.Trigger
              asChild
              className="hover:bg-ui-bg-field-hover data-[state=open]:bg-ui-bg-field-hover flex-1 cursor-pointer overflow-hidden border-r p-1 px-2"
            >
              <Text
                size="small"
                leading="compact"
                weight="plus"
                className="sm-filter-chip-value truncate text-nowrap"
              >
                {valueLabel}
              </Text>
            </Popover.Trigger>
          </div>
        )}
        {value && (
          <button
            onClick={onRemove}
            className="text-ui-fg-muted transition-fg hover:bg-ui-bg-subtle-hover active:bg-ui-bg-subtle-pressed active:text-ui-fg-base flex items-center justify-center p-1"
          >
            <XMarkMini />
          </button>
        )}
      </div>
      <Popover.Content
        align="start"
        sideOffset={8}
        collisionPadding={8}
        className="max-h-[200px] w-[300px] overflow-auto p-1"
      >
        {options.map((option) => {
          const isSelected = value === option.value
          return (
            <div
              key={option.value}
              role="menuitem"
              className={clx(MENU_ITEM_CLASSES, "gap-x-2")}
              onClick={() => onChange(isSelected ? null : option.value)}
            >
              <div
                className={clx(
                  "transition-fg flex h-5 w-5 items-center justify-center",
                  { "[&_svg]:invisible": !isSelected }
                )}
              >
                <EllipseMiniSolid />
              </div>
              {option.label}
            </div>
          )
        })}
      </Popover.Content>
    </Popover>
  )
}

export default DataTableFilterChip
