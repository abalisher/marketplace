// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_slot_res_delivery_window.dart';

part 'admin_order_slot_res.g.dart';

@JsonSerializable()
class AdminOrderSlotRes {
  const AdminOrderSlotRes({
    required this.orderId,
    required this.deliveryDate,
    required this.deliveryWindow,
  });

  factory AdminOrderSlotRes.fromJson(Map<String, Object?> json) =>
      _$AdminOrderSlotResFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;
  @JsonKey(name: 'delivery_date')
  final String deliveryDate;
  @JsonKey(name: 'delivery_window')
  final AdminOrderSlotResDeliveryWindow deliveryWindow;

  Map<String, Object?> toJson() => _$AdminOrderSlotResToJson(this);
}
