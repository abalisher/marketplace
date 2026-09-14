// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_draft_order_action_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateDraftOrderActionItem _$AdminUpdateDraftOrderActionItemFromJson(
  Map<String, dynamic> json,
) => AdminUpdateDraftOrderActionItem(
  quantity: json['quantity'] as num,
  unitPrice: json['unit_price'] as num?,
  compareAtUnitPrice: json['compare_at_unit_price'] as num?,
  internalNote: json['internal_note'] as String?,
);

Map<String, dynamic> _$AdminUpdateDraftOrderActionItemToJson(
  AdminUpdateDraftOrderActionItem instance,
) => <String, dynamic>{
  'quantity': instance.quantity,
  'unit_price': ?instance.unitPrice,
  'compare_at_unit_price': ?instance.compareAtUnitPrice,
  'internal_note': ?instance.internalNote,
};
