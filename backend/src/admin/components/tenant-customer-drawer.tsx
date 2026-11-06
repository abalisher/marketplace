import { Button, Drawer, Input, Label, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { sdk } from "../lib/sdk"

type TenantCustomerDrawerProps = {
  open: boolean
  onClose: () => void
}

type CreateBody = {
  phone: string
  first_name: string
  last_name?: string
  address_1?: string
  city?: string
}

// Новый клиент компании (POST /admin/tenant-customers): телефон — ключ входа
// клиента по SMS, ФИО и адрес подставятся ему при первом заказе. Номер, уже
// известный площадке, просто добавляется в клиенты компании — экран это не
// различает (так задумано, см. lib/tenants/tenant-customer.ts).
const TenantCustomerDrawer = ({ open, onClose }: TenantCustomerDrawerProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [phone, setPhone] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")

  useEffect(() => {
    if (open) {
      setPhone("")
      setFirstName("")
      setLastName("")
      setAddress("")
      setCity("")
    }
  }, [open])

  const createMutation = useMutation({
    mutationFn: (body: CreateBody) =>
      sdk.client.fetch<{ customer: { id: string } }>("/admin/tenant-customers", {
        method: "POST",
        body,
      }),
    onSuccess: ({ customer }) => {
      toast.success(t("tenantCustomers.toast"))
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      onClose()
      navigate(`/customers/${customer.id}`)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const valid = phone.replace(/\D+/g, "").length >= 10 && !!firstName.trim()

  const save = () => {
    const optional = (value: string) => value.trim() || undefined
    createMutation.mutate({
      phone: phone.trim(),
      first_name: firstName.trim(),
      last_name: optional(lastName),
      address_1: optional(address),
      city: optional(city),
    })
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{t("tenantCustomers.title")}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          <Text size="small" className="text-ui-fg-subtle">
            {t("tenantCustomers.hint")}
          </Text>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="tenant-customer-phone">
              {t("tenantCustomers.phone")}
            </Label>
            <Input
              id="tenant-customer-phone"
              type="tel"
              autoComplete="off"
              placeholder="+7 7XX XXX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="tenant-customer-first-name">
              {t("tenantCustomers.firstName")}
            </Label>
            <Input
              id="tenant-customer-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="tenant-customer-last-name">
              {t("tenantCustomers.lastName")}
            </Label>
            <Input
              id="tenant-customer-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="tenant-customer-address">
              {t("tenantCustomers.address")}
            </Label>
            <Input
              id="tenant-customer-address"
              placeholder={t("tenantCustomers.addressPlaceholder")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="tenant-customer-city">
              {t("tenantCustomers.city")}
            </Label>
            <Input
              id="tenant-customer-city"
              placeholder={t("tenantCustomers.cityPlaceholder")}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              {t("common.cancel")}
            </Button>
          </Drawer.Close>
          <Button
            size="small"
            disabled={!valid}
            isLoading={createMutation.isPending}
            onClick={save}
          >
            {t("common.create")}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export default TenantCustomerDrawer
