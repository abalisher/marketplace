// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_kaspi_payment_status.dart';

part 'store_kaspi_payment.g.dart';

@JsonSerializable()
class StoreKaspiPayment {
  const StoreKaspiPayment({
    required this.paymentCollectionId,
    required this.paymentSessionId,
    required this.status,
    this.kaspiState,
    this.qrPayload,
    this.paymentUrl,
  });

  factory StoreKaspiPayment.fromJson(Map<String, Object?> json) =>
      _$StoreKaspiPaymentFromJson(json);

  /// Payment collection ядра, привязанная к корзине.
  @JsonKey(name: 'payment_collection_id')
  final String paymentCollectionId;

  /// Платёжная сессия провайдера Kaspi.
  @JsonKey(name: 'payment_session_id')
  final String paymentSessionId;

  /// Статус сессии ядра. authorized/captured — оплачено, можно оформлять заказ.
  final StoreKaspiPaymentStatus status;

  /// Состояние инвойса Kaspi (pending|paid|canceled|error).
  @JsonKey(name: 'kaspi_state')
  final String? kaspiState;

  /// Данные для отрисовки QR-кода оплаты.
  @JsonKey(name: 'qr_payload')
  final String? qrPayload;

  /// Ссылка на оплату (редирект в приложение Kaspi).
  @JsonKey(name: 'payment_url')
  final String? paymentUrl;

  Map<String, Object?> toJson() => _$StoreKaspiPaymentToJson(this);
}
