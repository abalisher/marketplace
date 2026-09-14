// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_reschedule_order_slot_window.dart';

part 'admin_reschedule_order.g.dart';

@JsonSerializable()
class AdminRescheduleOrder {
  const AdminRescheduleOrder({
    required this.slotDate,
    required this.slotWindow,
    required this.reason,
  });

  factory AdminRescheduleOrder.fromJson(Map<String, Object?> json) =>
      _$AdminRescheduleOrderFromJson(json);

  /// Дата слота в астанинских сутках, `YYYY-MM-DD`.
  @JsonKey(name: 'slot_date')
  final String slotDate;
  @JsonKey(name: 'slot_window')
  final AdminRescheduleOrderSlotWindow slotWindow;

  /// Почему подвинули — обязательна, попадает в лог заказа.
  final String reason;

  Map<String, Object?> toJson() => _$AdminRescheduleOrderToJson(this);
}
