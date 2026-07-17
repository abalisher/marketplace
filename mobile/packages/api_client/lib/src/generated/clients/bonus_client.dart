// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_apply_cart_bonus.dart';
import '../models/store_bonus_res.dart';
import '../models/store_cart_bonus_res.dart';

part 'bonus_client.g.dart';

@RestApi()
abstract class BonusClient {
  factory BonusClient(Dio dio, {String? baseUrl}) = _BonusClient;

  /// Get Bonus Account.
  ///
  /// Бонусный счёт текущего покупателя: баланс и история операций (новые первыми). У покупателя без операций — нулевой баланс и пустая история. Вывод бонусов деньгами запрещён — только оплата части заказа (POST /store/carts/{id}/bonus).
  @GET('/store/bonus')
  Future<StoreBonusRes> getBonus({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Query('limit') int? limit = 50,
    @Query('offset') int? offset = 0,
  });

  /// Apply Bonus to Cart.
  ///
  /// Применить бонусы к корзине как частичную оплату: сумма к оплате уменьшается, остаток оплачивается обычным способом (Kaspi). Повторный вызов заменяет сумму. Ограничения: не более max_spend_percent от суммы заказа и не более баланса счёта (иначе 400). Если оплата Kaspi уже была инициализирована, её сессия сбрасывается (сумма изменилась) — инициализировать оплату заново. 404 — корзина не принадлежит покупателю.
  @POST('/store/carts/{id}/bonus')
  Future<StoreCartBonusRes> postCartsIdBonus({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
    @Body() required StoreApplyCartBonus body,
  });

  /// Remove Bonus from Cart.
  ///
  /// Снять применённые бонусы с корзины (идемпотентен). Сумма к оплате восстанавливается; инициализированная оплата Kaspi сбрасывается — инициализировать заново. 404 — корзина не принадлежит покупателю.
  @DELETE('/store/carts/{id}/bonus')
  Future<StoreCartBonusRes> deleteCartsIdBonus({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
  });
}
