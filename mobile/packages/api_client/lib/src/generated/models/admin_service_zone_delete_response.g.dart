// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_service_zone_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminServiceZoneDeleteResponse _$AdminServiceZoneDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminServiceZoneDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  parent: json['parent'] == null
      ? null
      : AdminFulfillmentSet.fromJson(json['parent'] as Map<String, dynamic>),
  object: json['object'] as String? ?? 'service_zone',
);

Map<String, dynamic> _$AdminServiceZoneDeleteResponseToJson(
  AdminServiceZoneDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
  'parent': instance.parent,
};
