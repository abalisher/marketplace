// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/admin_cancel_order.dart';
import '../models/admin_complete_assembly.dart';
import '../models/admin_deliver_order.dart';
import '../models/admin_order_card_res.dart';
import '../models/admin_order_documents_export_res.dart';
import '../models/admin_order_documents_res.dart';
import '../models/admin_order_fulfillment_res.dart';
import '../models/admin_order_lifecycle_list_res.dart';
import '../models/admin_order_lifecycle_res.dart';
import '../models/admin_order_reschedule_options_res.dart';
import '../models/admin_order_slot_res.dart';
import '../models/admin_order_status_res.dart';
import '../models/admin_reschedule_order.dart';
import '../models/admin_ship_order.dart';
import '../models/delivery_method.dart';
import '../models/get_store_orders_response.dart';
import '../models/order.dart';
import '../models/store_accept_order_transfer.dart';
import '../models/store_cancel_order.dart';
import '../models/store_decline_order_transfer.dart';
import '../models/store_my_order_lifecycles_res.dart';
import '../models/store_order_documents_res.dart';
import '../models/store_order_lifecycle_res.dart';
import '../models/store_order_response.dart';
import '../models/store_order_status_res.dart';
import '../models/store_place_order.dart';
import '../models/store_place_order_res.dart';
import '../models/store_request_order_transfer.dart';

part 'orders_client.g.dart';

@RestApi()
abstract class OrdersClient {
  factory OrdersClient(Dio dio, {String? baseUrl}) = _OrdersClient;

  /// List Logged-in Customer's Orders.
  ///
  /// Retrieve the orders of the logged-in customer. The orders can be filtered by fields such as `id`. The orders can also be sorted or paginated.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [offset] - The number of items to skip when retrieving a list.
  ///
  /// [limit] - Limit the number of items returned in the list.
  ///
  /// [order] - The field to sort the data by. By default, the sort order is ascending. To change the order to descending, prefix the field name with `-`.
  ///
  /// [withDeleted] - Whether to include deleted records in the result.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/orders')
  Future<GetStoreOrdersResponse> getOrders({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('offset') num? offset,
    @Query('limit') num? limit,
    @Query('order') String? order,
    @Query('id') dynamic id,
    @Query(r'$and') List<dynamic>? and,
    @Query(r'$or') List<dynamic>? or,
    @Query('status') dynamic status,
    @Query('with_deleted') bool? withDeleted,
    @Query('locale') String? locale,
  });

  /// Place an Order.
  ///
  /// Оформление заказа текущим покупателем: завершает его корзину (ядровый completeCart + резерв остатков) и заводит жизненный цикл заказа (статус new). Список и детали заказов покупателя обслуживает ядро (GET /store/orders[/{id}]); бизнес-статус ТЗ — GET /store/orders/{id}/lifecycle.
  @POST('/store/orders')
  Future<StorePlaceOrderRes> postOrders({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StorePlaceOrder body,
  });

