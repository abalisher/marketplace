import { Disclosure } from "@headlessui/react"
import { Badge, Button, clx } from "@medusajs/ui"
import { useEffect } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"
import { useMessages } from "@lib/i18n/i18n-context"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  "data-testid"?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage,
  children,
  "data-testid": dataTestid,
}: AccountInfoProps) => {
  const m = useMessages()
  const { state, close, toggle } = useToggleState()

  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div className="py-3" data-testid={dataTestid}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-body-medium text-ink-secondary">{label}</span>
          {typeof currentInfo === "string" ? (
            <span
              className="truncate text-body-large font-semibold text-ink"
              data-testid="current-info"
            >
              {currentInfo}
            </span>
          ) : (
            currentInfo
          )}
        </div>
        <button
          className="inline-flex min-h-[36px] shrink-0 items-center rounded-full border border-line px-3.5 text-body-medium font-semibold text-ink transition-colors hover:bg-surface-dim"
          onClick={handleToggle}
          type={state ? "reset" : "button"}
          data-testid="edit-button"
          data-active={state}
        >
          {state ? m.account.cancel : m.common.edit}
        </button>
      </div>

      {/* Success state */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isSuccess,
              "max-h-0 opacity-0": !isSuccess,
            }
          )}
          data-testid="success-message"
        >
          <Badge className="mt-2 px-2 py-1" color="green">
            <span>
              {label} {m.account.updatedSuccessfully}
            </span>
          </Badge>
        </Disclosure.Panel>
      </Disclosure>

      {/* Error state  */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isError,
              "max-h-0 opacity-0": !isError,
            }
          )}
          data-testid="error-message"
        >
          <Badge className="mt-2 px-2 py-1" color="red">
            <span>{errorMessage ?? m.account.errorOccurred}</span>
          </Badge>
        </Disclosure.Panel>
      </Disclosure>

      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out",
            {
              "max-h-[1000px] opacity-100 overflow-visible": state,
              // Закрытая форма — не просто прозрачная: иначе её поля и кнопка
              // «Сохранить» свисали поверх соседних блоков и ловили нажатия
              // (нажатие «Добавить адрес» сохраняло телефон).
              "max-h-0 opacity-0 overflow-hidden invisible pointer-events-none":
                !state,
            }
          )}
        >
          <div className="flex flex-col gap-y-2 py-4">
            <div>{children}</div>
            <div className="flex items-center justify-end mt-2">
              <Button
                isLoading={pending}
                className="w-full small:max-w-[140px]"
                type="submit"
                data-testid="save-button"
              >
                {m.account.saveChanges}
              </Button>
            </div>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  )
}

export default AccountInfo
