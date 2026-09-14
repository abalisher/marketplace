"use client"

import { applyCartBonus, removeCartBonus, BonusBalance } from "@lib/data/bonus"
import { getBonusCreditAmount } from "@lib/util/bonus"
import { useMessages } from "@lib/i18n/i18n-context"
import { convertToLocale } from "@lib/util/money"
import { Heading, Input, Label, Text } from "@medusajs/ui"
import Trash from "@modules/common/icons/trash"
import React from "react"
import ErrorMessage from "../error-message"
import { SubmitButton } from "../submit-button"

type BonusFormProps = {
  cart: {
    currency_code: string
    credit_lines?:
      | { amount?: number | null; reference?: string | null }[]
      | null
  }
  balance: BonusBalance | null
}

// Оплата части заказа бонусами (образец — discount-code). Всё считает
// бэкенд: потолок от суммы заказа, баланс, валюту — ошибки его валидации
// показываются под полем как есть.
const BonusForm: React.FC<BonusFormProps> = ({ cart, balance }) => {
  const m = useMessages()
  const [isOpen, setIsOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const appliedAmount = getBonusCreditAmount(cart)

  // Гость/без счёта/нулевой баланс без применённых бонусов — секции нет.
  if (!balance || (balance.balance <= 0 && appliedAmount <= 0)) {
    return null
  }

  const applyBonus = async (formData: FormData) => {
    setErrorMessage("")

    const raw = formData.get("amount")?.toString().trim()
    const amount = Number(raw)
    if (!raw || !Number.isInteger(amount) || amount <= 0) {
      setErrorMessage(m.checkout.bonus.invalidAmount)
      return
    }

    const error = await applyCartBonus(amount)
    if (error) {
      setErrorMessage(error)
      return
    }

    const input = document.getElementById("bonus-input") as HTMLInputElement
    if (input) {
      input.value = ""
    }
    setIsOpen(false)
  }

  const removeBonus = async () => {
    setErrorMessage("")
    await removeCartBonus()
  }

  return (
    <div className="w-full bg-surface flex flex-col">
      <div className="txt-medium">
        <form action={(a) => applyBonus(a)} className="w-full mb-5">
          <Label className="flex gap-x-1 my-2 items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="txt-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="add-bonus-button"
            >
              {m.checkout.bonus.payWithBonuses}
            </button>
            <Text className="txt-medium text-ui-fg-subtle">
              ({m.checkout.bonus.available}:{" "}
              {convertToLocale({
                amount: balance.balance,
                currency_code: balance.currency_code,
              })}
              )
            </Text>
          </Label>

          {isOpen && (
            <>
              <div className="flex w-full gap-x-2">
                <Input
                  className="size-full"
                  id="bonus-input"
                  name="amount"
                  type="number"
                  min={1}
                  step={1}
                  autoFocus={false}
                  data-testid="bonus-input"
                />
                <SubmitButton
                  variant="secondary"
                  data-testid="bonus-apply-button"
                >
                  {m.checkout.bonus.apply}
                </SubmitButton>
              </div>

              <ErrorMessage
                error={errorMessage}
                data-testid="bonus-error-message"
              />
            </>
          )}
        </form>

        {appliedAmount > 0 && (
          <div className="w-full flex items-center">
            <div className="flex flex-col w-full">
              <Heading className="txt-medium mb-2">
                {m.checkout.bonus.applied}
              </Heading>
              <div
                className="flex items-center justify-between w-full max-w-full mb-2"
                data-testid="bonus-row"
              >
                <Text className="flex gap-x-1 items-baseline txt-small-plus w-4/5 pr-1">
                  -{" "}
                  {convertToLocale({
                    amount: appliedAmount,
                    currency_code: cart.currency_code,
                  })}
                </Text>
                <button
                  className="flex items-center"
                  onClick={removeBonus}
                  data-testid="remove-bonus-button"
                >
                  <Trash size={14} />
                  <span className="sr-only">{m.checkout.bonus.remove}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BonusForm
