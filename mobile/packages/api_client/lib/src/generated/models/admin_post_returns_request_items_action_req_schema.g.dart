// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_post_returns_request_items_action_req_schema.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPostReturnsRequestItemsActionReqSchema
_$AdminPostReturnsRequestItemsActionReqSchemaFromJson(
  Map<String, dynamic> json,
) => AdminPostReturnsRequestItemsActionReqSchema(
  quantity: json['quantity'] as num?,
  internalNote: json['internal_note'] as String?,
  reasonId: json['reason_id'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminPostReturnsRequestItemsActionReqSchemaToJson(
  AdminPostReturnsRequestItemsActionReqSchema instance,
) => <String, dynamic>{
  'quantity': ?instance.quantity,
  'internal_note': ?instance.internalNote,
  'reason_id': ?instance.reasonId,
  'metadata': ?instance.metadata,
};
