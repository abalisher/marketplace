// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_price.g.dart';

/// The price's details.
@JsonSerializable()
class AdminPrice {
  const AdminPrice({
    required this.id,
    required this.title,
    required this.currencyCode,
    required this.amount,
    required this.rawAmount,
    required this.minQuantity,
    required this.maxQuantity,
    required this.priceSetId,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminPrice.fromJson(Map<String, Object?> json) =>
      _$AdminPriceFromJson(json);

  /// The price's ID.
  final String id;

  /// The price's title.
  final String title;

  /// The price's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The price's amount.
  final num amount;

  /// The price's raw amount.
  @JsonKey(name: 'raw_amount')
  final dynamic rawAmount;

  /// The minimum quantity that must be available in the cart for the price to be applied.
  @JsonKey(name: 'min_quantity')
  final num minQuantity;

  /// The maximum quantity allowed to be available in the cart for the price to be applied.
  @JsonKey(name: 'max_quantity')
  final num maxQuantity;

  /// The ID of the associated price set.
  @JsonKey(name: 'price_set_id')
  final String priceSetId;

  /// The date the price was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the price was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the price was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$AdminPriceToJson(this);
}
