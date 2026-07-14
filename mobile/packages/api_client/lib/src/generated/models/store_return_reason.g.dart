// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_return_reason.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreReturnReason _$StoreReturnReasonFromJson(Map<String, dynamic> json) =>
    StoreReturnReason(
      id: json['id'] as String,
      value: json['value'] as String,
      label: json['label'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      description: json['description'] as String?,
      metadata: json['metadata'],
    );

Map<String, dynamic> _$StoreReturnReasonToJson(StoreReturnReason instance) =>
    <String, dynamic>{
      'id': instance.id,
      'value': instance.value,
      'label': instance.label,
      'description': instance.description,
      'metadata': instance.metadata,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
    };
