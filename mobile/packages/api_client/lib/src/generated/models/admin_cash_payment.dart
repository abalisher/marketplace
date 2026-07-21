// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_cash_payment.g.dart';

@JsonSerializable()
class AdminCashPayment {
  const AdminCashPayment({
    required this.paymentCollectionId,
    required this.paymentSessionId,
    required this.status,
  });

  factory AdminCashPayment.fromJson(Map<String, Object?> json) =>
      _$AdminCashPaymentFromJson(json);

  @JsonKey(name: 'payment_collection_id')
  final String paymentCollectionId;
  @JsonKey(name: 'payment_session_id')
  final String paymentSessionId;

  /// Статус сессии ядра; pending — авторизуется при завершении корзины.
  final String status;

  Map<String, Object?> toJson() => _$AdminCashPaymentToJson(this);
}
