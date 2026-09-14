// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_assembly_task_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAssemblyTaskItem _$AdminAssemblyTaskItemFromJson(
  Map<String, dynamic> json,
) => AdminAssemblyTaskItem(
  id: json['id'] as String,
  orderItemId: json['order_item_id'] as String,
  title: json['title'] as String,
  quantity: json['quantity'] as num,
  pickedQuantity: json['picked_quantity'] as num,
  status: AdminAssemblyTaskItemStatus.fromJson(json['status'] as String),
  variantId: json['variant_id'] as String?,
  sku: json['sku'] as String?,
  markedAt: json['marked_at'] == null
      ? null
      : DateTime.parse(json['marked_at'] as String),
  markedBy: json['marked_by'] as String?,
  note: json['note'] as String?,
);

Map<String, dynamic> _$AdminAssemblyTaskItemToJson(
  AdminAssemblyTaskItem instance,
) => <String, dynamic>{
  'id': instance.id,
  'order_item_id': instance.orderItemId,
  'variant_id': ?instance.variantId,
  'title': instance.title,
  'sku': ?instance.sku,
  'quantity': instance.quantity,
  'picked_quantity': instance.pickedQuantity,
  'status': _$AdminAssemblyTaskItemStatusEnumMap[instance.status]!,
  'marked_at': ?instance.markedAt?.toIso8601String(),
  'marked_by': ?instance.markedBy,
  'note': ?instance.note,
};

const _$AdminAssemblyTaskItemStatusEnumMap = {
  AdminAssemblyTaskItemStatus.pending: 'pending',
  AdminAssemblyTaskItemStatus.picked: 'picked',
  AdminAssemblyTaskItemStatus.partial: 'partial',
  AdminAssemblyTaskItemStatus.missing: 'missing',
  AdminAssemblyTaskItemStatus.$unknown: r'$unknown',
};