  /// Get an Order.
  ///
  /// Retrieve an order by its ID. You can expand the order's relations or select the fields that should be returned. This API route doesn't require customer authentication, so that guest customers can view their order confirmation page after placing an order. To restrict access to this API route, refer to the [Restrict Order Retrieval guide](https://docs.medusajs.com/resources/commerce-modules/order/secure-order-retrieval).
  ///
  /// [id] - The order's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/orders/{id}')
  Future<StoreOrderResponse> getOrdersId({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Accept Order Transfer.
  ///
  /// Accept an order to be transfered to a customer's account, which was specified when the transfer request was created. The transfer is requested previously either by the customer using the [Request Order Transfer Store API route](https://docs.medusajs.com/api/store#orders_postordersidtransferrequest), or by the admin using the [Request Order Transfer Admin API route](https://docs.medusajs.com/api/admin#orders_postordersidtransferrequest).
  ///
  /// [id] - The order's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data.
  /// if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields.
  /// without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/orders/{id}/transfer/accept')
  Future<StoreOrderResponse> postOrdersIdTransferAccept({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreAcceptOrderTransfer body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Cancel Order Transfer.
  ///
  /// Cancel an order transfer that the logged-in customer previously requested using the [Request Order Transfer](https://docs.medusajs.com/api/store#orders_postordersidtransferrequest) API route.
  ///
  /// [id] - The order's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data.
  /// if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields.
  /// without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/orders/{id}/transfer/cancel')
  Future<StoreOrderResponse> postOrdersIdTransferCancel({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Decline Order Transfer.
  ///
  /// Decline an order transfer previously requested, typically by the admin user using the [Request Order Transfer Admin API route](https://docs.medusajs.com/api/admin#orders_postordersidtransferrequest).
  ///
  /// [id] - The order's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data.
  /// if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields.
  /// without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/orders/{id}/transfer/decline')
  Future<StoreOrderResponse> postOrdersIdTransferDecline({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreDeclineOrderTransfer body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Request Order Transfer.
  ///
  /// Request an order to be transfered to the logged-in customer's account. The transfer is confirmed using the [Accept Order Transfer](https://docs.medusajs.com/api/store#orders_postordersidtransferaccept) API route.
  ///
  /// [id] - The order's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data.
  /// if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields.
  /// without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/orders/{id}/transfer/request')
  Future<StoreOrderResponse> postOrdersIdTransferRequest({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreRequestOrderTransfer body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// List Order Lifecycle Queue.
  ///
  /// Очередь заказов по бизнес-статусу ТЗ. Отдельный ресурс, а не переопределение ядрового GET /admin/orders. Фильтр по статусу (одно значение или несколько), способу получения, поиск по номеру/почте, сортировка (дефолт — FIFO по created_at), пагинация. Каждая запись несёт заказ в виде готовой строки экрана «Заказы» (плательщик, число позиций, итог, оплата, адрес), а ответ — счётчики по статусам для чипов-фильтров.
  ///
  /// [status] - Фильтр по бизнес-статусу заказа. Одно значение или несколько через запятую («new,confirmed»). Описан ПРОСТОЙ строкой по той же причине, что и статус задания сборки: из oneOf кодогенератор Dart делает dynamic и зовёт toJson() (см. assembly-tasks.oas.json).
  ///
  /// [deliveryMethod] - Фильтр по способу получения заказа.
  ///
  /// [q] - Поиск: номер заказа (display_id, можно с «#») или email покупателя (частичное совпадение).
  ///
  /// [order] - Поле сортировки (префикс «-» — по убыванию).
  @GET('/admin/order-lifecycles')
  Future<AdminOrderLifecycleListRes> getOrderLifecycles({
    @Query('order') Order? order = Order.createdAt,
    @Query('limit') int? limit = 20,
    @Query('offset') int? offset = 0,
    @Query('status') String? status,
    @Query('delivery_method') DeliveryMethod? deliveryMethod,
    @Query('q') String? q,
  });

  /// Get Order Lifecycle Status (Admin).
  ///
  /// Бизнес-статус заказа и полный лог переходов. 404 — заказ не найден.
  @GET('/admin/orders/{id}/lifecycle')
  Future<AdminOrderLifecycleRes> getOrdersIdLifecycleAdmin({
    @Path('id') required String id,
  });

  /// Get Order Card (Admin).
  ///
  /// Карточка заказа для панели продавца одним ответом: статус и лог переходов, покупатель с лимитом отсрочки, позиции с итогами, доставка, документы и цели переходов. 404 — заказ не найден.
  @GET('/admin/orders/{id}/lifecycle/card')
  Future<AdminOrderCardRes> getOrdersIdLifecycleCardAdmin({
    @Path('id') required String id,
  });

  /// Confirm Order.
  ///
  /// Подтверждение заявки менеджером: new → confirmed.
  @POST('/admin/orders/{id}/lifecycle/confirm')
  Future<AdminOrderStatusRes> postOrdersIdLifecycleConfirm({
    @Path('id') required String id,
  });

  /// Start Order Assembly.
  ///
  /// Кладовщик начал комплектацию: confirmed → assembling.
  @POST('/admin/orders/{id}/lifecycle/start-assembly')
  Future<AdminOrderStatusRes> postOrdersIdLifecycleStartAssembly({
    @Path('id') required String id,
  });

  /// Complete Order Assembly.
  ///
  /// Сборка (в т.ч. частичная): ядровый createOrderFulfillment фиксирует физику, статус синхронизируется (полная → assembled, частичная → partially_assembled).
  @POST('/admin/orders/{id}/lifecycle/complete-assembly')
  Future<AdminOrderFulfillmentRes> postOrdersIdLifecycleCompleteAssembly({
    @Path('id') required String id,
    @Body() required AdminCompleteAssembly body,
  });

  /// Ship Order.
  ///
  /// Отгрузка: ядровый createOrderShipment (fulfillment → shipped), статус → in_delivery.
  @POST('/admin/orders/{id}/lifecycle/ship')
  Future<AdminOrderStatusRes> postOrdersIdLifecycleShip({
    @Path('id') required String id,
    @Body() required AdminShipOrder body,
  });

  /// Deliver Order.
  ///
  /// Вручение: статус → delivered (обязателен верный код получения от покупателя), затем ядровый markOrderFulfillmentAsDelivered.
  @POST('/admin/orders/{id}/lifecycle/deliver')
  Future<AdminOrderStatusRes> postOrdersIdLifecycleDeliver({
    @Path('id') required String id,
    @Body() required AdminDeliverOrder body,
  });

  /// Close Order.
  ///
  /// Закрытие после окна возврата: ядровый completeOrder (order.status → completed), статус → closed.
  @POST('/admin/orders/{id}/lifecycle/close')
  Future<AdminOrderStatusRes> postOrdersIdLifecycleClose({
    @Path('id') required String id,
  });

  /// List Order Documents (Admin).
  ///
  /// Все документы-основания заказа (счёт/накладная/АВР), все версии, новые сверху. Namespace /documents не перекрывает ядровые /admin/orders/{id}/{cancel,complete}.
  @GET('/admin/orders/{id}/documents')
  Future<AdminOrderDocumentsRes> getOrdersIdDocuments({
    @Path('id') required String id,
  });

  /// Export Order Source Data (1C).
  ///
  /// Выгрузка исходных данных заказа для 1С/бухгалтерии: снапшоты текущих версий документов (реквизиты продавца, позиции, суммы деньгами/бонусами раздельно на момент выпуска). Официальные ЭСФ/АВР бухгалтер оформляет вручную; платформа отдаёт исходные данные.
  @GET('/admin/orders/{id}/documents/export')
  Future<AdminOrderDocumentsExportRes> getOrdersIdDocumentsExport({
    @Path('id') required String id,
  });

  /// Cancel Order (Admin).
  ///
  /// Отмена админом: ядровый cancelOrder (order.status → canceled), статус → canceled. Под /lifecycle/, чтобы не перекрывать ядровый POST /admin/orders/{id}/cancel.
  @POST('/admin/orders/{id}/lifecycle/cancel')
  Future<AdminOrderStatusRes> postOrdersIdLifecycleCancel({
    @Path('id') required String id,
    @Body() AdminCancelOrder? body,
  });

  /// List Delivery Slots For Reschedule (Admin).
  ///
  /// Окна приезда, которые заказу ещё можно поставить, и признак, можно ли его двигать (T5.6b). Доступность окна (запас на сборку, горизонт недели) считает домен слота — панель получает коды и подписывает их сама.
  @GET('/admin/orders/{id}/lifecycle/reschedule')
  Future<AdminOrderRescheduleOptionsRes> getOrdersIdLifecycleReschedule({
    @Path('id') required String id,
  });

  /// Reschedule Order Delivery (Admin).
  ///
  /// Перенос доставки на другое окно (T5.6b): продавец двигает слот по звонку покупателя. Статус заказа не меняется; «кто и почему подвинул» пишется в лог заказа записью kind=slot.
  @POST('/admin/orders/{id}/lifecycle/reschedule')
  Future<AdminOrderSlotRes> postOrdersIdLifecycleReschedule({
    @Path('id') required String id,
    @Body() required AdminRescheduleOrder body,
  });

  /// List My Order Lifecycles.
  ///
  /// Бизнес-стадии всех заказов текущего покупателя одним запросом (кабинет клиента): ядровый GET /store/orders не знает про order-lifecycle, а список заказов показывает стадию. Заказ без заведённого цикла в ответ не попадает.
  @GET('/store/order-lifecycles')
  Future<StoreMyOrderLifecyclesRes> storeListMyOrderLifecycles({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
  });

  /// Get Order Lifecycle Status.
  ///
  /// Бизнес-статус заказа (ТЗ) и лог переходов для текущего покупателя. Единое поле статуса вместо склейки трёх ядровых. 404 — заказ не принадлежит покупателю или не найден.
  @GET('/store/orders/{id}/lifecycle')
  Future<StoreOrderLifecycleRes> getOrdersIdLifecycle({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
  });

  /// List My Order Documents.
  ///
  /// Документы-основания заказа (счёт/накладная/АВР) текущих версий, видимые покупателю. Скачивание — по file_url (PDF в File Module). 404 — заказ не принадлежит покупателю.
  @GET('/store/orders/{id}/documents')
  Future<StoreOrderDocumentsRes> storeGetOrderDocuments({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
  });

  /// Cancel My Order.
  ///
  /// Покупатель отменяет свой заказ. Разрешено стейт-машиной только до отгрузки (new..assembled → canceled); ядро дополнительно откажет при наличии неотменённых fulfillment'ов. 404 — заказ не принадлежит покупателю.
  @POST('/store/orders/{id}/cancel')
  Future<StoreOrderStatusRes> postOrdersIdCancel({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
    @Body() StoreCancelOrder? body,
  });
}
