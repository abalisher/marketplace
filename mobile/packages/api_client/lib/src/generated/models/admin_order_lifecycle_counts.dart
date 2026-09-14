// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_order_lifecycle_counts.g.dart';

/// Счётчики для чипов-фильтров экрана «Заказы»: всего и по каждому бизнес-статусу при текущем поиске/способе получения.
@JsonSerializable()
class AdminOrderLifecycleCounts {
  const AdminOrderLifecycleCounts({
    required this.total,
    required this.byStatus,
    this.overdue,
  });

  factory AdminOrderLifecycleCounts.fromJson(Map<String, Object?> json) =>
      _$AdminOrderLifecycleCountsFromJson(json);

  final int total;
  @JsonKey(name: 'by_status')
  final Map<String, int> byStatus;

  /// Сколько заказов вышли за срок своей стадии при текущих фильтрах.
  final int? overdue;

  Map<String, Object?> toJson() => _$AdminOrderLifecycleCountsToJson(this);
}
