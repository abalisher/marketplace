// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_lifecycle.dart';
import 'order.dart';

part 'admin_place_counter_order_res.g.dart';

@JsonSerializable()
class AdminPlaceCounterOrderRes {
  const AdminPlaceCounterOrderRes({
    required this.order,
    required this.lifecycle,
  });

  factory AdminPlaceCounterOrderRes.fromJson(Map<String, Object?> json) =>
      _$AdminPlaceCounterOrderResFromJson(json);

  /// Заказ ядра (schema AdminOrder базовой спеки).
  final Order order;
  final AdminOrderLifecycle lifecycle;

  Map<String, Object?> toJson() => _$AdminPlaceCounterOrderResToJson(this);
}
