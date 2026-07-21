// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_estimate_suggestions_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreEstimateSuggestionsRes _$StoreEstimateSuggestionsResFromJson(
  Map<String, dynamic> json,
) => StoreEstimateSuggestionsRes(
  estimateId: json['estimate_id'] as String,
  currencyCode: json['currency_code'] as String,
  suggestions: (json['suggestions'] as List<dynamic>)
      .map((e) => StoreEstimateSuggestion.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StoreEstimateSuggestionsResToJson(
  StoreEstimateSuggestionsRes instance,
) => <String, dynamic>{
  'estimate_id': instance.estimateId,
  'currency_code': instance.currencyCode,
  'suggestions': instance.suggestions,
};
