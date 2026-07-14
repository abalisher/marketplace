// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'items2.g.dart';

@JsonSerializable()
class Items2 {
  const Items2({
    required this.quantity,
    required this.variantId,
    this.internalNote,
    this.metadata,
    this.unitPrice,
  });

  factory Items2.fromJson(Map<String, Object?> json) => _$Items2FromJson(json);

  /// The quantity to send to the customer.
  final num quantity;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// Key-value pairs of custom data.
  final dynamic metadata;

  /// The ID of the product variant to send to the customer.
  @JsonKey(name: 'variant_id')
  final String variantId;

  /// The item's unit price.
  @JsonKey(name: 'unit_price')
  final num? unitPrice;

  Map<String, Object?> toJson() => _$Items2ToJson(this);
}
