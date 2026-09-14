// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_line_input.dart';

part 'admin_ship_target.g.dart';

/// Цель перехода «передать водителю»: fulfillment под отгрузку и реально набранные позиции.
@JsonSerializable()
class AdminShipTarget {
  const AdminShipTarget({required this.fulfillmentId, required this.items});

  factory AdminShipTarget.fromJson(Map<String, Object?> json) =>
      _$AdminShipTargetFromJson(json);

  @JsonKey(name: 'fulfillment_id')
  final String fulfillmentId;
  final List<AdminOrderLineInput> items;

  Map<String, Object?> toJson() => _$AdminShipTargetToJson(this);
}
