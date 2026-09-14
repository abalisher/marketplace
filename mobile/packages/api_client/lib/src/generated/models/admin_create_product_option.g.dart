// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_product_option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateProductOption _$AdminCreateProductOptionFromJson(
  Map<String, dynamic> json,
) => AdminCreateProductOption(
  title: json['title'] as String,
  values: (json['values'] as List<dynamic>).map((e) => e as String).toList(),
  ranks: json['ranks'],
  isExclusive: json['is_exclusive'] as bool?,
);

Map<String, dynamic> _$AdminCreateProductOptionToJson(
  AdminCreateProductOption instance,
) => <String, dynamic>{
  'title': instance.title,
  'values': instance.values,
  'ranks': ?instance.ranks,
  'is_exclusive': ?instance.isExclusive,
};
