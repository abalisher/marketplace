// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_assistant_payment_provider.dart';
import 'store_assistant_payment_type.dart';

part 'store_assistant_payment.g.dart';

@JsonSerializable()
class StoreAssistantPayment {
  const StoreAssistantPayment({
    required this.type,
    required this.provider,
    required this.status,
    required this.paid,
    required this.amount,
    required this.currency,
    required this.qrPayload,
    required this.paymentUrl,
  });

  factory StoreAssistantPayment.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantPaymentFromJson(json);

  final StoreAssistantPaymentType type;
  final StoreAssistantPaymentProvider provider;
  final String status;
  final bool paid;

  /// Сумма к оплате в тенге (итог корзины на момент счёта).
  final num? amount;
  final String currency;
  @JsonKey(name: 'qr_payload')
  final String? qrPayload;
  @JsonKey(name: 'payment_url')
  final String? paymentUrl;

  Map<String, Object?> toJson() => _$StoreAssistantPaymentToJson(this);
}
