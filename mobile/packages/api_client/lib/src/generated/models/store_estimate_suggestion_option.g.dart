// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_estimate_suggestion_option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreEstimateSuggestionOption _$StoreEstimateSuggestionOptionFromJson(
  Map<String, dynamic> json,
) => StoreEstimateSuggestionOption(
  segment: StoreEstimateSuggestionOptionSegment.fromJson(
    json['segment'] as String,
  ),
  productId: json['product_id'] as String,
  unitPrice: json['unit_price'] as num,
  total: json['total'] as num,
  inStock: json['in_stock'] as bool,
  productTitle: json['product_title'] as String?,
);

Map<String, dynamic> _$StoreEstimateSuggestionOptionToJson(
  StoreEstimateSuggestionOption instance,
) => <String, dynamic>{
  'segment': _$StoreEstimateSuggestionOptionSegmentEnumMap[instance.segment]!,
  'product_id': instance.productId,
  'product_title': instance.productTitle,
  'unit_price': instance.unitPrice,
  'total': instance.total,
  'in_stock': instance.inStock,
};

const _$StoreEstimateSuggestionOptionSegmentEnumMap = {
  StoreEstimateSuggestionOptionSegment.economy: 'economy',
  StoreEstimateSuggestionOptionSegment.comfort: 'comfort',
  StoreEstimateSuggestionOptionSegment.business: 'business',
  StoreEstimateSuggestionOptionSegment.$unknown: r'$unknown',
};
