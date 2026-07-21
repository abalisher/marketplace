// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/admin_add_counter_cart_item.dart';
import '../models/admin_cash_payment_res.dart';
import '../models/admin_counter_cart_res.dart';
import '../models/admin_create_counter_cart.dart';
import '../models/admin_update_counter_cart_item.dart';
import '../models/store_init_kaspi_payment.dart';
import '../models/store_kaspi_payment_res.dart';

part 'counter_carts_client.g.dart';

@RestApi()
abstract class CounterCartsClient {
  factory CounterCartsClient(Dio dio, {String? baseUrl}) = _CounterCartsClient;

  /// Create POS Cart.
  ///
  /// POS-корзина продавца (продажа у окна склада): создаётся с контекстом склада (регион, канал продаж, адрес) и pickup-опцией 0 ₸ этого склада. Дальше — line-items, оплата (payment/kaspi | payment/cash) и POST /admin/counter-orders.
  @POST('/admin/counter-carts')
  Future<AdminCounterCartRes> postCounterCarts({
    @Body() required AdminCreateCounterCart body,
  });

  /// Get POS Cart.
  ///
  /// Текущее состояние POS-корзины (позиции, тоталы, платёжные сессии). Обычная покупательская корзина по этому роуту недоступна (404).
  @GET('/admin/counter-carts/{id}')
  Future<AdminCounterCartRes> getCounterCartsId({
    @Path('id') required String id,
  });

  /// Add POS Cart Line Item.
  ///
  /// Добавить позицию в POS-корзину. Повторное добавление того же варианта суммируется ядром.
  @POST('/admin/counter-carts/{id}/line-items')
  Future<AdminCounterCartRes> postCounterCartsIdLineItems({
    @Path('id') required String id,
    @Body() required AdminAddCounterCartItem body,
  });

  /// Update POS Cart Line Item.
  ///
  /// Сменить количество позиции POS-корзины.
  @POST('/admin/counter-carts/{id}/line-items/{line_id}')
  Future<AdminCounterCartRes> postCounterCartsIdLineItemsLineId({
    @Path('id') required String id,
    @Path('line_id') required String lineId,
    @Body() required AdminUpdateCounterCartItem body,
  });

  /// Remove POS Cart Line Item.
  ///
  /// Убрать позицию из POS-корзины.
  @DELETE('/admin/counter-carts/{id}/line-items/{line_id}')
  Future<AdminCounterCartRes> deleteCounterCartsIdLineItemsLineId({
    @Path('id') required String id,
    @Path('line_id') required String lineId,
  });

  /// Init POS Cart Kaspi Payment.
  ///
  /// Инициализация Kaspi-оплаты POS-корзины с partner-стороны: payment collection + сессия Kaspi (инвойс + QR для показа покупателю). Идемпотентен. Ответ — как у store-варианта.
  @POST('/admin/counter-carts/{id}/payment/kaspi')
  Future<StoreKaspiPaymentRes> postCounterCartsIdPaymentKaspi({
    @Path('id') required String id,
    @Body() required StoreInitKaspiPayment body,
  });

  /// Get POS Cart Kaspi Payment Status.
  ///
  /// Статус Kaspi-оплаты POS-корзины (polling): синхронизирует сессию с инвойсом; оплачено → authorized (можно пробивать POST /admin/counter-orders).
  @GET('/admin/counter-carts/{id}/payment/kaspi')
  Future<StoreKaspiPaymentRes> getCounterCartsIdPaymentKaspi({
    @Path('id') required String id,
  });

  /// Init POS Cart Cash Payment.
  ///
  /// Оплата наличными/переводом у окна: сессия pp_system_default (авторизуется при завершении корзины, деньги продавец принимает физически). Идемпотентен; вызов после Kaspi-инициализации переключает способ оплаты.
  @POST('/admin/counter-carts/{id}/payment/cash')
  Future<AdminCashPaymentRes> postCounterCartsIdPaymentCash({
    @Path('id') required String id,
  });
}
