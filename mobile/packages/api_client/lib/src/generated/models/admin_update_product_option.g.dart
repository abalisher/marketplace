// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_product_option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateProductOption _$AdminUpdateProductOptionFromJson(
  Map<String, dynamic> json,
) => AdminUpdateProductOption(
  title: json['title'] as String?,
  values: (json['values'] as List<dynamic>?)?.map((e) => e as String).toList(),
  id: json['id'] as String?,
  ranks: json['ranks'],
  isExclusive: json['is_exclusive'] as bool?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminUpdateProductOptionToJson(
  AdminUpdateProductOption instance,
) => <String, dynamic>{
  'title': instance.title,
  'values': instance.values,
  'id': instance.id,
  'ranks': instance.ranks,
  'is_exclusive': instance.isExclusive,
  'metadata': instance.metadata,
};
