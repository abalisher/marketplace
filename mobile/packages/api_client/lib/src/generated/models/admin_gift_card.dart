// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_customer.dart';
import 'admin_gift_card_status.dart';
import 'admin_order_line_item.dart';

part 'admin_gift_card.g.dart';

/// The gift card's details.
@JsonSerializable()
class AdminGiftCard {
  const AdminGiftCard({
    required this.lineItem,
    required this.customer,
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

  factory AdminGiftCard.fromJson(Map<String, Object?> json) =>
      _$AdminGiftCardFromJson(json);

  @JsonKey(name: 'line_item')
  final AdminOrderLineItem lineItem;
  final AdminCustomer customer;

  /// The gift card's ID.
  final String id;

  /// The gift card's code.
  final String code;

  /// The gift card's status.
  final AdminGiftCardStatus status;

  /// The gift card's amount.
  final num value;

  /// The gift card's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The ID of the customer associated with the gift card.
  @JsonKey(name: 'customer_id')
  final String customerId;

  /// The gift card's reference ID.
  @JsonKey(name: 'reference_id')
  final String referenceId;

  /// The gift card's note.
  final String note;

  /// The gift card's reference.
  final String reference;

  /// The date the gift card expires at.
  @JsonKey(name: 'expires_at')
  final String expiresAt;

  /// The date the gift card was created at.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the gift card was updated at.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$AdminGiftCardToJson(this);
}
