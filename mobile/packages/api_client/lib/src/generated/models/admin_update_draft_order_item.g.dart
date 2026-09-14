// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_draft_order_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateDraftOrderItem _$AdminUpdateDraftOrderItemFromJson(
  Map<String, dynamic> json,
) => AdminUpdateDraftOrderItem(
  quantity: json['quantity'] as num,
  unitPrice: json['unit_price'] as num?,
  compareAtUnitPrice: json['compare_at_unit_price'] as num?,
  internalNote: json['internal_note'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminUpdateDraftOrderItemToJson(
  AdminUpdateDraftOrderItem instance,
) => <String, dynamic>{
  'quantity': instance.quantity,
  'unit_price': ?instance.unitPrice,
  'compare_at_unit_price': ?instance.compareAtUnitPrice,
  'internal_note': ?instance.internalNote,
  'metadata': ?instance.metadata,
};
