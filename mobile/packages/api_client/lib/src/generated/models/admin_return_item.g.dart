// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_return_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReturnItem _$AdminReturnItemFromJson(Map<String, dynamic> json) =>
    AdminReturnItem(
      id: json['id'] as String,
      quantity: json['quantity'] as num,
      receivedQuantity: json['received_quantity'] as num,
      damagedQuantity: json['damaged_quantity'] as num,
      itemId: json['item_id'] as String,
      returnId: json['return_id'] as String,
      reasonId: json['reason_id'] as String?,
      note: json['note'] as String?,
      metadata: json['metadata'],
    );

Map<String, dynamic> _$AdminReturnItemToJson(AdminReturnItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'quantity': instance.quantity,
      'received_quantity': instance.receivedQuantity,
      'damaged_quantity': instance.damagedQuantity,
      'reason_id': instance.reasonId,
      'note': instance.note,
      'item_id': instance.itemId,
      'return_id': instance.returnId,
      'metadata': instance.metadata,
    };
