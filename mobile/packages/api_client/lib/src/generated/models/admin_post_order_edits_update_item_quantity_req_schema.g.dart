// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_post_order_edits_update_item_quantity_req_schema.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPostOrderEditsUpdateItemQuantityReqSchema
_$AdminPostOrderEditsUpdateItemQuantityReqSchemaFromJson(
  Map<String, dynamic> json,
) => AdminPostOrderEditsUpdateItemQuantityReqSchema(
  quantity: json['quantity'] as num,
  internalNote: json['internal_note'] as String?,
  unitPrice: json['unit_price'] as num?,
  compareAtUnitPrice: json['compare_at_unit_price'] as num?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminPostOrderEditsUpdateItemQuantityReqSchemaToJson(
  AdminPostOrderEditsUpdateItemQuantityReqSchema instance,
) => <String, dynamic>{
  'quantity': instance.quantity,
  'internal_note': instance.internalNote,
  'unit_price': instance.unitPrice,
  'compare_at_unit_price': instance.compareAtUnitPrice,
  'metadata': instance.metadata,
};
