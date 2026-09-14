// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_order_assembly_summary.g.dart';

@JsonSerializable()
class AdminOrderAssemblySummary {
  const AdminOrderAssemblySummary({
    required this.tasksTotal,
    required this.tasksFinished,
    required this.tasksAssembled,
    required this.tasksShortage,
    required this.isFinished,
    required this.isAssembled,
    required this.hasShortage,
  });

  factory AdminOrderAssemblySummary.fromJson(Map<String, Object?> json) =>
      _$AdminOrderAssemblySummaryFromJson(json);

  @JsonKey(name: 'tasks_total')
  final num tasksTotal;
  @JsonKey(name: 'tasks_finished')
  final num tasksFinished;
  @JsonKey(name: 'tasks_assembled')
  final num tasksAssembled;
  @JsonKey(name: 'tasks_shortage')
  final num tasksShortage;

  /// По каждому заданию сборщик отработал — заказ можно передавать отгрузке.
  @JsonKey(name: 'is_finished')
  final bool isFinished;

  /// Заказ СОБРАН: собраны все задания, нехватки нет.
  @JsonKey(name: 'is_assembled')
  final bool isAssembled;

  /// Нехватка хотя бы в одном задании — флаг отвечающему за отгрузку.
  @JsonKey(name: 'has_shortage')
  final bool hasShortage;

  Map<String, Object?> toJson() => _$AdminOrderAssemblySummaryToJson(this);
}
