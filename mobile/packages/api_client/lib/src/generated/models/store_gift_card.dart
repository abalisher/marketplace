// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_customer.dart';
import 'store_gift_card_status.dart';
import 'store_order_line_item.dart';

part 'store_gift_card.g.dart';

/// The gift card's details.
@JsonSerializable()
class StoreGiftCard {
  const StoreGiftCard({
    required this.customer,
    required this.lineItem,
    required this.id,
    required this.code,
    required this.status,
    required this.value,
    required this.currencyCode,
    required this.customerId,
    required this.referenceId,
    required this.note,
    required this.reference,
    required this.expiresAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory StoreGiftCard.fromJson(Map<String, Object?> json) =>
      _$StoreGiftCardFromJson(json);

  final StoreCustomer customer;
  @JsonKey(name: 'line_item')
  final StoreOrderLineItem lineItem;

  /// The gift card's ID.
  final String id;

  /// The gift card's code.
  final String code;

  /// The gift card's status.
  final StoreGiftCardStatus status;

  /// The gift card's amount.
  final num value;

  /// The gift card's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The ID of the customer that the gift card belongs to.
  @JsonKey(name: 'customer_id')
  final String customerId;

  /// The gift card's reference ID.
  @JsonKey(name: 'reference_id')
  final String referenceId;

  /// A note with more information about the gift card.
  final String note;

  /// The gift card's reference.
  final String reference;

  /// The date the gift card expires.
  @JsonKey(name: 'expires_at')
  final DateTime expiresAt;

  /// The date the gift card was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the gift card was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$StoreGiftCardToJson(this);
}
