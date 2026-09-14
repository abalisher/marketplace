// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_assembly_task_item_status.dart';

part 'admin_assembly_task_item.g.dart';

@JsonSerializable()
class AdminAssemblyTaskItem {
  const AdminAssemblyTaskItem({
    required this.id,
    required this.orderItemId,
    required this.title,
    required this.quantity,
    required this.pickedQuantity,
    required this.status,
    this.variantId,
    this.sku,
    this.markedAt,
    this.markedBy,
    this.note,
  });

  factory AdminAssemblyTaskItem.fromJson(Map<String, Object?> json) =>
      _$AdminAssemblyTaskItemFromJson(json);

  final String id;
  @JsonKey(name: 'order_item_id')
  final String orderItemId;
  @JsonKey(name: 'variant_id')
  final String? variantId;
  final String title;
  final String? sku;
  final num quantity;
  @JsonKey(name: 'picked_quantity')
  final num pickedQuantity;
  final AdminAssemblyTaskItemStatus status;
  @JsonKey(name: 'marked_at')
  final DateTime? markedAt;
  @JsonKey(name: 'marked_by')
  final String? markedBy;
  final String? note;

  Map<String, Object?> toJson() => _$AdminAssemblyTaskItemToJson(this);
}
