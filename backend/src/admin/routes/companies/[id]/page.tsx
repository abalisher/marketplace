import {
  CheckCircleSolid,
  EllipsisHorizontal,
  PencilSquare,
  XCircleSolid,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  DropdownMenu,
  Heading,
  IconButton,
  StatusBadge,
  Table,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import RejectCompanyPrompt from "../../../components/reject-company-prompt"
import CreditLimitDrawer from "../../../components/credit-limit-drawer"
import { useCompanyModeration } from "../../../hooks/use-company-moderation"
import {
  AdminCompanyResponse,
  AdminCompanySpendLimit,
  COMPANY_STATUS_META,
} from "../../../lib/company"
import { AdminScorecardResponse, formatMoney } from "../../../lib/scoring"
import { sdk } from "../../../lib/sdk"

const PERIOD_LABELS: Record<AdminCompanySpendLimit["period"], string> = {
  order: "per order",
  day: "per day",
  week: "per week",
  month: "per month",
}

const formatSpendLimit = (limit: AdminCompanySpendLimit) => {
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: limit.currency_code.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(limit.amount)
  return `${amount} ${PERIOD_LABELS[limit.period]}`
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

// Карточка компании для модерации: реквизиты, документы, сотрудники
// с лимитами; approve/reject — в «...»-меню шапки (идиома карточек ядра).
const CompanyDetailPage = () => {
  const { id } = useParams()
  const { approveMutation, rejectMutation, approveWithConfirm } =
    useCompanyModeration()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [limitOpen, setLimitOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-companies", id],
    queryFn: () =>
      sdk.client.fetch<AdminCompanyResponse>(`/admin/companies/${id}`),
    enabled: !!id,
  })
  const company = data?.company

  // Карточка рейтинга/лимита отсрочки компании (модуль scoring).
  const { data: scorecardData } = useQuery({
    queryKey: ["company-scorecard", id],
    queryFn: () =>
      sdk.client.fetch<AdminScorecardResponse>(
        `/admin/companies/${id}/scorecard`
      ),
    enabled: !!id,
  })
  const scorecard = scorecardData?.scorecard ?? null

  if (isLoading) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">Loading…</Text>
      </Container>
    )
  }

  if (!company) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">Company not found.</Text>
      </Container>
    )
  }

  const statusMeta = COMPANY_STATUS_META[company.status]
  const documents = company.documents ?? []
  const actionsPending = approveMutation.isPending || rejectMutation.isPending

  return (
    <div className="flex flex-col gap-y-3">
      <Button
        variant="transparent"
        size="small"
        className="text-ui-fg-subtle w-fit"
        asChild
      >
        <Link to="/companies">← Back to companies</Link>
      </Button>

      <Container className="divide-y p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-3">
              <Heading level="h1">{company.name}</Heading>
              <StatusBadge color={statusMeta.color}>
                {statusMeta.label}
              </StatusBadge>
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              BIN {company.bin} · submitted {formatDate(company.created_at)}
            </Text>
          </div>
          {/* Действия — в «...»-меню, как на стандартных карточках дашборда. */}
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <IconButton size="small" variant="transparent">
                <EllipsisHorizontal />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              {company.status !== "approved" && (
                <DropdownMenu.Item
                  className="gap-x-2"
                  onClick={() => approveWithConfirm(company)}
                  disabled={actionsPending}
                >
                  <CheckCircleSolid className="text-ui-fg-subtle" />
                  Approve
                </DropdownMenu.Item>
              )}
              {company.status !== "rejected" && (
                <DropdownMenu.Item
                  className="gap-x-2"
                  onClick={() => setRejectOpen(true)}
                  disabled={actionsPending}
                >
                  <XCircleSolid className="text-ui-fg-subtle" />
                  Reject
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
        {company.status === "rejected" && company.rejection_reason && (
          <div className="flex flex-col gap-y-1 px-6 py-4">
            <Text size="small" weight="plus">
              Rejection reason
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              {company.rejection_reason}
            </Text>
          </div>
        )}
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Documents</Heading>
        </div>
        <div className="px-6 py-4">
          {documents.length ? (
            <ul className="flex flex-col gap-y-1">
              {documents.map((doc) => (
                <li key={doc.url}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover txt-small"
                  >
                    {doc.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <Text size="small" className="text-ui-fg-subtle">
              No documents provided.
            </Text>
          )}
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Employees</Heading>
        </div>
        {company.employees.length ? (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Role</Table.HeaderCell>
                <Table.HeaderCell>Spend limits</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {company.employees.map((employee) => {
                const limits = employee.spend_limits ?? []
                return (
                  <Table.Row key={employee.id}>
                    <Table.Cell>{employee.customer?.email ?? "—"}</Table.Cell>
                    <Table.Cell>
                      {[
                        employee.customer?.first_name,
                        employee.customer?.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        size="2xsmall"
                        color={employee.role === "admin" ? "purple" : "grey"}
                      >
                        {employee.role === "admin" ? "Admin" : "Member"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {limits.length
                        ? limits.map(formatSpendLimit).join(", ")
                        : "—"}
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        ) : (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-fg-subtle">
              No employees yet.
            </Text>
          </div>
        )}
      </Container>

      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Credit scoring</Heading>
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <IconButton size="small" variant="transparent">
                <EllipsisHorizontal />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item
                className="gap-x-2"
                onClick={() => setLimitOpen(true)}
              >
                <PencilSquare className="text-ui-fg-subtle" />
                Set manual limit
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
        {scorecard?.exists ? (
          <div className="grid grid-cols-2 gap-y-3 px-6 py-4">
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              Score
            </Text>
            <Text size="small">{scorecard.score} / 100</Text>
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              Computed limit
            </Text>
            <Text size="small">{formatMoney(scorecard.credit_limit)}</Text>
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              Manual limit
            </Text>
            <Text size="small">
              {scorecard.manual_limit != null
                ? formatMoney(scorecard.manual_limit)
                : "—"}
            </Text>
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              Available credit
            </Text>
            <Text size="small">{formatMoney(scorecard.available_credit)}</Text>
            {scorecard.note && (
              <>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">
                  Note
                </Text>
                <Text size="small">{scorecard.note}</Text>
              </>
            )}
          </div>
        ) : (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-fg-subtle">
              No scoring computed yet. It is recalculated as the company's
              orders close, or you can set a manual limit.
            </Text>
          </div>
        )}
      </Container>

      <RejectCompanyPrompt
        company={rejectOpen ? company : null}
        onClose={() => setRejectOpen(false)}
        onSubmit={(companyId, reason) =>
          rejectMutation.mutate(
            { id: companyId, reason },
            { onSuccess: () => setRejectOpen(false) }
          )
        }
        isPending={rejectMutation.isPending}
      />

      <CreditLimitDrawer
        companyId={company.id}
        scorecard={scorecard}
        open={limitOpen}
        onClose={() => setLimitOpen(false)}
      />
    </div>
  )
}

export default CompanyDetailPage
