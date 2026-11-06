"use client"

import { MapPoint } from "@lib/maps/dgis"
import AddressMapPicker from "@modules/common/components/address-map-picker"
import { RefObject, useState } from "react"

// Карта в форме адреса профиля: выбранная точка подставляет улицу и дом в поле
// «Адрес» (и город, если в форме есть такое поле), а координаты уходят скрытыми полями lat/lng — серверное
// действие кладёт их в metadata адреса (customer.ts). Поля формы остаются
// обычными: адрес можно уточнить текстом.
const AddressMapFields = ({
  address1Ref,
  cityRef,
  initial,
}: {
  address1Ref: RefObject<HTMLInputElement | null>
  cityRef?: RefObject<HTMLInputElement | null>
  initial?: MapPoint | null
}) => {
  const [point, setPoint] = useState<MapPoint | null>(null)

  return (
    <>
      <AddressMapPicker
        initial={initial}
        onPick={(picked) => {
          setPoint({ lat: picked.lat, lng: picked.lng })
          if (address1Ref.current) {
            address1Ref.current.value = picked.address_1
          }
          if (cityRef?.current && !cityRef.current.value) {
            cityRef.current.value = "Астана"
          }
        }}
        onPoint={setPoint}
      />
      {point && (
        <>
          <input type="hidden" name="lat" value={point.lat} />
          <input type="hidden" name="lng" value={point.lng} />
        </>
      )}
    </>
  )
}

export default AddressMapFields
