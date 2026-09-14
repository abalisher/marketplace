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
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"
import RejectCompanyPrompt from "../../../components/reject-company-prompt"
import CreditLimitDrawer from "../../../components/credit-limit-drawer"
import { useCompanyModeration } from "../../../hooks/use-company-moderation"
import {
  AdminCompanyResponse,
  AdminCompanySpendLimit,
  COMPANY_STATUS_META,
} from "../../../lib/company"
import FeatureDisabledNotice from "../../../components/feature-disabled-notice"
import { useFeatureFlags } from "../../../hooks/use-feature-flags"
import { formatDate } from "../../../lib/date"
import { formatTenge } from "../../../lib/money"
import { AdminScorecardResponse } from "../../../lib/scoring"
import { sdk } from "../../../lib/sdk"

// Карточка компании для модерации: реквизиты, документы, сотрудники
// с лимитами; approve/reject — в «...»-меню шапки (идиома карточек ядра).
const CompanyDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams()

  // Форматирование лимита — замыкание внутри компонента ради доступа к t
  // (период рендерится i18n-ключом companies.period.*).
  const formatSpendLimit = (limit: AdminCompanySpendLimit) => {
    const amount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: limit.currency_code.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(limit.amount)
    return `${amount} ${t(`companies.period.${limit.period}`)}`
  }
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
        <Text className="text-ui-fg-subtle">{t("common.loading")}</Text>
      </Container>
    )
  }

  if (!company) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">
          {t("companies.detail.notFound")}
        </Text>
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
        <Link to="/companies">{t("companies.detail.back")}</Link>
      </Button>

      <Container className="divide-y p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-3">
              <Heading level="h1">{company.name}</Heading>
              <StatusBadge color={statusMeta.color}>
                {t(statusMeta.label)}
              </StatusBadge>
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              {t("companies.detail.submitted", {
                bin: company.bin,
                date: formatDate(company.created_at),
              })}
            </Text>
            {/* Заявку переподали после отказа — модератор смотрит её заново. */}
            {company.resubmitted_at && (
              <Text size="small" className="text-ui-fg-subtle">
                {t("companies.detail.resubmitted", {
                  date: formatDate(company.resubmitted_at),
                })}
              </Text>
            )}
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
                  {t("companies.action.approve")}
                </DropdownMenu.Item>
              )}
              {company.status !== "rejected" && (
                <DropdownMenu.Item
                  className="gap-x-2"
                  onClick={() => setRejectOpen(true)}
                  disabled={actionsPending}
                >
                  <XCircleSolid className="text-ui-fg-subtle" />
                  {t("companies.action.reject")}
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
        {/* У переподанной заявки причина отказа остаётся: она напоминает
            модератору, что он просил исправить. */}
        {company.rejection_reason && company.status !== "approved" && (
          <div className="flex flex-col gap-y-1 px-6 py-4">
            <Text size="small" weight="plus">
              {t(
                company.status === "rejected"
                  ? "companies.detail.rejectionReason"
                  : "companies.detail.previousRejectionReason"
              )}
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              {company.rejection_reason}
            </Text>
          </div>
        )}
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">{t("companies.detail.documents")}</Heading>
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
              {t("companies.detail.noDocuments")}
            </Text>
          )}
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">{t("companies.detail.employees")}</Heading>
        </div>
        {company.employees.length ? (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  {t("companies.detail.email")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("companies.detail.name")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("companies.detail.role")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("companies.detail.spendLimits")}
                </Table.HeaderCell>
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
                        {t(
                          employee.role === "admin"
                            ? "companies.role.admin"
                            : "companies.role.member"
                        )}
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
              {t("companies.detail.noEmployees")}
            </Text>
          </div>
        )}
      </Container>

      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">{t("companies.scoring.title")}</Heading>
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
                {t("companies.scoring.setManualLimit")}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
        {scorecard?.exists ? (
          <div className="grid grid-cols-2 gap-y-3 px-6 py-4">
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              {t("companies.scoring.score")}
            </Text>
            <Text size="small">{scorecard.score} / 100</Text>
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              {t("companies.scoring.computedLimit")}
            </Text>
            <Text size="small">{formatTenge(scorecard.credit_limit)}</Text>
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              {t("companies.scoring.manualLimit")}
            </Text>
            <Text size="small">
              {scorecard.manual_limit != null
                ? formatTenge(scorecard.manual_limit)
                : "—"}
            </Text>
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              {t("companies.scoring.availableCredit")}
            </Text>
            <Text size="small">{formatTenge(scorecard.available_credit)}</Text>
            {scorecard.note && (
              <>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">
                  {t("companies.scoring.note")}
                </Text>
                <Text size="small">{scorecard.note}</Text>
              </>
            )}
          </div>
        ) : (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-fg-subtle">
              {t("companies.scoring.empty")}
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

// Юрлица заморожены на MVP (T10.9): адрес остаётся рабочим, но экран не
// монтируется, пока домен выключен, — открывший его видит объяснение.
const CompanyDetailRoute = () => {
  const { t } = useTranslation()
  const { data: featureFlags } = useFeatureFlags()

  if (!featureFlags.companies) {
    return (
      <FeatureDisabledNotice message={t("common.featureDisabled.companies")} />
    )
  }

  return <CompanyDetailPage />
}

export default CompanyDetailRoute
