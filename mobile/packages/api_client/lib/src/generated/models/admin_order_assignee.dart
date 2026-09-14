// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_assignee_role.dart';

part 'admin_order_assignee.g.dart';

/// Ответственный за заказ: на стадиях сборки — сборщики, взявшие задания своих категорий, в остальных статусах — сотрудник, последним переведший статус. null — из сотрудников заказа ещё никто не касался («не взят»).
@JsonSerializable()
class AdminOrderAssignee {
  const AdminOrderAssignee({required this.name, required this.role});

  factory AdminOrderAssignee.fromJson(Map<String, Object?> json) =>
      _$AdminOrderAssigneeFromJson(json);

  final String name;
  final AdminOrderAssigneeRole role;

  Map<String, Object?> toJson() => _$AdminOrderAssigneeToJson(this);
}
