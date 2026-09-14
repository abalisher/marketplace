// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'order_line_item_tax_line.g.dart';

/// The line item tax line's details.
@JsonSerializable()
class OrderLineItemTaxLine {
  const OrderLineItemTaxLine({
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
    this.data,
    this.metadata,
  });

  factory OrderLineItemTaxLine.fromJson(Map<String, Object?> json) =>
      _$OrderLineItemTaxLineFromJson(json);

  final dynamic item;

  /// The ID of the line item that the tax line belongs to.
  @JsonKey(name: 'item_id')
  final String itemId;

  /// The item's total including taxes and promotions.
  final num total;

  /// The item's total excluding taxes, including promotions.
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

  /// The ID of the tax provider used to calculate the tax lines.
  @JsonKey(name: 'provider_id')
  final String? providerId;

  /// The date the tax line was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the tax line was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The tax line's data.
  final dynamic data;

  /// The tax line's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$OrderLineItemTaxLineToJson(this);
}
