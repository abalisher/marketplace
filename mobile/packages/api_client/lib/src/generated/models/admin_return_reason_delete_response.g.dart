// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_return_reason_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReturnReasonDeleteResponse _$AdminReturnReasonDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminReturnReasonDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'return_reason',
);

Map<String, dynamic> _$AdminReturnReasonDeleteResponseToJson(
  AdminReturnReasonDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
