// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/admin_add_trip_stop.dart';
import '../models/admin_create_trip.dart';
import '../models/admin_delete_res.dart';
import '../models/admin_gps_ping_res.dart';
import '../models/admin_gps_position_res.dart';
import '../models/admin_record_gps_ping.dart';
import '../models/admin_set_trip_status.dart';
import '../models/admin_set_trip_stop_status.dart';
import '../models/admin_tariff_list_res.dart';
import '../models/admin_tariff_res.dart';
import '../models/admin_trip_detail_res.dart';
import '../models/admin_trip_list_res.dart';
import '../models/admin_trip_res.dart';
import '../models/admin_trip_stop_res.dart';
import '../models/admin_upsert_delivery_tariff.dart';

part 'logistics_client.g.dart';

@RestApi()
abstract class LogisticsClient {
  factory LogisticsClient(Dio dio, {String? baseUrl}) = _LogisticsClient;

  /// List Trips.
  ///
  /// Список рейсов водителей (новые сверху). Исполнительный слой доставки поверх order-lifecycle; водитель работает из partner-app под admin-аутентификацией.
  @GET('/admin/logistics/trips')
  Future<AdminTripListRes> getLogisticsTrips();

  /// Create Trip.
  ///
  /// Создать рейс (planned): водитель + склад загрузки.
  @POST('/admin/logistics/trips')
  Future<AdminTripRes> postLogisticsTrips({
    @Body() required AdminCreateTrip body,
  });

  /// Get Trip.
  ///
  /// Рейс + его точки (сортировка по sequence).
  @GET('/admin/logistics/trips/{id}')
  Future<AdminTripDetailRes> getLogisticsTripsId({
    @Path('id') required String id,
  });

  /// Set Trip Status.
  ///
  /// Перевод рейса по стейт-машине (planned→loading→en_route→completed; отмена из незавершённого). Недопустимый переход → 400.
  @POST('/admin/logistics/trips/{id}/status')
  Future<AdminTripRes> postLogisticsTripsIdStatus({
    @Path('id') required String id,
    @Body() required AdminSetTripStatus body,
  });

  /// Add Trip Stop.
  ///
  /// Добавить точку рейса (выдача заказа или забор возврата). Порядок точек — вручную (sequence).
  @POST('/admin/logistics/trips/{id}/stops')
  Future<AdminTripStopRes> postLogisticsTripsIdStops({
    @Path('id') required String id,
    @Body() required AdminAddTripStop body,
  });

  /// Set Trip Stop Status.
  ///
  /// Перевод точки по стейт-машине (pending→arrived→done; failed из pending/arrived) + proof (фото/подпись выдачи) / checklist (осмотр возврата). Для выдачи delivery-точки (done) с fulfillment_id — триггерит deliver-order (заказ → delivered по коду покупателя). Недопустимый переход / неверный код → 400.
  @POST('/admin/logistics/trips/{id}/stops/{stop_id}/status')
  Future<AdminTripStopRes> postLogisticsTripsIdStopsStopIdStatus({
    @Path('id') required String id,
    @Path('stop_id') required String stopId,
    @Body() required AdminSetTripStopStatus body,
  });

  /// Record GPS Ping.
  ///
  /// Принять GPS-пинг водителя (append в поток).
  @POST('/admin/logistics/trips/{id}/gps')
  Future<AdminGpsPingRes> postLogisticsTripsIdGps({
    @Path('id') required String id,
    @Body() required AdminRecordGpsPing body,
  });

  /// Get Latest Position.
  ///
  /// Последняя известная позиция по рейсу (polling; realtime-канал отложен за MVP). Нет пингов → position: null.
  @GET('/admin/logistics/trips/{id}/gps')
  Future<AdminGpsPositionRes> getLogisticsTripsIdGps({
    @Path('id') required String id,
  });

  /// List Delivery Tariffs.
  ///
  /// Администрируемая сетка тарифов доставки (зона + база + ставки за вес/объём).
  @GET('/admin/logistics/tariffs')
  Future<AdminTariffListRes> getLogisticsTariffs();

  /// Upsert Delivery Tariff.
  ///
  /// Создать/править тариф доставки (upsert по zone). Цены в минорных единицах (тенге).
  @POST('/admin/logistics/tariffs')
  Future<AdminTariffRes> postLogisticsTariffs({
    @Body() required AdminUpsertDeliveryTariff body,
  });

  /// Delete Delivery Tariff.
  ///
  /// Удалить тариф доставки. Несуществующий id → 404.
  @DELETE('/admin/logistics/tariffs/{id}')
  Future<AdminDeleteRes> deleteLogisticsTariffsId({
    @Path('id') required String id,
  });
}
