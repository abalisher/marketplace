import { model } from "@medusajs/framework/utils"

// GPS-пинг водителя — поток координат. trip_id/driver_id — опазные ссылки-
// колонки (не belongsTo: высокочастотный append-поток, связь по колонке
// достаточна). Отдаём ПОСЛЕДНЮЮ позицию + трек рейса обычным polling'ом (GET);
// realtime-канал (SSE/WS) отложен за MVP (docs/modules/logistics.md).
const GpsPing = model.define("gps_ping", {
  id: model.id({ prefix: "gps" }).primaryKey(),
  trip_id: model.text(),
  driver_id: model.text(),
  lat: model.float(),
  lng: model.float(),
  recorded_at: model.dateTime(),
})

export default GpsPing
