// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_shipping_category_tile_status.dart';

part 'admin_shipping_category_tile.g.dart';

/// Плитка категории в строке заказа: статус задания, кто собирает, сколько позиций отмечено и сколько не набралось. Списка позиций в плитке нет — отгрузке нужен светофор по категориям.
@JsonSerializable()
class AdminShippingCategoryTile {
  const AdminShippingCategoryTile({
    required this.id,
    required this.orderId,
    required this.categoryHandle,
    required this.categoryName,
    required this.status,
    required this.itemsTotal,
    required this.itemsMarked,
    required this.itemsMissing,
    this.orderDisplayId,
    this.customerName,
    this.assigneeId,
    this.assigneeName,
    this.completedBy,
    this.completedByName,
    this.startedAt,
    this.completedAt,
    this.note,
    this.createdAt,
  });

  factory AdminShippingCategoryTile.fromJson(Map<String, Object?> json) =>
      _$AdminShippingCategoryTileFromJson(json);

  final String id;
  @JsonKey(name: 'order_id')
  final String orderId;
  @JsonKey(name: 'order_display_id')
  final num? orderDisplayId;
  @JsonKey(name: 'customer_name')
  final String? customerName;
  @JsonKey(name: 'category_handle')
  final String categoryHandle;
  @JsonKey(name: 'category_name')
  final String categoryName;
  final AdminShippingCategoryTileStatus status;
  @JsonKey(name: 'assignee_id')
  final String? assigneeId;

  /// Кто взял задание (имя учётки сборщика).
  @JsonKey(name: 'assignee_name')
  final String? assigneeName;
  @JsonKey(name: 'completed_by')
  final String? completedBy;
  @JsonKey(name: 'completed_by_name')
  final String? completedByName;
  @JsonKey(name: 'started_at')
  final DateTime? startedAt;
  @JsonKey(name: 'completed_at')
  final DateTime? completedAt;
  final String? note;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @JsonKey(name: 'items_total')
  final num itemsTotal;
  @JsonKey(name: 'items_marked')
  final num itemsMarked;
  @JsonKey(name: 'items_missing')
  final num itemsMissing;

  Map<String, Object?> toJson() => _$AdminShippingCategoryTileToJson(this);
}
