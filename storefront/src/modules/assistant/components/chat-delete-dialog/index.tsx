"use client"

import { Dialog, Transition } from "@headlessui/react"
import { useMessages } from "@lib/i18n/i18n-context"
import { Fragment } from "react"

// Подтверждение удаления диалога (бриф T10.1a раздел 3.1): история локальная,
// восстановить удалённое нельзя — поэтому спрашиваем. Свой диалог, а не
// `common/components/modal`: тот сверстан на типошкале стартера, а гейт U
// требует только токены дизайн-системы.
const ChatDeleteDialog = ({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}) => {
  const m = useMessages()

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[80]" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-scrim/50" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              className="flex w-full max-w-md flex-col gap-4 rounded-card border border-line bg-surface p-6 shadow-lg"
              data-testid="chat-delete-dialog"
            >
              <Dialog.Title className="text-heading-medium text-ink">
                {m.assistant.rail.deleteTitle}
              </Dialog.Title>
              <Dialog.Description className="text-body-large text-ink-secondary">
                {m.assistant.rail.deleteBody}
              </Dialog.Description>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="min-h-[48px] rounded-chip border border-line px-4 text-button text-ink transition-colors hover:bg-surface-dim"
                  data-testid="chat-delete-cancel"
                >
                  {m.assistant.rail.cancel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="min-h-[48px] rounded-chip bg-error px-4 text-button text-on-accent transition-opacity hover:opacity-90"
                  data-testid="chat-delete-confirm"
                >
                  {m.assistant.rail.deleteConfirm}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ChatDeleteDialog
