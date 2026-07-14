// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'items7.g.dart';

@JsonSerializable()
class Items7 {
  const Items7({
    required this.variantId,
    required this.quantity,
    this.unitPrice,
    this.internalNote,
    this.allowBackorder,
    this.metadata,
    this.compareAtUnitPrice,
  });

  factory Items7.fromJson(Map<String, Object?> json) => _$Items7FromJson(json);

  /// The ID of the associated product variant.
  @JsonKey(name: 'variant_id')
  final String variantId;

  /// The item's quantity.
  final num quantity;

  /// The item's unit price.
  @JsonKey(name: 'unit_price')
  final num? unitPrice;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// Whether the item can be added even if there's no available invenotory quantity of the variant.
  @JsonKey(name: 'allow_backorder')
  final bool? allowBackorder;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The original price of the item before a promotion or sale.
  @JsonKey(name: 'compare_at_unit_price')
  final num? compareAtUnitPrice;

  Map<String, Object?> toJson() => _$Items7ToJson(this);
}
