// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_estimate_suggestion_option_segment.dart';

part 'store_estimate_suggestion_option.g.dart';

@JsonSerializable()
class StoreEstimateSuggestionOption {
  const StoreEstimateSuggestionOption({
    required this.segment,
    required this.productId,
    required this.unitPrice,
    required this.total,
    required this.inStock,
    this.productTitle,
  });

  factory StoreEstimateSuggestionOption.fromJson(Map<String, Object?> json) =>
      _$StoreEstimateSuggestionOptionFromJson(json);

  final StoreEstimateSuggestionOptionSegment segment;
  @JsonKey(name: 'product_id')
  final String productId;
  @JsonKey(name: 'product_title')
  final String? productTitle;
  @JsonKey(name: 'unit_price')
  final num unitPrice;
  final num total;
  @JsonKey(name: 'in_stock')
  final bool inStock;

  Map<String, Object?> toJson() => _$StoreEstimateSuggestionOptionToJson(this);
}
