// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_refund_reason_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminRefundReasonDeleteResponse _$AdminRefundReasonDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminRefundReasonDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'refund_reason',
);

Map<String, dynamic> _$AdminRefundReasonDeleteResponseToJson(
  AdminRefundReasonDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
