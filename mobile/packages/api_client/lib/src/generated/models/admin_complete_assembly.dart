// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_line_input.dart';

part 'admin_complete_assembly.g.dart';

@JsonSerializable()
class AdminCompleteAssembly {
  const AdminCompleteAssembly({required this.items, this.locationId});

  factory AdminCompleteAssembly.fromJson(Map<String, Object?> json) =>
      _$AdminCompleteAssemblyFromJson(json);

  final List<AdminOrderLineInput> items;

  /// Склад отгрузки (по умолчанию — из заказа).
  @JsonKey(name: 'location_id')
  final String? locationId;

  Map<String, Object?> toJson() => _$AdminCompleteAssemblyToJson(this);
}
