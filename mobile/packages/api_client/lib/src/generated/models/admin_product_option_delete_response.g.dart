// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_option_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductOptionDeleteResponse _$AdminProductOptionDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductOptionDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  parent: json['parent'] == null
      ? null
      : AdminProduct.fromJson(json['parent'] as Map<String, dynamic>),
  object: json['object'] as String? ?? 'product_option',
);

Map<String, dynamic> _$AdminProductOptionDeleteResponseToJson(
  AdminProductOptionDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
  'parent': instance.parent,
};
