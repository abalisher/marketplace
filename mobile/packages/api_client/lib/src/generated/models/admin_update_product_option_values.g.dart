// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_product_option_values.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateProductOptionValues _$AdminUpdateProductOptionValuesFromJson(
  Map<String, dynamic> json,
) => AdminUpdateProductOptionValues(
  productOptionId: json['product_option_id'] as String,
  add: json['add'] as List<dynamic>?,
  remove: (json['remove'] as List<dynamic>?)?.map((e) => e as String).toList(),
);

Map<String, dynamic> _$AdminUpdateProductOptionValuesToJson(
  AdminUpdateProductOptionValues instance,
) => <String, dynamic>{
  'product_option_id': instance.productOptionId,
  'add': instance.add,
  'remove': instance.remove,
};
