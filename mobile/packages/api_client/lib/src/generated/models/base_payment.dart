// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_capture.dart';
import 'base_refund.dart';

part 'base_payment.g.dart';

/// The payment's details.
@JsonSerializable()
class BasePayment {
  const BasePayment({
    required this.id,
    required this.amount,
    required this.currencyCode,
    required this.providerId,
    this.authorizedAmount,
    this.data,
    this.createdAt,
    this.updatedAt,
    this.capturedAt,
    this.canceledAt,
    this.capturedAmount,
    this.refundedAmount,
    this.captures,
    this.refunds,
    this.paymentCollection,
    this.paymentSession,
  });

  factory BasePayment.fromJson(Map<String, Object?> json) =>
      _$BasePaymentFromJson(json);

  /// The payment's ID.
  final String id;

  /// The payment's amount.
  final num amount;

  /// The amount authorized of the payment.
  @JsonKey(name: 'authorized_amount')
  final num? authorizedAmount;

  /// The payment's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The ID of the payment provider used to process this payment.
  @JsonKey(name: 'provider_id')
  final String providerId;

  /// The payment's data, useful for processing by the payment provider.
  final dynamic data;

  /// The date the payment was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date the payment was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The date the payment was captured.
  @JsonKey(name: 'captured_at')
  final DateTime? capturedAt;

  /// The date the payment was canceled.
  @JsonKey(name: 'canceled_at')
  final DateTime? canceledAt;

  /// The captured amount of the payment.
  @JsonKey(name: 'captured_amount')
  final num? capturedAmount;

  /// The refunded amount of the payment.
  @JsonKey(name: 'refunded_amount')
  final num? refundedAmount;

  /// The details of payment captures.
  final List<BaseCapture>? captures;

  /// The details of payment refunds.
  final List<BaseRefund>? refunds;
  @JsonKey(name: 'payment_collection')
  final dynamic paymentCollection;
  @JsonKey(name: 'payment_session')
  final dynamic paymentSession;

  Map<String, Object?> toJson() => _$BasePaymentToJson(this);
}
