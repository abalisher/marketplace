// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_post_exchanges_request_items_return_action_req_schema.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPostExchangesRequestItemsReturnActionReqSchema
_$AdminPostExchangesRequestItemsReturnActionReqSchemaFromJson(
  Map<String, dynamic> json,
) => AdminPostExchangesRequestItemsReturnActionReqSchema(
  quantity: json['quantity'] as num?,
  internalNote: json['internal_note'] as String?,
  reasonId: json['reason_id'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic>
_$AdminPostExchangesRequestItemsReturnActionReqSchemaToJson(
  AdminPostExchangesRequestItemsReturnActionReqSchema instance,
) => <String, dynamic>{
  'quantity': ?instance.quantity,
  'internal_note': ?instance.internalNote,
  'reason_id': ?instance.reasonId,
  'metadata': ?instance.metadata,
};
