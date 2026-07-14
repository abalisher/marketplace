// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_option_value.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductOptionValue _$AdminProductOptionValueFromJson(
  Map<String, dynamic> json,
) => AdminProductOptionValue(
  id: json['id'] as String,
  value: json['value'] as String,
  option: json['option'] == null
      ? null
      : AdminProductOption.fromJson(json['option'] as Map<String, dynamic>),
  optionId: json['option_id'] as String?,
  metadata: json['metadata'],
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  updatedAt: json['updated_at'] == null
      ? null
      : DateTime.parse(json['updated_at'] as String),
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
  rank: json['rank'] as num?,
);

Map<String, dynamic> _$AdminProductOptionValueToJson(
  AdminProductOptionValue instance,
) => <String, dynamic>{
  'id': instance.id,
  'value': instance.value,
  'option': instance.option,
  'option_id': instance.optionId,
  'metadata': instance.metadata,
  'created_at': instance.createdAt?.toIso8601String(),
  'updated_at': instance.updatedAt?.toIso8601String(),
  'deleted_at': instance.deletedAt?.toIso8601String(),
  'rank': instance.rank,
};
