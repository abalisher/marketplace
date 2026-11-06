"use client"

import React, { useEffect, useRef, useState, useActionState } from "react"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import useToggleState from "@lib/hooks/use-toggle-state"
import Input from "@modules/common/components/input"
import PhoneInput from "@modules/common/components/phone-input"
import Modal from "@modules/common/components/modal"
import Spinner from "@modules/common/icons/spinner"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import {
  deleteCustomerAddress,
  setDefaultShippingAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import { useMessages } from "@lib/i18n/i18n-context"
import { formatPhone } from "@lib/util/format-phone"
import AddressMapFields from "@modules/account/components/address-map-fields"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const m = useMessages()
  const [removing, setRemoving] = useState(false)
  const address1Ref = useRef<HTMLInputElement>(null)
  // Точка, если адрес уже выбирали на карте: карта откроется на ней.
  const savedLat = Number(address.metadata?.lat)
  const savedLng = Number(address.metadata?.lng)
  const savedPoint =
    Number.isFinite(savedLat) &&
    Number.isFinite(savedLng) &&
    (savedLat || savedLng)
      ? { lat: savedLat, lng: savedLng }
      : null
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
    addressId: address.id,
  })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  const [makingDefault, setMakingDefault] = useState(false)
  const makeDefault = async () => {
    setMakingDefault(true)
    await setDefaultShippingAddress(address.id)
    setMakingDefault(false)
  }

  return (
    <>
      <li
        className={clx(
          "flex items-start gap-3 py-3.5",
          isActive && "bg-surface-dim"
        )}
        data-testid="address-container"
      >
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-container text-accent"
        >
          <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]">
            <path
              d="M10 17.5s5.5-4.8 5.5-9.3a5.5 5.5 0 00-11 0c0 4.5 5.5 9.3 5.5 9.3zM10 10.3a2 2 0 100-4 2 2 0 000 4z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className="text-body-large font-semibold text-ink"
              data-testid="address-address"
            >
              {address.address_1}
            </span>
            {address.is_default_shipping && (
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[12px] font-semibold text-success">
                {m.cabinet.profile.defaultAddress}
              </span>
            )}
          </div>
          {address.address_2 && (
            <span className="text-body-medium text-ink">
              {/* Только номер («308») — это квартира или офис: так и пишем. */}
              {/^\d+[а-яa-z]?$/i.test(address.address_2.trim())
                ? m.cabinet.profile.apartment.replace(
                    "{value}",
                    address.address_2.trim()
                  )
                : address.address_2}
            </span>
          )}
          <span
            className="text-body-medium text-ink-secondary"
            data-testid="address-name"
          >
            {[
              [address.first_name, address.last_name].filter(Boolean).join(" "),
              address.phone ? formatPhone(address.phone) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
          {savedPoint && (
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent">
              <svg
                viewBox="0 0 20 20"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  d="M4.5 10.5l3.5 3.5 7.5-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {m.cabinet.profile.onMap}
            </span>
          )}
          {!address.is_default_shipping && (
            <button
              type="button"
              onClick={makeDefault}
              disabled={makingDefault}
              className="mt-1 inline-flex w-fit items-center gap-1.5 text-body-medium font-semibold text-accent transition-colors hover:text-accent-pressed disabled:opacity-60"
              data-testid="address-make-default-button"
            >
              {makingDefault && <Spinner />}
              {m.cabinet.profile.makeDefault}
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-dim hover:text-ink"
            onClick={open}
            aria-label={m.common.edit}
            title={m.common.edit}
            data-testid="address-edit-button"
          >
            <Edit />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-error/10 hover:text-error"
            onClick={removeAddress}
            aria-label={m.account.remove}
            title={m.account.remove}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <Trash />}
          </button>
        </div>
      </li>

      <Modal
        isOpen={state}
        close={close}
        size="large"
        data-testid="edit-address-modal"
      >
        <Modal.Title>
          <Heading className="mb-2">{m.account.editAddress}</Heading>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body className="pr-4">
            <div className="grid grid-cols-1 gap-y-2">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label={m.common.address.firstName}
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.first_name || undefined}
                  data-testid="first-name-input"
                />
                <Input
                  label={m.common.address.lastName}
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.last_name || undefined}
                  data-testid="last-name-input"
                />
              </div>
              {/* Город, страна, индекс и область — как были, без полей: магазин
                  возит только по Астане, а лишние поля путали покупателя. */}
              <input
                type="hidden"
                name="city"
                value={address.city || "Астана"}
              />
              <input
                type="hidden"
                name="country_code"
                value={address.country_code || "kz"}
              />
              <input
                type="hidden"
                name="postal_code"
                value={address.postal_code || ""}
              />
              <input
                type="hidden"
                name="province"
                value={address.province || ""}
              />
              <input
                type="hidden"
                name="company"
                value={address.company || ""}
              />
              <AddressMapFields
                address1Ref={address1Ref}
                initial={savedPoint}
              />
              <Input
                ref={address1Ref}
                label={m.common.address.address}
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address_1 || undefined}
                data-testid="address-1-input"
              />
              <Input
                label={m.common.address.apartment}
                name="address_2"
                autoComplete="address-line2"
                defaultValue={address.address_2 || undefined}
                data-testid="address-2-input"
              />
              <PhoneInput
                label={m.common.address.phone}
                name="phone"
                defaultValue={address.phone}
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div className="text-error text-body-medium py-2">
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                {m.account.cancel}
              </Button>
              <SubmitButton data-testid="save-button">
                {m.account.save}
              </SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default EditAddress
