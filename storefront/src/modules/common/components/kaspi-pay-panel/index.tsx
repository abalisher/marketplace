"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import { clx } from "@medusajs/ui"
import { useEffect, useState } from "react"
import QRCode from "react-qr-code"

// Кнопка «оплатить» — красная кнопка Kaspi: на телефоне во всю ширину (главное
// действие под палец), на широком экране — по содержимому под QR, который там
// главный.
const payActionClass = [
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-chip bg-kaspi px-6 py-2",
  "text-body-large font-semibold text-on-kaspi transition-colors hover:bg-kaspi/90",
  "small:w-fit",
].join(" ")

// Второстепенные действия (передать ссылку, показать QR) — нейтральные, чтобы
// красной в блоке оставалась только кнопка оплаты.
const secondaryActionClass =
  "inline-flex items-center gap-2 self-start text-body-medium font-semibold text-ink transition-colors hover:text-kaspi"

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
    <div className="flex flex-col gap-4" data-testid="kaspi-pay-panel">
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
          className={secondaryActionClass}
          data-testid="kaspi-pay-share"
        >
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
            <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
          </svg>
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
            className={clx(secondaryActionClass, "small:hidden")}
            data-testid="kaspi-pay-qr-toggle"
            aria-expanded={qrOpen}
          >
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <path d="M14 14h3v3M21 14v.01M14 21h.01M17.5 21H21v-3.5" />
            </svg>
            {qrOpen ? m.kaspiPay.hideQr : m.kaspiPay.showQr}
          </button>

          {/* QR и рядом шаги оплаты — как на кассе Kaspi QR. На широком
              экране QR главный и поднимается наверх. */}
          <div
            className={clx(
              "flex-col gap-4 xsmall:flex-row xsmall:items-center small:order-first",
              qrOpen ? "flex" : "hidden small:flex"
            )}
            data-testid="kaspi-pay-qr"
          >
            {/* Подложка QR намеренно ВНЕ темы — белая в свете и тьме
                (сканируемость, DECISIONS 2026-07-27). */}
            <div className="w-fit shrink-0 rounded-card border-2 border-kaspi/25 bg-white p-3">
              <QRCode value={qrPayload} size={qrSize} />
            </div>
            <ol className="flex flex-col gap-3" aria-label={m.kaspiPay.scanQr}>
              {[m.kaspiPay.qrStep1, m.kaspiPay.qrStep2, m.kaspiPay.qrStep3].map(
                (step, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaspi text-[13px] font-bold leading-none text-on-kaspi">
                      {index + 1}
                    </span>
                    <span className="pt-0.5 text-body-medium text-ink">{step}</span>
                  </li>
                )
              )}
            </ol>
          </div>
        </>
      )}
    </div>
  )
}

export default KaspiPayPanel
