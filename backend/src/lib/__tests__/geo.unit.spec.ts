import { dgisPointUrl, geoFromMetadata, geoPoint } from "../geo"

// Unit: точка адреса с карты 2ГИС хранится в metadata адреса и превращается в
// ссылку для продавца и водителя.
describe("точка адреса на карте", () => {
  it("принимает только пару настоящих координат", () => {
    expect(geoPoint(51.128207, 71.430411)).toEqual({ lat: 51.128207, lng: 71.430411 })
    expect(geoPoint("51.1282071234", "71.43")).toEqual({ lat: 51.128207, lng: 71.43 })
    expect(geoPoint(51.1, undefined)).toBeNull()
    expect(geoPoint(0, 0)).toBeNull()
    expect(geoPoint(95, 71)).toBeNull()
    expect(geoPoint(Number.NaN, 71)).toBeNull()
  })

  it("читает точку из metadata адреса", () => {
    expect(geoFromMetadata({ lat: 51.1, lng: 71.4, note: "x" })).toEqual({ lat: 51.1, lng: 71.4 })
    expect(geoFromMetadata({})).toBeNull()
    expect(geoFromMetadata(null)).toBeNull()
  })

  it("ссылка 2ГИС — долгота вперёд", () => {
    expect(dgisPointUrl({ lat: 51.128207, lng: 71.430411 })).toBe(
      "https://2gis.kz/astana/geo/71.430411%2C51.128207"
    )
  })
})
