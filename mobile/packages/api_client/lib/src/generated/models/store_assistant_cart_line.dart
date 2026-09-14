// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_assistant_cart_line.g.dart';

@JsonSerializable()
class StoreAssistantCartLine {
  const StoreAssistantCartLine({
    required this.variantId,
    required this.title,
    required this.quantity,
    required this.unitPrice,
    required this.total,
  });

  factory StoreAssistantCartLine.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantCartLineFromJson(json);

  @JsonKey(name: 'variant_id')
  final String variantId;
  final String title;
  final num quantity;
  @JsonKey(name: 'unit_price')
  final num unitPrice;
  final num total;

  Map<String, Object?> toJson() => _$StoreAssistantCartLineToJson(this);
}
