// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_post_order_edits_items_action_req_schema.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPostOrderEditsItemsActionReqSchema
_$AdminPostOrderEditsItemsActionReqSchemaFromJson(Map<String, dynamic> json) =>
    AdminPostOrderEditsItemsActionReqSchema(
      quantity: json['quantity'] as num?,
      internalNote: json['internal_note'] as String?,
      unitPrice: json['unit_price'] as num?,
      compareAtUnitPrice: json['compare_at_unit_price'] as num?,
    );

Map<String, dynamic> _$AdminPostOrderEditsItemsActionReqSchemaToJson(
  AdminPostOrderEditsItemsActionReqSchema instance,
) => <String, dynamic>{
  'quantity': ?instance.quantity,
  'internal_note': ?instance.internalNote,
  'unit_price': ?instance.unitPrice,
  'compare_at_unit_price': ?instance.compareAtUnitPrice,
};
