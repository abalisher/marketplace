// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product_card_summary_segment.dart';

part 'store_product_card_summary.g.dart';

@JsonSerializable()
class StoreProductCardSummary {
  const StoreProductCardSummary({required this.segment, required this.unit});

  factory StoreProductCardSummary.fromJson(Map<String, Object?> json) =>
      _$StoreProductCardSummaryFromJson(json);

  final StoreProductCardSummarySegment segment;
  final String unit;

  Map<String, Object?> toJson() => _$StoreProductCardSummaryToJson(this);
}
