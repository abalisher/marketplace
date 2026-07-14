// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_claim_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminClaimDeleteResponse _$AdminClaimDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminClaimDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'claim',
);

Map<String, dynamic> _$AdminClaimDeleteResponseToJson(
  AdminClaimDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
