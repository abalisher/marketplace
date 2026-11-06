import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { serializeTable } from "../../price-stock/csv"
import { loadDebts, loadPaymentEntries } from "../load"
import { reportSalesChannel } from "../scope"
import { AdminExportPaymentReportParamsType } from "../validators"
import { buildDebtsTable, buildEntriesTable, paymentReportFileName } from "./table"

// GET /admin/payment-report/export — журнал оплат или долги файлом CSV (тот же
// срез, что на экране, целиком). BOM — чтобы русский Excel прочитал UTF-8.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { view, sales_channel_id, state, ...filter } =
    req.validatedQuery as AdminExportPaymentReportParamsType
  const channel = reportSalesChannel(req, sales_channel_id)

  const table =
    view === "entries"
      ? buildEntriesTable(
          (await loadPaymentEntries(req.scope, { ...filter, sales_channel_id: channel })).rows
        )
      : buildDebtsTable(
          (await loadDebts(req.scope, { state, q: filter.q, sales_channel_id: channel })).rows
        )

  res.setHeader("Content-Type", "text/csv; charset=utf-8")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${paymentReportFileName(view, new Date())}"`
  )
  res.send(`﻿${serializeTable(table)}`)
}
