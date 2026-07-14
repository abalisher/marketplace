// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_order_line_item_tax_line.dart';

part 'store_order_line_item_tax_lines.g.dart';

@JsonSerializable()
class StoreOrderLineItemTaxLines {
  const StoreOrderLineItemTaxLines({
    required this.item,
    required this.itemId,
    required this.total,
    required this.subtotal,
    required this.id,
    required this.code,
    required this.rate,
    required this.createdAt,
    required this.updatedAt,
    this.description,
    this.taxRateId,
    this.providerId,
  });

  factory StoreOrderLineItemTaxLines.fromJson(Map<String, Object?> json) =>
      _$StoreOrderLineItemTaxLinesFromJson(json);

  final dynamic item;

  /// The ID of the associated line item.
  @JsonKey(name: 'item_id')
  final String itemId;

  /// The tax line's total including promotions.
  final num total;

  /// The tax line's subtotal excluding promotions.
  final num subtotal;

  /// The tax line's ID.
  final String id;

  /// The tax line's description.
  final String? description;

  /// The ID of the applied tax rate.
  @JsonKey(name: 'tax_rate_id')
  final String? taxRateId;

  /// The code that the tax rate is identified by.
  final String code;

  /// The rate to charge.
  final num rate;

  /// The ID of the tax provider used to calculate the tax line.
  @JsonKey(name: 'provider_id')
  final String? providerId;

  /// The date the tax line was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the tax line was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$StoreOrderLineItemTaxLinesToJson(this);
}
