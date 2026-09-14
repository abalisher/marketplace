// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_post_order_edits_shipping_action_req_schema.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPostOrderEditsShippingActionReqSchema
_$AdminPostOrderEditsShippingActionReqSchemaFromJson(
  Map<String, dynamic> json,
) => AdminPostOrderEditsShippingActionReqSchema(
  customAmount: json['custom_amount'] as num?,
  internalNote: json['internal_note'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminPostOrderEditsShippingActionReqSchemaToJson(
  AdminPostOrderEditsShippingActionReqSchema instance,
) => <String, dynamic>{
  'custom_amount': ?instance.customAmount,
  'internal_note': ?instance.internalNote,
  'metadata': ?instance.metadata,
};
