// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_category_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductCategoryDeleteResponse _$AdminProductCategoryDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductCategoryDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'product_category',
);

Map<String, dynamic> _$AdminProductCategoryDeleteResponseToJson(
  AdminProductCategoryDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
