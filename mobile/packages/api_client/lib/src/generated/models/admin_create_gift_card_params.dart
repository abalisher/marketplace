// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_gift_card_params.g.dart';

/// The details of the gift card to create.
@JsonSerializable()
class AdminCreateGiftCardParams {
  const AdminCreateGiftCardParams({
    required this.code,
    required this.value,
    required this.currencyCode,
    required this.expiresAt,
    required this.referenceId,
    required this.reference,
    required this.lineItemId,
    required this.customerId,
    required this.metadata,
  });

  factory AdminCreateGiftCardParams.fromJson(Map<String, Object?> json) =>
      _$AdminCreateGiftCardParamsFromJson(json);

  /// The gift card's code.
  final String code;

  /// The gift card's amount.
  final num value;

  /// The gift card's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The date the gift card expires at.
  @JsonKey(name: 'expires_at')
  final String expiresAt;

  /// The gift card's reference ID.
  @JsonKey(name: 'reference_id')
  final String referenceId;

  /// The gift card's reference.
  final String reference;

  /// The ID of the line item associated with the gift card.
  @JsonKey(name: 'line_item_id')
  final String lineItemId;

  /// The ID of the customer associated with the gift card.
  @JsonKey(name: 'customer_id')
  final String customerId;

  /// The gift card's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateGiftCardParamsToJson(this);
}
