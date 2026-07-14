// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_product_card_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreProductCardSummary _$StoreProductCardSummaryFromJson(
  Map<String, dynamic> json,
) => StoreProductCardSummary(
  segment: StoreProductCardSummarySegment.fromJson(json['segment'] as String),
  unit: json['unit'] as String,
);

Map<String, dynamic> _$StoreProductCardSummaryToJson(
  StoreProductCardSummary instance,
) => <String, dynamic>{
  'segment': _$StoreProductCardSummarySegmentEnumMap[instance.segment]!,
  'unit': instance.unit,
};

const _$StoreProductCardSummarySegmentEnumMap = {
  StoreProductCardSummarySegment.economy: 'economy',
  StoreProductCardSummarySegment.comfort: 'comfort',
  StoreProductCardSummarySegment.business: 'business',
  StoreProductCardSummarySegment.$unknown: r'$unknown',
};
