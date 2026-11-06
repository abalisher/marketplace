import React from "react"

import AddAddress from "../address-card/add-address"
import EditAddress from "../address-card/edit-address-modal"
import { HttpTypes } from "@medusajs/types"

type AddressBookProps = {
  customer: HttpTypes.StoreCustomer
  region: HttpTypes.StoreRegion
  // Заголовок и текст пустого списка — от страницы (кабинет даёт свои).
  title?: string
  emptyText?: string
}

// Адреса доставки карточкой: заголовок и «Добавить адрес» сверху, адреса —
// списком, основной первым.
const AddressBook: React.FC<AddressBookProps> = ({
  customer,
  region,
  title,
  emptyText,
}) => {
  const addresses = [...customer.addresses].sort(
    (a, b) => Number(!!b.is_default_shipping) - Number(!!a.is_default_shipping)
  )
  return (
    <div
      className="flex w-full flex-col rounded-card border border-line bg-surface"
      data-testid="address-book"
    >
      <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-4">
        {title ? (
          <h2 className="text-title-medium text-ink">{title}</h2>
        ) : (
          <span />
        )}
        <AddAddress region={region} addresses={customer.addresses} />
      </div>
      {addresses.length ? (
        <ul className="flex flex-col divide-y divide-line px-4 pb-1">
          {addresses.map((address) => (
            <EditAddress region={region} address={address} key={address.id} />
          ))}
        </ul>
      ) : (
        emptyText && (
          <p className="px-4 pb-4 pt-2 text-body-medium text-ink-secondary">
            {emptyText}
          </p>
        )
      )}
    </div>
  )
}

export default AddressBook
