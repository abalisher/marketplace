// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_option_value_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductOptionValueDeleteResponse
_$AdminProductOptionValueDeleteResponseFromJson(Map<String, dynamic> json) =>
    AdminProductOptionValueDeleteResponse(
      id: json['id'] as String,
      deleted: json['deleted'] as bool,
      parent: json['parent'] == null
          ? null
          : AdminProductOption.fromJson(json['parent'] as Map<String, dynamic>),
      object: json['object'] as String? ?? 'product_option_value',
    );

Map<String, dynamic> _$AdminProductOptionValueDeleteResponseToJson(
  AdminProductOptionValueDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
  'parent': ?instance.parent,
};
