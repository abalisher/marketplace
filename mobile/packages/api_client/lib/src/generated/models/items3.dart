// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'items3.g.dart';

@JsonSerializable()
class Items3 {
  const Items3({
    required this.quantity,
    this.variantId,
    this.title,
    this.unitPrice,
    this.compareAtUnitPrice,
    this.internalNote,
    this.allowBackorder,
    this.metadata,
  });

  factory Items3.fromJson(Map<String, Object?> json) => _$Items3FromJson(json);

  /// The item's quantity.
  final num quantity;

  /// The ID of the variant to add to the draft order.
  @JsonKey(name: 'variant_id')
  final String? variantId;

  /// The item's title.
  final String? title;

  /// The item's unit price.
  @JsonKey(name: 'unit_price')
  final num? unitPrice;

  /// The original price of the item before a promotion or sale.
  @JsonKey(name: 'compare_at_unit_price')
  final num? compareAtUnitPrice;

  /// A note viewed only by admin users about the item.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// Whether the item can be purchased if it's out of stock.
  @JsonKey(name: 'allow_backorder')
  final bool? allowBackorder;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$Items3ToJson(this);
}
