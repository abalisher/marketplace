// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_shipping_category_tile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShippingCategoryTile _$AdminShippingCategoryTileFromJson(
  Map<String, dynamic> json,
) => AdminShippingCategoryTile(
  id: json['id'] as String,
  orderId: json['order_id'] as String,
  categoryHandle: json['category_handle'] as String,
  categoryName: json['category_name'] as String,
  status: AdminShippingCategoryTileStatus.fromJson(json['status'] as String),
  itemsTotal: json['items_total'] as num,
  itemsMarked: json['items_marked'] as num,
  itemsMissing: json['items_missing'] as num,
  orderDisplayId: json['order_display_id'] as num?,
  customerName: json['customer_name'] as String?,
  assigneeId: json['assignee_id'] as String?,
  assigneeName: json['assignee_name'] as String?,
  completedBy: json['completed_by'] as String?,
  completedByName: json['completed_by_name'] as String?,
  startedAt: json['started_at'] == null
      ? null
      : DateTime.parse(json['started_at'] as String),
  completedAt: json['completed_at'] == null
      ? null
      : DateTime.parse(json['completed_at'] as String),
  note: json['note'] as String?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$AdminShippingCategoryTileToJson(
  AdminShippingCategoryTile instance,
) => <String, dynamic>{
  'id': instance.id,
  'order_id': instance.orderId,
  'order_display_id': ?instance.orderDisplayId,
  'customer_name': ?instance.customerName,
  'category_handle': instance.categoryHandle,
  'category_name': instance.categoryName,
  'status': _$AdminShippingCategoryTileStatusEnumMap[instance.status]!,
  'assignee_id': ?instance.assigneeId,
  'assignee_name': ?instance.assigneeName,
  'completed_by': ?instance.completedBy,
  'completed_by_name': ?instance.completedByName,
  'started_at': ?instance.startedAt?.toIso8601String(),
  'completed_at': ?instance.completedAt?.toIso8601String(),
  'note': ?instance.note,
  'created_at': ?instance.createdAt?.toIso8601String(),
  'items_total': instance.itemsTotal,
  'items_marked': instance.itemsMarked,
  'items_missing': instance.itemsMissing,
};

const _$AdminShippingCategoryTileStatusEnumMap = {
  AdminShippingCategoryTileStatus.pending: 'pending',
  AdminShippingCategoryTileStatus.picking: 'picking',
  AdminShippingCategoryTileStatus.assembled: 'assembled',
  AdminShippingCategoryTileStatus.shortage: 'shortage',
  AdminShippingCategoryTileStatus.$unknown: r'$unknown',
};
