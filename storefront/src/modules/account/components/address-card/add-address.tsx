"use client"

import { Plus } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"
import { useEffect, useRef, useState, useActionState } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import Input from "@modules/common/components/input"
import PhoneInput from "@modules/common/components/phone-input"
import Modal from "@modules/common/components/modal"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import { addCustomerAddress } from "@lib/data/customer"
import { useMessages } from "@lib/i18n/i18n-context"
import AddressMapFields from "@modules/account/components/address-map-fields"

const AddAddress = ({
  region,
  addresses,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const m = useMessages()
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)
  const address1Ref = useRef<HTMLInputElement>(null)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    isDefaultShipping: addresses.length === 0,
    success: false,
    error: null,
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

  return (
    <>
      {/* «Добавить адрес» — компактная кнопка в шапке списка адресов, а не
          пустая карточка в рост адреса (она читалась как сломанный блок). */}
      <button
        type="button"
        className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border border-line px-3.5 text-body-medium font-semibold text-accent transition-colors hover:bg-surface-dim"
        onClick={open}
        data-testid="add-address-button"
      >
        <Plus />
        {m.account.addAddress}
      </button>

      <Modal
        isOpen={state}
        close={close}
        size="large"
        data-testid="add-address-modal"
      >
        <Modal.Title>
          <Heading className="mb-2">{m.account.addAddress}</Heading>
        </Modal.Title>
        <form action={formAction}>
          <Modal.Body className="pr-4">
            <div className="flex flex-col gap-y-2">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label={m.common.address.firstName}
                  name="first_name"
                  required
                  autoComplete="given-name"
                  data-testid="first-name-input"
                />
                <Input
                  label={m.common.address.lastName}
                  name="last_name"
                  required
                  autoComplete="family-name"
                  data-testid="last-name-input"
                />
              </div>
              {/* Магазин возит только по Астане: город и страна — сами, без
                  полей (индекс, область и страна только путали покупателя). */}
              <input type="hidden" name="city" value="Астана" />
              <input type="hidden" name="country_code" value="kz" />
              <AddressMapFields address1Ref={address1Ref} />
              <Input
                ref={address1Ref}
                label={m.common.address.address}
                name="address_1"
                required
                autoComplete="address-line1"
                data-testid="address-1-input"
              />
              <Input
                label={m.common.address.apartment}
                name="address_2"
                autoComplete="address-line2"
                data-testid="address-2-input"
              />
              <PhoneInput
                label={m.common.address.phone}
                name="phone"
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div
                className="text-error text-body-medium py-2"
                data-testid="address-error"
              >
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

export default AddAddress
