// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_refund_reason.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseRefundReason _$BaseRefundReasonFromJson(Map<String, dynamic> json) =>
    BaseRefundReason(
      id: json['id'] as String,
      label: json['label'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      code: json['code'] as String,
      description: json['description'] as String?,
      metadata: json['metadata'],
    );

Map<String, dynamic> _$BaseRefundReasonToJson(BaseRefundReason instance) =>
    <String, dynamic>{
      'id': instance.id,
      'label': instance.label,
      'description': ?instance.description,
      'metadata': ?instance.metadata,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'code': instance.code,
    };
