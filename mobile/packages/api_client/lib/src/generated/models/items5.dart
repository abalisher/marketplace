// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'items5.g.dart';

@JsonSerializable()
class Items5 {
  const Items5({
    required this.variantId,
    required this.quantity,
    this.unitPrice,
    this.internalNote,
    this.allowBackorder,
    this.metadata,
  });

  factory Items5.fromJson(Map<String, Object?> json) => _$Items5FromJson(json);

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

  /// Whether the item can be added even if it's not in stock.
  @JsonKey(name: 'allow_backorder')
  final bool? allowBackorder;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$Items5ToJson(this);
}
