// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_payment.dart';
import 'store_payment_session_status.dart';

part 'store_payment_session.g.dart';

/// The payment session's details.
@JsonSerializable()
class StorePaymentSession {
  const StorePaymentSession({
    required this.id,
    required this.amount,
    required this.currencyCode,
    required this.providerId,
    required this.data,
    required this.status,
    this.context,
    this.authorizedAt,
    this.paymentCollection,
    this.payment,
  });

  factory StorePaymentSession.fromJson(Map<String, Object?> json) =>
      _$StorePaymentSessionFromJson(json);

  /// The payment session's ID.
  final String id;

  /// The payment session's amount.
  final num amount;

  /// The payment session's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The ID of the payment provider processing this session.
  @JsonKey(name: 'provider_id')
  final String providerId;

  /// The payment session's data, useful for the payment provider processing the payment.
  final dynamic data;

  /// The context around the payment, such as the customer's details.
  final dynamic context;

  /// The payment session's status.
  final StorePaymentSessionStatus status;

  /// The date the payment session was authorized.
  @JsonKey(name: 'authorized_at')
  final DateTime? authorizedAt;
  @JsonKey(name: 'payment_collection')
  final dynamic paymentCollection;
  final BasePayment? payment;

  Map<String, Object?> toJson() => _$StorePaymentSessionToJson(this);
}
