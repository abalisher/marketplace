// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_property_label_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPropertyLabelDeleteResponse _$AdminPropertyLabelDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminPropertyLabelDeleteResponse(
  id: json['id'] as String,
  object: json['object'] as String,
  deleted: json['deleted'] as bool,
);

Map<String, dynamic> _$AdminPropertyLabelDeleteResponseToJson(
  AdminPropertyLabelDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
