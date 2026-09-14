// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_create_estimate.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCreateEstimate _$StoreCreateEstimateFromJson(Map<String, dynamic> json) =>
    StoreCreateEstimate(
      params: json['params'] == null
          ? null
          : Params.fromJson(json['params'] as Map<String, dynamic>),
      normCodes: (json['norm_codes'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      note: json['note'] as String?,
    );

Map<String, dynamic> _$StoreCreateEstimateToJson(
  StoreCreateEstimate instance,
) => <String, dynamic>{
  'params': ?instance.params,
  'norm_codes': ?instance.normCodes,
  'note': ?instance.note,
};
