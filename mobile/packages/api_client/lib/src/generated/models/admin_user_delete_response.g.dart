// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_user_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUserDeleteResponse _$AdminUserDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminUserDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'user',
);

Map<String, dynamic> _$AdminUserDeleteResponseToJson(
  AdminUserDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
