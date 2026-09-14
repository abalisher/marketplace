// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_slot_option.dart';
import 'current.dart';

part 'admin_order_reschedule_options_res.g.dart';

@JsonSerializable()
class AdminOrderRescheduleOptionsRes {
  const AdminOrderRescheduleOptionsRes({
    required this.orderId,
    required this.canReschedule,
    required this.current,
    required this.slots,
    this.status,
  });

  factory AdminOrderRescheduleOptionsRes.fromJson(Map<String, Object?> json) =>
      _$AdminOrderRescheduleOptionsResFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;
  final String? status;

  /// false — заказ уже отгружен, вручён или отменён: двигать нечего.
  @JsonKey(name: 'can_reschedule')
  final bool canReschedule;
  final Current current;
  final List<AdminOrderSlotOption> slots;

  Map<String, Object?> toJson() => _$AdminOrderRescheduleOptionsResToJson(this);
}
