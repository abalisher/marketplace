// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_estimate_line.g.dart';

@JsonSerializable()
class StoreEstimateLine {
  const StoreEstimateLine({
    required this.id,
    required this.materialKind,
    required this.quantity,
    required this.unit,
    this.normCode,
    this.segment,
    this.productId,
    this.unitPrice,
    this.total,
  });

  factory StoreEstimateLine.fromJson(Map<String, Object?> json) =>
      _$StoreEstimateLineFromJson(json);

  final String id;
  @JsonKey(name: 'material_kind')
  final String materialKind;
  final num quantity;
  final String unit;
  @JsonKey(name: 'norm_code')
  final String? normCode;
  final String? segment;
  @JsonKey(name: 'product_id')
  final String? productId;
  @JsonKey(name: 'unit_price')
  final num? unitPrice;
  final num? total;

  Map<String, Object?> toJson() => _$StoreEstimateLineToJson(this);
}
