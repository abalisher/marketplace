// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_initialize_payment_session.g.dart';

/// The payment session's details.
@JsonSerializable()
class StoreInitializePaymentSession {
  const StoreInitializePaymentSession({required this.providerId, this.data});

  factory StoreInitializePaymentSession.fromJson(Map<String, Object?> json) =>
      _$StoreInitializePaymentSessionFromJson(json);

  /// The ID of the payment provider the customer chose.
  @JsonKey(name: 'provider_id')
  final String providerId;

  /// Any data necessary for the payment provider to process the payment.
  final dynamic data;

  Map<String, Object?> toJson() => _$StoreInitializePaymentSessionToJson(this);
}
