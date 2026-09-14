// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_init_kaspi_payment.dart';
import '../models/store_kaspi_payment_res.dart';

part 'payment_client.g.dart';

@RestApi()
abstract class PaymentClient {
  factory PaymentClient(Dio dio, {String? baseUrl}) = _PaymentClient;

  /// Initialize Kaspi Payment.
  ///
  /// Инициализация оплаты корзины через Kaspi: создаёт payment collection ядра на сумму корзины (если ещё нет) и платёжную сессию провайдера Kaspi — внутри создаётся инвойс, в ответе QR/ссылка для оплаты. Идемпотентен: повторный вызов возвращает существующую сессию. 404 — корзина не принадлежит покупателю.
  @POST('/store/carts/{id}/payment/kaspi')
  Future<StoreKaspiPaymentRes> postCartsIdPaymentKaspi({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
    @Body() StoreInitKaspiPayment? body,
  });

  /// Get Kaspi Payment Status.
  ///
  /// Статус оплаты Kaspi (polling): синхронизирует платёжную сессию с состоянием инвойса. Оплачено → status=authorized (можно оформлять заказ POST /store/orders). Гость допускается: владение ГОСТЕВОЙ корзиной подтверждает сам cart_id (капабилити-токен гостевого checkout'а); корзина покупателя доступна только ему. 400 — оплата для корзины не инициализирована; 404 — корзина не найдена/не принадлежит покупателю.
  @GET('/store/carts/{id}/payment/kaspi')
  Future<StoreKaspiPaymentRes> getCartsIdPaymentKaspi({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
  });
}
