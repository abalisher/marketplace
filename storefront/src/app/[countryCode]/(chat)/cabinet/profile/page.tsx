import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import { getServerMessages } from "@lib/i18n/server"
import AddressBook from "@modules/account/components/address-book"
import ProfileName from "@modules/account/components/profile-name"
import ProfilePhone from "@modules/account/components/profile-phone"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Profile",
  description: "Your name, phone and delivery addresses.",
}

// Профиль кабинета: ФИО, телефон и адреса доставки — ровно то, что ассистент
// подставляет при оформлении (T10.8), и ровно то, что покупатель приходит сюда
// поправить. Email не показываем: с телефонным входом (T10.7) на учётке лежит
// служебный адрес `<номер>@phone.invalid`, и показывать его покупателю нельзя.
// Формы переиспользуем из аккаунта — вторая копия тех же полей разошлась бы.
export default async function CabinetProfilePage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const [customer, region, m] = await Promise.all([
    retrieveCustomer().catch(() => null),
    getRegion(countryCode),
    getServerMessages(),
  ])

  if (!customer || !region) {
    notFound()
  }

  return (
    <section className="flex flex-col gap-6" data-testid="cabinet-profile">
      <div className="flex flex-col gap-1">
        <h1 className="text-heading-large text-ink">
          {m.cabinet.profile.title}
        </h1>
        <p className="text-body-large text-ink-secondary">
          {m.cabinet.profile.subtitle}
        </p>
      </div>

      <div
        className="flex flex-col rounded-card border border-line bg-surface px-4 pt-3"
        data-testid="cabinet-profile-personal"
      >
        <h2 className="text-title-medium text-ink">
          {m.cabinet.profile.personal}
        </h2>
        <div className="flex flex-col divide-y divide-line">
          <ProfileName customer={customer} />
          <ProfilePhone customer={customer} />
        </div>
      </div>

      <AddressBook
        customer={customer}
        region={region}
        title={m.cabinet.profile.addresses}
        emptyText={m.cabinet.profile.emptyAddresses}
      />
    </section>
  )
}
