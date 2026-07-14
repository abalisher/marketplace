// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_update_gift_card_params_status.dart';

part 'admin_update_gift_card_params.g.dart';

/// The details to update in the gift card.
@JsonSerializable()
class AdminUpdateGiftCardParams {
  const AdminUpdateGiftCardParams({
    this.status,
    this.value,
    this.customerId,
    this.currencyCode,
    this.note,
    this.expiresAt,
    this.metadata,
  });

  factory AdminUpdateGiftCardParams.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateGiftCardParamsFromJson(json);

  /// The gift card's status.
  final AdminUpdateGiftCardParamsStatus? status;

  /// The gift card's amount.
  final num? value;

  /// The ID of the customer that the gift card belongs to.
  @JsonKey(name: 'customer_id')
  final String? customerId;

  /// The gift card's currency code.
  @JsonKey(name: 'currency_code')
  final String? currencyCode;

  /// The gift card's note.
  final String? note;

  /// The date the gift card expires at.
  @JsonKey(name: 'expires_at')
  final String? expiresAt;

  /// The gift card's metadata.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateGiftCardParamsToJson(this);
}
