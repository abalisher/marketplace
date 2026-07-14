// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductDeleteResponse _$AdminProductDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'product',
);

Map<String, dynamic> _$AdminProductDeleteResponseToJson(
  AdminProductDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
