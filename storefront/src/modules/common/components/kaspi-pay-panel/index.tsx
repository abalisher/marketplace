"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import { clx } from "@medusajs/ui"
import { useEffect, useState } from "react"
import QRCode from "react-qr-code"

// Кнопка «оплатить» меняет вес вместе с экраном, а не дублируется двумя
// элементами: на телефоне это главное действие (заливка, палец), на широком
// экране — подпись под QR, который там главный.
const payActionClass = [
  "inline-flex min-h-[48px] items-center justify-center rounded-chip bg-accent px-4 py-2",
  "text-body-large font-semibold text-on-accent transition-colors hover:bg-accent-pressed",
  "small:min-h-0 small:justify-start small:rounded-none small:bg-transparent small:p-0",
  "small:text-body-medium small:text-accent small:hover:bg-transparent small:hover:text-accent-pressed",
].join(" ")

// Счёт Kaspi одним блоком: открыть приложение, передать ссылку, показать QR.
// Общий для вставки чата и шага оформления — вид оплаты у них один, а
// дублировать раскладку в двух местах значило бы чинить её тоже дважды.
//
// Ключевое: QR и ссылка — ОДИН И ТОТ ЖЕ токен (в живом транспорте
// `qr_payload` и `payment_url` совпадают, см. `kaspi-http-client.ts`). QR не
// «способ оплаты», а способ ПЕРЕНЕСТИ счёт на другое устройство. Поэтому на
// узком экране первична кнопка — покупатель уже держит телефон в руках, и
// универсальная ссылка `pay.kaspi.kz` открывает приложение Kaspi прямо тут,
// сканировать нечем и незачем; QR уезжает под «оплатить с другого
// устройства». На широком экране наоборот: QR сверху, ссылка подписью.
const KaspiPayPanel = ({
  qrPayload,
  paymentUrl,
  qrSize = 160,
}: {
  qrPayload?: string | null
  paymentUrl?: string | null
  qrSize?: number
}) => {
  const m = useMessages()
  const [qrOpen, setQrOpen] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const [copied, setCopied] = useState(false)

  // Наличие share-листа выясняем ПОСЛЕ монтирования: на сервере такого знания
  // нет, и разная разметка сломала бы гидратацию. До эффекта показываем
  // «скопировать» — на десктопе это и есть правда.
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share)
  }, [])

  useEffect(() => {
    if (!copied) {
      return
    }
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  // Передать счёт тому, кто платит: на стройке заказывает прораб, а платит
  // бухгалтер — на телефоне это и заменяет QR со стены.
  const shareLink = async () => {
    if (!paymentUrl) {
      return
    }
    if (canShare) {
      try {
        await navigator.share({ url: paymentUrl })
      } catch {
        // Закрытый share-лист — это отказ покупателя, а не сбой: молчим.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(paymentUrl)
      setCopied(true)
    } catch {
      // Буфер закрыт политикой браузера — ссылка остаётся в QR и в кнопке.
    }
  }

  if (!qrPayload && !paymentUrl) {
    return null
  }

  return (
    <div className="flex flex-col gap-3" data-testid="kaspi-pay-panel">
      {paymentUrl && (
        <a
          href={paymentUrl}
          target="_blank"
          rel="noreferrer"
          className={payActionClass}
          data-testid="kaspi-pay-open"
        >
          {m.kaspiPay.payInApp}
        </a>
      )}

      {paymentUrl && (
        <button
          type="button"
          onClick={shareLink}
          className="text-left text-body-medium font-semibold text-accent hover:text-accent-pressed"
          data-testid="kaspi-pay-share"
        >
          {copied
            ? m.kaspiPay.linkCopied
            : canShare
            ? m.kaspiPay.shareLink
            : m.kaspiPay.copyLink}
        </button>
      )}

      {qrPayload && (
        <>
          {/* Раскрывашка только для узкого экрана: на широком QR и так виден. */}
          <button
            type="button"
            onClick={() => setQrOpen((open) => !open)}
            className="text-left text-body-medium font-semibold text-accent hover:text-accent-pressed small:hidden"
            data-testid="kaspi-pay-qr-toggle"
            aria-expanded={qrOpen}
          >
            {qrOpen ? m.kaspiPay.hideQr : m.kaspiPay.showQr}
          </button>

          <div
            className={clx(
              // На широком экране QR — главный, поэтому поднимается наверх.
              "flex-col gap-2 small:order-first",
              qrOpen ? "flex" : "hidden small:flex"
            )}
            data-testid="kaspi-pay-qr"
          >
            {/* Подложка QR намеренно ВНЕ темы — белая в свете и тьме
                (сканируемость, DECISIONS 2026-07-27). */}
            <div className="w-fit rounded-chip border border-line bg-white p-3">
              <QRCode value={qrPayload} size={qrSize} />
            </div>
            <span className="text-body-medium text-ink-secondary">
              {m.kaspiPay.scanQr}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default KaspiPayPanel
