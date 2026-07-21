// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_counter_cart_payment_session.g.dart';

@JsonSerializable()
class AdminCounterCartPaymentSession {
  const AdminCounterCartPaymentSession({
    required this.id,
    required this.providerId,
    required this.status,
  });

  factory AdminCounterCartPaymentSession.fromJson(Map<String, Object?> json) =>
      _$AdminCounterCartPaymentSessionFromJson(json);

  final String id;
  @JsonKey(name: 'provider_id')
  final String providerId;
  final String status;

  Map<String, Object?> toJson() => _$AdminCounterCartPaymentSessionToJson(this);
}
