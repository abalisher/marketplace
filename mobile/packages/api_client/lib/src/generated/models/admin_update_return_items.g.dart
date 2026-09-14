// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_return_items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateReturnItems _$AdminUpdateReturnItemsFromJson(
  Map<String, dynamic> json,
) => AdminUpdateReturnItems(
  quantity: json['quantity'] as num?,
  internalNote: json['internal_note'] as String?,
  reasonId: json['reason_id'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminUpdateReturnItemsToJson(
  AdminUpdateReturnItems instance,
) => <String, dynamic>{
  'quantity': ?instance.quantity,
  'internal_note': ?instance.internalNote,
  'reason_id': ?instance.reasonId,
  'metadata': ?instance.metadata,
};
