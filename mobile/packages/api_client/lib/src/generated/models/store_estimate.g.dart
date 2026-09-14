// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_estimate.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreEstimate _$StoreEstimateFromJson(Map<String, dynamic> json) =>
    StoreEstimate(
      id: json['id'] as String,
      source: StoreEstimateSource.fromJson(json['source'] as String),
      status: StoreEstimateStatus.fromJson(json['status'] as String),
      lines: (json['lines'] as List<dynamic>)
          .map((e) => StoreEstimateLine.fromJson(e as Map<String, dynamic>))
          .toList(),
      params: json['params'],
      note: json['note'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$StoreEstimateToJson(StoreEstimate instance) =>
    <String, dynamic>{
      'id': instance.id,
      'source': _$StoreEstimateSourceEnumMap[instance.source]!,
      'status': _$StoreEstimateStatusEnumMap[instance.status]!,
      'params': ?instance.params,
      'note': ?instance.note,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'lines': instance.lines,
    };

const _$StoreEstimateSourceEnumMap = {
  StoreEstimateSource.manual: 'manual',
  StoreEstimateSource.file: 'file',
  StoreEstimateSource.voice: 'voice',
  StoreEstimateSource.$unknown: r'$unknown',
};

const _$StoreEstimateStatusEnumMap = {
  StoreEstimateStatus.draft: 'draft',
  StoreEstimateStatus.calculated: 'calculated',
  StoreEstimateStatus.$unknown: r'$unknown',
};
