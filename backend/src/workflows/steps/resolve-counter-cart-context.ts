import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

export type ResolveCounterCartContextStepInput = {
  location_id: string
  region_id?: string
}

export type CounterCartContext = {
  region_id: string
  currency_code: string
  sales_channel_id: string
  shipping_option_id: string
  shipping_address: {
    address_1: string | undefined
    city: string | undefined
    country_code: string
    postal_code: string | undefined
  }
}

// Контекст POS-корзины по складу продавца: регион (явный или единственный),
// канал продаж склада, pickup-опция склада (completeCart требует shipping
// method — у продажи с окна это самовывоз 0 ₸ с этого же склада) и адрес склада
// как shipping_address корзины (заказ у окна «доставляется» на склад).
// Только чтение — компенсация не нужна.
export const resolveCounterCartContextStep = createStep(
  "resolve-counter-cart-context",
  async (input: ResolveCounterCartContextStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: locations } = await query.graph({
      entity: "stock_location",
      fields: [
        "id",
        "name",
        "address.address_1",
        "address.city",
        "address.country_code",
        "address.postal_code",
        "sales_channels.id",
        "fulfillment_sets.type",
        "fulfillment_sets.service_zones.shipping_options.id",
      ],
      filters: { id: input.location_id },
    })
    const location = locations[0] as
      | {
          name: string
          address?: {
            address_1?: string | null
            city?: string | null
            country_code?: string | null
            postal_code?: string | null
          } | null
          sales_channels?: ({ id: string } | null)[] | null
          fulfillment_sets?:
            | ({
                type: string
                service_zones?:
                  | ({
                      shipping_options?: ({ id: string } | null)[] | null
                    } | null)[]
                  | null
              } | null)[]
            | null
        }
      | undefined
    if (!location) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Stock location ${input.location_id} not found`
      )
    }

    // Pickup-опция склада: первый shipping option из fulfillment-набора типа
    // pickup (сид создаёт по одному набору «Pickup — <склад>» на склад).
    const pickupOptionId = (location.fulfillment_sets ?? [])
      .filter((set) => set?.type === "pickup")
      .flatMap((set) => set?.service_zones ?? [])
      .flatMap((zone) => zone?.shipping_options ?? [])
      .map((option) => option?.id)
      .find(Boolean)
    if (!pickupOptionId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Stock location ${input.location_id} has no pickup shipping option (fulfillment set of type "pickup"). Seed delivery for the location first.`
      )
    }

    // Канал продаж — от склада (инвентарь корзины валидируется по каналу):
    // предпочитаем дефолтный канал магазина, если склад к нему привязан.
    const channelIds = (location.sales_channels ?? [])
      .map((channel) => channel?.id)
      .filter(Boolean) as string[]
    if (!channelIds.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Stock location ${input.location_id} is not linked to any sales channel`
      )
    }
    const storeService = container.resolve(Modules.STORE)
    const [store] = await storeService.listStores({}, { take: 1 })
    const defaultChannelId = store?.default_sales_channel_id
    const salesChannelId =
      defaultChannelId && channelIds.includes(defaultChannelId)
        ? defaultChannelId
        : channelIds[0]

    // Регион: явный из запроса или единственный в системе; при нескольких
    // регионах partner-клиент обязан прислать region_id.
    const regionService = container.resolve(Modules.REGION)
    let region
    if (input.region_id) {
      region = await regionService.retrieveRegion(input.region_id, {
        relations: ["countries"],
      })
    } else {
      const regions = await regionService.listRegions(
        {},
        { relations: ["countries"], take: 2 }
      )
      if (regions.length !== 1) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Multiple regions configured — pass region_id explicitly"
        )
      }
      region = regions[0]
    }

    const countryCode =
      location.address?.country_code ?? region.countries?.[0]?.iso_2
    if (!countryCode) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Cannot resolve country for POS cart: neither stock location ${input.location_id} address nor region ${region.id} has one`
      )
    }

    return new StepResponse({
      region_id: region.id,
      currency_code: region.currency_code,
      sales_channel_id: salesChannelId,
      shipping_option_id: pickupOptionId,
      shipping_address: {
        address_1: location.address?.address_1 ?? location.name,
        city: location.address?.city ?? undefined,
        country_code: countryCode,
        postal_code: location.address?.postal_code ?? undefined,
      },
    } satisfies CounterCartContext)
  }
)
