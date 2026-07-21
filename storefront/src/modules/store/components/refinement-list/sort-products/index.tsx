"use client"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import { useMessages } from "@lib/i18n/i18n-context"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
}

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const m = useMessages()
  // Опции строятся в компоненте — подписи из словаря (хук доступен только здесь).
  const sortOptions = [
    { value: "created_at", label: m.store.sort.latest },
    { value: "price_asc", label: m.store.sort.priceAsc },
    { value: "price_desc", label: m.store.sort.priceDesc },
  ]

  const handleChange = (value: SortOptions) => {
    setQueryParams("sortBy", value)
  }

  return (
    <FilterRadioGroup
      title={m.store.sort.title}
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default SortProducts
