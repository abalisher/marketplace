// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_tag_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductTagDeleteResponse _$AdminProductTagDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductTagDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'product_tag',
);

Map<String, dynamic> _$AdminProductTagDeleteResponseToJson(
  AdminProductTagDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
