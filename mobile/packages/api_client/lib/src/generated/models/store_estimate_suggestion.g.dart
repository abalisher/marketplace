// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_estimate_suggestion.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreEstimateSuggestion _$StoreEstimateSuggestionFromJson(
  Map<String, dynamic> json,
) => StoreEstimateSuggestion(
  lineId: json['line_id'] as String,
  materialKind: json['material_kind'] as String,
  quantity: json['quantity'] as num,
  unit: json['unit'] as String,
  options: (json['options'] as List<dynamic>)
      .map(
        (e) =>
            StoreEstimateSuggestionOption.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
);

Map<String, dynamic> _$StoreEstimateSuggestionToJson(
  StoreEstimateSuggestion instance,
) => <String, dynamic>{
  'line_id': instance.lineId,
  'material_kind': instance.materialKind,
  'quantity': instance.quantity,
  'unit': instance.unit,
  'options': instance.options,
};
