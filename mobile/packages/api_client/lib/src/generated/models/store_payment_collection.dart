// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_payment.dart';
import 'store_payment_collection_status.dart';
import 'store_payment_provider.dart';
import 'store_payment_session.dart';

part 'store_payment_collection.g.dart';

/// The payment collection's details.
@JsonSerializable()
class StorePaymentCollection {
  const StorePaymentCollection({
    required this.id,
    required this.currencyCode,
    required this.amount,
    required this.status,
    required this.paymentProviders,
    this.authorizedAmount,
    this.capturedAmount,
    this.refundedAmount,
    this.completedAt,
    this.createdAt,
    this.updatedAt,
    this.metadata,
    this.paymentSessions,
    this.payments,
  });

  factory StorePaymentCollection.fromJson(Map<String, Object?> json) =>
      _$StorePaymentCollectionFromJson(json);

  /// The payment collection's ID.
  final String id;

  /// The payment collection's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The total amount to be paid.
  final num amount;

  /// The total authorized amount of the collection's payments.
  @JsonKey(name: 'authorized_amount')
  final num? authorizedAmount;

  /// The total captured amount of the collection's payments.
  @JsonKey(name: 'captured_amount')
  final num? capturedAmount;

  /// The total refunded amount of the collection's payments.
  @JsonKey(name: 'refunded_amount')
  final num? refundedAmount;

  /// The date the payment collection was completed.
  @JsonKey(name: 'completed_at')
  final DateTime? completedAt;

  /// The date the payment collection was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date the payment collection was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The payment collection's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The payment collection's status.
  final StorePaymentCollectionStatus status;

  /// The payment provider used to process the collection's payments and sessions.
  @JsonKey(name: 'payment_providers')
  final List<StorePaymentProvider> paymentProviders;

  /// The payment collection's payment sessions.
  @JsonKey(name: 'payment_sessions')
  final List<StorePaymentSession>? paymentSessions;

  /// The payment collection's payments.
  final List<BasePayment>? payments;

  Map<String, Object?> toJson() => _$StorePaymentCollectionToJson(this);
}
