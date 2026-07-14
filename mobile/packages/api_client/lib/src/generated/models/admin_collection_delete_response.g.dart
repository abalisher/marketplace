// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_collection_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCollectionDeleteResponse _$AdminCollectionDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminCollectionDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'collection',
);

Map<String, dynamic> _$AdminCollectionDeleteResponseToJson(
  AdminCollectionDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
